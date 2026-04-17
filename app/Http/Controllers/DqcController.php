<?php

namespace App\Http\Controllers;

use App\Services\DataQualityControlService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DqcController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private DataQualityControlService $dqcService
    ) {}

    /**
     * Display DQC dashboard
     */
    public function index(Request $request): Response
    {
        $this->authorize('view analytics');
        $user = $request->user();

        // Get barangay ID from user (BHW/BNS) or all (admin/municipal)
        $barangayId = in_array($user->role ?? 'bhw', ['municipal', 'admin'])
            ? null
            : $user->barangay_id;

        // Get DQC summary
        $dqcSummary = $this->dqcService->getDQCSummary($barangayId);

        // Get detailed lists
        $flaggedMeasurements = $this->dqcService->findFlaggedMeasurements($barangayId, 50);
        $overagedChildren = $this->dqcService->findOveragedChildren($barangayId, 50);
        $stuntedChildren = $this->dqcService->findStuntedChildren($barangayId, 50);

        return Inertia::render('dqc/index', [
            'user' => $user,
            'dqcSummary' => $dqcSummary,
            'flaggedMeasurements' => $flaggedMeasurements->map(fn($m) => [
                'id' => $m->id,
                'child_id' => $m->child->id,
                'child_name' => $m->child->full_name,
                'barangay' => $m->child->barangay->name,
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'weight_kg' => $m->weight_kg,
                'height_cm' => $m->height_length_cm,
                'wfa_zscore' => $m->weight_for_age_zscore,
                'hfa_zscore' => $m->height_for_age_zscore,
                'wfh_zscore' => $m->weight_for_height_zscore,
                'opt_classification' => $m->opt_classification,
            ]),
            'overagedChildren' => $overagedChildren->map(fn($m) => [
                'id' => $m->id,
                'child_name' => $m->child->full_name,
                'barangay' => $m->child->barangay->name,
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'weight_kg' => $m->weight_kg,
                'height_cm' => $m->height_length_cm,
            ]),
            'stuntedChildren' => $stuntedChildren->map(fn($m) => [
                'id' => $m->id,
                'child_name' => $m->child->full_name,
                'barangay' => $m->child->barangay->name,
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'height_cm' => $m->height_length_cm,
                'hfa_zscore' => $m->height_for_age_zscore,
                'hfa_status' => $m->height_for_age_status,
            ]),
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Export DQC summary report (Excel)
     */
    public function exportSummary(Request $request)
    {
        $this->authorize('export reports');
        $user = $request->user();

        $barangayId = in_array($user->role ?? 'bhw', ['municipal', 'admin'])
            ? $request->input('barangay_id')
            : $user->barangay_id;

        $summary = $this->dqcService->getDQCSummary($barangayId);

        // Export to Excel using PhpSpreadsheet
        // This will be implemented with ExportService
        return response()->json($summary);
    }
}
