<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService,
        private ExportService $exportService
    ) {}

    /**
     * Display reports dashboard
     */
    public function index(): Response
    {
        return Inertia::render('reports/index');
    }

    /**
     * Generate OPT Plus summary report
     */
    public function optSummary(Request $request): Response
    {
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
        return $this->exportService->exportTargetListExcel(
            $request->query('barangay'),
            $request->query('start_date'),
            $request->query('end_date')
        );
    }
}
