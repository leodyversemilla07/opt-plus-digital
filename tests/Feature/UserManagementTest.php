<?php

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');

    $this->targetUser = User::factory()->create();
    $this->targetUser->assignRole('bhw');
});

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected to login on all user management routes', function () {
    $this->get(route('users.index'))->assertRedirect(route('login'));
    $this->get(route('users.create'))->assertRedirect(route('login'));
    $this->post(route('users.store'), [])->assertRedirect(route('login'));
    $this->get(route('users.show', $this->targetUser))->assertRedirect(route('login'));
    $this->get(route('users.edit', $this->targetUser))->assertRedirect(route('login'));
    $this->put(route('users.update', $this->targetUser), [])->assertRedirect(route('login'));
    $this->delete(route('users.destroy', $this->targetUser))->assertRedirect(route('login'));
    $this->post(route('users.toggle-status', $this->targetUser))->assertRedirect(route('login'));
});

// ─── Permission Enforcement ─────────────────────────────────

test('user without view users permission cannot access index', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->get(route('users.index'))->assertForbidden();
});

test('user without create users permission cannot access create page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view users');
    $this->actingAs($user)->get(route('users.create'))->assertForbidden();
});

test('user without create users permission cannot store', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view users');
    $this->actingAs($user)->post(route('users.store'), [])->assertForbidden();
});

test('user without view users permission cannot view another user', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('users.show', $this->targetUser))
        ->assertForbidden();
});

test('user without edit users permission cannot edit another user', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view users');
    $this->actingAs($user)
        ->get(route('users.edit', $this->targetUser))
        ->assertForbidden();
});

test('user without edit users permission cannot update another user', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view users');
    $this->actingAs($user)
        ->put(route('users.update', $this->targetUser), [
            'name' => 'Hacked Name',
            'email' => $this->targetUser->email,
            'role' => 'bhw',
        ])
        ->assertForbidden();
});

test('user without delete users permission cannot delete another user', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view users');
    $this->actingAs($user)
        ->delete(route('users.destroy', $this->targetUser))
        ->assertForbidden();
});

test('user can view their own profile without special permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('users.show', $user))
        ->assertOk();
});

test('user can edit their own profile without edit users permission', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('users.edit', $user))
        ->assertOk();
});

// ─── Index ──────────────────────────────────────────────────

test('users index loads with correct structure', function () {
    $this->actingAs($this->admin)
        ->get(route('users.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/index')
            ->has('users.data')
            ->has('filters')
        );
});

test('users index can be filtered by search', function () {
    User::factory()->create(['name' => 'John Doe']);
    User::factory()->create(['name' => 'Jane Smith']);

    $this->actingAs($this->admin)
        ->get(route('users.index', ['search' => 'John']))
        ->assertInertia(fn ($page) => $page
            ->has('users.data', 1)
            ->where('filters.search', 'John')
        );
});

test('users index can be filtered by role', function () {
    $this->actingAs($this->admin)
        ->get(route('users.index', ['role' => 'admin']))
        ->assertOk();
});

test('users index can be filtered by status', function () {
    User::factory()->create(['is_active' => false]);

    $this->actingAs($this->admin)
        ->get(route('users.index', ['status' => 'inactive']))
        ->assertOk();
});

// ─── Create / Store ─────────────────────────────────────────

test('create page loads with roles and barangays', function () {
    $this->actingAs($this->admin)
        ->get(route('users.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/create')
            ->has('roles')
            ->has('barangays')
        );
});

test('user can be created with valid data', function () {
    $barangay = Barangay::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'New User',
            'email' => 'newuser@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'bhw',
            'barangay_id' => $barangay->id,
        ])
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('users', [
        'name' => 'New User',
        'email' => 'newuser@test.com',
        'barangay_id' => $barangay->id,
    ]);
});

test('user creation validates required fields', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'password', 'role']);
});

test('user creation validates unique email', function () {
    $existing = User::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Duplicate',
            'email' => $existing->email,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'bhw',
        ])
        ->assertSessionHasErrors(['email']);
});

test('user creation validates password confirmation', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'DifferentPassword123!',
            'role' => 'bhw',
        ])
        ->assertSessionHasErrors(['password']);
});

test('user creation assigns correct role', function () {
    $this->actingAs($this->admin)
        ->post(route('users.store'), [
            'name' => 'Role Test',
            'email' => 'role@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'bns',
        ]);

    $user = User::where('email', 'role@test.com')->first();
    expect($user->hasRole('bns'))->toBeTrue();
});

// ─── Show ───────────────────────────────────────────────────

test('user show page loads with permissions', function () {
    $this->actingAs($this->admin)
        ->get(route('users.show', $this->targetUser))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/show')
            ->has('user')
            ->has('permissions')
        );
});

// ─── Edit / Update ──────────────────────────────────────────

test('edit page loads with current role and barangays', function () {
    $this->actingAs($this->admin)
        ->get(route('users.edit', $this->targetUser))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('users/edit')
            ->has('user')
            ->has('currentRole')
            ->has('roles')
            ->has('barangays')
        );
});

test('user can be updated with new data', function () {
    $this->actingAs($this->admin)
        ->put(route('users.update', $this->targetUser), [
            'name' => 'Updated Name',
            'email' => $this->targetUser->email,
            'role' => 'bns',
        ])
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('success');

    expect($this->targetUser->fresh()->name)->toBe('Updated Name');
    expect($this->targetUser->fresh()->hasRole('bns'))->toBeTrue();
});

test('user update validates unique email ignoring self', function () {
    $otherUser = User::factory()->create(['email' => 'other@test.com']);

    $this->actingAs($this->admin)
        ->put(route('users.update', $this->targetUser), [
            'name' => 'Test',
            'email' => $otherUser->email,
            'role' => 'bhw',
        ])
        ->assertSessionHasErrors(['email']);
});

test('user can update their password', function () {
    $this->actingAs($this->admin)
        ->put(route('users.update', $this->targetUser), [
            'name' => $this->targetUser->name,
            'email' => $this->targetUser->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
            'role' => 'bhw',
        ])
        ->assertSessionHas('success');
});

// ─── Toggle Status ──────────────────────────────────────────

test('user can be deactivated', function () {
    $this->targetUser->update(['is_active' => true]);
    expect($this->targetUser->fresh()->is_active)->toBeTrue();

    $this->actingAs($this->admin)
        ->post(route('users.toggle-status', $this->targetUser))
        ->assertSessionHas('success');

    expect($this->targetUser->fresh()->is_active)->toBeFalse();
});

test('deactivated user can be reactivated', function () {
    $this->targetUser->update(['is_active' => false]);

    $this->actingAs($this->admin)
        ->post(route('users.toggle-status', $this->targetUser))
        ->assertSessionHas('success');

    expect($this->targetUser->fresh()->is_active)->toBeTrue();
});

// ─── Destroy ────────────────────────────────────────────────

test('user can be deleted', function () {
    $this->actingAs($this->admin)
        ->delete(route('users.destroy', $this->targetUser))
        ->assertRedirect(route('users.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('users', ['id' => $this->targetUser->id]);
});

test('user cannot delete themselves per policy', function () {
    $this->actingAs($this->admin)
        ->delete(route('users.destroy', $this->admin))
        ->assertForbidden();
});
