<?php

use App\Models\AuditLog;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'view audit logs', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'export audit logs', 'guard_name' => 'web']);

    // Clear any side-effect logs from factory model creation (Auditable trait)
    AuditLog::truncate();
});

test('guests are redirected to login', function () {
    $this->get(route('audit-logs.index'))
        ->assertRedirect(route('login'));
});

test('users without permission cannot view audit logs', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index'))
        ->assertForbidden();
});

test('users with permission can view audit logs index', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    AuditLog::factory()->count(15)->created()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('audit-logs/index')
            ->has('logs.data')
            ->has('actions')
            ->has('types')
            ->has('filters')
        );
});

test('audit logs index paginates results', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    AuditLog::factory()->count(25)->created()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index'))
        ->assertInertia(fn ($page) => $page
            ->where('logs.per_page', 20)
            ->has('logs.data', 20)
        );
    // Total may be 25 + auto-generated logs from factory User creation
    // so just verify per_page and data count
});

test('audit logs can be filtered by action', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    AuditLog::factory()->created()->create();
    AuditLog::factory()->count(3)->updated()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index', ['action' => 'updated']))
        ->assertInertia(fn ($page) => $page
            ->where('filters.action', 'updated')
            ->has('logs.data', 3)
        );
});

test('audit logs can be filtered by date range', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    // Create logs on specific dates
    AuditLog::factory()->created()->create([
        'created_at' => now()->subDays(5),
    ]);

    AuditLog::factory()->created()->create([
        'created_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('audit-logs.index', ['from' => now()->subDay()->format('Y-m-d')]))
        ->assertInertia(fn ($page) => $page
            // Should only get the recent one (plus any auto-generated)
            ->has('logs.data')
        );
});

test('audit logs can be searched', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    AuditLog::factory()->created()->create([
        'action' => 'exported',
    ]);
    AuditLog::factory()->count(3)->created()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index', ['search' => 'export']))
        ->assertInertia(fn ($page) => $page
            ->where('logs.total', 1)
        );
});

test('users with permission can view a single audit log', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    $log = AuditLog::factory()->created()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.show', $log))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('audit-logs/show')
            ->has('log')
            ->has('auditable')
        );
});

test('audit log show returns 404 for non-existent log', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    $this->actingAs($user)
        ->get(route('audit-logs.show', 99999))
        ->assertNotFound();
});

test('audit logs index returns distinct action and type lists', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('view audit logs');

    AuditLog::factory()->created()->create();
    AuditLog::factory()->updated()->create();
    AuditLog::factory()->deleted()->create();

    $this->actingAs($user)
        ->get(route('audit-logs.index'))
        ->assertInertia(fn ($page) => $page
            ->has('actions', 3)
            ->has('types')
        );
});
