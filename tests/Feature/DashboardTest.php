<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    // Ensure permission exists
    Permission::firstOrCreate(['name' => 'view analytics', 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->givePermissionTo('view analytics');

    $this->actingAs($user);

    $this->get(route('dashboard'))->assertOk();
});
