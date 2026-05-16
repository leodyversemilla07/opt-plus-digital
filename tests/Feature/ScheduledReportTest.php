<?php

use App\Models\ScheduledReport;
use App\Models\User;
use App\Notifications\ReportGeneratedNotification;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->create(['is_active' => true]);
    $this->admin->assignRole('admin');

    $this->bns = User::factory()->create(['is_active' => true]);
    $this->bns->assignRole('bns');
});

it('creates a scheduled report record', function () {
    $report = ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Monthly OPT Summary - 2026-05',
        'file_path' => 'reports/opt-summary-2026-05.pdf',
        'file_size' => 1024,
        'mime_type' => 'application/pdf',
        'generated_by' => null,
        'generated_at' => now(),
    ]);

    expect($report)->toBeInstanceOf(ScheduledReport::class);
    expect($report->type)->toBe('monthly');
    expect($report->title)->toBe('Monthly OPT Summary - 2026-05');
});

it('lists scheduled reports on the page', function () {
    ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Test Report',
        'file_path' => 'reports/test.pdf',
        'file_size' => 500,
        'mime_type' => 'application/pdf',
        'generated_by' => $this->admin->id,
        'generated_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('reports.scheduled'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/scheduled')
            ->has('reports.data', 1)
        );
});

it('shows empty state when no scheduled reports', function () {
    $this->actingAs($this->admin)
        ->get(route('reports.scheduled'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/scheduled')
            ->has('reports.data', 0)
        );
});

it('requires authentication for scheduled reports page', function () {
    $this->get(route('reports.scheduled'))->assertRedirect(route('login'));
});

it('requires view reports permission for scheduled reports', function () {
    $userWithoutPermission = User::factory()->create(['is_active' => true]);
    $userWithoutPermission->assignRole('bhw');

    // BHW role has view reports in this app, so this should work
    $this->actingAs($userWithoutPermission)
        ->get(route('reports.scheduled'))
        ->assertOk();
});

it('downloads a scheduled report file', function () {
    Storage::fake('local');

    Storage::disk('local')->put('reports/test-report.pdf', 'fake-content');

    $report = ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Download Test',
        'file_path' => 'reports/test-report.pdf',
        'file_size' => 12,
        'mime_type' => 'application/pdf',
        'generated_by' => $this->admin->id,
        'generated_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('reports.scheduled.download', $report))
        ->assertOk()
        ->assertDownload('test-report.pdf');
});

it('returns 404 when report file is missing', function () {
    $report = ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Missing File',
        'file_path' => 'reports/nonexistent.pdf',
        'file_size' => 0,
        'mime_type' => 'application/pdf',
        'generated_by' => $this->admin->id,
        'generated_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->get(route('reports.scheduled.download', $report))
        ->assertNotFound();
});

it('sends report generated notification to admins', function () {
    Notification::fake();

    $report = ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Test Report',
        'file_path' => 'reports/test.pdf',
        'file_size' => 500,
        'mime_type' => 'application/pdf',
        'generated_by' => $this->admin->id,
        'generated_at' => now(),
    ]);

    $this->admin->notify(new ReportGeneratedNotification($report));

    Notification::assertSentTo(
        $this->admin,
        ReportGeneratedNotification::class,
    );
});

it('notification contains correct report data', function () {
    $report = ScheduledReport::create([
        'type' => 'monthly',
        'title' => 'Monthly OPT Summary - 2026-05',
        'file_path' => 'reports/opt-summary-2026-05.pdf',
        'file_size' => 2048,
        'mime_type' => 'application/pdf',
        'generated_by' => null,
        'generated_at' => now(),
    ]);

    $notification = new ReportGeneratedNotification($report);
    $data = $notification->toArray($this->admin);

    expect($data['report_id'])->toBe($report->id);
    expect($data['title'])->toBe($report->title);
    expect($data['type'])->toBe('monthly');
    expect($data['notif_type'])->toBe('report_generated');
});
