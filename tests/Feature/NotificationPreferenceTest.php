<?php

use App\Models\NotificationPreference;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->user = User::factory()->create([
        'is_active' => true,
    ]);
    $this->user->assignRole('admin');
});

it('shows the notification preferences page', function () {
    $this->actingAs($this->user)
        ->get(route('settings.notifications'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/notification-preferences')
            ->has('preferences')
        );
});

it('creates default preferences for all notification types', function () {
    $this->actingAs($this->user)
        ->get(route('settings.notifications'));

    $types = $this->user->notificationPreferences()->pluck('notification_type')->toArray();

    expect($types)->toContain('severe_malnutrition');
    expect($types)->toContain('report_generated');
    expect($types)->toContain('weekly_summary');
});

it('respects existing notification preferences', function () {
    // Create a preference first
    $this->user->notificationPreferences()->create([
        'notification_type' => 'severe_malnutrition',
        'database' => true,
        'email' => false,
        'push' => true,
    ]);

    $this->actingAs($this->user)
        ->get(route('settings.notifications'))
        ->assertInertia(fn ($page) => $page
            ->where('preferences.0.email', false)
        );
});

it('updates a notification preference', function () {
    $pref = $this->user->notificationPreferences()->create([
        'notification_type' => 'report_generated',
        'database' => true,
        'email' => true,
        'push' => true,
    ]);

    $this->actingAs($this->user)
        ->put(route('settings.notification-preferences.update', $pref), [
            'email' => false,
        ])
        ->assertRedirect();

    expect($pref->fresh()->email)->toBeFalse();
    expect($pref->fresh()->database)->toBeTrue(); // unchanged
});

it('prevents updating another users preference', function () {
    $otherUser = User::factory()->create(['is_active' => true]);
    $otherUser->assignRole('admin');

    $pref = $otherUser->notificationPreferences()->create([
        'notification_type' => 'severe_malnutrition',
        'database' => true,
        'email' => true,
        'push' => true,
    ]);

    $this->actingAs($this->user)
        ->put(route('settings.notification-preferences.update', $pref), [
            'email' => false,
        ])
        ->assertForbidden();
});

it('requires authentication for preferences page', function () {
    $this->get(route('settings.notifications'))->assertRedirect(route('login'));
});

it('has default channel values for new preferences', function () {
    $pref = $this->user->notificationPreferences()->create([
        'notification_type' => 'weekly_summary',
    ]);

    expect($pref->database)->toBeTrue();
    expect($pref->email)->toBeTrue();
    expect($pref->push)->toBeTrue();
});

it('updates database and push channels independently', function () {
    $pref = $this->user->notificationPreferences()->create([
        'notification_type' => 'severe_malnutrition',
        'database' => true,
        'email' => true,
        'push' => true,
    ]);

    $this->actingAs($this->user)
        ->put(route('settings.notification-preferences.update', $pref), [
            'database' => false,
            'push' => false,
        ])
        ->assertRedirect();

    $pref->refresh();
    expect($pref->database)->toBeFalse();
    expect($pref->push)->toBeFalse();
    expect($pref->email)->toBeTrue(); // unchanged
});
