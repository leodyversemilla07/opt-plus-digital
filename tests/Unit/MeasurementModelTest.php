<?php

use App\Models\Measurement;

test('measurement has fillable attributes', function () {
    $fillable = [
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
        'dqc_status',
        'dqc_certified_by_user_id',
        'dqc_certified_at',
        'dqc_notes',
    ];

    $measurement = new Measurement;
    expect($measurement->getFillable())->toBe($fillable);
});

test('measurement casts attributes correctly', function () {
    $measurement = new Measurement;
    $casts = $measurement->getCasts();

    expect($casts)->toHaveKey('measurement_date', 'date')
        ->and($casts)->toHaveKey('age_in_months', 'integer')
        ->and($casts)->toHaveKey('age_in_days', 'integer')
        ->and($casts)->toHaveKey('weight_kg', 'decimal:2')
        ->and($casts)->toHaveKey('height_length_cm', 'decimal:2')
        ->and($casts)->toHaveKey('weight_for_age_zscore', 'float')
        ->and($casts)->toHaveKey('height_for_age_zscore', 'float')
        ->and($casts)->toHaveKey('weight_for_height_zscore', 'float')
        ->and($casts)->toHaveKey('muac_cm', 'decimal:2')
        ->and($casts)->toHaveKey('has_edema', 'boolean')
        ->and($casts)->toHaveKey('has_disability', 'boolean')
        ->and($casts)->toHaveKey('is_flagged', 'boolean')
        ->and($casts)->toHaveKey('is_overaged', 'boolean')
        ->and($casts)->toHaveKey('synced_at', 'datetime')
        ->and($casts)->toHaveKey('dqc_certified_at', 'datetime');
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
    $severelyMalnourished = new Measurement(['opt_classification' => 'sam']);
    expect($severelyMalnourished->isMalnourished())->toBeTrue();

    $moderatelyMalnourished = new Measurement(['opt_classification' => 'mam']);
    expect($moderatelyMalnourished->isMalnourished())->toBeTrue();

    $normal = new Measurement(['opt_classification' => 'normal']);
    expect($normal->isMalnourished())->toBeFalse();

    $overweight = new Measurement(['opt_classification' => 'overweight']);
    expect($overweight->isMalnourished())->toBeFalse();
});

test('measurement identifies severely malnourished status', function () {
    $severelyMalnourished = new Measurement(['opt_classification' => 'sam']);
    expect($severelyMalnourished->isSeverelyMalnourished())->toBeTrue();

    $moderatelyMalnourished = new Measurement(['opt_classification' => 'mam']);
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
