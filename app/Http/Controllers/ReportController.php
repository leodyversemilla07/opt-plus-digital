<?php

namespace App\Http\Controllers;

use App\Services\ExportService;
use App\Services\ReportService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private ReportService $reportService,
        private ExportService $exportService
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
}
