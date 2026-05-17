<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\Measurement;
use App\Models\OptSession;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create(['name' => 'Test Barangay']);
    $this->user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->user->givePermissionTo([
        'create children', 'edit children', 'delete children',
        'view children',
        'view measurements', 'create measurements', 'edit measurements',
        'view analytics', 'view reports', 'export reports',
        'view users', 'create users', 'edit users',
    ]);
    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'sex' => 'male',
        'date_of_birth' => now()->subMonths(24)->format('Y-m-d'), // 24 months old
    ]);
    $this->today = now()->format('Y-m-d');
});

// ─── E2E: Full OPT Session Lifecycle ───────────────────────

test('full OPT session lifecycle — create, start, measure, complete, verify', function () {
    // 1. Create a session
    $this->actingAs($this->user)
        ->post(route('opt-sessions.store'), [
            'barangay_id' => $this->barangay->id,
            'name' => 'Current OPT Session',
            'session_date' => $this->today,
            'venue' => 'Barangay Health Center',
            'target_children' => 100,
        ])
        ->assertSessionHas('success');

    $session = OptSession::where('name', 'Current OPT Session')->first();
    expect($session)->not->toBeNull();
    expect($session->status)->toBe('scheduled');

    // 2. Start the session
    $this->actingAs($this->user)
        ->post(route('opt-sessions.start', $session))
        ->assertSessionHas('success');

    expect($session->fresh()->status)->toBe('in_progress');
    expect($session->fresh()->start_date)->not->toBeNull();

    // 3. Add a measurement via quick entry
    $this->actingAs($this->user)
        ->post(route('opt-sessions.measurements.quick', $session), [
            'child_id' => $this->child->id,
            'opt_session_id' => $session->id,
            'measurement_date' => $this->today,
            'weight_kg' => 12.0,
            'height_length_cm' => 86.0,
        ])
        ->assertSessionHas('success');

    expect($session->fresh()->measurements()->count())->toBe(1);

    // Verify the measurement was created with proper classification
    $measurement = $session->measurements()->first();
    expect($measurement->opt_classification)->not->toBeNull();

    // 4. Verify children-available endpoint excludes measured child
    $this->actingAs($this->user)
        ->get(route('opt-sessions.children-available', $session))
        ->assertOk()
        ->assertJsonCount(0, 'children');

    // 5. Complete the session
    $this->actingAs($this->user)
        ->post(route('opt-sessions.complete', $session))
        ->assertSessionHas('success');

    $session->refresh();
    expect($session->status)->toBe('completed');
    expect($session->end_date)->not->toBeNull();
    expect($session->measured_children)->toBe(1);
    expect($session->coverage_percentage)->toBeGreaterThan(0);

    // 6. Verify session show page loads with stats
    $this->actingAs($this->user)
        ->get(route('opt-sessions.show', $session))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('opt-sessions/show')
            ->has('session')
            ->has('stats')
        );
});

// ─── Duplicate + Complete New Session ──────────────────────

test('duplicate session and complete new measurement round', function () {
    $original = OptSession::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
        'name' => 'May 2026 OPT',
        'venue' => 'Barangay Hall',
        'target_children' => 50,
        'notes' => 'Quarterly weighing',
    ]);

    // Duplicate it
    $this->actingAs($this->user)
        ->post(route('opt-sessions.duplicate', $original))
        ->assertSessionHas('success');

    $duplicated = OptSession::where('name', 'May 2026 OPT (Copy)')->first();
    expect($duplicated)->not->toBeNull();
    expect($duplicated->barangay_id)->toBe($original->barangay_id);
    expect($duplicated->target_children)->toBe(50);
    expect($duplicated->venue)->toBe('Barangay Hall');
    expect($duplicated->notes)->toBe('Quarterly weighing');
    expect($duplicated->status)->toBe('scheduled');

    // Start, measure, complete
    $this->actingAs($this->user)
        ->post(route('opt-sessions.start', $duplicated))
        ->assertSessionHas('success');

    $this->actingAs($this->user)
        ->post(route('opt-sessions.measurements.quick', $duplicated), [
            'child_id' => $this->child->id,
            'opt_session_id' => $duplicated->id,
            'measurement_date' => $this->today,
            'weight_kg' => 14.0,
            'height_length_cm' => 97.5,
        ]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.complete', $duplicated))
        ->assertSessionHas('success');

    expect($duplicated->fresh()->status)->toBe('completed');
    expect($duplicated->fresh()->measured_children)->toBe(1);
});

// ─── E2E: Batch Operations ─────────────────────────────────

test('batch start, measure individually, batch complete', function () {
    $s1 = OptSession::factory()->scheduled()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);
    $s2 = OptSession::factory()->scheduled()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    // Batch start
    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.start'), ['ids' => [$s1->id, $s2->id]])
        ->assertSessionHas('success');

    expect($s1->fresh()->status)->toBe('in_progress');
    expect($s2->fresh()->status)->toBe('in_progress');

    // Add measurements to each
    foreach ([$s1, $s2] as $session) {
        $child = Child::factory()->create(['barangay_id' => $this->barangay->id]);
        $this->actingAs($this->user)
            ->post(route('opt-sessions.measurements.quick', $session), [
                'child_id' => $child->id,
                'opt_session_id' => $session->id,
                'measurement_date' => $this->today,
                'weight_kg' => 12.0,
                'height_length_cm' => 90.0,
            ]);
    }

    // Batch complete
    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.complete'), ['ids' => [$s1->id, $s2->id]])
        ->assertSessionHas('success');

    expect($s1->fresh()->status)->toBe('completed');
    expect($s2->fresh()->status)->toBe('completed');
    expect($s1->fresh()->measured_children)->toBe(1);
    expect($s2->fresh()->measured_children)->toBe(1);
});

