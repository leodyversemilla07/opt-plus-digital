<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\MassMail;
use App\Models\Measurement;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    private const STATS_CACHE_TTL = 600;
    private const BARANGAY_CACHE_TTL = 1800;

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

    public function getLatestMeasurementsStatistics(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:latest_measurements:barangay:{$barangayId}"
            : 'analytics:latest_measurements:all';

        $cacheTtl = $barangayId ? self::BARANGAY_CACHE_TTL : self::STATS_CACHE_TTL;

        return Cache::remember($cacheKey, $cacheTtl, function () use ($barangayId) {
            $latestSub = Measurement::query()
                ->select('child_id', DB::raw('MAX(measurement_date) as max_date'))
                ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
                ->groupBy('child_id');

            $latest = Measurement::query()
                ->select('measurements.*')
                ->joinSub($latestSub, 'latest', function ($join) {
                    $join->on('measurements.child_id', '=', 'latest.child_id')
                        ->on('measurements.measurement_date', '=', 'latest.max_date');
                })
                ->whereNotNull('opt_classification')
                ->get();

            $total = $latest->count();
            $classifications = $latest->groupBy('opt_classification');

            $result = [
                'normal' => 0,
                'mam' => 0,
                'sam' => 0,
                'overweight' => 0,
                'total' => $total,
            ];

            foreach ($classifications as $classification => $items) {
                $result[$classification] = $items->count();
            }

            return $result;
        });
    }

    public function getHighRiskChildren(?string $barangayId = null, int $limit = 10): array
    {
        $cacheKey = $barangayId
            ? "analytics:high_risk:barangay:{$barangayId}:{$limit}"
            : "analytics:high_risk:all:{$limit}";

        return Cache::remember($cacheKey, self::STATS_CACHE_TTL, function () use ($barangayId, $limit) {
            $latestSub = Measurement::query()
                ->select('child_id', DB::raw('MAX(measurement_date) as max_date'))
                ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
                ->groupBy('child_id');

            $highRisk = Measurement::query()
                ->select('measurements.*')
                ->joinSub($latestSub, 'latest', function ($join) {
                    $join->on('measurements.child_id', '=', 'latest.child_id')
                        ->on('measurements.measurement_date', '=', 'latest.max_date');
                })
                ->with('child.barangay')
                ->whereIn('opt_classification', ['sam', 'mam'])
                ->orderBy('measurements.measurement_date', 'desc')
                ->take($limit)
                ->get();

            $results = [];
            foreach ($highRisk as $measurement) {
                $child = $measurement->child;

                $results[] = [
                    'child' => [
                        'id' => (string) $child->id,
                        'full_name' => $child->full_name,
                        'sex' => $child->sex,
                        'age_in_months' => $child->age_in_months,
                        'barangay' => [
                            'name' => $child->barangay?->name ?? 'N/A',
                            'municipality_city' => $child->barangay?->municipality ?? 'N/A',
                        ],
                    ],
                    'measurement' => [
                        'opt_classification' => $measurement->opt_classification,
                        'wfa_zscore' => $measurement->weight_for_age_zscore,
                        'hfa_zscore' => $measurement->height_for_age_zscore,
                        'wfh_zscore' => $measurement->weight_for_height_zscore,
                        'measurement_date' => $measurement->measurement_date->toDateString(),
                    ],
                    'days_since_measurement' => now()->diffInDays($measurement->measurement_date),
                ];
            }

            return $results;
        });
    }

    public function getBarangayComparison(): array
    {
        return Cache::remember('analytics:barangay_comparison', self::BARANGAY_CACHE_TTL, function () {
            $barangays = Barangay::with(['children.measurements'])->get();

            return $barangays->map(function ($barangay) {
                $children = $barangay->children;
                $measurements = $children->flatMap->measurements;

                $latestByChild = $measurements->groupBy('child_id')->map->sortByDesc('measurement_date')->first();
                $totalChildren = $children->count();
                $measuredChildren = $latestByChild ? $latestByChild->count() : 0;

                $sam = $latestByChild ? $latestByChild->where('opt_classification', 'sam')->count() : 0;
                $mam = $latestByChild ? $latestByChild->where('opt_classification', 'mam')->count() : 0;
                $malnourished = $sam + $mam;

                return [
                    'barangay_id' => (string) $barangay->id,
                    'barangay_name' => $barangay->name,
                    'municipality_city' => $barangay->municipality,
                    'total_children' => $totalChildren,
                    'measured_children' => $measuredChildren,
                    'coverage_rate' => $totalChildren > 0 ? round(($measuredChildren / $totalChildren) * 100, 1) : 0,
                    'malnutrition_rate' => $totalChildren > 0 ? round(($malnourished / $totalChildren) * 100, 1) : 0,
                    'sam' => $sam,
                    'mam' => $mam,
                    'normal' => $measuredChildren - $malnourished,
                    'overweight' => 0,
                ];
            })->sortByDesc('malnutrition_rate')->values()->toArray();
        });
    }

    public function getAgeGroupBreakdown(?string $barangayId = null): array
    {
        // Get latest measurement for each child using a subquery
        $latestSub = Measurement::query()
            ->select('child_id', DB::raw('MAX(measurement_date) as max_date'))
            ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
            ->groupBy('child_id');

        $latestMeasurements = Measurement::query()
            ->select('measurements.child_id', 'age_in_months')
            ->joinSub($latestSub, 'latest', function ($join) {
                $join->on('measurements.child_id', '=', 'latest.child_id')
                    ->on('measurements.measurement_date', '=', 'latest.max_date');
            })
            ->whereNotNull('age_in_months')
            ->get();

        $groups = [
            '0-5 mos' => 0,
            '6-11 mos' => 0,
            '12-23 mos' => 0,
            '24-35 mos' => 0,
            '36-47 mos' => 0,
            '48-59 mos' => 0,
            '60+ mos' => 0,
        ];

        foreach ($latestMeasurements as $m) {
            $age = $m->age_in_months;
            if ($age <= 5) $groups['0-5 mos']++;
            elseif ($age <= 11) $groups['6-11 mos']++;
            elseif ($age <= 23) $groups['12-23 mos']++;
            elseif ($age <= 35) $groups['24-35 mos']++;
            elseif ($age <= 47) $groups['36-47 mos']++;
            elseif ($age <= 59) $groups['48-59 mos']++;
            else $groups['60+ mos']++;
        }

        return $groups;
    }

    public function getF1KStatistics(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:f1k_stats:barangay:{$barangayId}"
            : 'analytics:f1k_stats:all';

        return Cache::remember($cacheKey, self::STATS_CACHE_TTL, function () use ($barangayId) {
            $childrenQuery = Child::query();
            if ($barangayId) {
                $childrenQuery->where('barangay_id', $barangayId);
            }
            $allChildren = $childrenQuery->get();
            $totalChildren0to23 = $allChildren->filter(fn ($c) => $c->age_in_months <= 23)->count();

            $latestSub = Measurement::query()
                ->select('child_id', DB::raw('MAX(measurement_date) as max_date'))
                ->groupBy('child_id');
            $latest = Measurement::query()
                ->select('measurements.*')
                ->joinSub($latestSub, 'latest', function ($join) {
                    $join->on('measurements.child_id', '=', 'latest.child_id')
                        ->on('measurements.measurement_date', '=', 'latest.max_date');
                })
                ->get()
                ->keyBy('child_id');

            $f1k = $allChildren->filter(fn ($c) => $c->age_in_months <= 23);
            $measuredF1K = $f1k->filter(fn ($c) => $latest->has($c->id));
            $measuredF1KCount = $measuredF1K->count();

            $maleF1K = $f1k->where('sex', 'male')->count();
            $femaleF1K = $f1k->where('sex', 'female')->count();

            $malnourishedF1K = $measuredF1K->filter(fn ($c) => in_array(
                $latest->get($c->id)?->opt_classification,
                ['sam', 'mam']
            ))->count();

            $stuntedF1K = $measuredF1K->filter(fn ($c) => in_array(
                $latest->get($c->id)?->height_for_age_status,
                ['stunted', 'severely_stunted']
            ))->count();

            return [
                'total_children_0to23' => $totalChildren0to23,
                'measured_children_0to23' => $measuredF1KCount,
                'f1k_coverage' => $totalChildren0to23 > 0 ? round(($measuredF1KCount / $totalChildren0to23) * 100, 1) : 0,
                'male_f1k' => $maleF1K,
                'female_f1k' => $femaleF1K,
                'malnourished_f1k' => $malnourishedF1K,
                'stunted_f1k' => $stuntedF1K,
            ];
        });
    }

    public function getSexDisaggregatedStats(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:sex_stats:barangay:{$barangayId}"
            : 'analytics:sex_stats:all';

        return Cache::remember($cacheKey, self::STATS_CACHE_TTL, function () use ($barangayId) {
            $latestSub = Measurement::query()
                ->select('child_id', DB::raw('MAX(measurement_date) as max_date'))
                ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
                ->groupBy('child_id');

            $latestMeasurements = Measurement::query()
                ->select('measurements.child_id', 'opt_classification', 'height_for_age_status')
                ->joinSub($latestSub, 'latest', function ($join) {
                    $join->on('measurements.child_id', '=', 'latest.child_id')
                        ->on('measurements.measurement_date', '=', 'latest.max_date');
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
                'male_normal' => 0,
                'male_mam' => 0,
                'male_sam' => 0,
                'male_overweight' => 0,
                'male_stunted' => 0,
                'female_normal' => 0,
                'female_mam' => 0,
                'female_sam' => 0,
                'female_overweight' => 0,
                'female_stunted' => 0,
            ];

            foreach ($latestMeasurements as $measurement) {
                $child = $children->get($measurement->child_id);
                if (! $child) {
                    continue;
                }

                $sex = $child->sex;
                $stats[$sex]++;

                $classification = $measurement->opt_classification;
                if ($classification) {
                    $key = "{$sex}_{$classification}";
                    if (array_key_exists($key, $stats)) {
                        $stats[$key]++;
                    }
                }

                if (in_array($measurement->height_for_age_status, ['stunted', 'severely_stunted'])) {
                    $stats["{$sex}_stunted"]++;
                }
            }

            return $stats;
        });
    }

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
                    'overweight' => 0,
                ];
            }

            $measurements = Measurement::query()
                ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
                ->where('measurement_date', '>=', now()->subMonths(6))
                ->get();

            foreach ($measurements as $measurement) {
                $monthKey = $measurement->measurement_date->format('Y-m');

                foreach ($months as &$month) {
                    if ($month['month'] === $monthKey) {
                        $month['measurements']++;

                        if ($measurement->opt_classification && isset($month[$measurement->opt_classification])) {
                            $month[$measurement->opt_classification]++;
                        }
                        break;
                    }
                }
            }

            return $months;
        });
    }

    public function getRecentActivity(int $limit = 8): array
    {
        $measurements = Measurement::query()
            ->with(['child.barangay', 'measuredBy'])
            ->latest('measurement_date')
            ->take($limit)
            ->get()
            ->map(fn ($m) => [
                'type' => 'measurement',
                'description' => $m->child?->full_name
                    ? "{$m->child->full_name} — {$m->opt_classification}"
                    : 'Measurement recorded',
                'entity' => $m->child?->full_name ?? 'Unknown',
                'barangay' => $m->child?->barangay?->name,
                'date' => $m->measurement_date?->toDateTimeString(),
                'url' => $m->child_id ? "/children/{$m->child_id}" : null,
            ]);

        $massMails = MassMail::query()
            ->latest('created_at')
            ->take($limit)
            ->get()
            ->map(fn ($m) => [
                'type' => 'mass_mail',
                'description' => "Mass mail sent: {$m->subject}",
                'entity' => $m->recipients_count ? "{$m->recipients_count} recipients" : '',
                'barangay' => null,
                'date' => $m->created_at->toDateTimeString(),
                'url' => "/mass-mail/{$m->id}",
            ]);

        return $measurements->concat($massMails)
            ->sortByDesc('date')
            ->take($limit)
            ->values()
            ->toArray();
    }

    public function getChildrenMeasuredThisMonth(): int
    {
        $startOfMonth = now()->startOfMonth();

        return Measurement::query()
            ->where('measurement_date', '>=', $startOfMonth)
            ->distinct('child_id')
            ->count('child_id');
    }

    public function getMeasurementsThisMonth(): int
    {
        return Measurement::query()
            ->where('measurement_date', '>=', now()->startOfMonth())
            ->count();
    }

    private function getCoverageRate(): float
    {
        $totalChildren = Child::count();
        if ($totalChildren === 0) {
            return 0;
        }

        $childrenWithMeasurements = Measurement::distinct('child_id')->count('child_id');

        return round(($childrenWithMeasurements / $totalChildren) * 100, 1);
    }

    /**
     * Get coverage rate history for the last 6 months.
     */
    public function getCoverageHistory(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "analytics:coverage_history:barangay:{$barangayId}"
            : 'analytics:coverage_history:all';

        return Cache::remember($cacheKey, self::BARANGAY_CACHE_TTL, function () use ($barangayId) {
            $history = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $monthStart = $date->copy()->startOfMonth();
                $monthEnd = $date->copy()->endOfMonth();

                $measurementsInMonth = Measurement::query()
                    ->whereBetween('measurement_date', [$monthStart, $monthEnd])
                    ->when($barangayId, fn ($q) => $q->whereHas('child', fn ($q2) => $q2->where('barangay_id', $barangayId)))
                    ->distinct('child_id')
                    ->count('child_id');

                $totalQuery = Child::query();
                if ($barangayId) {
                    $totalQuery->where('barangay_id', $barangayId);
                }
                $total = $totalQuery->count();

                $history[] = [
                    'month' => $date->format('Y-m'),
                    'label' => $date->format('M Y'),
                    'coverage_rate' => $total > 0 ? round(($measurementsInMonth / $total) * 100, 1) : 0,
                    'measured' => $measurementsInMonth,
                    'total' => $total,
                ];
            }

            return $history;
        });
    }
}
