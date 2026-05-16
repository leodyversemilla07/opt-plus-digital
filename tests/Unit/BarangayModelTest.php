<?php

use App\Models\Barangay;
use Illuminate\Database\Eloquent\Relations\HasMany;

test('barangay has fillable attributes', function () {
    $fillable = [
        'name',
        'municipality_city',
        'province',
        'region',
        'psgc_code',
        'estimated_population_0_59_months',
        'geographic_coordinates',
    ];

    $barangay = new Barangay;
    expect($barangay->getFillable())->toBe($fillable);
});

test('barangay casts estimated population to integer', function () {
    $barangay = new Barangay;
    expect($barangay->getCasts())->toHaveKey('estimated_population_0_59_months', 'integer');
});

test('barangay uses uuid for primary key', function () {
    $barangay = new Barangay;
    expect($barangay->getKeyType())->toBe('string')
        ->and($barangay->getIncrementing())->toBeFalse();
});

test('barangay has many children', function () {
    $barangay = new Barangay;
    expect($barangay->children())->toBeInstanceOf(HasMany::class);
});

test('barangay full name includes municipality and province', function () {
    $barangay = new Barangay([
        'name' => 'San Jose',
        'municipality_city' => 'Malolos',
        'province' => 'Bulacan',
    ]);

    expect($barangay->getFullNameAttribute())->toBe('San Jose, Malolos, Bulacan');
});

test('barangay full name formats correctly', function () {
    $barangay = new Barangay([
        'name' => 'Poblacion',
        'municipality_city' => 'Davao City',
        'province' => 'Davao del Sur',
    ]);

    expect($barangay->getFullNameAttribute())->toBe('Poblacion, Davao City, Davao del Sur');
});
