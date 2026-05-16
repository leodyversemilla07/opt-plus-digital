<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'create children', 'guard_name' => 'web']);
});

test('guests are redirected to the login page', function () {
    $this->get(route('import.index'))->assertRedirect(route('login'));
});

test('users without create children permission cannot access import page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertForbidden();
});

test('users with create children permission can access the import page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('import/index'));
});
