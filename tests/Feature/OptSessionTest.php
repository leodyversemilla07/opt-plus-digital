<?php

use App\Models\Barangay;
use App\Models\Measurement;
use App\Models\OptSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create();
    $this->user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $this->user->givePermissionTo('create children');
    $this->session = OptSession::factory()->scheduled()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);
});

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected to login', function () {
    $this->get(route('opt-sessions.index'))->assertRedirect(route('login'));
    $this->get(route('opt-sessions.create'))->assertRedirect(route('login'));
    $this->post(route('opt-sessions.store'), [])->assertRedirect(route('login'));
    $this->get(route('opt-sessions.show', $this->session))->assertRedirect(route('login'));
    $this->get(route('opt-sessions.edit', $this->session))->assertRedirect(route('login'));
    $this->put(route('opt-sessions.update', $this->session), [])->assertRedirect(route('login'));
    $this->delete(route('opt-sessions.destroy', $this->session))->assertRedirect(route('login'));
    $this->post(route('opt-sessions.start', $this->session))->assertRedirect(route('login'));
    $this->post(route('opt-sessions.complete', $this->session))->assertRedirect(route('login'));
    $this->post(route('opt-sessions.cancel', $this->session))->assertRedirect(route('login'));
    $this->post(route('opt-sessions.batch.start'), ['ids' => ['x']])->assertRedirect(route('login'));
    $this->post(route('opt-sessions.batch.complete'), ['ids' => ['x']])->assertRedirect(route('login'));
    $this->post(route('opt-sessions.batch.cancel'), ['ids' => ['x']])->assertRedirect(route('login'));
});

// ─── Permission ─────────────────────────────────────────────

test('users without create children permission cannot access any OPT session pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('opt-sessions.index'))->assertForbidden();

    $this->actingAs($user)
        ->get(route('opt-sessions.create'))->assertForbidden();

    $this->actingAs($user)
        ->post(route('opt-sessions.store'), [])->assertForbidden();
});

// ─── Index ──────────────────────────────────────────────────

test('users with permission can view sessions list', function () {
    $this->actingAs($this->user)
        ->get(route('opt-sessions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('opt-sessions/index')
            ->has('sessions.data')
            ->has('years')
            ->has('filters')
        );
});

test('sessions index is scoped to users barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    OptSession::factory()->count(3)->create(['barangay_id' => $otherBarangay->id]);

    $this->actingAs($this->user)
        ->get(route('opt-sessions.index'))
        ->assertInertia(fn ($page) => $page
            ->has('sessions.data', 1) // Only the one from beforeEach
        );
});

test('admin can see all sessions regardless of barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    $other = OptSession::factory()->create(['barangay_id' => $otherBarangay->id]);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('opt-sessions.index'))
        ->assertInertia(fn ($page) => $page
            ->has('sessions.data', 2) // $other + $this->session
        );
});

test('sessions index can be filtered by status', function () {
    OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);
    OptSession::factory()->completed()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->get(route('opt-sessions.index', ['status' => 'scheduled']))
        ->assertInertia(fn ($page) => $page
            ->has('sessions.data', 1)
            ->where('filters.status', 'scheduled')
        );
});

// ─── Create / Store ─────────────────────────────────────────

test('create page loads with barangays', function () {
    $this->actingAs($this->user)
        ->get(route('opt-sessions.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('opt-sessions/create')
            ->has('barangays')
        );
});

test('bhw sees only their barangay on create page', function () {
    Barangay::factory()->create(['name' => 'Other Barangay']);

    $bhw = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('opt-sessions.create'))
        ->assertInertia(fn ($page) => $page
            ->has('barangays', 1)
        );
});

test('session can be created with valid data', function () {
    $response = $this->actingAs($this->user)
        ->post(route('opt-sessions.store'), [
            'barangay_id' => $this->barangay->id,
            'name' => 'July 2026 OPT Session',
            'session_date' => '2026-07-15',
            'venue' => 'Barangay Health Center',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('opt_sessions', [
        'barangay_id' => $this->barangay->id,
        'name' => 'July 2026 OPT Session',
        'status' => 'scheduled',
        'created_by_user_id' => $this->user->id,
    ]);
});

test('session creation validates required fields', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.store'), [])
        ->assertSessionHasErrors(['barangay_id', 'name', 'session_date']);
});

test('session creation validates barangay exists', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.store'), [
            'barangay_id' => 'non-existent',
            'name' => 'Test',
            'session_date' => '2026-07-15',
        ])
        ->assertSessionHasErrors(['barangay_id']);
});

test('session creation enforces barangay access', function () {
    $otherBarangay = Barangay::factory()->create();

    $this->actingAs($this->user)
        ->post(route('opt-sessions.store'), [
            'barangay_id' => $otherBarangay->id,
            'name' => 'Test',
            'session_date' => '2026-07-15',
        ])
        ->assertForbidden();
});

// ─── Show ───────────────────────────────────────────────────

test('session show page loads with stats and measurements', function () {
    $this->actingAs($this->user)
        ->get(route('opt-sessions.show', $this->session))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('opt-sessions/show')
            ->has('session')
            ->has('stats')
            ->has('recentMeasurements')
        );
});

