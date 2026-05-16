<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DqcController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\MassMailController;
use App\Http\Controllers\MeasurementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OfflineSyncController;
use App\Http\Controllers\OptSessionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/features', function () {
    return Inertia::render('features', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('features');

Route::get('/about', function () {
    return Inertia::render('about', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('about');

Route::get('/design-system', function () {
    return Inertia::render('design-system');
})->name('design-system');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard & Analytics
    Route::middleware('permission:view analytics')->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('analytics/barangay/{barangay}', [DashboardController::class, 'barangay'])
            ->name('analytics.barangay');
    });

    // DQC
    Route::prefix('dqc')
        ->name('dqc.')
        ->middleware('permission:view reports')
        ->group(function () {
            Route::get('/', [DqcController::class, 'index'])->name('index');
            Route::post('measurements/{measurement}/certify', [DqcController::class, 'certify'])
                ->name('measurements.certify');
            Route::post('measurements/{measurement}/reject', [DqcController::class, 'reject'])
                ->name('measurements.reject');
            Route::get('/export/summary', [DqcController::class, 'exportSummary'])
                ->middleware('permission:export reports')
                ->name('export.summary');
        });

    // Reports
    Route::prefix('reports')
        ->name('reports.')
        ->middleware('permission:view reports')
        ->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/opt-summary', [ReportController::class, 'optSummary'])->name('opt-summary');
            Route::get('/master-list', [ReportController::class, 'masterList'])->name('master-list');
            Route::get('/target-list', [ReportController::class, 'targetList'])->name('target-list');
            Route::get('/barangay-comparison', [ReportController::class, 'barangayComparison'])->name('barangay-comparison');
            Route::get('/f1k-list', [ReportController::class, 'f1kList'])->name('f1k-list');
            Route::get('/monitoring/{type}', [ReportController::class, 'monitoringList'])->name('monitoring-list');
            Route::get('/nut-status-brgy', [ReportController::class, 'nutStatusBrgy'])->name('nut-status-brgy');
            Route::get('/muac-list', [ReportController::class, 'muacList'])->name('muac-list');
            Route::get('/form-1c', [ReportController::class, 'form1C'])->name('form-1c');

            // Export routes
            Route::middleware('permission:export reports')->group(function () {
                Route::get('/export/opt-summary/pdf', [ReportController::class, 'exportOPTSummaryPDF'])->name('export.opt-summary.pdf');
                Route::get('/export/opt-summary/excel', [ReportController::class, 'exportOPTSummaryExcel'])->name('export.opt-summary.excel');
                Route::get('/export/master-list/pdf', [ReportController::class, 'exportMasterListPDF'])->name('export.master-list.pdf');
                Route::get('/export/master-list/excel', [ReportController::class, 'exportMasterListExcel'])->name('export.master-list.excel');
                Route::get('/export/target-list/pdf', [ReportController::class, 'exportTargetListPDF'])->name('export.target-list.pdf');
                Route::get('/export/target-list/excel', [ReportController::class, 'exportTargetListExcel'])->name('export.target-list.excel');
            });
        });

    // Import
    Route::prefix('import')
        ->name('import.')
        ->middleware('permission:create children')
        ->group(function () {
            Route::get('/', [ImportController::class, 'index'])->name('index');
            Route::post('/', [ImportController::class, 'store'])->name('store');
            Route::post('/validate', [ImportController::class, 'validate'])->name('validate');
            Route::get('/template', [ImportController::class, 'downloadTemplate'])->name('template');
        });

    // Batch Operations (MUST come before resource route to avoid {opt_session} collision)
    Route::post('opt-sessions/batch/start', [OptSessionController::class, 'batchStart'])
        ->middleware('permission:create children')
        ->name('opt-sessions.batch.start');
    Route::post('opt-sessions/batch/complete', [OptSessionController::class, 'batchComplete'])
        ->middleware('permission:create children')
        ->name('opt-sessions.batch.complete');
    Route::post('opt-sessions/batch/cancel', [OptSessionController::class, 'batchCancel'])
        ->middleware('permission:create children')
        ->name('opt-sessions.batch.cancel');

    // OPT Sessions
    Route::resource('opt-sessions', OptSessionController::class)
        ->middleware('permission:create children');
    Route::post('opt-sessions/{opt_session}/start', [OptSessionController::class, 'start'])
        ->middleware('permission:create children')
        ->name('opt-sessions.start');
    Route::post('opt-sessions/{opt_session}/complete', [OptSessionController::class, 'complete'])
        ->middleware('permission:create children')
        ->name('opt-sessions.complete');
    Route::post('opt-sessions/{opt_session}/cancel', [OptSessionController::class, 'cancel'])
        ->middleware('permission:create children')
        ->name('opt-sessions.cancel');

    // Children
    Route::resource('children', ChildController::class);
    Route::post('children/search-duplicates', [ChildController::class, 'searchDuplicates'])
        ->name('children.search-duplicates');

    // Measurements (nested under children)
    Route::prefix('children/{child}')->name('children.')->group(function () {
        Route::resource('measurements', MeasurementController::class);
    });

    // User Management
    Route::resource('users', UserController::class);
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->middleware('permission:manage roles')
        ->name('users.toggle-status');

    // Notifications
    Route::prefix('notifications')
        ->name('notifications.')
        ->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::post('{id}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
            Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::get('{id}/redirect', [NotificationController::class, 'redirect'])->name('redirect');
        });

    // Audit Logs
    Route::prefix('audit-logs')
        ->name('audit-logs.')
        ->middleware('permission:view audit logs')
        ->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('index');
            Route::get('{audit_log}', [AuditLogController::class, 'show'])->name('show');
        });

    // Mass Mail
    Route::prefix('mass-mail')
        ->name('mass-mail.')
        ->middleware('permission:send mass mail')
        ->group(function () {
            Route::get('/', [MassMailController::class, 'index'])->name('index');
            Route::get('/create', [MassMailController::class, 'create'])->name('create');
            Route::post('/preview-recipients', [MassMailController::class, 'previewRecipients'])->name('preview-recipients');
            Route::post('/', [MassMailController::class, 'store'])->name('store');
            Route::get('{mass_mail}', [MassMailController::class, 'show'])->name('show');
        });

    // Offline Sync
    Route::post('api/measurements/sync', [OfflineSyncController::class, 'syncMeasurements'])
        ->name('api.measurements.sync');
});

require __DIR__.'/settings.php';
