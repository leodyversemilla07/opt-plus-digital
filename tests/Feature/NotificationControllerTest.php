<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\User;
use App\Notifications\SevereMalnutritionAlert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(\Database\Seeders\RolePermissionSeeder::class);

    $this->barangay = Barangay::factory()->create();

    $this->user = User::factory()->create([
        'barangay_id' => $this->barangay->id,
        'is_active' => true,
    ]);
    $this->user->assignRole('admin');

    $this->child = Child::factory()->create([
        'barangay_id' => $this->barangay->id,
    ]);
});

/**
 * Helper: create a notification record directly in the database for controller tests.
 * These tests test the controller, not the notification sending logic (covered elsewhere).
 */
function createNotification(User $user, Child $child): DatabaseNotification
{
    return DatabaseNotification::query()->create([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'type' => SevereMalnutritionAlert::class,
        'notifiable_type' => get_class($user),
        'notifiable_id' => $user->id,
        'data' => [
            'measurement_id' => 'test-measurement-id',
            'child_id' => $child->id,
            'child_name' => $child->full_name,
            'barangay_name' => $child->barangay?->name,
            'measurement_date' => '2026-05-15',
            'age_in_months' => 24,
            'weight_kg' => '8.50',
            'height_length_cm' => '75.00',
            'weight_for_age_zscore' => -3.5,
            'height_for_age_zscore' => -2.0,
            'weight_for_height_zscore' => -3.2,
            'opt_classification' => 'sam',
            'has_edema' => false,
            'type' => 'severe_malnutrition',
        ],
        'read_at' => null,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('shows the notifications index page', function () {
    createNotification($this->user, $this->child);

    $this->actingAs($this->user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 1)
            ->has('unreadCount')
        );
});

it('shows empty state when no notifications', function () {
    $this->actingAs($this->user)
        ->get(route('notifications.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('notifications/index')
            ->has('notifications.data', 0)
        );
});

it('marks a single notification as read', function () {
    $notification = createNotification($this->user, $this->child);

    expect($notification->fresh()->read_at)->toBeNull();

    $this->actingAs($this->user)
        ->post(route('notifications.mark-as-read', $notification->id))
        ->assertRedirect();

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('marks all notifications as read', function () {
    createNotification($this->user, $this->child);
    createNotification($this->user, $this->child);

    expect($this->user->unreadNotifications()->count())->toBe(2);

    $this->actingAs($this->user)
        ->post(route('notifications.mark-all-read'))
        ->assertRedirect();

    expect($this->user->unreadNotifications()->count())->toBe(0);
});

it('redirects to child profile from notification', function () {
    $notification = createNotification($this->user, $this->child);

    expect($notification->fresh()->read_at)->toBeNull();

    $this->actingAs($this->user)
        ->get(route('notifications.redirect', $notification->id))
        ->assertRedirect(route('children.show', $this->child->id));

    expect($notification->fresh()->read_at)->not->toBeNull();
});

it('requires authentication for notification routes', function () {
    $this->get(route('notifications.index'))->assertRedirect(route('login'));
    $this->post(route('notifications.mark-all-read'))->assertRedirect(route('login'));
});

it('shows correct unread count on notification index', function () {
    createNotification($this->user, $this->child);

    $this->actingAs($this->user)
        ->get(route('notifications.index'))
        ->assertInertia(fn ($page) => $page
            ->where('unreadCount', 1)
        );

    $this->post(route('notifications.mark-all-read'));

    $this->actingAs($this->user)
        ->get(route('notifications.index'))
        ->assertInertia(fn ($page) => $page
            ->where('unreadCount', 0)
        );
});
