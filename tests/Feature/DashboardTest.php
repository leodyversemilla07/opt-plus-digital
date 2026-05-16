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
});

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('guests are redirected from barangay analytics page', function () {
    $this->get(route('analytics.barangay', $this->barangay))
        ->assertRedirect(route('login'));
});

// ─── Permission Enforcement ─────────────────────────────────

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view analytics');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('user without view analytics permission cannot access dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('user without view barangay analytics permission cannot access barangay page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view analytics'); // has main dashboard, but not barangay-level

    $this->actingAs($user)
        ->get(route('analytics.barangay', $this->barangay))
        ->assertForbidden();
});

// ─── Dashboard Structure & Data ─────────────────────────────

test('dashboard returns expected inertia structure', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view analytics');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('user')
            ->has('overallStats')
            ->has('nutritionalStatus')
            ->has('highRiskChildren')
            ->has('monthlyTrends')
            ->has('ageGroupBreakdown')
            ->has('sexDisaggregated')
            ->has('f1kStatistics')
            ->has('pendingCertifications')
            ->has('recentActivity')
            ->has('recentSessions')
        );
});

test('dashboard contains overall statistics data', function () {
    $child = Child::factory()->create(['barangay_id' => $this->barangay->id]);
    Measurement::factory()->count(3)->create(['child_id' => $child->id]);

    $user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $user->givePermissionTo('view analytics');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('overallStats.total_children')
            ->has('overallStats.total_measurements')
        );
});

test('dashboard shows high risk children when data exists', function () {
    $child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => User::factory(),
    ]);
    // Create a measurement with poor z-scores (flagged as high risk)
    Measurement::factory()->create([
        'child_id' => $child->id,
        'weight_for_age_zscore' => -3.5,
        'height_for_age_zscore' => -3.2,
        'weight_for_height_zscore' => -3.0,
    ]);

    $user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $user->givePermissionTo('view analytics');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('highRiskChildren')
        );
});

// ─── Role-Specific Behavior ─────────────────────────────────

test('admin users see barangay comparison data', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('barangayComparison')
        );
});

test('municipal users see barangay comparison data', function () {
    $user = User::factory()->create();
    $user->assignRole('municipal');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('barangayComparison')
        );
});

test('bns users see empty barangay comparison data', function () {
    $user = User::factory()->create();
    $user->assignRole('bns');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('barangayComparison')
            ->where('barangayComparison', [])
        );
});

test('bhw users cannot access dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('bhw');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

// ─── Barangay Analytics Page ────────────────────────────────

test('barangay analytics page returns expected inertia structure', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('analytics.barangay', $this->barangay))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('analytics/barangay')
            ->has('barangay')
            ->has('nutritionalStatus')
            ->has('highRiskChildren')
            ->has('monthlyTrends')
            ->has('totalChildren')
            ->has('measuredChildren')
        );
});

test('barangay analytics page returns 404 for non-existent barangay', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('analytics.barangay', 'non-existent-id'))
        ->assertNotFound();
});

test('barangay analytics page shows correct barangay data', function () {
    Child::factory()->count(3)->create(['barangay_id' => $this->barangay->id]);

    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('analytics.barangay', $this->barangay))
        ->assertInertia(fn ($page) => $page
            ->component('analytics/barangay')
            ->where('barangay.id', $this->barangay->id)
            ->where('totalChildren', 3)
        );
});

test('barangay analytics measured children count is accurate', function () {
    $child = Child::factory()->create(['barangay_id' => $this->barangay->id]);
    Measurement::factory()->count(2)->create(['child_id' => $child->id]);

    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('analytics.barangay', $this->barangay))
        ->assertInertia(fn ($page) => $page
            ->where('totalChildren', 1)
            ->where('measuredChildren', 1)
        );
});
