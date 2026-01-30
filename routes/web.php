<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DqcController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\MeasurementController;
use App\Http\Controllers\OptSessionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('analytics/barangay/{barangay}', [DashboardController::class, 'barangay'])
        ->name('analytics.barangay');

    // DQC routes
    Route::prefix('dqc')->name('dqc.')->group(function () {
        Route::get('/', [DqcController::class, 'index'])->name('index');
        Route::get('/export/summary', [DqcController::class, 'exportSummary'])->name('export.summary');
    });

    // Report routes
    Route::prefix('reports')->name('reports.')->group(function () {
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
        Route::get('/export/opt-summary/pdf', [ReportController::class, 'exportOPTSummaryPDF'])->name('export.opt-summary.pdf');
        Route::get('/export/opt-summary/excel', [ReportController::class, 'exportOPTSummaryExcel'])->name('export.opt-summary.excel');
        Route::get('/export/master-list/pdf', [ReportController::class, 'exportMasterListPDF'])->name('export.master-list.pdf');
        Route::get('/export/master-list/excel', [ReportController::class, 'exportMasterListExcel'])->name('export.master-list.excel');
        Route::get('/export/target-list/pdf', [ReportController::class, 'exportTargetListPDF'])->name('export.target-list.pdf');
        Route::get('/export/target-list/excel', [ReportController::class, 'exportTargetListExcel'])->name('export.target-list.excel');
    });

    // Import routes
    Route::prefix('import')->name('import.')->group(function () {
        Route::get('/', [ImportController::class, 'index'])->name('index');
        Route::post('/', [ImportController::class, 'store'])->name('store');
        Route::post('/validate', [ImportController::class, 'validate'])->name('validate');
        Route::get('/template', [ImportController::class, 'downloadTemplate'])->name('template');
    });

    // OPT Sessions routes
    Route::resource('opt-sessions', OptSessionController::class);
    Route::post('opt-sessions/{opt_session}/start', [OptSessionController::class, 'start'])
        ->name('opt-sessions.start');
    Route::post('opt-sessions/{opt_session}/complete', [OptSessionController::class, 'complete'])
        ->name('opt-sessions.complete');
    Route::post('opt-sessions/{opt_session}/cancel', [OptSessionController::class, 'cancel'])
        ->name('opt-sessions.cancel');

    // Children routes
    Route::resource('children', ChildController::class);
    Route::post('children/search-duplicates', [ChildController::class, 'searchDuplicates'])
        ->name('children.search-duplicates');

    // Measurement routes (nested under children)
    Route::prefix('children/{child}')->name('children.')->group(function () {
        Route::resource('measurements', MeasurementController::class);
    });

    // User Management routes
    Route::resource('users', UserController::class);
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
});

Route::get('/design-system', function () {
    return Inertia::render('design-system');
})->name('design-system');

require __DIR__.'/settings.php';
