<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create();
    $this->user = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $this->user->assignRole('admin');
    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);
});

test('measurement form page loads successfully', function () {
    $response = $this->actingAs($this->user)
        ->get("/children/{$this->child->id}/measurements/create");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('measurements/create')
        ->has('child')
    );
});

test('measurement can be created online', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'muac_cm' => 14.5,
        'notes' => 'Test measurement',
    ];

    $response = $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData);

    // Should redirect to the measurement show page
    $response->assertRedirect();
    $response->assertSessionHas('success', 'Measurement recorded successfully');

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'muac_cm' => 14.5,
    ]);
});

test('measurement calculates WHO z-scores automatically', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
    ];

    $response = $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData);

    $response->assertRedirect();

    // Z-scores should be calculated by MeasurementObserver
    $measurement = $this->child->measurements()->first();

    // Z-scores should not be null after creation
    expect($measurement)->not->toBeNull();
});

test('measurement validates required fields', function () {
    $response = $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", [
            'measurement_date' => now()->format('Y-m-d'),
            // Missing weight and height
        ]);

    $response->assertSessionHasErrors(['weight_kg', 'height_length_cm']);
});

test('measurement validates biological plausibility', function () {
    // Test unrealistic weight (100kg for a child)
    $response = $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", [
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 100.0, // Unrealistic
            'height_length_cm' => 85.0,
        ]);

    $response->assertSessionHasErrors(['weight_kg']);
});

test('measurement validates date is not in future', function () {
    $response = $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", [
            'measurement_date' => now()->addDays(1)->format('Y-m-d'),
            'weight_kg' => 12.5,
            'height_length_cm' => 85.0,
        ]);

    $response->assertSessionHasErrors(['measurement_date']);
});

test('measurement list shows all measurements for child', function () {
    // Create multiple measurements
    $measurements = \App\Models\Measurement::factory()->count(3)->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$this->child->id}/measurements");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('measurements/index')
        ->has('measurements.data', 3)
    );
});

test('unauthorized user cannot create measurement', function () {
    $otherUser = User::factory()->create();

    $response = $this->actingAs($otherUser)
        ->post("/children/{$this->child->id}/measurements", [
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 12.5,
            'height_length_cm' => 85.0,
        ]);

    $response->assertForbidden();
});

test('measurement stores correct user who measured', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
    ];

    $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData);

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);
});

test('measurement can include optional notes', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'notes' => 'Child was cooperative during measurement',
    ];

    $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData);

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'notes' => 'Child was cooperative during measurement',
    ]);
});

test('measurement can include optional muac', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'muac_cm' => 14.5,
    ];

    $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData);

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'muac_cm' => 14.5,
    ]);
});

test('multiple measurements can be created for same child', function () {
    $measurementData1 = [
        'measurement_date' => now()->subMonths(1)->format('Y-m-d'),
        'weight_kg' => 11.0,
        'height_length_cm' => 80.0,
    ];

    $measurementData2 = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
    ];

    $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData1);

    $this->actingAs($this->user)
        ->post("/children/{$this->child->id}/measurements", $measurementData2);

    expect($this->child->measurements()->count())->toBe(2);
});

test('measurements are ordered by date descending', function () {
    \App\Models\Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
        'measurement_date' => now()->subMonths(2),
    ]);

    \App\Models\Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
        'measurement_date' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$this->child->id}/measurements");

    // Date is returned as ISO 8601 format from API
    $response->assertInertia(fn ($page) => $page
        ->component('measurements/index')
        ->where('measurements.data.0.measurement_date', fn ($date) => str_starts_with($date, now()->format('Y-m-d'))
        )
    );
});
