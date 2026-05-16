<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    foreach (['view users', 'create users', 'edit users', 'delete users', 'manage roles'] as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }
});

test('guests are redirected to the login page', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
});

test('non-admin users cannot access user management', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertForbidden();
});

test('users with manage roles permission can view the users list', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['manage roles', 'view users']);

    $this->actingAs($user)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/index'));
});

test('users with manage roles permission can view the create user page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo(['manage roles', 'create users']);

    $this->actingAs($user)
        ->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/create'));
});

test('users with manage roles permission can view a user', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo(['manage roles', 'view users']);

    $targetUser = User::factory()->create();

    $this->actingAs($admin)
        ->get(route('users.show', $targetUser))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/show'));
});

test('users can view their own profile without manage roles permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('users.show', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/show'));
});

test('users with manage roles + edit users permission can view the edit user page', function () {
    $admin = User::factory()->create();
    $admin->givePermissionTo(['manage roles', 'edit users']);

    $targetUser = User::factory()->create();

    $this->actingAs($admin)
        ->get(route('users.edit', $targetUser))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/edit'));
});

test('users can edit their own profile without edit users permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('users.edit', $user))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('users/edit'));
});
