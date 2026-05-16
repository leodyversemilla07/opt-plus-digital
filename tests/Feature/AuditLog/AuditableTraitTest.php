<?php

use App\Models\AuditLog;
use App\Models\User;

/**
 * Test that the Auditable trait automatically logs model events.
 *
 * We use the User model (which has the Auditable trait applied)
 * to verify auto-logging of created, updated, and deleted events.
 */

// We'll apply the trait to User — let's verify it works
beforeEach(function () {
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
});

test('auditable trait logs created event', function () {
    $user = User::factory()->create();

    $log = AuditLog::query()
        ->where('auditable_type', $user->getMorphClass())
        ->where('auditable_id', $user->id)
        ->where('action', 'created')
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->action)->toBe('created')
        ->and($log->user_id)->toBeNull() // No authenticated user in factory context
        ->and($log->new_values)->not->toBeNull()
        ->and($log->old_values)->toBeNull();
});

test('auditable trait logs updated event', function () {
    $user = User::factory()->create();

    // Clear the created log
    AuditLog::where('auditable_id', $user->id)->delete();

    $user->update(['name' => 'Updated Name']);

    $log = AuditLog::query()
        ->where('auditable_type', $user->getMorphClass())
        ->where('auditable_id', $user->id)
        ->where('action', 'updated')
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->action)->toBe('updated')
        ->and($log->old_values)->toHaveKey('name')
        ->and($log->new_values)->toHaveKey('name', 'Updated Name');
});

test('auditable trait logs deleted event', function () {
    $user = User::factory()->create();

    // Clear previous logs
    AuditLog::where('auditable_id', $user->id)->delete();

    $userId = $user->id;
    $user->delete();

    $log = AuditLog::query()
        ->where('auditable_type', (new User)->getMorphClass())
        ->where('auditable_id', $userId)
        ->where('action', 'deleted')
        ->first();

    expect($log)->not->toBeNull()
        ->and($log->action)->toBe('deleted')
        ->and($log->old_values)->not->toBeNull()
        ->and($log->new_values)->toBeNull();
});

test('auditable trait creates separate log entries per event', function () {
    $user = User::factory()->create();
    $user->update(['name' => 'Name 2']);
    $user->update(['name' => 'Name 3']);

    $count = AuditLog::query()
        ->where('auditable_type', $user->getMorphClass())
        ->where('auditable_id', $user->id)
        ->count();

    // 1 created + 2 updated = 3
    expect($count)->toBe(3);
});

test('auditable trait does not log when model is not dirty', function () {
    $user = User::factory()->create();

    AuditLog::where('auditable_id', $user->id)->delete();

    // Save without changes — should not trigger updated
    $user->save();

    $count = AuditLog::query()
        ->where('auditable_type', $user->getMorphClass())
        ->where('auditable_id', $user->id)
        ->count();

    expect($count)->toBe(0);
});
