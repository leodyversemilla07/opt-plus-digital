<?php

namespace Database\Factories;

use App\Models\Child;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Measurement>
 */
class MeasurementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $ageInMonths = fake()->numberBetween(0, 59);
        
        // Realistic weight ranges by age (in kg)
        $weightRanges = [
            [3, 5],    // 0-2 months
            [4, 6],    // 3-5 months
            [5, 8],    // 6-11 months
            [7, 10],   // 12-23 months
            [9, 14],   // 24-35 months
            [11, 16],  // 36-47 months
            [13, 18],  // 48-59 months
        ];
        
        // Realistic height ranges by age (in cm)
        $heightRanges = [
            [50, 60],  // 0-2 months
            [58, 68],  // 3-5 months
            [65, 75],  // 6-11 months
            [75, 88],  // 12-23 months
            [85, 98],  // 24-35 months
            [92, 105], // 36-47 months
            [98, 112], // 48-59 months
        ];
        
        $ageGroup = min(6, floor($ageInMonths / 6));
        
        $weight = fake()->randomFloat(2, $weightRanges[$ageGroup][0], $weightRanges[$ageGroup][1]);
        $height = fake()->randomFloat(2, $heightRanges[$ageGroup][0], $heightRanges[$ageGroup][1]);
        
        // Generate z-scores (normally distributed around 0)
        $wfaZscore = fake()->randomFloat(2, -3, 2);
        $hfaZscore = fake()->randomFloat(2, -3, 2);
        $wfhZscore = fake()->randomFloat(2, -3, 2);
        
        // Determine statuses based on z-scores
        $wfaStatus = $this->getWeightForAgeStatus($wfaZscore);
        $hfaStatus = $this->getHeightForAgeStatus($hfaZscore);
        $wfhStatus = $this->getWeightForHeightStatus($wfhZscore);
        
        // Determine OPT classification
        $optClassification = $this->getOptClassification($wfaZscore, $hfaZscore, $wfhZscore);
        
        return [
            'child_id' => Child::factory(),
            'measurement_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'age_in_months' => $ageInMonths,
            'weight_kg' => $weight,
            'height_length_cm' => $height,
            'measurement_type' => $ageInMonths < 24 ? 'recumbent' : 'standing',
            'weight_for_age_zscore' => $wfaZscore,
            'height_for_age_zscore' => $hfaZscore,
            'weight_for_height_zscore' => $wfhZscore,
            'weight_for_age_status' => $wfaStatus,
            'height_for_age_status' => $hfaStatus,
            'weight_for_height_status' => $wfhStatus,
            'opt_classification' => $optClassification,
            'muac_cm' => fake()->optional()->randomFloat(2, 11.5, 16.5),
            'notes' => fake()->optional()->sentence(),
            'measured_by_user_id' => User::factory(),
            'synced_at' => fake()->optional()->dateTimeBetween('-1 month', 'now'),
        ];
    }

    private function getWeightForAgeStatus(float $zscore): string
    {
        if ($zscore < -3) return 'severely_underweight';
        if ($zscore < -2) return 'underweight';
        if ($zscore > 2) return 'overweight';
        return 'normal';
    }

    private function getHeightForAgeStatus(float $zscore): string
    {
        if ($zscore < -3) return 'severely_stunted';
        if ($zscore < -2) return 'stunted';
        if ($zscore > 2) return 'tall';
        return 'normal';
    }

    private function getWeightForHeightStatus(float $zscore): string
    {
        if ($zscore < -3) return 'severely_wasted';
        if ($zscore < -2) return 'wasted';
        if ($zscore > 2) return 'overweight';
        if ($zscore > 3) return 'obese';
        return 'normal';
    }

    private function getOptClassification(float $wfa, float $hfa, float $wfh): string
    {
        // Severely malnourished: any z-score < -3
        if ($wfa < -3 || $hfa < -3 || $wfh < -3) {
            return 'severely_malnourished';
        }
        
        // Moderately malnourished: any z-score between -3 and -2
        if ($wfa < -2 || $hfa < -2 || $wfh < -2) {
            return 'moderately_malnourished';
        }
        
        // Overweight/obese
        if ($wfh > 2) {
            return $wfh > 3 ? 'obese' : 'overweight';
        }
        
        return 'normal';
    }

    public function normal(): static
    {
        return $this->state(fn (array $attributes) => [
            'weight_for_age_zscore' => fake()->randomFloat(2, -1, 1),
            'height_for_age_zscore' => fake()->randomFloat(2, -1, 1),
            'weight_for_height_zscore' => fake()->randomFloat(2, -1, 1),
            'opt_classification' => 'normal',
        ]);
    }

    public function malnourished(): static
    {
        return $this->state(fn (array $attributes) => [
            'weight_for_age_zscore' => fake()->randomFloat(2, -3, -2),
            'opt_classification' => 'moderately_malnourished',
        ]);
    }

    public function severelyMalnourished(): static
    {
        return $this->state(fn (array $attributes) => [
            'weight_for_age_zscore' => fake()->randomFloat(2, -4, -3),
            'opt_classification' => 'severely_malnourished',
        ]);
    }
}
