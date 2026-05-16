<?php

use App\Models\Barangay;
use App\Models\OptSession;
use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    Permission::firstOrCreate(['name' => 'create children', 'guard_name' => 'web']);
});

test('guests are redirected to the login page', function () {
    $this->get(route('opt-sessions.index'))->assertRedirect(route('login'));
    $this->get(route('opt-sessions.create'))->assertRedirect(route('login'));
});

test('users without create children permission cannot access OPT sessions', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('opt-sessions.index'))
        ->assertForbidden();
});

test('users with create children permission can view OPT sessions list', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('opt-sessions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('opt-sessions/index'));
});

test('users with create children permission can view the create OPT session page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('opt-sessions.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('opt-sessions/create'));
});

test('guests cannot access batch operations', function () {
    $this->post(route('opt-sessions.batch.start'), ['ids' => ['fake-id']])
        ->assertRedirect(route('login'));
    $this->post(route('opt-sessions.batch.complete'), ['ids' => ['fake-id']])
        ->assertRedirect(route('login'));
    $this->post(route('opt-sessions.batch.cancel'), ['ids' => ['fake-id']])
        ->assertRedirect(route('login'));
});

test('batch start starts scheduled sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $session1 = OptSession::factory()->scheduled()->create([
        'barangay_id' => $barangay->id,
    ]);
    $session2 = OptSession::factory()->scheduled()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.start'), [
            'ids' => [$session1->id, $session2->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('success');

    expect($session1->fresh()->status)->toBe('in_progress');
    expect($session2->fresh()->status)->toBe('in_progress');
});

test('batch start ignores non-scheduled sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $completed = OptSession::factory()->completed()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.start'), [
            'ids' => [$completed->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

test('batch start requires at least one id', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.start'), ['ids' => []])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHasErrors('ids');
});

test('batch complete completes in-progress sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $session1 = OptSession::factory()->inProgress()->create([
        'barangay_id' => $barangay->id,
    ]);
    $session2 = OptSession::factory()->inProgress()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.complete'), [
            'ids' => [$session1->id, $session2->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('success');

    expect($session1->fresh()->status)->toBe('completed');
    expect($session2->fresh()->status)->toBe('completed');
});

test('batch complete ignores non-in-progress sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $scheduled = OptSession::factory()->scheduled()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.complete'), [
            'ids' => [$scheduled->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('error');

    expect($scheduled->fresh()->status)->toBe('scheduled');
});

test('batch cancel cancels eligible sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $session1 = OptSession::factory()->scheduled()->create([
        'barangay_id' => $barangay->id,
    ]);
    $session2 = OptSession::factory()->inProgress()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.cancel'), [
            'ids' => [$session1->id, $session2->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('success');

    expect($session1->fresh()->status)->toBe('cancelled');
    expect($session2->fresh()->status)->toBe('cancelled');
});

test('batch cancel skips completed sessions', function () {
    $barangay = Barangay::factory()->create();
    $user = User::factory()->create(['barangay_id' => $barangay->id]);
    $user->givePermissionTo('create children');

    $completed = OptSession::factory()->completed()->create([
        'barangay_id' => $barangay->id,
    ]);

    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.cancel'), [
            'ids' => [$completed->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('error');

    expect($completed->fresh()->status)->toBe('completed');
});

test('batch operations respect barangay access restrictions', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    // Create a session in a different barangay
    $otherBarangay = Barangay::factory()->create();
    $session = OptSession::factory()->scheduled()->create([
        'barangay_id' => $otherBarangay->id,
    ]);

    // User has no barangay_id, so they can't access the session
    $this->from(route('opt-sessions.index'))
        ->actingAs($user)
        ->post(route('opt-sessions.batch.start'), [
            'ids' => [$session->id],
        ])
        ->assertRedirect(route('opt-sessions.index'))
        ->assertSessionHas('success');

    // Session should remain scheduled because user doesn't have access
    expect($session->fresh()->status)->toBe('scheduled');
});
