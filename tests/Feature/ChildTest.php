<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * Helper: generate valid child data for controller tests.
 */
function getValidChildData(Barangay $barangay, array $overrides = []): array
{
    return array_merge([
        'family_serial_number' => 'FSN-99999',
        'first_name' => 'Maria',
        'middle_name' => 'Santos',
        'last_name' => 'Dela Cruz',
        'sex' => 'female',
        'date_of_birth' => '2024-01-15',
        'address' => '123 Test Street',
        'barangay_id' => $barangay->id,
        'purok_sitio' => 'Purok 3',
        'mother_caregiver_name' => 'Juana Santos',
        'father_name' => null,
        'contact_number' => '09171234567',
        'is_indigenous_people' => false,
        'ip_tribe_name' => null,
    ], $overrides);
}

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    $this->barangay = Barangay::factory()->create();
    $this->user = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $this->user->assignRole('admin');

    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);
});

// ─── Guest Access ───────────────────────────────────────────

test('guests are redirected from children routes', function () {
    $this->get(route('children.index'))->assertRedirect(route('login'));
    $this->get(route('children.create'))->assertRedirect(route('login'));
    $this->post(route('children.store'))->assertRedirect(route('login'));
    $this->get(route('children.show', $this->child))->assertRedirect(route('login'));
    $this->get(route('children.edit', $this->child))->assertRedirect(route('login'));
    $this->put(route('children.update', $this->child))->assertRedirect(route('login'));
    $this->delete(route('children.destroy', $this->child))->assertRedirect(route('login'));
});

// ─── Permission Enforcement ─────────────────────────────────

test('user without view children permission cannot list children', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('children.index'))
        ->assertForbidden();
});

test('user without create children permission cannot access create form', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('children.create'))
        ->assertForbidden();
});

test('user without create children permission cannot store a child', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->post(route('children.store'), getValidChildData($this->barangay))
        ->assertForbidden();
});

test('user without edit children permission cannot access edit form', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->get(route('children.edit', $this->child))
        ->assertForbidden();
});

test('user without edit children permission cannot update a child', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->put(route('children.update', $this->child), getValidChildData($this->barangay))
        ->assertForbidden();
});

test('user without delete children permission cannot delete a child', function () {
    $user = User::factory()->create();
    $this->actingAs($user)
        ->delete(route('children.destroy', $this->child))
        ->assertForbidden();
});

// ─── Create Form ────────────────────────────────────────────

test('create form page loads successfully', function () {
    $this->actingAs($this->user)
        ->get(route('children.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('children/create')
            ->has('barangays')
        );
});

// ─── Store ──────────────────────────────────────────────────

test('admin can create a child', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->assertDatabaseHas('children', [
        'first_name' => 'Maria',
        'last_name' => 'Dela Cruz',
        'sex' => 'female',
    ]);
});

test('child creation generates qr_code', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay));

    $child = Child::where('family_serial_number', 'FSN-99999')->first();
    expect($child)->not->toBeNull();
    expect($child->qr_code)->not->toBeNull();
    expect($child->qr_code)->toStartWith('OPT-');
});

test('child creation records created_by_user_id', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay));

    $child = Child::where('family_serial_number', 'FSN-99999')->first();
    expect($child)->not->toBeNull();
    expect($child->created_by_user_id)->toBe($this->user->id);
});

test('child creation requires family_serial_number', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['family_serial_number' => '']))
        ->assertSessionHasErrors('family_serial_number');
});

test('child creation requires unique family_serial_number', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, [
            'family_serial_number' => $this->child->family_serial_number,
        ]))
        ->assertSessionHasErrors('family_serial_number');
});

test('child creation requires first_name', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['first_name' => '']))
        ->assertSessionHasErrors('first_name');
});

test('child creation requires last_name', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['last_name' => '']))
        ->assertSessionHasErrors('last_name');
});

test('child creation requires valid sex', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['sex' => 'other']))
        ->assertSessionHasErrors('sex');
});

test('child creation requires date_of_birth before today', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, [
            'date_of_birth' => now()->addDay()->toDateString(),
        ]))
        ->assertSessionHasErrors('date_of_birth');
});

test('child creation requires valid barangay_id', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['barangay_id' => 99999]))
        ->assertSessionHasErrors('barangay_id');
});

test('child creation requires address', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['address' => '']))
        ->assertSessionHasErrors('address');
});

test('child creation requires mother caregiver name', function () {
    $this->actingAs($this->user)
        ->post(route('children.store'), getValidChildData($this->barangay, ['mother_caregiver_name' => '']))
        ->assertSessionHasErrors('mother_caregiver_name');
});

// ─── Edit Form ──────────────────────────────────────────────

