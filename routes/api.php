<?php

use App\Http\Controllers\Api\MeasurementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Measurement routes (nested under children)
Route::prefix('children/{child}')->group(function () {
    Route::apiResource('measurements', MeasurementController::class);
});

// Alternative flat route structure
Route::get('measurements/{measurement}', [MeasurementController::class, 'show'])->name('api.measurements.show');
