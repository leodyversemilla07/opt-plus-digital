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
}
