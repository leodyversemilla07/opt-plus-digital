<?php

use App\Models\Barangay;
use App\Models\Child;
use App\Models\MassMail;
use App\Models\User;
use App\Services\MassMailService;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'send mass mail', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'view reports', 'guard_name' => 'web']);
});

// ─── Auth Gates ───────────────────────────────────────────────

test('guests are redirected to the login page', function () {
    $this->get(route('mass-mail.index'))->assertRedirect(route('login'));
    $this->get(route('mass-mail.create'))->assertRedirect(route('login'));
});

test('users without send mass mail permission cannot access mass mail pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('mass-mail.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('mass-mail.create'))
        ->assertForbidden();
});

test('users with send mass mail permission can access the mass mail index', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->get(route('mass-mail.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('mass-mail/index'));
});

test('users with send mass mail permission can access the create page', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->get(route('mass-mail.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('mass-mail/create'));
});

// ─── Creating Mass Mail ───────────────────────────────────────

test('users can create a mass mail to all parents', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)->post(route('mass-mail.store'), [
        'subject' => 'Test Subject',
        'message_body' => 'Test message body',
        'recipient_type' => 'all_parents',
    ])->assertRedirect(route('mass-mail.index'));

    $this->assertDatabaseHas('mass_mails', [
        'subject' => 'Test Subject',
        'message_body' => 'Test message body',
        'recipient_type' => 'all_parents',
        'created_by' => $user->id,
    ]);
});

test('subject is required', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->post(route('mass-mail.store'), [
            'subject' => '',
            'message_body' => 'Test body',
            'recipient_type' => 'all_parents',
        ])
        ->assertSessionHasErrors('subject');
});

test('message body is required', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->post(route('mass-mail.store'), [
            'subject' => 'Test',
            'message_body' => '',
            'recipient_type' => 'all_parents',
        ])
        ->assertSessionHasErrors('message_body');
});

test('recipient type is required', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->post(route('mass-mail.store'), [
            'subject' => 'Test',
            'message_body' => 'Body',
            'recipient_type' => '',
        ])
        ->assertSessionHasErrors('recipient_type');
});

test('mass mail with by_barangay recipient type stores criteria', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');
    $barangay = Barangay::factory()->create();

    $this->actingAs($user)->post(route('mass-mail.store'), [
        'subject' => 'Barangay-specific',
        'message_body' => 'Message for specific barangay',
        'recipient_type' => 'by_barangay',
        'recipient_criteria' => ['barangay_id' => $barangay->id],
    ])->assertRedirect(route('mass-mail.index'));

    $this->assertDatabaseHas('mass_mails', [
        'subject' => 'Barangay-specific',
        'recipient_type' => 'by_barangay',
    ]);
});

test('mass mail with specific_roles stores roles criteria', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)->post(route('mass-mail.store'), [
        'subject' => 'Role-specific',
        'message_body' => 'Message for specific roles',
        'recipient_type' => 'specific_roles',
        'recipient_criteria' => ['roles' => ['bns', 'bhw']],
    ])->assertRedirect(route('mass-mail.index'));

    $this->assertDatabaseHas('mass_mails', [
        'subject' => 'Role-specific',
        'recipient_type' => 'specific_roles',
    ]);
});

test('invalid recipient type is rejected', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->post(route('mass-mail.store'), [
            'subject' => 'Test',
            'message_body' => 'Body',
            'recipient_type' => 'invalid_type',
        ])
        ->assertSessionHasErrors('recipient_type');
});

// ─── Mass Mail Model ──────────────────────────────────────────

test('mass mail has correct fillable attributes', function () {
    $massMail = new MassMail;

    expect($massMail->getFillable())->toContain(
        'subject', 'message_body', 'recipient_type',
        'recipient_criteria', 'total_recipients',
        'sent_count', 'failed_count', 'status',
        'created_by', 'sent_at', 'completed_at'
    );
});

