<?php

namespace App\Http\Controllers;

use App\Models\Measurement;
use App\Services\AuditLogService;
use App\Services\DataQualityControlService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
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
     * Display DQC dashboard with certification data.
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

        // Get measurements pending certification
        $pendingCertifications = Measurement::with(['child.barangay', 'measuredBy'])
            ->pendingCertification()
            ->when($barangayId, function ($query) use ($barangayId) {
                $query->whereHas('child', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                });
            })
            ->latest('measurement_date')
            ->limit(30)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'child_name' => $m->child?->full_name ?? 'Unknown',
                'child_id' => $m->child_id,
                'barangay' => $m->child?->barangay?->name ?? 'Unknown',
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'weight_kg' => $m->weight_kg,
                'height_cm' => $m->height_length_cm,
                'opt_classification' => $m->opt_classification,
                'measured_by' => $m->measuredBy?->name ?? 'Unknown',
                'days_since_measurement' => $m->measurement_date ? now()->diffInDays($m->measurement_date) : null,
            ]);

        return Inertia::render('dqc/index', [
            'user' => $user,
            'dqcSummary' => $dqcSummary,
            'flaggedMeasurements' => $flaggedMeasurements->map(fn ($m) => [
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
                'dqc_status' => $m->dqc_status,
            ]),
            'overagedChildren' => $overagedChildren->map(fn ($m) => [
                'id' => $m->id,
                'child_name' => $m->child->full_name,
                'barangay' => $m->child->barangay->name,
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'weight_kg' => $m->weight_kg,
                'height_cm' => $m->height_length_cm,
                'dqc_status' => $m->dqc_status,
            ]),
            'stuntedChildren' => $stuntedChildren->map(fn ($m) => [
                'id' => $m->id,
                'child_name' => $m->child->full_name,
                'barangay' => $m->child->barangay->name,
                'measurement_date' => $m->measurement_date->format('M d, Y'),
                'age_months' => $m->age_in_months,
                'height_cm' => $m->height_length_cm,
                'hfa_zscore' => $m->height_for_age_zscore,
                'hfa_status' => $m->height_for_age_status,
                'dqc_status' => $m->dqc_status,
            ]),
            'pendingCertifications' => $pendingCertifications,
            'barangayId' => $barangayId,
        ]);
    }

    /**
     * Certify a measurement as eye-checked verified.
     */
    public function certify(Request $request, Measurement $measurement): RedirectResponse
    {
        $this->authorize('view analytics');

        if ($measurement->dqc_status !== 'pending') {
            return back()->with('error', 'This measurement has already been processed (certified or rejected).');
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $measurement->certify($request->user()->id, $validated['notes'] ?? null);

        AuditLogService::logAction('dqc_certified', $measurement, user: $request->user());

        return back()->with('success', 'Measurement certified successfully.');
    }

    /**
     * Reject a measurement during DQC review.
     */
    public function reject(Request $request, Measurement $measurement): RedirectResponse
    {
        $this->authorize('view analytics');

        if ($measurement->dqc_status !== 'pending') {
            return back()->with('error', 'This measurement has already been processed (certified or rejected).');
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $measurement->reject($request->user()->id, $validated['notes'] ?? 'Rejected during DQC review');

        AuditLogService::logAction('dqc_rejected', $measurement, user: $request->user());

        return back()->with('success', 'Measurement rejected.');
    }

    /**
     * Export DQC summary report (Excel).
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
