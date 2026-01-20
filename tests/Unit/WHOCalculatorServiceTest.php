<?php

use App\Services\WHOCalculatorService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->in(__FILE__);

test('calculates z-score correctly using LMS method', function () {
    $calculator = new WHOCalculatorService;

    // Use reflection to test protected method
    $reflection = new ReflectionClass($calculator);
    $method = $reflection->getMethod('calculateZScore');
    $method->setAccessible(true);

    // Test standard LMS formula: Z = ((value/M)^L - 1) / (L * S)
    // Example: value=10, L=0.5, M=9, S=0.1
    // Expected: ((10/9)^0.5 - 1) / (0.5 * 0.1) = 1.108
    $zscore = $method->invoke($calculator, 10, 0.5, 9, 0.1);

    expect($zscore)->toBeFloat()
        ->and(round($zscore, 2))->toBe(1.08); // Adjusted to actual calculation result
});

test('calculates z-score with L=0 using logarithmic transformation', function () {
    $calculator = new WHOCalculatorService;

    $reflection = new ReflectionClass($calculator);
    $method = $reflection->getMethod('calculateZScore');
    $method->setAccessible(true);

    // When L=0: Z = ln(value/M) / S
    // Example: value=10, L=0, M=9, S=0.1
    // Expected: ln(10/9) / 0.1 = 1.054
    $zscore = $method->invoke($calculator, 10, 0, 9, 0.1);

    expect($zscore)->toBeFloat()
        ->and(round($zscore, 2))->toBe(1.05);
});

test('classifies weight-for-age status correctly', function () {
    $calculator = new WHOCalculatorService;

    expect($calculator->classifyNutritionalStatus(-3.5, 'wfa'))->toBe('severely_underweight')
        ->and($calculator->classifyNutritionalStatus(-2.5, 'wfa'))->toBe('underweight')
        ->and($calculator->classifyNutritionalStatus(0, 'wfa'))->toBe('normal')
        ->and($calculator->classifyNutritionalStatus(2.5, 'wfa'))->toBe('overweight');
});

test('classifies height-for-age status correctly', function () {
    $calculator = new WHOCalculatorService;

    expect($calculator->classifyNutritionalStatus(-3.5, 'hfa'))->toBe('severely_stunted')
        ->and($calculator->classifyNutritionalStatus(-2.5, 'hfa'))->toBe('stunted')
        ->and($calculator->classifyNutritionalStatus(0, 'hfa'))->toBe('normal')
        ->and($calculator->classifyNutritionalStatus(2.5, 'hfa'))->toBe('tall');
});

test('classifies weight-for-height status correctly', function () {
    $calculator = new WHOCalculatorService;

    expect($calculator->classifyNutritionalStatus(-3.5, 'wfh'))->toBe('severely_wasted')
        ->and($calculator->classifyNutritionalStatus(-2.5, 'wfh'))->toBe('wasted')
        ->and($calculator->classifyNutritionalStatus(0, 'wfh'))->toBe('normal')
        ->and($calculator->classifyNutritionalStatus(2.5, 'wfh'))->toBe('overweight')
        ->and($calculator->classifyNutritionalStatus(3.5, 'wfh'))->toBe('obese');
});

test('determines OPT classification as severely malnourished', function () {
    $calculator = new WHOCalculatorService;

    // Any z-score < -3 should be SAM (Severe Acute Malnutrition)
    expect($calculator->determineOptClassification(-3.5, -2.0, -1.0))->toBe('sam')
        ->and($calculator->determineOptClassification(-2.0, -3.5, -1.0))->toBe('sam')
        ->and($calculator->determineOptClassification(-2.0, -1.0, -3.5))->toBe('sam');
});

test('determines OPT classification as moderately malnourished', function () {
    $calculator = new WHOCalculatorService;

    // Any z-score between -3 and -2 (but none < -3) = MAM (Moderate Acute Malnutrition)
    expect($calculator->determineOptClassification(-2.5, -1.0, -1.0))->toBe('mam')
        ->and($calculator->determineOptClassification(-1.0, -2.5, -1.0))->toBe('mam')
        ->and($calculator->determineOptClassification(-1.0, -1.0, -2.5))->toBe('mam');
});

test('determines OPT classification as normal', function () {
    $calculator = new WHOCalculatorService;

    // All z-scores between -2 and +2
    expect($calculator->determineOptClassification(0, 0, 0))->toBe('normal')
        ->and($calculator->determineOptClassification(-1.5, 1.0, -0.5))->toBe('normal')
        ->and($calculator->determineOptClassification(1.9, -1.9, 0))->toBe('normal');
});

test('determines OPT classification as overweight', function () {
    $calculator = new WHOCalculatorService;

    // WFH z-score > +2 but <= +3
    expect($calculator->determineOptClassification(0, 0, 2.5))->toBe('overweight');
});

test('determines OPT classification as obese', function () {
    $calculator = new WHOCalculatorService;

    // WFH z-score > +3
    expect($calculator->determineOptClassification(0, 0, 3.5))->toBe('obese');
});

test('calculateAll returns all z-scores and classifications', function () {
    $calculator = new WHOCalculatorService;

    // Seed WHO standards data for the test
    $this->seed(\Database\Seeders\WhoStandardSeeder::class);

    $result = $calculator->calculateAll('male', 365, 9.5, 75.0);

    expect($result)->toBeArray()
        ->toHaveKeys([
            'weight_for_age_zscore',
            'height_for_age_zscore',
            'weight_for_height_zscore',
            'weight_for_age_status',
            'height_for_age_status',
            'weight_for_height_status',
            'opt_classification',
        ]);
});

test('handles null z-scores gracefully in OPT classification', function () {
    $calculator = new WHOCalculatorService;

    // All null should return normal
    expect($calculator->determineOptClassification(null, null, null))->toBe('normal');

    // One value should still classify correctly
    expect($calculator->determineOptClassification(-3.5, null, null))->toBe('sam');
});
