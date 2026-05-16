<?php

use App\Console\Commands\GenerateMonthlyReport;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Generate monthly reports on the 1st of each month at 2:00 AM
Schedule::command(GenerateMonthlyReport::class)->monthlyOn(1, '02:00');