test('mass mail casts recipient_criteria as array', function () {
    $massMail = new MassMail;

    expect($massMail->getCasts()['recipient_criteria'])->toBe('array');
});

test('isDraft returns true when status is draft', function () {
    $mail = new MassMail(['status' => 'draft']);
    expect($mail->isDraft())->toBeTrue();
});

test('isSent returns true when status is sent or partially_sent', function () {
    $sent = new MassMail(['status' => 'sent']);
    $partial = new MassMail(['status' => 'partially_sent']);
    $draft = new MassMail(['status' => 'draft']);

    expect($sent->isSent())->toBeTrue();
    expect($partial->isSent())->toBeTrue();
    expect($draft->isSent())->toBeFalse();
});

// ─── Mass Mail Service ────────────────────────────────────────

test('resolveRecipients returns empty array for unknown type', function () {
    $service = app(MassMailService::class);
    $recipients = $service->resolveRecipients('unknown_type');

    expect($recipients)->toBe([]);
});

test('resolveRecipients returns empty array when no children exist', function () {
    $service = app(MassMailService::class);
    $recipients = $service->resolveRecipients('all_parents');

    expect($recipients)->toBe([]);
});

test('getRecipientCount returns correct count for all parents', function () {
    $barangay = Barangay::factory()->create();
    Child::factory()->count(3)->create([
        'barangay_id' => $barangay->id,
        'contact_number' => '09171234567',
    ]);
    // Child without contact number should not be counted
    Child::factory()->create([
        'barangay_id' => $barangay->id,
        'contact_number' => null,
    ]);

    $service = app(MassMailService::class);
    $count = $service->getRecipientCount('all_parents');

    expect($count)->toBe(3);
});

test('getRecipientCount for specific_roles counts users with matching role', function () {
    $user1 = User::factory()->create(['is_active' => true]);
    $user2 = User::factory()->create(['is_active' => true]);
    $inactiveUser = User::factory()->create(['is_active' => false]);

    // Create roles in test environment
    Role::firstOrCreate(['name' => 'bns', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'municipal', 'guard_name' => 'web']);

    $user1->assignRole('bns');
    $user2->assignRole('municipal');

    $service = app(MassMailService::class);
    $count = $service->getRecipientCount('specific_roles', ['roles' => ['bns']]);

    expect($count)->toBe(1);
});

test('getClassifications returns expected keys', function () {
    $classifications = MassMailService::getClassifications();

    expect($classifications)->toHaveKey('sam');
    expect($classifications)->toHaveKey('mam');
    expect($classifications)->toHaveKey('overweight');
});

test('getRecipientTypes returns expected keys', function () {
    $types = MassMailService::getRecipientTypes();

    expect($types)->toHaveKey('all_parents');
    expect($types)->toHaveKey('by_barangay');
    expect($types)->toHaveKey('by_classification');
    expect($types)->toHaveKey('specific_roles');
});

// ─── Viewing Mass Mail Details ────────────────────────────────

test('user can view mass mail details', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $massMail = MassMail::factory()->create([
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('mass-mail.show', $massMail))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('mass-mail/show'));
});

test('user can only view mass mail they have permission for', function () {
    $user = User::factory()->create();

    $massMail = MassMail::factory()->create();

    $this->actingAs($user)
        ->get(route('mass-mail.show', $massMail))
        ->assertForbidden();
});

// ─── Preview Recipients ──────────────────────────────────────

test('preview recipients returns count via JSON', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->postJson(route('mass-mail.preview-recipients'), [
            'recipient_type' => 'all_parents',
        ])
        ->assertOk()
        ->assertJson(['count' => 0]);
});

test('preview recipients requires valid recipient type', function () {
    $user = User::factory()->create();
    $user->givePermissionTo('send mass mail');

    $this->actingAs($user)
        ->postJson(route('mass-mail.preview-recipients'), [
            'recipient_type' => 'invalid',
        ])
        ->assertStatus(422);
});
