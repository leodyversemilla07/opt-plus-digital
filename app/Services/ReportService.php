<?php

namespace App\Services;

use App\Models\Barangay;
use App\Models\Child;
use Illuminate\Support\Collection;

class ReportService
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Generate OPT Plus summary report data
     */
    public function generateOPTSummary(?string $barangayId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) use ($startDate, $endDate) {
            if ($startDate) {
                $q->where('measurement_date', '>=', $startDate);
            }
            if ($endDate) {
                $q->where('measurement_date', '<=', $endDate);
            }
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        $children = $query->get();

        $summary = [
            'report_title' => 'OPT Plus Summary Report',
            'generated_at' => now()->format('F d, Y h:i A'),
            'barangay' => $barangayId ? Barangay::find($barangayId)?->name : 'All Barangays',
            'period' => $this->formatPeriod($startDate, $endDate),
            'total_children' => $children->count(),
            'by_age_group' => $this->groupByAge($children),
            'by_sex' => $this->groupBySex($children),
            'nutritional_status' => $this->analyticsService->getLatestMeasurementsStatistics($barangayId),
            'coverage_summary' => $this->getCoverageSummary($children),
        ];

        return $summary;
    }

    /**
     * Generate master list of all children
     */
    public function generateMasterList(?string $barangayId = null): Collection
    {
        $query = Child::with(['barangay', 'measurements']);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        return $query->get()->map(function ($child) {
            $latestMeasurement = $child->measurements->sortByDesc('measurement_date')->first();

            return [
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'date_of_birth' => $child->date_of_birth->format('M d, Y'),
                'age_months' => $child->age_in_months,
                'barangay' => $child->barangay->name,
                'municipality' => $child->barangay->municipality,
                'latest_measurement_date' => $latestMeasurement?->measurement_date->format('M d, Y'),
                'weight_kg' => $latestMeasurement?->weight_kg,
                'height_cm' => $latestMeasurement?->height_cm,
                'wfa_zscore' => $latestMeasurement?->wfa_zscore,
                'hfa_zscore' => $latestMeasurement?->hfa_zscore,
                'wfh_zscore' => $latestMeasurement?->wfh_zscore,
                'nutritional_status' => $latestMeasurement?->opt_classification,
                'is_indigenous' => $child->is_indigenous_people ? 'Yes' : 'No',
                'ip_group' => $child->indigenous_people_group,
            ];
        });
    }

    /**
     * Generate target list (high-risk children)
     */
    public function generateTargetList(?string $barangayId = null): Collection
    {
        $highRiskChildren = $this->analyticsService->getHighRiskChildren($barangayId, 100);

        return collect($highRiskChildren)->map(function ($item) {
            $child = $item['child'];
            $measurement = $item['measurement'];

            return [
                'priority' => $measurement->opt_classification === 'sam' ? 'URGENT' : 'High',
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'age_months' => $child->age_in_months,
                'barangay' => $child->barangay->name,
                'classification' => strtoupper($measurement->opt_classification),
                'wfa_zscore' => $measurement->wfa_zscore,
                'hfa_zscore' => $measurement->hfa_zscore,
                'wfh_zscore' => $measurement->wfh_zscore,
                'weight_kg' => $measurement->weight_kg,
                'height_cm' => $measurement->height_cm,
                'measurement_date' => $measurement->measurement_date->format('M d, Y'),
                'days_since_measurement' => $item['days_since_measurement'],
                'mother_name' => $child->mother_name,
                'father_name' => $child->father_name,
                'contact_info' => 'N/A', // Future feature
            ];
        });
    }

    /**
     * Generate barangay comparison report
     */
    public function generateBarangayComparisonReport(): array
    {
        $comparison = $this->analyticsService->getBarangayComparison();

        return [
            'report_title' => 'Barangay Comparison Report',
            'generated_at' => now()->format('F d, Y h:i A'),
            'total_barangays' => count($comparison),
            'barangays' => $comparison,
            'summary' => [
                'highest_malnutrition' => $comparison[0] ?? null,
                'lowest_malnutrition' => end($comparison) ?: null,
                'average_coverage' => collect($comparison)->avg('coverage_rate'),
                'average_malnutrition_rate' => collect($comparison)->avg('malnutrition_rate'),
            ],
        ];
    }

    /**
     * Group children by age group
     */
    private function groupByAge(Collection $children): array
    {
        $groups = [
            '0-11 months' => 0,
            '12-23 months' => 0,
            '24-35 months' => 0,
            '36-47 months' => 0,
            '48-59 months' => 0,
            '60-71 months' => 0,
        ];

        foreach ($children as $child) {
            $age = $child->age_in_months;

            if ($age < 12) {
                $groups['0-11 months']++;
            } elseif ($age < 24) {
                $groups['12-23 months']++;
            } elseif ($age < 36) {
                $groups['24-35 months']++;
            } elseif ($age < 48) {
                $groups['36-47 months']++;
            } elseif ($age < 60) {
                $groups['48-59 months']++;
            } else {
                $groups['60-71 months']++;
            }
        }

        return $groups;
    }

    /**
     * Group children by sex
     */
    private function groupBySex(Collection $children): array
    {
        return [
            'male' => $children->where('sex', 'male')->count(),
            'female' => $children->where('sex', 'female')->count(),
        ];
    }

    /**
     * Get coverage summary
     */
    private function getCoverageSummary(Collection $children): array
    {
        $totalChildren = $children->count();
        $measuredChildren = $children->filter(function ($child) {
            return $child->measurements->isNotEmpty();
        })->count();

        return [
            'total_children' => $totalChildren,
            'measured_children' => $measuredChildren,
            'unmeasured_children' => $totalChildren - $measuredChildren,
            'coverage_rate' => $totalChildren > 0
                ? round(($measuredChildren / $totalChildren) * 100, 1)
                : 0,
        ];
    }

    /**
     * Format period for report
     */
    private function formatPeriod(?string $startDate, ?string $endDate): string
    {
        if (! $startDate && ! $endDate) {
            return 'All Time';
        }

        if ($startDate && $endDate) {
            return date('M d, Y', strtotime($startDate)).' - '.date('M d, Y', strtotime($endDate));
        }

        if ($startDate) {
            return 'From '.date('M d, Y', strtotime($startDate));
        }

        return 'Until '.date('M d, Y', strtotime($endDate));
    }

    /**
     * Generate F1K (First 1000 Days) list - children 0-23 months
     */
    public function generateF1KList(?string $barangayId = null): Collection
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) {
            $q->latest('measurement_date');
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        // Filter to F1K age range (0-23 months)
        $query->whereRaw('TIMESTAMPDIFF(MONTH, date_of_birth, CURDATE()) < 24');

        return $query->get()->map(function ($child) {
            $latestMeasurement = $child->measurements->first();
            $ageMonths = $child->age_in_months;

            // Determine priority based on status and age
            $priority = $this->calculateF1KPriority($latestMeasurement, $ageMonths);

            return [
                'id' => $child->id,
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'date_of_birth' => $child->date_of_birth->format('M d, Y'),
                'age_months' => $ageMonths,
                'age_group' => $ageMonths < 6 ? '0-5 months' : ($ageMonths < 12 ? '6-11 months' : '12-23 months'),
                'barangay' => $child->barangay->name,
                'latest_measurement_date' => $latestMeasurement?->measurement_date?->format('M d, Y'),
                'weight_kg' => $latestMeasurement?->weight_kg,
                'height_cm' => $latestMeasurement?->height_length_cm,
                'wfa_status' => $latestMeasurement?->weight_for_age_status,
                'hfa_status' => $latestMeasurement?->height_for_age_status,
                'wfh_status' => $latestMeasurement?->weight_for_height_status,
                'opt_classification' => $latestMeasurement?->opt_classification,
                'is_indigenous' => $child->is_indigenous_people,
                'priority' => $priority,
                'days_since_measurement' => $latestMeasurement?->measurement_date
                    ? now()->diffInDays($latestMeasurement->measurement_date)
                    : null,
                'needs_measurement' => ! $latestMeasurement || now()->diffInDays($latestMeasurement->measurement_date) > 30,
            ];
        })->sortBy([
            ['priority', 'asc'],
            ['age_months', 'asc'],
        ])->values();
    }

    /**
     * Calculate F1K priority (1 = highest, 4 = lowest)
     */
    private function calculateF1KPriority($measurement, int $ageMonths): int
    {
        // No measurement = high priority
        if (! $measurement) {
            return 2;
        }

        // SAM = highest priority
        if ($measurement->opt_classification === 'sam') {
            return 1;
        }

        // MAM or severely stunted = high priority
        if ($measurement->opt_classification === 'mam' ||
            $measurement->height_for_age_status === 'severely_stunted') {
            return 2;
        }

        // Stunted or underweight = medium priority
        if ($measurement->height_for_age_status === 'stunted' ||
            $measurement->weight_for_age_status === 'underweight') {
            return 3;
        }

        // Normal = lowest priority
        return 4;
    }

    /**
     * Generate monitoring list by type (SAM, MAM, stunted, overweight)
     */
    public function generateMonitoringList(string $type, ?string $barangayId = null): Collection
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) {
            $q->latest('measurement_date');
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        // Filter children who have measurements matching the type
        $query->whereHas('measurements', function ($q) use ($type) {
            switch ($type) {
                case 'sam':
                    $q->where('opt_classification', 'sam');
                    break;
                case 'mam':
                    $q->where('opt_classification', 'mam');
                    break;
                case 'stunted':
                    $q->whereIn('height_for_age_status', ['stunted', 'severely_stunted']);
                    break;
                case 'overweight':
                    $q->where('opt_classification', 'overweight');
                    break;
                case 'obese':
                    $q->where('opt_classification', 'obese');
                    break;
            }
        });

        return $query->get()->map(function ($child) {
            $latestMeasurement = $child->measurements->first();

            return [
                'id' => $child->id,
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'date_of_birth' => $child->date_of_birth->format('M d, Y'),
                'age_months' => $child->age_in_months,
                'barangay' => $child->barangay->name,
                'measurement_date' => $latestMeasurement?->measurement_date?->format('M d, Y'),
                'weight_kg' => $latestMeasurement?->weight_kg,
                'height_cm' => $latestMeasurement?->height_length_cm,
                'wfa_zscore' => $latestMeasurement?->weight_for_age_zscore,
                'hfa_zscore' => $latestMeasurement?->height_for_age_zscore,
                'wfh_zscore' => $latestMeasurement?->weight_for_height_zscore,
                'wfa_status' => $latestMeasurement?->weight_for_age_status,
                'hfa_status' => $latestMeasurement?->height_for_age_status,
                'wfh_status' => $latestMeasurement?->weight_for_height_status,
                'opt_classification' => $latestMeasurement?->opt_classification,
                'muac_cm' => $latestMeasurement?->muac_cm,
                'days_since_measurement' => $latestMeasurement?->measurement_date
                    ? now()->diffInDays($latestMeasurement->measurement_date)
                    : null,
                'guardian_name' => $child->guardian_name,
                'contact' => $child->contact_number,
            ];
        })->sortByDesc(function ($child) {
            return $child['days_since_measurement'] ?? 0;
        })->values();
    }

    /**
     * Generate sex-disaggregated nutritional status by barangay (NutStatusBrgy)
     */
    public function generateNutStatusBrgy(?string $barangayId = null): array
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) {
            $q->latest('measurement_date');
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        $children = $query->get();

        // Initialize stats structure
        $stats = [
            'report_title' => 'Nutritional Status by Barangay (Sex-Disaggregated)',
            'generated_at' => now()->format('F d, Y h:i A'),
            'barangay' => $barangayId ? Barangay::find($barangayId)?->name : 'All Barangays',
            'total_children' => $children->count(),
            'male_count' => $children->where('sex', 'male')->count(),
            'female_count' => $children->where('sex', 'female')->count(),
            'wfa' => $this->getSexDisaggregatedStats($children, 'wfa'),
            'hfa' => $this->getSexDisaggregatedStats($children, 'hfa'),
            'wfh' => $this->getSexDisaggregatedStats($children, 'wfh'),
            'age_groups' => $this->getSexDisaggregatedAgeGroups($children),
        ];

        return $stats;
    }

    /**
     * Get sex-disaggregated statistics for a specific indicator
     */
    private function getSexDisaggregatedStats(Collection $children, string $indicator): array
    {
        $statusField = match ($indicator) {
            'wfa' => 'weight_for_age_status',
            'hfa' => 'height_for_age_status',
            'wfh' => 'weight_for_height_status',
        };

        $categories = match ($indicator) {
            'wfa' => ['normal', 'underweight', 'severely_underweight'],
            'hfa' => ['normal', 'stunted', 'severely_stunted'],
            'wfh' => ['normal', 'wasted', 'severely_wasted', 'overweight', 'obese'],
        };

        $result = [];
        foreach ($categories as $category) {
            $maleCount = $children->where('sex', 'male')->filter(function ($child) use ($statusField, $category) {
                $measurement = $child->measurements->first();

                return $measurement && $category === $measurement->$statusField;
            })->count();

            $femaleCount = $children->where('sex', 'female')->filter(function ($child) use ($statusField, $category) {
                $measurement = $child->measurements->first();

                return $measurement && $category === $measurement->$statusField;
            })->count();

            $result[$category] = [
                'male' => $maleCount,
                'female' => $femaleCount,
                'total' => $maleCount + $femaleCount,
            ];
        }

        return $result;
    }

    /**
     * Get sex-disaggregated age group breakdown
     */
    private function getSexDisaggregatedAgeGroups(Collection $children): array
    {
        $groups = [
            '0-5 months' => ['male' => 0, 'female' => 0],
            '6-11 months' => ['male' => 0, 'female' => 0],
            '12-23 months' => ['male' => 0, 'female' => 0],
            '24-35 months' => ['male' => 0, 'female' => 0],
            '36-47 months' => ['male' => 0, 'female' => 0],
            '48-59 months' => ['male' => 0, 'female' => 0],
        ];

        foreach ($children as $child) {
            $age = $child->age_in_months;
            $sex = $child->sex;

            $groupKey = match (true) {
                $age < 6 => '0-5 months',
                $age < 12 => '6-11 months',
                $age < 24 => '12-23 months',
                $age < 36 => '24-35 months',
                $age < 48 => '36-47 months',
                default => '48-59 months',
            };

            if ($sex === 'male') {
                $groups[$groupKey]['male']++;
            } else {
                $groups[$groupKey]['female']++;
            }
        }

        // Add totals
        foreach ($groups as $key => $data) {
            $groups[$key]['total'] = $data['male'] + $data['female'];
        }

        return $groups;
    }

    /**
     * Generate MUAC-based monitoring list (for children 6-59 months)
     */
    public function generateMUACList(?string $barangayId = null): Collection
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) {
            $q->whereNotNull('muac_cm')->latest('measurement_date');
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        // Only children 6-59 months with MUAC measurements
        $query->whereHas('measurements', function ($q) {
            $q->whereNotNull('muac_cm');
        });

        return $query->get()->map(function ($child) {
            $latestMeasurement = $child->measurements->first();
            $muac = $latestMeasurement?->muac_cm;
            $ageMonths = $child->age_in_months;

            // MUAC classification (for 6-59 months)
            $muacStatus = null;
            if ($muac !== null && $ageMonths >= 6 && $ageMonths <= 59) {
                $muacStatus = match (true) {
                    $muac < 11.5 => 'SAM',
                    $muac < 12.5 => 'MAM',
                    $muac < 13.5 => 'At Risk',
                    default => 'Normal',
                };
            }

            return [
                'id' => $child->id,
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'date_of_birth' => $child->date_of_birth->format('M d, Y'),
                'age_months' => $ageMonths,
                'barangay' => $child->barangay->name,
                'measurement_date' => $latestMeasurement?->measurement_date?->format('M d, Y'),
                'muac_cm' => $muac,
                'muac_status' => $muacStatus,
                'weight_kg' => $latestMeasurement?->weight_kg,
                'height_cm' => $latestMeasurement?->height_length_cm,
                'opt_classification' => $latestMeasurement?->opt_classification,
                'days_since_measurement' => $latestMeasurement?->measurement_date
                    ? now()->diffInDays($latestMeasurement->measurement_date)
                    : null,
            ];
        })->sortBy([
            fn ($a, $b) => ($a['muac_cm'] ?? 999) <=> ($b['muac_cm'] ?? 999),
        ])->values();
    }

    /**
     * Generate OPT Form 1C - List of affected/at-risk children
     */
    public function generateForm1C(?string $barangayId = null): array
    {
        $query = Child::with(['barangay', 'measurements' => function ($q) {
            $q->latest('measurement_date');
        }]);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        // Get children with any abnormal status
        $query->whereHas('measurements', function ($q) {
            $q->where(function ($inner) {
                $inner->whereIn('opt_classification', ['sam', 'mam', 'overweight', 'obese'])
                    ->orWhereIn('height_for_age_status', ['stunted', 'severely_stunted']);
            });
        });

        $children = $query->get();

        $categories = [
            'sam' => [],
            'mam' => [],
            'stunted' => [],
            'overweight_obese' => [],
        ];

        foreach ($children as $child) {
            $measurement = $child->measurements->first();
            if (! $measurement) {
                continue;
            }

            $record = [
                'id' => $child->id,
                'fsn' => $child->family_serial_number,
                'name' => $child->full_name,
                'sex' => ucfirst($child->sex),
                'age_months' => $child->age_in_months,
                'barangay' => $child->barangay->name,
                'weight_kg' => $measurement->weight_kg,
                'height_cm' => $measurement->height_length_cm,
                'wfa_zscore' => $measurement->weight_for_age_zscore,
                'hfa_zscore' => $measurement->height_for_age_zscore,
                'wfh_zscore' => $measurement->weight_for_height_zscore,
                'measurement_date' => $measurement->measurement_date?->format('M d, Y'),
                'mother_name' => $child->mother_name,
                'contact' => $child->contact_number,
            ];

            if ($measurement->opt_classification === 'sam') {
                $categories['sam'][] = $record;
            } elseif ($measurement->opt_classification === 'mam') {
                $categories['mam'][] = $record;
            }

            if (in_array($measurement->height_for_age_status, ['stunted', 'severely_stunted'])) {
                $categories['stunted'][] = $record;
            }

            if (in_array($measurement->opt_classification, ['overweight', 'obese'])) {
                $categories['overweight_obese'][] = $record;
            }
        }

        return [
            'report_title' => 'OPT Plus Form 1C - Affected/At-Risk Children',
            'generated_at' => now()->format('F d, Y h:i A'),
            'barangay' => $barangayId ? Barangay::find($barangayId)?->name : 'All Barangays',
            'summary' => [
                'sam_count' => count($categories['sam']),
                'mam_count' => count($categories['mam']),
                'stunted_count' => count($categories['stunted']),
                'overweight_obese_count' => count($categories['overweight_obese']),
            ],
            'categories' => $categories,
        ];
    }
}
