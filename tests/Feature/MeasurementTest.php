<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
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

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected to login when accessing measurements index', function () {
    $this->get(route('children.measurements.index', $this->child))
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when accessing measurement creation form', function () {
    $this->get(route('children.measurements.create', $this->child))
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when storing a measurement', function () {
    $this->post(route('children.measurements.store', $this->child), [])
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when viewing a measurement', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $this->get(route('children.measurements.show', [$this->child, $measurement]))
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when editing a measurement', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $this->get(route('children.measurements.edit', [$this->child, $measurement]))
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when updating a measurement', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $this->put(route('children.measurements.update', [$this->child, $measurement]), [])
        ->assertRedirect(route('login'));
});

test('guests are redirected to login when deleting a measurement', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $this->delete(route('children.measurements.destroy', [$this->child, $measurement]))
        ->assertRedirect(route('login'));
});

// ─── Permission Enforcement ─────────────────────────────────

test('user without view measurements permission cannot view index', function () {
    $userWithoutPerm = User::factory()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($userWithoutPerm)
        ->get(route('children.measurements.index', $this->child))
        ->assertForbidden();
});

test('user without create measurements permission cannot see create form', function () {
    $userWithoutPerm = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->actingAs($userWithoutPerm)
        ->get(route('children.measurements.create', $this->child))
        ->assertForbidden();
});

test('user without create measurements permission cannot store', function () {
    $userWithoutPerm = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->actingAs($userWithoutPerm)
        ->post(route('children.measurements.store', $this->child), [
            'measurement_date' => now()->format('Y-m-d'),
            'weight_kg' => 12.5,
            'height_length_cm' => 85.0,
        ])
        ->assertForbidden();
});

test('user without edit measurements permission cannot update', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $userWithoutPerm = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->actingAs($userWithoutPerm)
        ->put(route('children.measurements.update', [$this->child, $measurement]), [
            'weight_kg' => 13.0,
        ])
        ->assertForbidden();
});

test('user without delete measurements permission cannot delete', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);
    $userWithoutPerm = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->actingAs($userWithoutPerm)
        ->delete(route('children.measurements.destroy', [$this->child, $measurement]))
        ->assertForbidden();
});

// ─── BHW/BNS Barangay Scoping ───────────────────────────────

test('bhw can only view measurements in their own barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    $otherChild = Child::factory()->create(['barangay_id' => $otherBarangay->id]);
    $measurement = Measurement::factory()->create(['child_id' => $otherChild->id]);

    $bhw = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.measurements.show', [$otherChild, $measurement]))
        ->assertForbidden();
});

test('bhw can view measurements in their own barangay', function () {
    $measurement = Measurement::factory()->create(['child_id' => $this->child->id]);

    $bhw = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.measurements.show', [$this->child, $measurement]))
        ->assertOk();
});

test('bhw can only update measurements in their own barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    $otherChild = Child::factory()->create(['barangay_id' => $otherBarangay->id]);
    $measurement = Measurement::factory()->create(['child_id' => $otherChild->id]);

    $bhw = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->put(route('children.measurements.update', [$otherChild, $measurement]), [
            'weight_kg' => 13.0,
        ])
        ->assertForbidden();
});

// ─── CRUD Operations ────────────────────────────────────────

test('measurement index page loads successfully', function () {
    Measurement::factory()->count(3)->create(['child_id' => $this->child->id]);

    $this->actingAs($this->user)
        ->get(route('children.measurements.index', $this->child))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('measurements/index')
            ->has('child')
            ->has('measurements.data', 3)
            ->has('statistics')
        );
});

test('measurement create form loads successfully', function () {
    $this->actingAs($this->user)
        ->get(route('children.measurements.create', $this->child))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('measurements/create')
            ->has('child')
        );
});

test('measurement can be created with valid data', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'muac_cm' => 14.5,
        'has_edema' => false,
        'has_disability' => false,
        'notes' => 'Routine checkup',
    ];

    $response = $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), $measurementData);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Measurement recorded successfully');

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'measured_by_user_id' => $this->user->id,
        'notes' => 'Routine checkup',
    ]);
});

