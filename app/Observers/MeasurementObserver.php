<?php

namespace App\Observers;

use App\Models\Measurement;
use App\Services\WHOCalculatorService;

class MeasurementObserver
{
    public function __construct(
        protected WHOCalculatorService $whoCalculator
    ) {}

    /**
     * Handle the Measurement "creating" event.
     * Calculate z-scores before saving if not already set
     */
    public function creating(Measurement $measurement): void
    {
        // Only auto-calculate if z-scores are not already set
        if ($measurement->weight_for_age_zscore === null) {
            $this->calculateZScores($measurement);
        }
    }

    /**
     * Handle the Measurement "updating" event.
     * Recalculate z-scores if weight or height changed
     */
    public function updating(Measurement $measurement): void
    {
        // Check if weight or height changed
        if ($measurement->isDirty(['weight_kg', 'height_length_cm'])) {
            $this->calculateZScores($measurement);
        }
    }

    /**
     * Calculate and set z-scores for a measurement
     */
    protected function calculateZScores(Measurement $measurement): void
    {
        $child = $measurement->child;
        
        if (!$child) {
            return;
        }

        // Calculate age in days
        $ageInDays = $child->date_of_birth->diffInDays($measurement->measurement_date ?? now());
        
        // Calculate all z-scores
        $zscores = $this->whoCalculator->calculateAll(
            $child->sex,
            $ageInDays,
            $measurement->weight_kg,
            $measurement->height_length_cm
        );

        // Set z-scores and classifications
        $measurement->weight_for_age_zscore = $zscores['weight_for_age_zscore'];
        $measurement->height_for_age_zscore = $zscores['height_for_age_zscore'];
        $measurement->weight_for_height_zscore = $zscores['weight_for_height_zscore'];
        $measurement->weight_for_age_status = $zscores['weight_for_age_status'];
        $measurement->height_for_age_status = $zscores['height_for_age_status'];
        $measurement->weight_for_height_status = $zscores['weight_for_height_status'];
        $measurement->opt_classification = $zscores['opt_classification'];

        // Set age in months if not already set
        if ($measurement->age_in_months === null) {
            $measurement->age_in_months = floor($ageInDays / 30.4375);
        }
    }
}

