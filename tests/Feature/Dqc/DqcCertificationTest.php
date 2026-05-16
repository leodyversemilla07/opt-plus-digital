<?php

use App\Models\Child;
use App\Models\Measurement;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

    Permission::firstOrCreate(['name' => 'view analytics', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'view reports', 'guard_name' => 'web']);

    // Ensure admin role exists with view analytics
    Role::findOrCreate('admin')->givePermissionTo(Permission::all());

    // Clean up audit log side effects
    \App\Models\AuditLog::truncate();
});

test('guests cannot access DQC page', function () {
    $this->get(route('dqc.index'))->assertRedirect(route('login'));
});

test('measurement can be certified', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.certify', $measurement))
        ->assertRedirect(route('dqc.index'))
        ->assertSessionHas('success');

    $measurement->refresh();

    expect($measurement->dqc_status)->toBe('certified');
    expect($measurement->dqc_certified_by_user_id)->toBe($user->id);
    expect($measurement->dqc_certified_at)->not->toBeNull();
});

test('measurement can be rejected', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.reject', $measurement))
        ->assertRedirect(route('dqc.index'))
        ->assertSessionHas('success');

    $measurement->refresh();

    expect($measurement->dqc_status)->toBe('rejected');
    expect($measurement->dqc_certified_by_user_id)->toBe($user->id);
});

test('already certified measurement cannot be certified again', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'certified']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.certify', $measurement))
        ->assertRedirect(route('dqc.index'))
        ->assertSessionHas('error');

    expect($measurement->fresh()->dqc_status)->toBe('certified');
});

test('already rejected measurement cannot be rejected again', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'rejected']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.reject', $measurement))
        ->assertRedirect(route('dqc.index'))
        ->assertSessionHas('error');

    expect($measurement->fresh()->dqc_status)->toBe('rejected');
});

test('users without view analytics permission cannot certify', function () {
    $user = User::factory()->create();

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->actingAs($user)
        ->post(route('dqc.measurements.certify', $measurement))
        ->assertForbidden();
});

test('users without view analytics permission cannot reject', function () {
    $user = User::factory()->create();

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->actingAs($user)
        ->post(route('dqc.measurements.reject', $measurement))
        ->assertForbidden();
});

test('certification creates audit log entry', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.certify', $measurement));

    $log = \App\Models\AuditLog::where('action', 'dqc_certified')
        ->where('auditable_id', $measurement->id)
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->user_id)->toBe($user->id);
});

test('rejection creates audit log entry', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    $this->from(route('dqc.index'))
        ->actingAs($user)
        ->post(route('dqc.measurements.reject', $measurement));

    $log = \App\Models\AuditLog::where('action', 'dqc_rejected')
        ->where('auditable_id', $measurement->id)
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->user_id)->toBe($user->id);
});

test('measurement model certification methods work', function () {
    $measurement = Measurement::factory()->create(['dqc_status' => 'pending']);

    expect($measurement->isPendingCertification())->toBeTrue();
    expect($measurement->isCertified())->toBeFalse();
    expect($measurement->isRejected())->toBeFalse();

    $measurement->certify(1, 'Looks good');

    expect($measurement->fresh()->dqc_status)->toBe('certified');
    expect($measurement->fresh()->dqc_notes)->toBe('Looks good');
    expect($measurement->fresh()->isCertified())->toBeTrue();

    $rejected = Measurement::factory()->create(['dqc_status' => 'pending']);
    $rejected->reject(1, 'Invalid data');

    expect($rejected->fresh()->dqc_status)->toBe('rejected');
    expect($rejected->fresh()->isRejected())->toBeTrue();
});

test('scopes filter by dqc_status correctly', function () {
    Measurement::factory()->count(3)->create(['dqc_status' => 'pending']);
    Measurement::factory()->count(2)->create(['dqc_status' => 'certified']);
    Measurement::factory()->count(1)->create(['dqc_status' => 'rejected']);

    expect(Measurement::pendingCertification()->count())->toBe(3);
    expect(Measurement::certified()->count())->toBe(2);
    expect(Measurement::rejected()->count())->toBe(1);
});

test('DQC summary includes pending certifications count', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    Measurement::factory()->count(5)->create(['dqc_status' => 'pending']);
    Measurement::factory()->count(3)->create(['dqc_status' => 'certified']);

    $this->actingAs($user)
        ->get(route('dqc.index'))
        ->assertInertia(fn ($page) => $page
            ->where('dqcSummary.pending_certifications_count', 5)
            ->has('pendingCertifications')
        );
});

test('pending certifications list on DQC page', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    Measurement::factory()->count(2)->create(['dqc_status' => 'pending']);

    $this->actingAs($user)
        ->get(route('dqc.index'))
        ->assertInertia(fn ($page) => $page
            ->has('pendingCertifications', 2)
        );
});
