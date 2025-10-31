<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\MeasurementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
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
