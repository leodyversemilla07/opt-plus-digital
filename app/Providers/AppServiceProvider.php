<?php

namespace App\Providers;

use App\Models\Measurement;
use App\Observers\MeasurementObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Measurement::observe(MeasurementObserver::class);
    }
}