test('measurement creation fails with invalid data', function () {
    $response = $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), [
            'measurement_date' => 'not-a-date',
            'weight_kg' => -1,
            'height_length_cm' => 5,
        ]);

    $response->assertSessionHasErrors(['measurement_date', 'weight_kg', 'height_length_cm']);
});

test('measurement creation fails with future date', function () {
    $response = $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), [
            'measurement_date' => now()->addDays(1)->format('Y-m-d'),
            'weight_kg' => 12.5,
            'height_length_cm' => 85.0,
        ]);

    $response->assertSessionHasErrors(['measurement_date']);
});

test('measurement show page loads successfully', function () {
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('children.measurements.show', [$this->child, $measurement]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('measurements/show')
            ->has('child')
            ->has('measurement')
        );
});

test('measurement belonging to a different child returns 404', function () {
    $otherChild = Child::factory()->create();
    $measurement = Measurement::factory()->create(['child_id' => $otherChild->id]);

    $this->actingAs($this->user)
        ->get(route('children.measurements.show', [$this->child, $measurement]))
        ->assertNotFound();
});

test('measurement edit form loads successfully', function () {
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('children.measurements.edit', [$this->child, $measurement]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('measurements/edit')
            ->has('child')
            ->has('measurement')
        );
});

test('measurement can be updated', function () {
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
        'weight_kg' => 10.0,
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('children.measurements.update', [$this->child, $measurement]), [
            'weight_kg' => 12.0,
            'height_length_cm' => 86.0,
            'measurement_date' => now()->format('Y-m-d'),
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Measurement updated successfully');

    $this->assertDatabaseHas('measurements', [
        'id' => $measurement->id,
        'weight_kg' => 12.0,
        'height_length_cm' => 86.0,
    ]);
});

test('measurement cannot be updated with invalid data', function () {
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->put(route('children.measurements.update', [$this->child, $measurement]), [
            'weight_kg' => 0,
        ]);

    $response->assertSessionHasErrors(['weight_kg']);
});

test('measurement can be deleted', function () {
    $measurement = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->delete(route('children.measurements.destroy', [$this->child, $measurement]));

    $response->assertRedirect();
    $response->assertSessionHas('success', 'Measurement deleted successfully');

    $this->assertSoftDeleted($measurement);
});

test('measurement from different child cannot be deleted via wrong child', function () {
    $otherChild = Child::factory()->create();
    $measurement = Measurement::factory()->create(['child_id' => $otherChild->id]);

    $this->actingAs($this->user)
        ->delete(route('children.measurements.destroy', [$this->child, $measurement]))
        ->assertNotFound();
});

// ─── Edge Cases ──────────────────────────────────────────────

test('measurement with edema can be recorded', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'has_edema' => true,
        'edema_grade' => '+1',
    ];

    $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), $measurementData)
        ->assertRedirect();

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'has_edema' => true,
        'edema_grade' => '+1',
    ]);
});

test('measurement with disability notes can be recorded', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 15.0,
        'height_length_cm' => 90.0,
        'has_disability' => true,
        'disability_notes' => 'Child has visual impairment',
    ];

    $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), $measurementData)
        ->assertRedirect();

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'has_disability' => true,
        'disability_notes' => 'Child has visual impairment',
    ]);
});

test('muac_only measurement method can be recorded', function () {
    $measurementData = [
        'measurement_date' => now()->format('Y-m-d'),
        'weight_kg' => 12.5,
        'height_length_cm' => 85.0,
        'measurement_method' => 'muac_only',
        'muac_cm' => 14.0,
    ];

    $this->actingAs($this->user)
        ->post(route('children.measurements.store', $this->child), $measurementData)
        ->assertRedirect();

    $this->assertDatabaseHas('measurements', [
        'child_id' => $this->child->id,
        'measurement_method' => 'muac_only',
        'muac_cm' => 14.0,
    ]);
});

test('measurements index respects sorting', function () {
    $old = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measurement_date' => now()->subMonths(2),
    ]);
    $recent = Measurement::factory()->create([
        'child_id' => $this->child->id,
        'measurement_date' => now(),
    ]);

    $response = $this->actingAs($this->user)
        ->get(route('children.measurements.index', $this->child));

    $response->assertInertia(fn ($page) => $page
        ->component('measurements/index')
        ->where('measurements.data.0.id', $recent->id)
        ->where('measurements.data.1.id', $old->id)
    );
});
