<?php

namespace App\Services;

use App\Models\WhoStandard;

class WHOCalculatorService
{
    /**
     * Calculate z-score using WHO LMS method
     *
     * Formula: Z = ((value/M)^L - 1) / (L * S)
     * Special case when L = 0: Z = ln(value/M) / S
     *
     * @param  float  $value  The measured value (weight or height)
     * @param  float  $l  Box-Cox power
     * @param  float  $m  Median
     * @param  float  $s  Coefficient of variation
     * @return float Z-score
     */
    protected function calculateZScore(float $value, float $l, float $m, float $s): float
    {
        if ($l == 0) {
            // Special case: use logarithmic transformation
            return log($value / $m) / $s;
        }

        // Standard LMS formula
        return (pow($value / $m, $l) - 1) / ($l * $s);
    }

    /**
     * Calculate Weight-for-Age z-score
     *
     * @param  string  $sex  'male' or 'female'
     * @param  int  $ageInDays  Age in days (0-1856 for 0-60 months)
     * @param  float  $weightKg  Weight in kilograms
     * @return float|null Z-score or null if data not available
     */
    public function calculateWeightForAge(string $sex, int $ageInDays, float $weightKg): ?float
    {
        $standard = WhoStandard::getStandardWithInterpolation('wfa', $sex, $ageInDays);

        if (! $standard) {
            return null;
        }

        return $this->calculateZScore($weightKg, $standard['l'], $standard['m'], $standard['s']);
    }

    /**
     * Calculate Height-for-Age z-score
     *
     * @param  string  $sex  'male' or 'female'
     * @param  int  $ageInDays  Age in days
     * @param  float  $heightCm  Height/length in centimeters
     * @return float|null Z-score or null if data not available
     */
    public function calculateHeightForAge(string $sex, int $ageInDays, float $heightCm): ?float
    {
        $standard = WhoStandard::getStandardWithInterpolation('hfa', $sex, $ageInDays);

        if (! $standard) {
            return null;
        }

        return $this->calculateZScore($heightCm, $standard['l'], $standard['m'], $standard['s']);
    }

    /**
     * Calculate Weight-for-Height z-score
     *
     * @param  string  $sex  'male' or 'female'
     * @param  float  $heightCm  Height in centimeters (45-110 cm for recumbent, 65-120 cm for standing)
     * @param  float  $weightKg  Weight in kilograms
     * @return float|null Z-score or null if data not available
     */
    public function calculateWeightForHeight(string $sex, float $heightCm, float $weightKg): ?float
    {
        // WHO uses height in 0.1 cm increments, convert to integer
        $heightDecimal = round($heightCm * 10);

        $standard = WhoStandard::getStandardWithInterpolation('wfh', $sex, $heightDecimal);

        if (! $standard) {
            return null;
        }

        return $this->calculateZScore($weightKg, $standard['l'], $standard['m'], $standard['s']);
    }

    /**
     * Classify nutritional status based on z-score
     *
     * @param  float  $zscore  Z-score value
     * @param  string  $indicator  'wfa', 'hfa', or 'wfh'
     * @return string Classification
     */
    public function classifyNutritionalStatus(float $zscore, string $indicator): string
    {
        return match ($indicator) {
            'wfa' => $this->classifyWeightForAge($zscore),
            'hfa' => $this->classifyHeightForAge($zscore),
            'wfh' => $this->classifyWeightForHeight($zscore),
            default => 'unknown',
        };
    }

    /**
     * Classify Weight-for-Age status
     */
    protected function classifyWeightForAge(float $zscore): string
    {
        if ($zscore < -3) {
            return 'severely_underweight';
        }
        if ($zscore < -2) {
            return 'underweight';
        }
        if ($zscore > 2) {
            return 'overweight';
        }

        return 'normal';
    }

    /**
     * Classify Height-for-Age status
     */
    protected function classifyHeightForAge(float $zscore): string
    {
        if ($zscore < -3) {
            return 'severely_stunted';
        }
        if ($zscore < -2) {
            return 'stunted';
        }
        if ($zscore > 2) {
            return 'tall';
        }

        return 'normal';
    }

    /**
     * Classify Weight-for-Height status
     */
    protected function classifyWeightForHeight(float $zscore): string
    {
        if ($zscore < -3) {
            return 'severely_wasted';
        }
        if ($zscore < -2) {
            return 'wasted';
        }
        if ($zscore > 3) {
            return 'obese';
        }
        if ($zscore > 2) {
            return 'overweight';
        }

        return 'normal';
    }

    /**
     * Determine overall OPT classification
     *
     * @param  float|null  $wfaZscore  Weight-for-Age z-score
     * @param  float|null  $hfaZscore  Height-for-Age z-score
     * @param  float|null  $wfhZscore  Weight-for-Height z-score
     * @return string Overall classification
     */
    public function determineOptClassification(?float $wfaZscore, ?float $hfaZscore, ?float $wfhZscore): string
    {
        // Severely malnourished: any z-score < -3
        if (($wfaZscore !== null && $wfaZscore < -3) ||
            ($hfaZscore !== null && $hfaZscore < -3) ||
            ($wfhZscore !== null && $wfhZscore < -3)) {
            return 'severely_malnourished';
        }

        // Moderately malnourished: any z-score between -3 and -2
        if (($wfaZscore !== null && $wfaZscore < -2) ||
            ($hfaZscore !== null && $hfaZscore < -2) ||
            ($wfhZscore !== null && $wfhZscore < -2)) {
            return 'moderately_malnourished';
        }

        // Overweight/obese
        if ($wfhZscore !== null && $wfhZscore > 3) {
            return 'obese';
        }

        if ($wfhZscore !== null && $wfhZscore > 2) {
            return 'overweight';
        }

        return 'normal';
    }

    /**
     * Calculate all z-scores for a measurement
     *
     * @param  string  $sex  Child's sex
     * @param  int  $ageInDays  Age in days
     * @param  float  $weightKg  Weight in kg
     * @param  float  $heightCm  Height in cm
     * @return array Array of z-scores and classifications
     */
    public function calculateAll(string $sex, int $ageInDays, float $weightKg, float $heightCm): array
    {
        $wfaZscore = $this->calculateWeightForAge($sex, $ageInDays, $weightKg);
        $hfaZscore = $this->calculateHeightForAge($sex, $ageInDays, $heightCm);
        $wfhZscore = $this->calculateWeightForHeight($sex, $heightCm, $weightKg);

        return [
            'weight_for_age_zscore' => $wfaZscore !== null ? round($wfaZscore, 2) : null,
            'height_for_age_zscore' => $hfaZscore !== null ? round($hfaZscore, 2) : null,
            'weight_for_height_zscore' => $wfhZscore !== null ? round($wfhZscore, 2) : null,
            'weight_for_age_status' => $wfaZscore !== null ? $this->classifyWeightForAge($wfaZscore) : null,
            'height_for_age_status' => $hfaZscore !== null ? $this->classifyHeightForAge($hfaZscore) : null,
            'weight_for_height_status' => $wfhZscore !== null ? $this->classifyWeightForHeight($wfhZscore) : null,
            'opt_classification' => $this->determineOptClassification($wfaZscore, $hfaZscore, $wfhZscore),
        ];
    }
}
