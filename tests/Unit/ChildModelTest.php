<?php

use App\Models\Child;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

test('child has fillable attributes', function () {
    $fillable = [
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

    $child = new Child;
    expect($child->getFillable())->toBe($fillable);
});

test('child casts attributes correctly', function () {
    $child = new Child;
    expect($child->getCasts())->toHaveKey('date_of_birth', 'date')
        ->and($child->getCasts())->toHaveKey('is_indigenous_people', 'boolean');
});

test('child uses uuid for primary key', function () {
    $child = new Child;
    expect($child->getKeyType())->toBe('string')
        ->and($child->getIncrementing())->toBeFalse();
});

test('child uses soft deletes', function () {
    $child = new Child;
    expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($child)))->toBeTrue();
});

test('child full name accessor combines names correctly', function () {
    $child = new Child([
        'first_name' => 'Juan',
        'middle_name' => 'Santos',
        'last_name' => 'Dela Cruz',
    ]);

    expect($child->full_name)->toBe('Juan Santos Dela Cruz');
});

test('child full name handles missing middle name', function () {
    $child = new Child([
        'first_name' => 'Maria',
        'middle_name' => '',
        'last_name' => 'Garcia',
    ]);

    expect($child->full_name)->toBe('Maria Garcia');
});

test('child age in months is calculated correctly', function () {
    $child = new Child([
        'date_of_birth' => now()->subMonths(24),
    ]);

    expect($child->age_in_months)->toBe(24);
});

test('child age in years is calculated correctly', function () {
    $child = new Child([
        'date_of_birth' => now()->subYears(3)->subMonths(6),
    ]);

    expect($child->age_in_years)->toBe(3);
});

test('child is eligible for OPT when age is 0-59 months', function () {
    // 0 months (newborn)
    $newborn = new Child(['date_of_birth' => now()]);
    expect($newborn->isEligibleForOpt())->toBeTrue();

    // 24 months (2 years)
    $toddler = new Child(['date_of_birth' => now()->subMonths(24)]);
    expect($toddler->isEligibleForOpt())->toBeTrue();

    // 59 months (just under 5 years)
    $almostFive = new Child(['date_of_birth' => now()->subMonths(59)]);
    expect($almostFive->isEligibleForOpt())->toBeTrue();
});

test('child is not eligible for OPT when age is 60+ months', function () {
    $child = new Child(['date_of_birth' => now()->subMonths(60)]);
    expect($child->isEligibleForOpt())->toBeFalse();

    $olderChild = new Child(['date_of_birth' => now()->subYears(6)]);
    expect($olderChild->isEligibleForOpt())->toBeFalse();
});

test('child belongs to barangay', function () {
    $child = new Child;
    expect($child->barangay())->toBeInstanceOf(BelongsTo::class);
});

test('child has many measurements', function () {
    $child = new Child;
    expect($child->measurements())->toBeInstanceOf(HasMany::class);
});

test('child belongs to user who created it', function () {
    $child = new Child;
    expect($child->createdBy())->toBeInstanceOf(BelongsTo::class);
});