test('edit form page loads successfully', function () {
    $this->actingAs($this->user)
        ->get(route('children.edit', $this->child))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('children/edit')
            ->has('child')
            ->has('barangays')
        );
});

// ─── Update ─────────────────────────────────────────────────

test('admin can update a child', function () {
    $this->actingAs($this->user)
        ->put(route('children.update', $this->child), [
            'family_serial_number' => $this->child->family_serial_number,
            'first_name' => 'Updated',
            'middle_name' => 'Name',
            'last_name' => 'Child',
            'sex' => 'male',
            'date_of_birth' => '2024-06-15',
            'address' => '456 New Street',
            'barangay_id' => $this->barangay->id,
            'purok_sitio' => 'Purok 5',
            'mother_caregiver_name' => 'New Mother',
            'father_name' => null,
            'contact_number' => '09189999999',
            'is_indigenous_people' => false,
            'ip_tribe_name' => null,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->child->refresh();
    expect($this->child->first_name)->toBe('Updated');
    expect($this->child->last_name)->toBe('Child');
    expect($this->child->contact_number)->toBe('09189999999');
});

test('update rejects duplicate family_serial_number', function () {
    $otherChild = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->put(route('children.update', $this->child), getValidChildData($this->barangay, [
            'family_serial_number' => $otherChild->family_serial_number,
        ]))
        ->assertSessionHasErrors('family_serial_number');
});

test('update allows same family_serial_number on self', function () {
    $this->actingAs($this->user)
        ->put(route('children.update', $this->child), getValidChildData($this->barangay, [
            'family_serial_number' => $this->child->family_serial_number,
        ]))
        ->assertSessionHasNoErrors();
});

// ─── Destroy ────────────────────────────────────────────────

test('admin can soft delete a child', function () {
    $this->actingAs($this->user)
        ->delete(route('children.destroy', $this->child))
        ->assertRedirect(route('children.index'))
        ->assertSessionHas('success');

    expect($this->child->fresh()->trashed())->toBeTrue();
});

test('deleting a child returns success flash message', function () {
    $this->actingAs($this->user)
        ->delete(route('children.destroy', $this->child))
        ->assertSessionHas('success');
});

// ─── Search Duplicates ──────────────────────────────────────

test('search duplicates returns potential matches', function () {
    Child::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Dela Cruz',
        'date_of_birth' => '2024-01-15',
        'barangay_id' => $this->barangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->post(route('children.search-duplicates'), [
            'first_name' => 'Maria',
            'last_name' => 'Dela Cruz',
            'date_of_birth' => '2024-01-20',
        ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('children/duplicates')
            ->has('duplicates', 1)
            ->has('searchData')
        );
});

test('search duplicates returns empty when no matches', function () {
    $this->actingAs($this->user)
        ->post(route('children.search-duplicates'), [
            'first_name' => 'NonExistent',
            'last_name' => 'Person',
            'date_of_birth' => '2024-06-01',
        ])
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('children/duplicates')
            ->has('duplicates', 0)
        );
});

test('search duplicates validates required fields', function () {
    $this->actingAs($this->user)
        ->post(route('children.search-duplicates'), [
            'first_name' => '',
            'last_name' => '',
            'date_of_birth' => '',
        ])
        ->assertSessionHasErrors(['first_name', 'last_name', 'date_of_birth']);
});

// ─── BHW/BNS Barangay Scoping ───────────────────────────────

test('bhw can only see children in their own barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    $otherChild = Child::factory()->create([
        'barangay_id' => $otherBarangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $bhw = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.show', $otherChild))
        ->assertForbidden();
});

test('bhw can view children in their own barangay', function () {
    $bhw = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.show', $this->child))
        ->assertOk();
});

test('bhw cannot edit children in another barangay', function () {
    $otherBarangay = Barangay::factory()->create();
    $otherChild = Child::factory()->create([
        'barangay_id' => $otherBarangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $bhw = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.edit', $otherChild))
        ->assertForbidden();
});

test('bhw can edit children in their own barangay', function () {
    $bhw = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $bhw->assignRole('bhw');

    $this->actingAs($bhw)
        ->get(route('children.edit', $this->child))
        ->assertOk();
});

test('bns scoping works same as bhw for child show', function () {
    $otherBarangay = Barangay::factory()->create();
    $otherChild = Child::factory()->create([
        'barangay_id' => $otherBarangay->id,
        'created_by_user_id' => $this->user->id,
    ]);

    $bns = User::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
    $bns->assignRole('bns');

    $this->actingAs($bns)
        ->get(route('children.show', $otherChild))
        ->assertForbidden();

    $this->actingAs($bns)
        ->get(route('children.show', $this->child))
        ->assertOk();
});
