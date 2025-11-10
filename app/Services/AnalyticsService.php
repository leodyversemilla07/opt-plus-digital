<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Cache TTL in seconds (10 minutes)
     */
    private const STATS_CACHE_TTL = 600;

    /**
     * Cache TTL for barangay analytics (30 minutes)
     */
    private const BARANGAY_CACHE_TTL = 1800;

    /**
     * Get overall system statistics (cached)
     */
    public function getOverallStatistics(): array
    {
        return Cache::remember('analytics:overall_stats', self::STATS_CACHE_TTL, function () {
            return [
                'total_children' => Child::count(),
                'total_measurements' => Measurement::count(),
                'total_barangays' => Barangay::count(),
                'children_measured_this_month' => $this->getChildrenMeasuredThisMonth(),
                'measurements_this_month' => $this->getMeasurementsThisMonth(),
                'coverage_rate' => $this->getCoverageRate(),
            ];
        });
    }

    /**
     * Get nutritional status breakdown (cached)
     */
    public function getNutritionalStatusBreakdown(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:nutrition_breakdown:barangay:{$barangayId}"
            : 'analytics:nutrition_breakdown:all';

        $cacheTtl = $barangayId ? self::BARANGAY_CACHE_TTL : self::STATS_CACHE_TTL;

        return Cache::remember($cacheKey, $cacheTtl, function () use ($barangayId) {
            $query = Measurement::query()
                ->select('opt_classification', DB::raw('COUNT(*) as count'))
                ->whereNotNull('opt_classification')
                ->groupBy('opt_classification');

            if ($barangayId) {
                $query->whereHas('child', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });
            }

            $results = $query->get()->pluck('count', 'opt_classification')->toArray();

            return [
                'normal' => $results['normal'] ?? 0,
                'mam' => $results['mam'] ?? 0,
                'sam' => $results['sam'] ?? 0,
                'overweight' => $results['overweight'] ?? 0,
                'total' => array_sum($results),
            ];
        });
    }

    /**
     * Get latest measurements with classification
     */
    public function getLatestMeasurementsStatistics(?string $barangayId = null): array
    {
        $latestMeasurements = Measurement::query()
            ->select('child_id', DB::raw('MAX(measurement_date) as latest_date'))
            ->when($barangayId, function ($query, $barangayId) {
                $query->whereHas('child', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });
            })
            ->groupBy('child_id')
            ->get();

        $childIds = $latestMeasurements->pluck('child_id');

        $stats = [];
        foreach ($latestMeasurements as $latest) {
            $measurement = Measurement::where('child_id', $latest->child_id)
                ->where('measurement_date', $latest->latest_date)
                ->first();

            if ($measurement && $measurement->opt_classification) {
                $classification = $measurement->opt_classification;
                $stats[$classification] = ($stats[$classification] ?? 0) + 1;
            }
        }

        return [
            'normal' => $stats['normal'] ?? 0,
            'mam' => $stats['mam'] ?? 0,
            'sam' => $stats['sam'] ?? 0,
            'overweight' => $stats['overweight'] ?? 0,
            'total' => array_sum($stats),
        ];
    }

    /**
     * Get high-risk children (SAM/MAM) - cached
     */
    public function getHighRiskChildren(?string $barangayId = null, int $limit = 10): array
    {
        $cacheKey = $barangayId
            ? "analytics:high_risk:barangay:{$barangayId}:limit:{$limit}"
            : "analytics:high_risk:all:limit:{$limit}";

        $cacheTtl = $barangayId ? self::BARANGAY_CACHE_TTL : self::STATS_CACHE_TTL;

        return Cache::remember($cacheKey, $cacheTtl, function () use ($barangayId, $limit) {
            $latestMeasurements = Measurement::query()
                ->select('child_id', DB::raw('MAX(measurement_date) as latest_date'))
                ->when($barangayId, function ($query, $barangayId) {
                    $query->whereHas('child', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                })
                ->groupBy('child_id')
                ->get();

            $highRiskChildren = [];

            foreach ($latestMeasurements as $latest) {
                $measurement = Measurement::with(['child.barangay'])
                    ->where('child_id', $latest->child_id)
                    ->where('measurement_date', $latest->latest_date)
                    ->whereIn('opt_classification', ['sam', 'mam'])
                    ->first();

                if ($measurement) {
                    $highRiskChildren[] = [
                        'child' => $measurement->child,
                        'measurement' => $measurement,
                        'days_since_measurement' => now()->diffInDays($measurement->measurement_date),
                    ];
                }
            }

            // Sort by severity (SAM first) and days since measurement
            usort($highRiskChildren, function ($a, $b) {
                if ($a['measurement']->opt_classification === 'sam' && $b['measurement']->opt_classification !== 'sam') {
                    return -1;
                }
                if ($a['measurement']->opt_classification !== 'sam' && $b['measurement']->opt_classification === 'sam') {
                    return 1;
                }

                return $b['days_since_measurement'] - $a['days_since_measurement'];
            });

            return array_slice($highRiskChildren, 0, $limit);
        });
    }

    /**
     * Get barangay comparison data
     */
    public function getBarangayComparison(): array
    {
        $barangays = Barangay::with(['children.measurements'])->get();

        $comparison = [];

        foreach ($barangays as $barangay) {
            $childIds = $barangay->children->pluck('id');

            if ($childIds->isEmpty()) {
                continue;
            }

            $latestStats = $this->getLatestMeasurementsStatistics($barangay->id);
            $totalChildren = $barangay->children->count();
            $measuredChildren = $latestStats['total'];
            $coverageRate = $totalChildren > 0 ? ($measuredChildren / $totalChildren) * 100 : 0;

            $comparison[] = [
                'barangay_id' => $barangay->id,
                'barangay_name' => $barangay->name,
                'municipality' => $barangay->municipality,
                'total_children' => $totalChildren,
                'measured_children' => $measuredChildren,
                'coverage_rate' => round($coverageRate, 1),
                'normal' => $latestStats['normal'],
                'mam' => $latestStats['mam'],
                'sam' => $latestStats['sam'],
                'overweight' => $latestStats['overweight'],
                'malnutrition_rate' => $latestStats['total'] > 0
                    ? round((($latestStats['mam'] + $latestStats['sam']) / $latestStats['total']) * 100, 1)
                    : 0,
            ];
        }

        // Sort by malnutrition rate (highest first)
        usort($comparison, function ($a, $b) {
            return $b['malnutrition_rate'] <=> $a['malnutrition_rate'];
        });

        return $comparison;
    }

    /**
     * Get monthly trend data (last 6 months) - cached
     */
    public function getMonthlyTrends(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:monthly_trends:barangay:{$barangayId}"
            : 'analytics:monthly_trends:all';

        $cacheTtl = $barangayId ? self::BARANGAY_CACHE_TTL : self::STATS_CACHE_TTL;

        return Cache::remember($cacheKey, $cacheTtl, function () use ($barangayId) {
            $months = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $months[] = [
                    'month' => $date->format('Y-m'),
                    'label' => $date->format('M Y'),
                    'measurements' => 0,
                    'normal' => 0,
                    'mam' => 0,
                    'sam' => 0,
                ];
            }

            $measurements = Measurement::query()
                ->when($barangayId, function ($query, $barangayId) {
                    $query->whereHas('child', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                })
                ->where('measurement_date', '>=', now()->subMonths(6))
                ->get();

            foreach ($measurements as $measurement) {
                $monthKey = $measurement->measurement_date->format('Y-m');

                foreach ($months as &$month) {
                    if ($month['month'] === $monthKey) {
                        $month['measurements']++;

                        if ($measurement->opt_classification) {
                            $month[$measurement->opt_classification] = ($month[$measurement->opt_classification] ?? 0) + 1;
                        }
                        break;
                    }
                }
            }

            return $months;
        });
    }

    /**
     * Get children measured this month
     */
    private function getChildrenMeasuredThisMonth(): int
    {
        return Measurement::query()
            ->whereBetween('measurement_date', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])
            ->distinct('child_id')
            ->count('child_id');
    }

    /**
     * Get total measurements this month
     */
    private function getMeasurementsThisMonth(): int
    {
        return Measurement::query()
            ->whereBetween('measurement_date', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])
            ->count();
    }

    /**
     * Calculate coverage rate (% of children with at least one measurement)
     */
    private function getCoverageRate(): float
    {
        $totalChildren = Child::count();

        if ($totalChildren === 0) {
            return 0;
        }

        $childrenWithMeasurements = Child::query()
            ->whereHas('measurements')
            ->count();

        return round(($childrenWithMeasurements / $totalChildren) * 100, 1);
    }
}
