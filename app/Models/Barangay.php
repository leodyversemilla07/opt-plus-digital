<?php

namespace App\Models;

use Database\Factories\BarangayFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Barangay extends Model
{
    /** @use HasFactory<BarangayFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'municipality_city',
        'province',
        'region',
        'psgc_code',
        'estimated_population_0_59_months',
        'geographic_coordinates',
    ];

    protected $casts = [
        'estimated_population_0_59_months' => 'integer',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(Child::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->name}, {$this->municipality_city}, {$this->province}";
    }
}
