<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create();
    $this->user = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $this->user->assignRole('admin');
    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
        'date_of_birth' => Carbon::parse('2023-01-15'),
    ]);
});

test('sync endpoint creates measurement successfully', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => $this->child->id,
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 12.5,
            'height_length_cm' => 85.0,
            'muac_cm' => 14.5,
            'notes' => 'Synced from offline device',
            'localId' => 'local-abc123',
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'muac_cm' => 14.5,
        'notes' => 'Synced from offline device',
        'measured_by_user_id' => $this->user->id,
    ]);
});

test('sync endpoint returns measurement id', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => $this->child->id,
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 10.0,
            'height_length_cm' => 75.0,
        ]);

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'measurement_id',
        ]);
});

test('sync endpoint requires auth', function () {
    $response = $this->postJson(route('api.measurements.sync'), [
        'child_id' => $this->child->id,
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 10.0,
        'height_length_cm' => 75.0,
    ]);

    $response->assertUnauthorized();
});

test('sync endpoint validates required fields', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => $this->child->id,
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['measurement_date', 'weight_kg', 'height_length_cm']);
});

test('sync endpoint validates child exists', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => '00000000-0000-0000-0000-000000000000',
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 10.0,
            'height_length_cm' => 75.0,
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['child_id']);
});

test('sync endpoint records synced_at timestamp', function () {
    $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => $this->child->id,
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 10.0,
            'height_length_cm' => 75.0,
        ]);

    $measurement = $this->child->measurements()->first();
    expect($measurement->synced_at)->not->toBeNull();
});

test('sync endpoint validates measurement date not in future', function () {
    $response = $this->actingAs($this->user)
        ->postJson(route('api.measurements.sync'), [
            'child_id' => $this->child->id,
            'measurement_date' => now()->addDay()->format('Y-m-d'),
            'weight_kg' => 10.0,
            'height_length_cm' => 75.0,
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['measurement_date']);
});
