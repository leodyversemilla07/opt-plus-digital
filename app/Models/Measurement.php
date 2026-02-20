<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Measurement extends Model
{
    /** @use HasFactory<\Database\Factories\MeasurementFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'child_id',
        'opt_session_id',
        'measurement_date',
        'age_in_months',
        'age_in_days',
        'weight_kg',
        'height_length_cm',
        'measurement_type',
        'measurement_method',
        'weight_for_age_zscore',
        'height_for_age_zscore',
        'weight_for_height_zscore',
        'weight_for_age_status',
        'height_for_age_status',
        'weight_for_height_status',
        'opt_classification',
        'muac_cm',
        'has_edema',
        'edema_grade',
        'has_disability',
        'disability_notes',
        'is_flagged',
        'flag_reason',
        'is_overaged',
        'notes',
        'measured_by_user_id',
        'synced_at',
    ];

    protected $casts = [
        'measurement_date' => 'date',
        'age_in_months' => 'integer',
        'age_in_days' => 'integer',
        'weight_kg' => 'decimal:2',
        'height_length_cm' => 'decimal:2',
        'weight_for_age_zscore' => 'float',
        'height_for_age_zscore' => 'float',
        'weight_for_height_zscore' => 'float',
        'muac_cm' => 'decimal:2',
        'has_edema' => 'boolean',
        'has_disability' => 'boolean',
        'is_flagged' => 'boolean',
        'is_overaged' => 'boolean',
        'synced_at' => 'datetime',
    ];

    public function child(): BelongsTo
    {
        return $this->belongsTo(Child::class);
    }

    public function measuredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'measured_by_user_id');
    }

    public function optSession(): BelongsTo
    {
        return $this->belongsTo(OptSession::class);
    }

    public function isMalnourished(): bool
    {
        return in_array($this->opt_classification, ['sam', 'mam']);
    }

    public function isSeverelyMalnourished(): bool
    {
        return $this->opt_classification === 'sam';
    }
}
