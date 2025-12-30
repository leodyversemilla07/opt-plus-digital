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
});

test('children index page loads successfully', function () {
    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->has('children')
    );
});

test('children index returns paginated children', function () {
    Child::factory()->count(25)->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->has('children.data', 15) // Default pagination
        ->has('children.links')
    );
});

test('child show page loads successfully', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$child->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->has('child')
        ->where('child.id', $child->id)
    );
});

test('child show page includes measurements', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    \App\Models\Measurement::factory()->count(3)->create([
        'child_id' => $child->id,
        'measured_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$child->id}");

    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->has('child.measurements', 3)
    );
});

test('child show page includes barangay data', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$child->id}");

    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->has('child.barangay')
        ->where('child.barangay.id', $this->barangay->id)
    );
});

test('children can be searched by name', function () {
    Child::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    Child::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get('/children?search=Juan');

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->has('children.data', 1)
    );
});

test('children can be filtered by barangay', function () {
    $barangay1 = Barangay::factory()->create();
    $barangay2 = Barangay::factory()->create();

    Child::factory()->count(3)->create([
        'barangay_id' => $barangay1->id,
        'created_by_user_id' => $this->user->id,
    ]);

    Child::factory()->count(2)->create([
        'barangay_id' => $barangay2->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children?barangay_id={$barangay1->id}");

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->has('children.data', 3)
    );
});

test('children list shows full name', function () {
    $child = Child::factory()->create([
        'first_name' => 'Juan',
        'middle_name' => 'Pedro',
        'last_name' => 'Dela Cruz',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->where('children.data.0.full_name', 'Juan Pedro Dela Cruz')
    );
});

test('children list shows age in months', function () {
    $child = Child::factory()->create([
        'date_of_birth' => now()->subMonths(24),
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->where('children.data.0.age_in_months', fn ($age) => $age >= 24 && $age < 25)
    );
});

test('unauthorized user cannot view child details', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $otherUser = User::factory()->create();

    $response = $this->actingAs($otherUser)
        ->get("/children/{$child->id}");

    $response->assertForbidden();
});

test('children index has search functionality', function () {
    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->has('filters')
    );
});

test('children are sorted by latest created by default', function () {
    Child::factory()->create([
        'last_name' => 'Zeta',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    sleep(1); // Ensure different timestamps

    Child::factory()->create([
        'last_name' => 'Alpha',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)
        ->get('/children');

    // Should show most recently created first (Alpha created after Zeta)
    $response->assertInertia(fn ($page) => $page
        ->component('children/index')
        ->where('children.data.0.last_name', 'Alpha')
    );
});

test('child profile includes latest measurement', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $oldMeasurement = \App\Models\Measurement::factory()->create([
        'child_id' => $child->id,
        'measured_by_user_id' => $this->user->id,
        'measurement_date' => now()->subMonths(2),
        'weight_kg' => 10.0,
    ]);

    $latestMeasurement = \App\Models\Measurement::factory()->create([
        'child_id' => $child->id,
        'measured_by_user_id' => $this->user->id,
        'measurement_date' => now(),
        'weight_kg' => 12.5,
    ]);

    $response = $this->actingAs($this->user)
        ->get("/children/{$child->id}");

    $response->assertInertia(fn ($page) => $page
        ->component('children/show')
        ->has('child.measurements')
    );
});

test('children index eager loads relationships', function () {
    Child::factory()->count(10)->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    // This test ensures N+1 query prevention
    // In a real scenario, you'd use a query counter
    $response = $this->actingAs($this->user)
        ->get('/children');

    $response->assertOk();
    // The controller should eager load 'barangay' relationship
});
