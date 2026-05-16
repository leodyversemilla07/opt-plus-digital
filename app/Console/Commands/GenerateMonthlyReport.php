<?php

namespace App\Console\Commands;

use App\Models\ScheduledReport;
use App\Models\User;
use App\Notifications\ReportGeneratedNotification;
use App\Services\ReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

#[Signature('reports:generate-monthly')]
#[Description('Generate the monthly OPT Plus summary report and notify admins')]
class GenerateMonthlyReport extends Command
{
    public function handle(ReportService $reportService): int
    {
        $this->info('Generating monthly report...');

        $now = Carbon::now();
        $startDate = $now->copy()->startOfMonth()->toDateString();
        $endDate = $now->copy()->endOfMonth()->toDateString();
        $barangayId = $this->option('barangay');
        $reportDate = $now->format('Y-m');

        // 1. Generate OPT Summary PDF
        $this->info('Generating OPT Summary PDF...');
        $optData = $reportService->generateOPTSummary($barangayId, $startDate, $endDate);
        $optPdf = Pdf::loadView('exports.pdf.opt-summary', $optData);
        $optPdf->setPaper('a4', 'landscape');
        $optPath = "reports/opt-summary-{$reportDate}.pdf";
        Storage::disk('local')->put($optPath, $optPdf->output());
        $this->saveReport(
            type: 'monthly',
            title: "Monthly OPT Summary - {$reportDate}",
            filePath: $optPath,
            fileSize: Storage::disk('local')->size($optPath),
            mimeType: 'application/pdf',
            filters: ['start_date' => $startDate, 'end_date' => $endDate, 'barangay_id' => $barangayId],
        );

        // 2. Generate Master List PDF
        $this->info('Generating Master List PDF...');
        $masterData = $reportService->generateMasterList($barangayId);
        $masterPdf = Pdf::loadView('exports.pdf.master-list', ['children' => $masterData]);
        $masterPdf->setPaper('a4', 'landscape');
        $masterPath = "reports/master-list-{$reportDate}.pdf";
        Storage::disk('local')->put($masterPath, $masterPdf->output());
        $this->saveReport(
            type: 'monthly',
            title: "Monthly Master List - {$reportDate}",
            filePath: $masterPath,
            fileSize: Storage::disk('local')->size($masterPath),
            mimeType: 'application/pdf',
            filters: ['barangay_id' => $barangayId],
        );

        // 3. Generate Target List PDF
        $this->info('Generating Target List PDF...');
        $targetData = $reportService->generateTargetList($barangayId);
        $targetPdf = Pdf::loadView('exports.pdf.target-list', ['children' => $targetData]);
        $targetPdf->setPaper('a4', 'portrait');
        $targetPath = "reports/target-list-{$reportDate}.pdf";
        Storage::disk('local')->put($targetPath, $targetPdf->output());
        $this->saveReport(
            type: 'monthly',
            title: "Monthly Target List - {$reportDate}",
            filePath: $targetPath,
            fileSize: Storage::disk('local')->size($targetPath),
            mimeType: 'application/pdf',
            filters: ['barangay_id' => $barangayId],
        );

        // 4. Notify all admin users
        $this->info('Notifying admin users...');
        $admins = User::role('admin')->where('is_active', true)->get();
        $this->info("Found {$admins->count()} admin(s) to notify.");

        $latestReport = ScheduledReport::latest('id')->first();
        if ($latestReport) {
            foreach ($admins as $admin) {
                $admin->notify(new ReportGeneratedNotification($latestReport));
            }
        }

        $this->info('Monthly report generation complete!');

        return self::SUCCESS;
    }

    private function saveReport(
        string $type,
        string $title,
        string $filePath,
        int $fileSize,
        string $mimeType,
        ?array $filters = null
    ): ScheduledReport {
        return ScheduledReport::create([
            'type' => $type,
            'title' => $title,
            'file_path' => $filePath,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'filters' => $filters,
            'generated_by' => null, // system-generated
            'generated_at' => now(),
        ]);
    }
}
