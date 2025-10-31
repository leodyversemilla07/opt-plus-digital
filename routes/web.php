<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MeasurementController;
use App\Http\Controllers\ReportController;
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
    
    // Report routes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::get('/opt-summary', [ReportController::class, 'optSummary'])->name('opt-summary');
        Route::get('/master-list', [ReportController::class, 'masterList'])->name('master-list');
        Route::get('/target-list', [ReportController::class, 'targetList'])->name('target-list');
        Route::get('/barangay-comparison', [ReportController::class, 'barangayComparison'])->name('barangay-comparison');
    });
    
    // Children routes
    Route::resource('children', ChildController::class);
    Route::post('children/search-duplicates', [ChildController::class, 'searchDuplicates'])
        ->name('children.search-duplicates');
    
    // Measurement routes (nested under children)
    Route::prefix('children/{child}')->name('children.')->group(function () {
        Route::resource('measurements', MeasurementController::class);
    });
});

require __DIR__.'/settings.php';
