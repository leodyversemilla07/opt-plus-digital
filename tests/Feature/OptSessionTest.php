<?php

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