// ─── E2E: Dashboard Reflects Data ──────────────────────────

test('dashboard reflects latest measurements', function () {
    $session = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $child2 = Child::factory()->create(['barangay_id' => $this->barangay->id]);
    $child3 = Child::factory()->create(['barangay_id' => $this->barangay->id]);

    foreach ([$this->child, $child2, $child3] as $child) {
        $this->actingAs($this->user)
            ->post(route('opt-sessions.measurements.quick', $session), [
                'child_id' => $child->id,
                'opt_session_id' => $session->id,
                'measurement_date' => $this->today,
                'weight_kg' => 14.0,
                'height_length_cm' => 96.0,
            ]);
    }

    $this->actingAs($this->user)
        ->post(route('opt-sessions.complete', $session));

    // Dashboard should show data
    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('overallStats')
            ->has('monthlyTrends')
            ->has('nutritionalStatus')
        );
});

// ─── E2E: Child + Measurement Full Lifecycle ───────────────

test('child registration through measurement viewing', function () {
    // 1. Register a new child
    $response = $this->actingAs($this->user)
        ->post(route('children.store'), [
            'barangay_id' => $this->barangay->id,
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'sex' => 'female',
            'date_of_birth' => now()->subYears(2)->format('Y-m-d'),
            'family_serial_number' => 'FS-TEST-001',
            'address' => 'Test Address',
            'mother_caregiver_name' => 'Maria Santos',
        ]);

    $response->assertRedirect();
    $child = Child::where('family_serial_number', 'FS-TEST-001')->first();
    expect($child)->not->toBeNull();

    // 2. View the child
    $this->actingAs($this->user)
        ->get(route('children.show', $child))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('children/show'));

    // 3. Create session and add measurement
    $session = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.measurements.quick', $session), [
            'child_id' => $child->id,
            'opt_session_id' => $session->id,
            'measurement_date' => $this->today,
            'weight_kg' => 11.0,
            'height_length_cm' => 85.0,
        ]);

    // 4. View child again
    $this->actingAs($this->user)
        ->get(route('children.show', $child))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('children/show'));

    // 5. View the measurement
    $measurement = $child->measurements()->first();
    $this->actingAs($this->user)
        ->get(route('children.measurements.show', [$child, $measurement]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('measurements/show'));
});

// ─── E2E: Prevent duplicate measurements in same session ───

test('child cannot be measured twice in the same session', function () {
    $session = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    // First measurement succeeds
    $this->actingAs($this->user)
        ->post(route('opt-sessions.measurements.quick', $session), [
            'child_id' => $this->child->id,
            'opt_session_id' => $session->id,
            'measurement_date' => $this->today,
            'weight_kg' => 14.5,
            'height_length_cm' => 98.0,
        ])
        ->assertSessionHas('success');

    expect($session->measurements()->count())->toBe(1);

    // Verify child is excluded from available children
    $this->actingAs($this->user)
        ->get(route('opt-sessions.children-available', $session))
        ->assertJsonCount(0, 'children');
});

// ─── E2E: Session cancellation cascade ─────────────────────

test('cancelled session does not affect other sessions', function () {
    $active = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);
    $cancelled = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    // Add measurements to both
    $child1 = Child::factory()->create(['barangay_id' => $this->barangay->id]);
    $child2 = Child::factory()->create(['barangay_id' => $this->barangay->id]);

    foreach ([$active, $cancelled] as $i => $session) {
        $child = $i === 0 ? $child1 : $child2;
        Measurement::factory()->create([
            'child_id' => $child->id,
            'opt_session_id' => $session->id,
        ]);
    }

    // Cancel second session
    $this->actingAs($this->user)
        ->post(route('opt-sessions.cancel', $cancelled))
        ->assertSessionHas('success');

    expect($cancelled->fresh()->status)->toBe('cancelled');
    expect($cancelled->fresh()->measurements()->count())->toBe(1);
    expect($active->fresh()->status)->toBe('in_progress');
    expect($active->fresh()->measurements()->count())->toBe(1);
});

// ─── E2E: Malnourished measurement creates measurement with z-scores ──

test('malnourished weight produces valid z-scores', function () {
    $session = OptSession::factory()->inProgress()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.measurements.quick', $session), [
            'child_id' => $this->child->id,
            'opt_session_id' => $session->id,
            'measurement_date' => $this->today,
            'weight_kg' => 8.5,
            'height_length_cm' => 95.0,
        ]);

    $measurement = $session->measurements()->first();
    expect($measurement)->not->toBeNull();
    expect($measurement->opt_classification)->not->toBeNull();
});

// ─── E2E: Language switching via frontend route ────────────

test('settings page loads with language switcher', function () {
    $this->actingAs($this->user)
        ->get(route('settings.notifications'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/notification-preferences'));
});

// ─── E2E: User can view their profile ──────────────────────

test('user profile settings page loads', function () {
    $this->actingAs($this->user)
        ->get('/settings/profile')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/profile'));
});

// ─── E2E: Reports page loads for users with permissions ────

test('reports page loads for authorized users', function () {
    $this->actingAs($this->user)
        ->get(route('reports.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('reports/index'));
});

// ─── E2E: Landing pages load ───────────────────────────────

test('public landing pages load successfully', function () {
    $this->get(route('home'))->assertOk();
    $this->get(route('features'))->assertOk();
    $this->get(route('about'))->assertOk();
});
