<?php

use App\Models\AuditLog;
use App\Models\User;
use App\Services\AuditLogService;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

test('can log a created action with fluent api', function () {
    $user = User::factory()->create();
    $subject = User::factory()->create();

    $log = AuditLogService::make()
        ->performedBy($user)
        ->withAction('created')
        ->on($subject)
        ->withNew($subject->toArray())
        ->fromIp('192.168.1.1')
        ->withUserAgent('TestAgent/1.0')
        ->log();

    expect($log)
        ->toBeInstanceOf(AuditLog::class)
        ->and($log->user_id)->toBe($user->id)
        ->and($log->action)->toBe('created')
        ->and($log->auditable_type)->toBe($subject->getMorphClass())
        ->and($log->auditable_id)->toBe($subject->id)
        ->and($log->ip_address)->toBe('192.168.1.1')
        ->and($log->user_agent)->toBe('TestAgent/1.0');
});

test('created shorthand logs creation correctly', function () {
    $user = User::factory()->create();
    $subject = User::factory()->create();

    $log = AuditLogService::created($subject, $user);

    expect($log)
        ->action->toBe('created')
        ->user_id->toBe($user->id)
        ->auditable_id->toBe($subject->id)
        ->old_values->toBeNull()
        ->new_values->not->toBeNull();
});

test('updated shorthand logs diff correctly', function () {
    $user = User::factory()->create();
    $subject = User::factory()->create(['name' => 'Old Name']);

    $oldValues = $subject->toArray();
    $subject->update(['name' => 'New Name']);
    $newValues = $subject->toArray();

    $log = AuditLogService::updated($subject, $oldValues, $newValues, $user);

    expect($log)
        ->action->toBe('updated')
        ->user_id->toBe($user->id)
        ->auditable_id->toBe($subject->id)
        ->old_values->toHaveKey('name', 'Old Name')
        ->new_values->toHaveKey('name', 'New Name');
});

test('deleted shorthand logs deletion correctly', function () {
    $user = User::factory()->create();
    $subject = User::factory()->create();

    $log = AuditLogService::deleted($subject, $user);

    expect($log)
        ->action->toBe('deleted')
        ->user_id->toBe($user->id)
        ->auditable_id->toBe($subject->id)
        ->old_values->not->toBeNull()
        ->new_values->toBeNull();
});

test('log action generic shorthand works', function () {
    $user = User::factory()->create();
    $subject = User::factory()->create();

    $log = AuditLogService::logAction(
        'exported',
        $subject,
        oldValues: null,
        newValues: ['report' => 'opt-summary'],
        user: $user,
    );

    expect($log)
        ->action->toBe('exported')
        ->new_values->toHaveKey('report', 'opt-summary');
});

test('throws exception when action is missing', function () {
    $subject = User::factory()->create();

    AuditLogService::make()
        ->on($subject)
        ->log();
})->throws(InvalidArgumentException::class, 'Action is required');

test('throws exception when subject is missing', function () {
    AuditLogService::make()
        ->withAction('created')
        ->log();
})->throws(InvalidArgumentException::class, 'Subject model is required');

test('can log without a user (system action)', function () {
    $subject = User::factory()->create();

    $log = AuditLogService::make()
        ->withAction('purged')
        ->on($subject)
        ->log();

    expect($log)
        ->user_id->toBeNull()
        ->action->toBe('purged');
});
