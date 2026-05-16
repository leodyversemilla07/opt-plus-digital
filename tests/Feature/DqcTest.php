<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'view reports', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'view analytics', 'guard_name' => 'web']);
});

test('guests are redirected to the login page', function () {
    $this->get(route('dqc.index'))->assertRedirect(route('login'));
});

test('users without view reports permission cannot access DQC page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dqc.index'))
        ->assertForbidden();
});

test('users with view reports permission can access the DQC page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['view reports', 'view analytics']);

    $this->actingAs($user)
        ->get(route('dqc.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dqc/index'));
});

test('users with only view reports but not view analytics are denied DQC access', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view reports');

    $this->actingAs($user)
        ->get(route('dqc.index'))
        ->assertForbidden();
});
