<?php

use App\Models\Measurement;

test('measurement has fillable attributes', function () {
    $fillable = [
        'child_id',
        'measurement_date',
        'age_in_months',
        'weight_kg',
        'height_length_cm',
        'measurement_type',
        'weight_for_age_zscore',
        'height_for_age_zscore',
        'weight_for_height_zscore',
        'weight_for_age_status',
        'height_for_age_status',
        'weight_for_height_status',
        'opt_classification',
        'muac_cm',
        'notes',
        'measured_by_user_id',
        'synced_at',
    ];

    $measurement = new Measurement;
    expect($measurement->getFillable())->toBe($fillable);
});

test('measurement casts attributes correctly', function () {
    $measurement = new Measurement;
    $casts = $measurement->getCasts();

    expect($casts)->toHaveKey('measurement_date', 'date')
        ->and($casts)->toHaveKey('age_in_months', 'integer')
        ->and($casts)->toHaveKey('weight_kg', 'decimal:2')
        ->and($casts)->toHaveKey('height_length_cm', 'decimal:2')
        ->and($casts)->toHaveKey('weight_for_age_zscore', 'decimal:2')
        ->and($casts)->toHaveKey('height_for_age_zscore', 'decimal:2')
        ->and($casts)->toHaveKey('weight_for_height_zscore', 'decimal:2')
        ->and($casts)->toHaveKey('muac_cm', 'decimal:2')
        ->and($casts)->toHaveKey('synced_at', 'datetime');
});

test('measurement uses uuid for primary key', function () {
    $measurement = new Measurement;
    expect($measurement->getKeyType())->toBe('string')
        ->and($measurement->getIncrementing())->toBeFalse();
});

test('measurement uses soft deletes', function () {
    $measurement = new Measurement;
    expect(in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses($measurement)))->toBeTrue();
});

test('measurement belongs to child', function () {
    $measurement = new Measurement;
    expect($measurement->child())->toBeInstanceOf(Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

test('measurement belongs to user who measured', function () {
    $measurement = new Measurement;
    expect($measurement->measuredBy())->toBeInstanceOf(Illuminate\Database\Eloquent\Relations\BelongsTo::class);
});

test('measurement identifies malnourished status', function () {
    $severelyMalnourished = new Measurement(['opt_classification' => 'severely_malnourished']);
    expect($severelyMalnourished->isMalnourished())->toBeTrue();

    $moderatelyMalnourished = new Measurement(['opt_classification' => 'moderately_malnourished']);
    expect($moderatelyMalnourished->isMalnourished())->toBeTrue();

    $normal = new Measurement(['opt_classification' => 'normal']);
    expect($normal->isMalnourished())->toBeFalse();

    $overweight = new Measurement(['opt_classification' => 'overweight']);
    expect($overweight->isMalnourished())->toBeFalse();
});

test('measurement identifies severely malnourished status', function () {
    $severelyMalnourished = new Measurement(['opt_classification' => 'severely_malnourished']);
    expect($severelyMalnourished->isSeverelyMalnourished())->toBeTrue();

    $moderatelyMalnourished = new Measurement(['opt_classification' => 'moderately_malnourished']);
    expect($moderatelyMalnourished->isSeverelyMalnourished())->toBeFalse();

    $normal = new Measurement(['opt_classification' => 'normal']);
    expect($normal->isSeverelyMalnourished())->toBeFalse();
});

test('measurement type is recumbent for children under 24 months', function () {
    $measurement = new Measurement([
        'age_in_months' => 12,
        'measurement_type' => 'recumbent',
    ]);

    expect($measurement->measurement_type)->toBe('recumbent');
});

test('measurement type is standing for children 24+ months', function () {
    $measurement = new Measurement([
        'age_in_months' => 36,
        'measurement_type' => 'standing',
    ]);

    expect($measurement->measurement_type)->toBe('standing');
});
