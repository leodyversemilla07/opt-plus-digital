<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
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
}
