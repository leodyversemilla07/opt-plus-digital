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
     * Get age group breakdown (0-5, 6-11, 12-23, 24-35, 36-47, 48-59 months)
     */
    public function getAgeGroupBreakdown(?string $barangayId = null): array
    {
        // Get latest measurement for each child using a subquery
        $latestMeasurements = Measurement::query()
            ->select('child_id', DB::raw('MAX(age_in_months) as latest_age'))
            ->whereNotNull('age_in_months')
            ->when($barangayId, function ($query, $barangayId) {
                $query->whereHas('child', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });
            })
            ->groupBy('child_id')
            ->get();

        $ageGroups = [
            '0-5 months' => 0,
            '6-11 months' => 0,
            '12-23 months' => 0,
            '24-35 months' => 0,
            '36-47 months' => 0,
            '48-59 months' => 0,
        ];

        foreach ($latestMeasurements as $latest) {
            $age = $latest->latest_age;

            if ($age < 6) {
                $ageGroups['0-5 months']++;
            } elseif ($age < 12) {
                $ageGroups['6-11 months']++;
            } elseif ($age < 24) {
                $ageGroups['12-23 months']++;
            } elseif ($age < 36) {
                $ageGroups['24-35 months']++;
            } elseif ($age < 48) {
                $ageGroups['36-47 months']++;
            } else {
                $ageGroups['48-59 months']++;
            }
        }

        return $ageGroups;
    }

    /**
     * Get F1K (First 1000 Days) statistics for children 0-23 months
     */
    public function getF1KStatistics(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:f1k_stats:barangay:{$barangayId}"
            : 'analytics:f1k_stats:all';

        return Cache::remember($cacheKey, self::STATS_CACHE_TTL, function () use ($barangayId) {
            // Get all children 0-23 months (database agnostic - calculate in PHP)
            $cutoffDate = now()->subMonths(23)->startOfDay();
            
            $query = Child::query()
                ->where('date_of_birth', '>=', $cutoffDate)
                ->when($barangayId, function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });

            $totalF1K = $query->count();
            $childIds = $query->pluck('id')->toArray();

            // Get measurements for F1K children
            $f1kMeasurements = Measurement::query()
                ->whereIn('child_id', $childIds)
                ->whereNotNull('opt_classification')
                ->with('child')
                ->get();

            $measuredF1K = $f1kMeasurements->count();
            $f1kCoverage = $totalF1K > 0 ? ($measuredF1K / $totalF1K) * 100 : 0;

            // Get sex breakdown
            $maleF1K = 0;
            $femaleF1K = 0;
            $malnourishedF1K = 0;
            $stuntedF1K = 0;

            foreach ($f1kMeasurements as $measurement) {
                $sex = $measurement->child->sex;
                if ($sex === 'male') $maleF1K++;
                if ($sex === 'female') $femaleF1K++;

                if (in_array($measurement->opt_classification, ['mam', 'sam'])) {
                    $malnourishedF1K++;
                }

                if (in_array($measurement->height_for_age_status, ['stunted', 'severely_stunted'])) {
                    $stuntedF1K++;
                }
            }

            return [
                'total_children_0to23' => $totalF1K,
                'measured_children_0to23' => $measuredF1K,
                'f1k_coverage' => round($f1kCoverage, 1),
                'male_f1k' => $maleF1K,
                'female_f1k' => $femaleF1K,
                'malnourished_f1k' => $malnourishedF1K,
                'stunted_f1k' => $stuntedF1K,
            ];
        });
    }

    /**
     * Get sex-disaggregated statistics
     */
    public function getSexDisaggregatedStats(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:sex_stats:barangay:{$barangayId}"
            : 'analytics:sex_stats:all';

        return Cache::remember($cacheKey, self::STATS_CACHE_TTL, function () use ($barangayId) {
            $latestMeasurements = Measurement::query()
                ->select('child_id', 'weight_for_age_zscore', 'height_for_age_zscore', 'weight_for_height_zscore')
                ->when($barangayId, function ($query, $barangayId) {
                    $query->whereHas('child', function ($q) use ($barangayId) {
                        $q->where('barangay_id', $barangayId);
                    });
                })
                ->get();

            $childIds = $latestMeasurements->pluck('child_id')->unique()->values();
            $children = Child::with(['barangay'])
                ->whereIn('id', $childIds)
                ->get()
                ->keyBy('id');

            $stats = [
                'total' => $children->count(),
                'male' => 0,
                'female' => 0,
                'male_mam' => 0,
                'male_sam' => 0,
                'male_stunted' => 0,
                'female_mam' => 0,
                'female_sam' => 0,
                'female_stunted' => 0,
            ];

            foreach ($latestMeasurements as $measurement) {
                $child = $children->get($measurement->child_id);
                if (!$child) continue;

                $sex = $child->sex;
                $stats[$sex]++;

                $classification = $measurement->opt_classification;
                if ($classification) {
                    $stats["{$sex}_{$classification}"]++;
                }

                if (in_array($measurement->height_for_age_status, ['stunted', 'severely_stunted'])) {
                    $stats["{$sex}_stunted"]++;
                }
            }

            return $stats;
        });
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

    /**
     * Get recent system activity for the dashboard feed
     */
    public function getRecentActivity(int $limit = 10): array
    {
        $activities = [];

        // Recent measurements
        $recentMeasurements = Measurement::with(['child.barangay'])
            ->latest('measurement_date')
            ->take($limit)
            ->get()
            ->map(fn ($m) => [
                'type' => 'measurement',
                'description' => 'Measurement recorded for '.($m->child?->full_name ?? 'Unknown'),
                'entity' => $m->opt_classification,
                'barangay' => $m->child?->barangay?->name,
                'date' => $m->measurement_date?->toISOString(),
                'created_at' => $m->created_at?->toISOString(),
                'url' => $m->child_id ? "/children/{$m->child_id}" : null,
            ]);

        $activities = array_merge($activities, $recentMeasurements->toArray());

        // Recent imports (if the service reports them)
        $recentImports = \App\Models\MassMail::with('creator')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($m) => [
                'type' => 'mass_mail',
                'description' => "Mass mail sent: {$m->subject}",
                'entity' => "{$m->total_recipients} recipients",
                'barangay' => null,
                'date' => $m->created_at?->toISOString(),
                'created_at' => $m->created_at?->toISOString(),
                'url' => "/mass-mail/{$m->id}",
            ]);

        $activities = array_merge($activities, $recentImports->toArray());

        // Sort by date descending and limit
        usort($activities, fn ($a, $b) => strcmp($b['created_at'] ?? '', $a['created_at'] ?? ''));

        return array_slice($activities, 0, $limit);
    }
}
