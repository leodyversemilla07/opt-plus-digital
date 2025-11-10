<?php

namespace App\Services;

use App\Models\Child;
use App\Models\Measurement;

class MeasurementService
{
    public function __construct(
        protected WHOCalculatorService $whoCalculator
    ) {}

    /**
     * Create a measurement with automatic z-score calculation
     *
     * @param  array  $data  Measurement data (date, weight, height, etc.)
     */
    public function createMeasurement(Child $child, array $data): Measurement
    {
        // Calculate age in days at measurement date
        $measurementDate = $data['measurement_date'] ?? now();
        $ageInDays = $child->date_of_birth->diffInDays($measurementDate);

        // Calculate all z-scores
        $zscores = $this->whoCalculator->calculateAll(
            $child->sex,
            $ageInDays,
            $data['weight_kg'],
            $data['height_length_cm']
        );

        // Merge z-scores with input data
        $measurementData = array_merge($data, $zscores, [
            'child_id' => $child->id,
            'age_in_months' => floor($ageInDays / 30.4375), // Average days per month
        ]);

        return Measurement::create($measurementData);
    }

    /**
     * Update a measurement and recalculate z-scores
     */
    public function updateMeasurement(Measurement $measurement, array $data): Measurement
    {
        $child = $measurement->child;

        // Recalculate if weight or height changed
        if (isset($data['weight_kg']) || isset($data['height_length_cm'])) {
            $measurementDate = $data['measurement_date'] ?? $measurement->measurement_date;
            $ageInDays = $child->date_of_birth->diffInDays($measurementDate);

            $weight = $data['weight_kg'] ?? $measurement->weight_kg;
            $height = $data['height_length_cm'] ?? $measurement->height_length_cm;

            $zscores = $this->whoCalculator->calculateAll(
                $child->sex,
                $ageInDays,
                $weight,
                $height
            );

            $data = array_merge($data, $zscores);
        }

        $measurement->update($data);

        return $measurement->fresh();
    }

    /**
     * Validate measurement data
     *
     * @return array Validation errors (empty if valid)
     */
    public function validateMeasurement(array $data): array
    {
        $errors = [];

        // Weight validation (biologically plausible ranges)
        if (isset($data['weight_kg'])) {
            if ($data['weight_kg'] < 1.0 || $data['weight_kg'] > 30.0) {
                $errors['weight_kg'] = 'Weight must be between 1.0 and 30.0 kg';
            }
        }

        // Height validation
        if (isset($data['height_length_cm'])) {
            if ($data['height_length_cm'] < 40.0 || $data['height_length_cm'] > 125.0) {
                $errors['height_length_cm'] = 'Height must be between 40.0 and 125.0 cm';
            }
        }

        // MUAC validation (if provided)
        if (isset($data['muac_cm']) && $data['muac_cm'] !== null) {
            if ($data['muac_cm'] < 10.0 || $data['muac_cm'] > 20.0) {
                $errors['muac_cm'] = 'MUAC must be between 10.0 and 20.0 cm';
            }
        }

        return $errors;
    }

    /**
     * Check if measurement is flagged (significant change from previous)
     *
     * @return bool True if flagged for review
     */
    public function isFlagged(Child $child, float $weightKg): bool
    {
        $previousMeasurement = $child->measurements()
            ->latest('measurement_date')
            ->first();

        if (! $previousMeasurement) {
            return false;
        }

        // Flag if weight change > 2 SD from previous
        $weightChange = abs($weightKg - $previousMeasurement->weight_kg);
        $expectedChange = $previousMeasurement->weight_kg * 0.15; // 15% threshold

        return $weightChange > $expectedChange;
    }

    /**
     * Determine measurement type based on age
     *
     * @return string 'recumbent' or 'standing'
     */
    public function determineMeasurementType(int $ageInMonths): string
    {
        return $ageInMonths < 24 ? 'length' : 'height';
    }

    /**
     * Get measurement statistics for a child
     */
    public function getChildStatistics(Child $child): array
    {
        $measurements = $child->measurements()
            ->orderBy('measurement_date')
            ->get();

        if ($measurements->isEmpty()) {
            return [
                'total_measurements' => 0,
                'latest_status' => null,
                'trend' => null,
            ];
        }

        $latest = $measurements->last();
        $previous = $measurements->count() > 1 ? $measurements->get($measurements->count() - 2) : null;

        // Determine trend
        $trend = null;
        if ($previous) {
            if ($latest->weight_for_age_zscore > $previous->weight_for_age_zscore) {
                $trend = 'improving';
            } elseif ($latest->weight_for_age_zscore < $previous->weight_for_age_zscore) {
                $trend = 'declining';
            } else {
                $trend = 'stable';
            }
        }

        return [
            'total_measurements' => $measurements->count(),
            'latest_status' => $latest->opt_classification,
            'latest_weight_kg' => $latest->weight_kg,
            'latest_height_cm' => $latest->height_length_cm,
            'latest_wfa_zscore' => $latest->weight_for_age_zscore,
            'latest_hfa_zscore' => $latest->height_for_age_zscore,
            'latest_wfh_zscore' => $latest->weight_for_height_zscore,
            'trend' => $trend,
            'is_malnourished' => $latest->isMalnourished(),
            'is_severely_malnourished' => $latest->isSeverelyMalnourished(),
        ];
    }
}