test('session show stats are calculated correctly', function () {
    $child = \App\Models\Child::factory()->create(['barangay_id' => $this->barangay->id]);
    Measurement::factory()->count(3)->create([
        'child_id' => $child->id,
        'opt_session_id' => $this->session->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('opt-sessions.show', $this->session))
        ->assertInertia(fn ($page) => $page
            ->where('stats.measured_children', 3)
            ->where('stats.target_children', $this->session->target_children)
        );
});

// ─── Edit / Update ──────────────────────────────────────────

test('edit page loads with session data', function () {
    $this->actingAs($this->user)
        ->get(route('opt-sessions.edit', $this->session))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('opt-sessions/edit')
            ->has('session')
            ->has('barangays')
        );
});

test('session can be updated', function () {
    $this->actingAs($this->user)
        ->put(route('opt-sessions.update', $this->session), [
            'name' => 'Updated Session Name',
            'session_date' => '2026-08-01',
            'status' => 'scheduled',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($this->session->fresh()->name)->toBe('Updated Session Name');
});

// ─── State Transitions ──────────────────────────────────────

test('scheduled session can be started', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.start', $this->session))
        ->assertSessionHas('success');

    expect($this->session->fresh()->status)->toBe('in_progress');
    expect($this->session->fresh()->start_date)->not->toBeNull();
});

test('non-scheduled session cannot be started', function () {
    $inProgress = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.start', $inProgress))
        ->assertSessionHas('error');

    expect($inProgress->fresh()->status)->toBe('in_progress');
});

test('completed session cannot be started', function () {
    $completed = OptSession::factory()->completed()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.start', $completed))
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

test('in-progress session can be completed', function () {
    $inProgress = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.complete', $inProgress))
        ->assertSessionHas('success');

    expect($inProgress->fresh()->status)->toBe('completed');
    expect($inProgress->fresh()->end_date)->not->toBeNull();
});

test('non-in-progress session cannot be completed', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.complete', $this->session))
        ->assertSessionHas('error');

    expect($this->session->fresh()->status)->toBe('scheduled');
});

test('scheduled session can be cancelled', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.cancel', $this->session))
        ->assertSessionHas('success');

    expect($this->session->fresh()->status)->toBe('cancelled');
});

test('in-progress session can be cancelled', function () {
    $inProgress = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.cancel', $inProgress))
        ->assertSessionHas('success');

    expect($inProgress->fresh()->status)->toBe('cancelled');
});

test('completed session cannot be cancelled', function () {
    $completed = OptSession::factory()->completed()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.cancel', $completed))
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

// ─── Destroy ────────────────────────────────────────────────

test('session without measurements can be deleted', function () {
    $this->actingAs($this->user)
        ->delete(route('opt-sessions.destroy', $this->session))
        ->assertSessionHas('success');

    $this->assertSoftDeleted($this->session);
});

test('session with measurements cannot be deleted', function () {
    $child = \App\Models\Child::factory()->create(['barangay_id' => $this->barangay->id]);
    Measurement::factory()->create([
        'child_id' => $child->id,
        'opt_session_id' => $this->session->id,
    ]);

    $this->actingAs($this->user)
        ->delete(route('opt-sessions.destroy', $this->session))
        ->assertSessionHas('error');

    $this->assertDatabaseHas('opt_sessions', ['id' => $this->session->id]);
});

// ─── Batch Operations ───────────────────────────────────────

test('batch start starts scheduled sessions', function () {
    $s1 = OptSession::factory()->scheduled()->create(['barangay_id' => $this->barangay->id]);
    $s2 = OptSession::factory()->scheduled()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.start'), ['ids' => [$s1->id, $s2->id]])
        ->assertSessionHas('success');

    expect($s1->fresh()->status)->toBe('in_progress');
    expect($s2->fresh()->status)->toBe('in_progress');
});

test('batch start ignores non-scheduled sessions', function () {
    $completed = OptSession::factory()->completed()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.start'), ['ids' => [$completed->id]])
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

test('batch start requires at least one id', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.start'), ['ids' => []])
        ->assertSessionHasErrors('ids');
});

test('batch complete completes in-progress sessions', function () {
    $s1 = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);
    $s2 = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.complete'), ['ids' => [$s1->id, $s2->id]])
        ->assertSessionHas('success');

    expect($s1->fresh()->status)->toBe('completed');
    expect($s2->fresh()->status)->toBe('completed');
});

test('batch complete ignores non-in-progress sessions', function () {
    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.complete'), ['ids' => [$this->session->id]])
        ->assertSessionHas('error');

    expect($this->session->fresh()->status)->toBe('scheduled');
});

test('batch cancel cancels eligible sessions', function () {
    $s1 = OptSession::factory()->scheduled()->create(['barangay_id' => $this->barangay->id]);
    $s2 = OptSession::factory()->inProgress()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.cancel'), ['ids' => [$s1->id, $s2->id]])
        ->assertSessionHas('success');

    expect($s1->fresh()->status)->toBe('cancelled');
    expect($s2->fresh()->status)->toBe('cancelled');
});

test('batch cancel skips completed sessions', function () {
    $completed = OptSession::factory()->completed()->create(['barangay_id' => $this->barangay->id]);

    $this->actingAs($this->user)
        ->post(route('opt-sessions.batch.cancel'), ['ids' => [$completed->id]])
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

test('batch operations respect barangay access restrictions', function () {
    $otherBarangay = Barangay::factory()->create();
    $session = OptSession::factory()->scheduled()->create(['barangay_id' => $otherBarangay->id]);

    $userNoBarangay = User::factory()->create();
    $userNoBarangay->givePermissionTo('create children');

    $this->actingAs($userNoBarangay)
        ->post(route('opt-sessions.batch.start'), ['ids' => [$session->id]])
        ->assertSessionHas('success');

    expect($session->fresh()->status)->toBe('scheduled');
});
