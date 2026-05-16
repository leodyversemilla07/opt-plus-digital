<?php

use App\Models\Barangay;
use App\Models\OptSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create();
    $this->optSession = OptSession::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
});

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected to the login page', function () {
    $this->get(route('import.index'))->assertRedirect(route('login'));
});

test('guests cannot import', function () {
    $this->post(route('import.store'))->assertRedirect(route('login'));
});

test('guests cannot validate', function () {
    $this->post(route('import.validate'))->assertRedirect(route('login'));
});

test('guests cannot download template', function () {
    $this->get(route('import.template'))->assertRedirect(route('login'));
});

// ─── Permission Enforcement ─────────────────────────────────

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
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('barangays')
            ->has('optSessions')
        );
});

test('users without create children permission cannot import', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('import.store'))
        ->assertForbidden();
});

// ─── Page Structure & Data ──────────────────────────────────

test('import page shows barangays accessible to the user', function () {
    $barangayA = Barangay::factory()->create(['name' => 'Alpha Barangay']);
    $barangayB = Barangay::factory()->create(['name' => 'Beta Barangay']);

    // BHW can only see their own barangay
    $user = User::factory()->create(['barangay_id' => $barangayA->id]);
    $user->assignRole('bhw');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('barangays', 1)
            ->where('barangays.0.id', $barangayA->id)
        );
});

test('admin can see all barangays on import page', function () {
    Barangay::factory()->count(3)->create();

    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('barangays', 4) // 3 created + 1 from beforeEach
        );
});

test('import page shows opt sessions for users barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    OptSession::factory()->create(['barangay_id' => $otherBarangay->id]);

    $user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('optSessions', 1)
        );
});

test('admin can see all barangays opt sessions on import page', function () {
    // Clear the opt session from beforeEach
    $this->optSession->delete();

    $otherBarangay = Barangay::factory()->create();
    OptSession::factory()->create(['barangay_id' => $otherBarangay->id]);
    OptSession::factory()->create(['barangay_id' => $this->barangay->id]);

    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('optSessions', 2)
        );
});

test('import page excludes cancelled opt sessions', function () {
    OptSession::factory()->create([
        'barangay_id' => $this->barangay->id,
        'status' => 'cancelled',
    ]);

    $user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('import.index'))
        ->assertInertia(fn ($page) => $page
            ->component('import/index')
            ->has('optSessions', 1) // Only the one from beforeEach, not the cancelled one
        );
});

// ─── Store Validation ───────────────────────────────────────

test('store requires a file', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'barangay_id' => $this->barangay->id,
        ])
        ->assertSessionHasErrors(['file']);
});

test('store requires a valid barangay', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.xlsx', 100),
        ])
        ->assertSessionHasErrors(['barangay_id']);
});

test('store rejects non-existent barangay', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.xlsx', 100),
            'barangay_id' => 'non-existent-id',
        ])
        ->assertSessionHasErrors(['barangay_id']);
});

test('store rejects file with wrong extension', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.pdf', 100),
            'barangay_id' => $this->barangay->id,
        ])
        ->assertSessionHasErrors(['file']);
});

test('store rejects file that exceeds max size', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.xlsx', 11264), // 11MB > 10MB max
            'barangay_id' => $this->barangay->id,
        ])
        ->assertSessionHasErrors(['file']);
});

test('store rejects when user cannot access the specified barangay', function () {
    $otherBarangay = Barangay::factory()->create();

    $user = User::factory()->create(['barangay_id' => $this->barangay->id]);
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.xlsx', 100),
            'barangay_id' => $otherBarangay->id, // User's barangay is different
        ])
        ->assertForbidden();
});

test('admin can import to any barangay without forbidden error', function () {
    $otherBarangay = Barangay::factory()->create();

    $user = User::factory()->create();
    $user->assignRole('admin');

    $response = $this->actingAs($user)
        ->post(route('import.store'), [
            'file' => UploadedFile::fake()->create('test.xlsx', 100),
            'barangay_id' => $otherBarangay->id,
        ]);

    // Admin has access to any barangay, so the response should NOT be 403.
    // The import itself fails (fake xlsx), but we only verify access is granted.
    $response->assertStatus(302); // redirect back regardless of success/failure
});

// ─── Validate Endpoint ──────────────────────────────────────

test('validate requires a file', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.validate'))
        ->assertSessionHasErrors(['file']);
});

test('validate rejects non-excel file', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->post(route('import.validate'), [
            'file' => UploadedFile::fake()->create('test.pdf', 100),
        ])
        ->assertSessionHasErrors(['file']);
});

// ─── Template Download ──────────────────────────────────────

test('template download returns 404 if template file missing', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('create children');

    $this->actingAs($user)
        ->get(route('import.template'))
        ->assertNotFound();
});
