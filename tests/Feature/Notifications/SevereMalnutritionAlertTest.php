<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use App\Models\User;
use App\Notifications\SevereMalnutritionAlert;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

// Test data setup - shared across all tests
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    // Create a barangay and users
    $this->barangay = Barangay::factory()->create();

    // Admin user
    $this->admin = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => true,
    ]);
    $this->admin->assignRole('admin');

    // BNS user in same barangay
    $this->bns = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => true,
    ]);
    $this->bns->assignRole('bns');

    // BHW user in same barangay
    $this->bhw = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => true,
    ]);
    $this->bhw->assignRole('bhw');

    // User from a different barangay
    $otherBarangay = Barangay::factory()->create();
    $this->otherUser = User::factory()->create([
        'barangay_id' => $otherBarangay->id,
        'is_active' => true,
    ]);
    $this->otherUser->assignRole('bns');

    // Inactive user in same barangay
    $this->inactiveUser = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => false,
    ]);
    $this->inactiveUser->assignRole('bns');

    // Child in the barangay
    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->bns->id,
    ]);
});

it('sends severe malnutrition notification when a measurement is created with SAM', function () {
    Notification::fake();

    Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
        'height_for_age_zscore' => -2.0,
        'weight_for_height_zscore' => -3.2,
        'measured_by_user_id' => $this->bns->id,
    ]);

    Notification::assertSentTo(
        [$this->admin, $this->bns, $this->bhw],
        SevereMalnutritionAlert::class,
    );

    Notification::assertNotSentTo(
        [$this->inactiveUser, $this->otherUser],
        SevereMalnutritionAlert::class,
    );
});

it('does not send notification for non-SAM measurements', function () {
    Notification::fake();

    Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'normal',
        'weight_for_age_zscore' => 0,
        'weight_for_height_zscore' => 0,
        'height_for_age_zscore' => 0,
        'measured_by_user_id' => $this->bns->id,
    ]);

    Notification::assertNothingSent();
});

it('sends notification when measurement is updated to SAM classification', function () {
    Notification::fake();

    // Create a normal measurement first
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'normal',
        'weight_for_age_zscore' => 0,
        'weight_for_height_zscore' => 0,
        'height_for_age_zscore' => 0,
        'measured_by_user_id' => $this->bns->id,
    ]);

    Notification::assertNothingSent();

    // Update to SAM
    $measurement->update([
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
    ]);

    Notification::assertSentTo(
        [$this->admin, $this->bns, $this->bhw],
        SevereMalnutritionAlert::class,
    );
});

it('does not send notification on update if classification did not change', function () {
    Notification::fake();

    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
        'height_for_age_zscore' => -2.0,
        'weight_for_height_zscore' => -3.2,
        'measured_by_user_id' => $this->bns->id,
    ]);

    Notification::assertSentTo(
        [$this->admin, $this->bns, $this->bhw],
        SevereMalnutritionAlert::class,
    );

    // Reset fake
    Notification::fake();

    // Update weight but keep the same SAM classification
    $measurement->update([
        'weight_kg' => 5.0,
        'opt_classification' => 'sam', // Same value - wasChanged should be false
    ]);

    Notification::assertNothingSent();
});

it('sends notification to child creator even if they lack view reports permission', function () {
    Notification::fake();

    // Create a BHW who created the child
    $creator = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => true,
    ]);
    $creator->assignRole('bhw');

    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $creator->id,
    ]);

    Measurement::factory()->create([
        'child_id' => $child->id,
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
        'weight_for_height_zscore' => -3.2,
        'height_for_age_zscore' => -2.0,
        'measured_by_user_id' => $this->bns->id,
    ]);

    Notification::assertSentTo($creator, SevereMalnutritionAlert::class);
});

it('stores notification data correctly in the database', function () {
    // No Notification::fake() — we want real database entries
    Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
        'height_for_age_zscore' => -2.0,
        'weight_for_height_zscore' => -3.2,
        'measured_by_user_id' => $this->bns->id,
        'measurement_date' => '2026-05-15',
        'age_in_months' => 24,
        'weight_kg' => 8.5,
        'height_length_cm' => 75.0,
        'has_edema' => false,
    ]);

    $notification = $this->admin->notifications()->first();

    expect($notification)->not->toBeNull();
    expect($notification->type)->toBe(SevereMalnutritionAlert::class);
    expect($notification->data['child_name'])->toBe($this->child->full_name);
    expect($notification->data['opt_classification'])->toBe('sam');
    expect($notification->data['type'])->toBe('severe_malnutrition');
    expect($notification->data['child_id'])->toBe($this->child->id);
    expect($notification->data['barangay_name'])->toBe($this->barangay->name);
    expect($notification->data['measurement_date'])->toBe('2026-05-15');
    expect($notification->data['weight_kg'])->toBe('8.50');
    expect($notification->read_at)->toBeNull();
});

it('notification data contains all required fields for the frontend', function () {
    Measurement::factory()->create([
        'child_id' => $this->child->id,
        'opt_classification' => 'sam',
        'weight_for_age_zscore' => -3.5,
        'height_for_age_zscore' => -2.0,
        'weight_for_height_zscore' => -3.2,
        'measured_by_user_id' => $this->bns->id,
        'measurement_date' => '2026-05-15',
        'age_in_months' => 24,
        'weight_kg' => 8.5,
        'height_length_cm' => 75.0,
        'has_edema' => false,
    ]);

    $notification = $this->admin->notifications()->first();
    $data = $notification->data;

    expect($data)->toHaveKeys([
        'measurement_id',
        'child_id',
        'child_name',
        'barangay_name',
        'measurement_date',
        'age_in_months',
        'weight_kg',
        'height_length_cm',
        'weight_for_age_zscore',
        'height_for_age_zscore',
        'weight_for_height_zscore',
        'opt_classification',
        'has_edema',
        'type',
    ]);
});
