<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use App\Models\User;
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
    ]);
});

test('child show page loads successfully', function () {
    $response = $this->actingAs($this->user)
        ->get("/children/{$this->child->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->has('child')
        ->has('latestMeasurement')
    );
});

test('z-score values are serialized as numbers not strings', function () {
    Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
        'weight_for_age_zscore' => -1.5,
        'height_for_age_zscore' => 0.25,
        'weight_for_height_zscore' => -2.1,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$this->child->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->where('latestMeasurement.weight_for_age_zscore', fn ($value) => is_float($value))
        ->where('latestMeasurement.height_for_age_zscore', fn ($value) => is_float($value))
        ->where('latestMeasurement.weight_for_height_zscore', fn ($value) => is_float($value))
    );
});
