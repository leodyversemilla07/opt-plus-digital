<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use App\Services\ExportService;
use App\Services\ReportService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use App\Models\ScheduledReport;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ReportService $reportService,
        private ExportService $exportService,
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Display reports dashboard
     */
    public function index(): Response
    {
        $this->authorize('view reports');

        return Inertia::render('reports/index');
    }

    /**
     * Generate OPT Plus summary report
     */
    public function optSummary(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $summary = $this->reportService->generateOPTSummary($barangayId, $startDate, $endDate);

        return Inertia::render('reports/opt-summary', [
            'summary' => $summary,
        ]);
    }

    /**
     * Generate master list
     */
    public function masterList(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');
        $children = $this->reportService->generateMasterList($barangayId);

        return Inertia::render('reports/master-list', [
            'children' => $children,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate target list (high-risk children)
     */
    public function targetList(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');
        $children = $this->reportService->generateTargetList($barangayId);

        return Inertia::render('reports/target-list', [
            'children' => $children,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate barangay comparison report
     */
    public function barangayComparison(): Response
    {
        $this->authorize('view municipal analytics');
        $report = $this->reportService->generateBarangayComparisonReport();

        return Inertia::render('reports/barangay-comparison', [
            'report' => $report,
        ]);
    }

    /**
     * Generate F1K (First 1000 Days) list - children 0-23 months
     */
    public function f1kList(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');

        $f1kStats = $this->analyticsService->getF1KStatistics($barangayId);
        $children = $this->reportService->generateF1KList($barangayId);

        return Inertia::render('reports/f1k-list', [
            'children' => $children,
            'statistics' => $f1kStats,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate monitoring list by status (SAM, MAM, stunted, overweight)
     */
    public function monitoringList(Request $request, string $type): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');

        $validTypes = ['sam', 'mam', 'stunted', 'overweight', 'obese'];
        if (! in_array($type, $validTypes)) {
            abort(404, 'Invalid monitoring list type');
        }

        $children = $this->reportService->generateMonitoringList($type, $barangayId);

        return Inertia::render('reports/monitoring-list', [
            'type' => $type,
            'children' => $children,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate NutStatusBrgy - Sex-disaggregated report
     */
    public function nutStatusBrgy(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');

        $report = $this->reportService->generateNutStatusBrgy($barangayId);

        return Inertia::render('reports/nut-status-brgy', [
            'report' => $report,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate MUAC monitoring list
     */
    public function muacList(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');

        $children = $this->reportService->generateMUACList($barangayId);

        return Inertia::render('reports/muac-list', [
            'children' => $children,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Generate OPT Form 1C - Affected/At-risk children
     */
    public function form1C(Request $request): Response
    {
        $this->authorize('view reports');
        $barangayId = $request->query('barangay');

        $report = $this->reportService->generateForm1C($barangayId);

        return Inertia::render('reports/form-1c', [
            'report' => $report,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Export OPT Summary as PDF
     */
    public function exportOPTSummaryPDF(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportOPTSummaryPDF(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Export Master List as PDF
     */
    public function exportMasterListPDF(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportMasterListPDF(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Export Target List as PDF
     */
    public function exportTargetListPDF(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportTargetListPDF(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Export OPT Summary as Excel
     */
    public function exportOPTSummaryExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportOPTSummaryExcel(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Export Master List as Excel
     */
    public function exportMasterListExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportMasterListExcel(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Export Target List as Excel
     */
    public function exportTargetListExcel(Request $request): BinaryFileResponse
    {
        $this->authorize('export reports');

        return $this->exportService->exportTargetListExcel(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }

    /**
     * Display list of scheduled/generated reports.
     */
    public function scheduled(Request $request): Response
    {
        $this->authorize('view reports');

        $reports = ScheduledReport::latest('generated_at')
            ->with('generator')
            ->paginate(20);

        return Inertia::render('reports/scheduled', [
            'reports' => $reports,
        ]);
    }

    /**
     * Download a generated report file.
     */
    public function download(ScheduledReport $scheduledReport): BinaryFileResponse
    {
        $this->authorize('view reports');

        if (! Storage::disk('local')->exists($scheduledReport->file_path)) {
            abort(404, 'Report file not found.');
        }

        $filename = basename($scheduledReport->file_path);
        $fullPath = Storage::disk('local')->path($scheduledReport->file_path);

        return response()->download($fullPath, $filename, [
            'Content-Type' => $scheduledReport->mime_type ?? 'application/pdf',
        ]);
    }
}
