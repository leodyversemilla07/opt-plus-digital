<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhoStandard extends Model
{
    protected $fillable = [
        'indicator',
        'sex',
        'age_or_length',
        'l',
        'm',
        's',
    ];

    protected $casts = [
        'age_or_length' => 'integer',
        'l' => 'decimal:6',
        'm' => 'decimal:6',
        's' => 'decimal:6',
    ];

    /**
     * Get WHO standard for specific parameters
     */
    public static function getStandard(string $indicator, string $sex, int $ageOrLength): ?self
    {
        return static::where('indicator', $indicator)
            ->where('sex', $sex)
            ->where('age_or_length', $ageOrLength)
            ->first();
    }

    /**
     * Get WHO standard with interpolation if exact match not found
     */
    public static function getStandardWithInterpolation(string $indicator, string $sex, float $ageOrLength): ?array
    {
        $floor = floor($ageOrLength);
        $ceil = ceil($ageOrLength);

        if ($floor == $ceil) {
            $standard = static::getStandard($indicator, $sex, (int)$floor);
            return $standard ? [
                'l' => (float)$standard->l,
                'm' => (float)$standard->m,
                's' => (float)$standard->s,
            ] : null;
        }

        $lower = static::getStandard($indicator, $sex, (int)$floor);
        $upper = static::getStandard($indicator, $sex, (int)$ceil);

        if (!$lower || !$upper) {
            return null;
        }

        // Linear interpolation
        $fraction = $ageOrLength - $floor;
        
        return [
            'l' => (float)$lower->l + ($upper->l - $lower->l) * $fraction,
            'm' => (float)$lower->m + ($upper->m - $lower->m) * $fraction,
            's' => (float)$lower->s + ($upper->s - $lower->s) * $fraction,
        ];
    }
}
