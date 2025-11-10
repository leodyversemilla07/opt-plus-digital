<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{
    /** @use HasFactory<\Database\Factories\ChildFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'family_serial_number',
        'first_name',
        'middle_name',
        'last_name',
        'sex',
        'date_of_birth',
        'address',
        'purok_sitio',
        'barangay_id',
        'mother_caregiver_name',
        'father_name',
        'contact_number',
        'alternative_contact_number',
        'is_indigenous_people',
        'ip_tribe_name',
        'photo_url',
        'qr_code',
        'created_by_user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_indigenous_people' => 'boolean',
    ];

    protected $appends = [
        'full_name',
        'age_in_months',
        'age_in_years',
    ];

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function measurements(): HasMany
    {
        return $this->hasMany(Measurement::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => trim(implode(' ', array_filter([
                $this->first_name,
                $this->middle_name,
                $this->last_name,
            ])))
        );
    }

    protected function ageInMonths(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->date_of_birth) {
                    return null;
                }

                $birthDate = $this->date_of_birth;
                $now = now();

                return (int) $birthDate->diffInMonths($now);
            }
        );
    }

    protected function ageInYears(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->date_of_birth) {
                    return null;
                }

                return $this->date_of_birth->age;
            }
        );
    }

    public function latestMeasurement()
    {
        return $this->measurements()->latest('measurement_date')->first();
    }

    public function isEligibleForOpt(): bool
    {
        $ageInMonths = $this->age_in_months;

        return $ageInMonths !== null && $ageInMonths >= 0 && $ageInMonths <= 59;
    }

    public function getCurrentNutritionalStatus(): ?string
    {
        $latest = $this->latestMeasurement();

        return $latest?->opt_classification;
    }

    public function scopeEligibleForOpt($query)
    {
        return $query->whereRaw('TIMESTAMPDIFF(MONTH, date_of_birth, NOW()) BETWEEN 0 AND 59');
    }

    public function scopeByBarangay($query, $barangayId)
    {
        return $query->where('barangay_id', $barangayId);
    }

    public function scopeIndigenousPeople($query)
    {
        return $query->where('is_indigenous_people', true);
    }
}
