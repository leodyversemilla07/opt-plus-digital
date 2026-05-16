<?php

namespace App\Services;

use App\Models\Child;
use App\Models\Measurement;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class DataQualityControlService
{
    /**
     * Cache TTL in seconds (30 minutes)
     */
    private const CACHE_TTL = 1800;

    /**
     * Analyze terminal digit preference for measurements
     * Returns distribution of last digits in weight/height values
     */
    public function analyzeTerminalDigitPreference(Collection $measurements): array
    {
        $weightDigits = array_fill(0, 10, 0);
        $heightDigits = array_fill(0, 10, 0);

        foreach ($measurements as $measurement) {
            // Get last digit of weight (after decimal)
            if ($measurement->weight_kg) {
                $weightDecimal = round(($measurement->weight_kg * 10) % 10);
                $weightDigits[$weightDecimal]++;
            }

            // Get last digit of height (after decimal)
            if ($measurement->height_length_cm) {
                $heightDecimal = round(($measurement->height_length_cm * 10) % 10);
                $heightDigits[$heightDecimal]++;
            }
        }

        $total = max($measurements->count(), 1);

        return [
            'weight' => [
                'counts' => $weightDigits,
                'percentages' => array_map(fn ($c) => round(($c / $total) * 100, 1), $weightDigits),
                'has_preference' => $this->hasDigitPreference($weightDigits, $total),
                'max_percentage' => max(array_map(fn ($c) => round(($c / $total) * 100, 1), $weightDigits)),
            ],
            'height' => [
                'counts' => $heightDigits,
                'percentages' => array_map(fn ($c) => round(($c / $total) * 100, 1), $heightDigits),
                'has_preference' => $this->hasDigitPreference($heightDigits, $total),
                'max_percentage' => max(array_map(fn ($c) => round(($c / $total) * 100, 1), $heightDigits)),
            ],
        ];
    }

    /**
     * Check if there's significant digit preference (>20% for any digit)
     */
    private function hasDigitPreference(array $counts, int $total): bool
    {
        foreach ($counts as $count) {
            if ($total > 0 && ($count / $total) > 0.20) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find duplicate children records
     * Duplicates: same first_name, last_name, date_of_birth, barangay_id
     */
    public function findDuplicates(?string $barangayId = null): Collection
    {
        $query = \DB::table('children')
            ->select('first_name', 'last_name', 'date_of_birth', 'barangay_id', \DB::raw('COUNT(*) as count'))
            ->groupBy('first_name', 'last_name', 'date_of_birth', 'barangay_id')
            ->having('count', '>', 1);

        if ($barangayId) {
            $query->where('barangay_id', $barangayId);
        }

        return $query->get();
    }

    /**
     * Find flagged measurements (z-scores outside ±6)
     */
    public function findFlaggedMeasurements(?string $barangayId = null, int $limit = 20): Collection
    {
        $query = Measurement::with(['child.barangay'])
            ->where(function ($q) {
                $q->where(function ($subQ) {
                    $subQ->whereNotNull('weight_for_age_zscore')
                        ->whereRaw('ABS(weight_for_age_zscore) > 6');
                })
                    ->orWhere(function ($subQ) {
                        $subQ->whereNotNull('height_for_age_zscore')
                            ->whereRaw('ABS(height_for_age_zscore) > 6');
                    })
                    ->orWhere(function ($subQ) {
                        $subQ->whereNotNull('weight_for_height_zscore')
                            ->whereRaw('ABS(weight_for_height_zscore) > 6');
                    });
            });

        if ($barangayId) {
            $query->whereHas('child', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        return $query->latest('measurement_date')->limit($limit)->get();
    }

    /**
     * Find overaged children (≥60 months / 5 years)
     */
    public function findOveragedChildren(?string $barangayId = null, int $limit = 20): Collection
    {
        $query = Measurement::with(['child.barangay'])
            ->where('age_in_months', '>=', 60);

        if ($barangayId) {
            $query->whereHas('child', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        return $query->latest('measurement_date')->limit($limit)->get();
    }

    /**
     * Find stunted children (moderate + severe stunting)
     */
    public function findStuntedChildren(?string $barangayId = null, int $limit = 20): Collection
    {
        $query = Measurement::with(['child.barangay'])
            ->whereIn('height_for_age_status', ['stunted', 'severely_stunted']);

        if ($barangayId) {
            $query->whereHas('child', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        return $query->latest('measurement_date')->limit($limit)->get();
    }

    /**
     * Get children needing attention (MAM, SAM, Stunted)
     */
    public function getChildrenNeedingAttention(?string $barangayId = null, int $limit = 20): array
    {
        $mamSam = $this->getMalnourishedChildren($barangayId, $limit);
        $stunted = $this->findStuntedChildren($barangayId, $limit);

        // Combine and deduplicate by child_id
        $children = collect($mamSam)
            ->concat($stunted)
            ->keyBy(fn ($m) => $m->child_id)
            ->values()
            ->take($limit)
            ->map(function ($measurement) {
                return [
                    'child' => $measurement->child,
                    'measurement' => $measurement,
                    'reason' => $this->getAttentionReason($measurement),
                    'priority' => $this->getAttentionPriority($measurement),
                    'days_since_measurement' => $measurement->measurement_date
                        ? now()->diffInDays($measurement->measurement_date)
                        : 999,
                ];
            })
            ->sortBy([
                ['priority', 'asc'],
                ['days_since_measurement', 'desc'],
            ]);

        return $children->values()->all();
    }

    /**
     * Count measurements pending DQC certification.
     */
    public function countPendingCertifications(?string $barangayId = null): int
    {
        $query = Measurement::pendingCertification();

        if ($barangayId) {
            $query->whereHas('child', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        return $query->count();
    }

    /**
     * Get malnourished children (MAM + SAM)
     */
    private function getMalnourishedChildren(?string $barangayId, int $limit): Collection
    {
        $query = Measurement::with(['child.barangay'])
            ->whereIn('opt_classification', ['mam', 'sam']);

        if ($barangayId) {
            $query->whereHas('child', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            });
        }

        return $query->latest('measurement_date')->limit($limit)->get();
    }

    /**
     * Get attention reason for a child
     */
    private function getAttentionReason(Measurement $measurement): string
    {
        $reasons = [];

        if (in_array($measurement->opt_classification, ['sam', 'mam'])) {
            $reasons[] = strtoupper($measurement->opt_classification);
        }

        if (in_array($measurement->height_for_age_status, ['severely_stunted', 'stunted'])) {
            $reasons[] = strtoupper($measurement->height_for_age_status);
        }

        return implode(' + ', $reasons);
    }

    /**
     * Get attention priority (1 = highest, 3 = lowest)
     */
    private function getAttentionPriority(Measurement $measurement): int
    {
        // SAM = highest priority
        if ($measurement->opt_classification === 'sam') {
            return 1;
        }

        // Severely stunted = high priority
        if ($measurement->height_for_age_status === 'severely_stunted') {
            return 1;
        }

        // MAM or stunted = medium priority
        if ($measurement->opt_classification === 'mam' ||
            $measurement->height_for_age_status === 'stunted') {
            return 2;
        }

        return 3;
    }

    /**
     * Get complete DQC summary for a barangay or all
     */
    public function getDQCSummary(?string $barangayId = null): array
    {
        $cacheKey = $barangayId
            ? "dqc:summary:barangay:{$barangayId}"
            : 'dqc:summary:all';

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($barangayId) {
            $query = Measurement::query();

            if ($barangayId) {
                $query->whereHas('child', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });
            }

            $measurements = $query->get();

            return [
                'total_measurements' => $measurements->count(),
                'terminal_digit_analysis' => $this->analyzeTerminalDigitPreference($measurements),
                'duplicates' => $this->findDuplicates($barangayId),
                'flagged_records_count' => $this->findFlaggedMeasurements($barangayId)->count(),
                'overaged_records_count' => $this->findOveragedChildren($barangayId)->count(),
                'stunted_records_count' => $this->findStuntedChildren($barangayId)->count(),
                'pending_certifications_count' => $this->countPendingCertifications($barangayId),
                'children_needing_attention' => $this->getChildrenNeedingAttention($barangayId, 10),
            ];
        });
    }
}
