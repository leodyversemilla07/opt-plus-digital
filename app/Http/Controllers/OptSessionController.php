<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\OptSession;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OptSessionController extends Controller
{
    /**
     * Display a listing of OPT sessions.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $sessions = OptSession::query()
            ->with(['barangay', 'createdBy'])
            ->when($user->barangay_id, function ($query) use ($user) {
                $query->where('barangay_id', $user->barangay_id);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->year, function ($query, $year) {
                $query->whereYear('session_date', $year);
            })
            ->orderBy('session_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get available years for filtering
        $years = OptSession::query()
            ->orderBy('session_date')
            ->pluck('session_date')
            ->map(fn ($date) => (int) $date->format('Y'))
            ->unique()
            ->sort()
            ->reverse()
            ->values();

        return Inertia::render('opt-sessions/index', [
            'sessions' => $sessions,
            'years' => $years,
            'filters' => $request->only(['status', 'year']),
        ]);
    }

    /**
     * Show the form for creating a new OPT session.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        $barangays = $this->getAccessibleBarangays($user);

        return Inertia::render('opt-sessions/create', [
            'barangays' => $barangays,
        ]);
    }

    /**
     * Store a newly created OPT session.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'barangay_id' => ['required', 'exists:barangays,id'],
            'name' => ['required', 'string', 'max:255'],
            'session_date' => ['required', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'target_children' => ['nullable', 'integer', 'min:0'],
            'venue' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        // Verify user has access to this barangay
        if (!$this->canAccessBarangay($user, $validated['barangay_id'])) {
            abort(403, 'You do not have access to create sessions for this barangay.');
        }

        // Calculate target children if not provided
        if (empty($validated['target_children'])) {
            $sessionDate = \Carbon\Carbon::parse($validated['session_date']);
            $cutoffDate = $sessionDate->copy()->subMonths(60);

            $validated['target_children'] = Child::where('barangay_id', $validated['barangay_id'])
                ->where('date_of_birth', '>=', $cutoffDate->toDateString())
                ->count();
        }

        $session = OptSession::create([
            ...$validated,
            'status' => 'scheduled',
            'created_by_user_id' => $user->id,
        ]);

        return redirect()->route('opt-sessions.show', $session)
            ->with('success', 'OPT session created successfully.');
    }

    /**
     * Display the specified OPT session.
     */
    public function show(OptSession $optSession): Response
    {
        $optSession->load(['barangay', 'createdBy', 'measurements.child']);

        // Get statistics
        $stats = [
            'target_children' => $optSession->target_children,
            'measured_children' => $optSession->measurements->count(),
            'coverage' => $optSession->target_children > 0
                ? round(($optSession->measurements->count() / $optSession->target_children) * 100, 1)
                : 0,
            'sam_count' => $optSession->measurements->where('opt_classification', 'sam')->count(),
            'mam_count' => $optSession->measurements->where('opt_classification', 'mam')->count(),
            'normal_count' => $optSession->measurements->where('opt_classification', 'normal')->count(),
            'overweight_count' => $optSession->measurements->where('opt_classification', 'overweight')->count(),
            'obese_count' => $optSession->measurements->where('opt_classification', 'obese')->count(),
        ];

        // Get recent measurements
        $recentMeasurements = $optSession->measurements()
            ->with('child')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('opt-sessions/show', [
            'session' => $optSession,
            'stats' => $stats,
            'recentMeasurements' => $recentMeasurements,
        ]);
    }

    /**
     * Show the form for editing the specified OPT session.
     */
    public function edit(Request $request, OptSession $optSession): Response
    {
        $user = $request->user();
        $optSession->load('barangay');

        $barangays = $this->getAccessibleBarangays($user);

        return Inertia::render('opt-sessions/edit', [
            'session' => $optSession,
            'barangays' => $barangays,
        ]);
    }

    /**
     * Update the specified OPT session.
     */
    public function update(Request $request, OptSession $optSession)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'session_date' => ['required', 'date'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['required', Rule::in(['scheduled', 'in_progress', 'completed', 'cancelled'])],
            'target_children' => ['nullable', 'integer', 'min:0'],
            'venue' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ]);

        $optSession->update($validated);

        // Update statistics if completed
        if ($validated['status'] === 'completed') {
            $optSession->updateStatistics();
        }

        return redirect()->route('opt-sessions.show', $optSession)
            ->with('success', 'OPT session updated successfully.');
    }

    /**
     * Remove the specified OPT session.
     */
    public function destroy(OptSession $optSession)
    {
        // Only allow deletion if no measurements are linked
        if ($optSession->measurements()->count() > 0) {
            return back()->with('error', 'Cannot delete session with linked measurements. Cancel instead.');
        }

        $optSession->delete();

        return redirect()->route('opt-sessions.index')
            ->with('success', 'OPT session deleted successfully.');
    }

    /**
     * Start an OPT session (change status to in_progress).
     */
    public function start(OptSession $optSession)
    {
        if ($optSession->status !== 'scheduled') {
            return back()->with('error', 'Only scheduled sessions can be started.');
        }

        $optSession->update([
            'status' => 'in_progress',
            'start_date' => now(),
        ]);

        return back()->with('success', 'OPT session started.');
    }

    /**
     * Complete an OPT session.
     */
    public function complete(OptSession $optSession)
    {
        if ($optSession->status !== 'in_progress') {
            return back()->with('error', 'Only in-progress sessions can be completed.');
        }

        $optSession->update([
            'status' => 'completed',
            'end_date' => now(),
        ]);

        $optSession->updateStatistics();

        return back()->with('success', 'OPT session completed.');
    }

    /**
     * Cancel an OPT session.
     */
    public function cancel(OptSession $optSession)
    {
        if ($optSession->status === 'completed') {
            return back()->with('error', 'Completed sessions cannot be cancelled.');
        }

        $optSession->update(['status' => 'cancelled']);

        return back()->with('success', 'OPT session cancelled.');
    }

    /**
     * Batch start multiple scheduled sessions.
     */
    public function batchStart(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'string', 'exists:opt_sessions,id'],
        ]);

        $user = $request->user();

        $sessions = OptSession::whereIn('id', $validated['ids'])
            ->where('status', 'scheduled')
            ->get();

        if ($sessions->isEmpty()) {
            return back()->with('error', 'No scheduled sessions found to start.');
        }

        $count = 0;
        foreach ($sessions as $session) {
            if ($this->canAccessBarangay($user, $session->barangay_id)) {
                $session->update([
                    'status' => 'in_progress',
                    'start_date' => now(),
                ]);
                AuditLogService::logAction('batch_started', $session, user: $user);
                $count++;
            }
        }

        $skipped = count($validated['ids']) - $count;

        $message = "{$count} session(s) started successfully.";
        if ($skipped > 0) {
            $message .= " {$skipped} session(s) skipped (not accessible or not in scheduled status).";
        }

        return back()->with('success', $message);
    }

    /**
     * Batch complete multiple in-progress sessions.
     */
    public function batchComplete(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'string', 'exists:opt_sessions,id'],
        ]);

        $user = $request->user();

        $sessions = OptSession::whereIn('id', $validated['ids'])
            ->where('status', 'in_progress')
            ->get();

        if ($sessions->isEmpty()) {
            return back()->with('error', 'No in-progress sessions found to complete.');
        }

        $count = 0;
        foreach ($sessions as $session) {
            if ($this->canAccessBarangay($user, $session->barangay_id)) {
                $session->update([
                    'status' => 'completed',
                    'end_date' => now(),
                ]);
                $session->updateStatistics();
                AuditLogService::logAction('batch_completed', $session, user: $user);
                $count++;
            }
        }

        $skipped = count($validated['ids']) - $count;

        $message = "{$count} session(s) completed successfully.";
        if ($skipped > 0) {
            $message .= " {$skipped} session(s) skipped.";
        }

        return back()->with('success', $message);
    }

    /**
     * Batch cancel multiple sessions.
     */
    public function batchCancel(Request $request)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'string', 'exists:opt_sessions,id'],
        ]);

        $user = $request->user();

        $sessions = OptSession::whereIn('id', $validated['ids'])
            ->where('status', '!=', 'completed')
            ->get();

        if ($sessions->isEmpty()) {
            return back()->with('error', 'No eligible sessions found to cancel (completed sessions cannot be cancelled).');
        }

        $count = 0;
        foreach ($sessions as $session) {
            if ($this->canAccessBarangay($user, $session->barangay_id)) {
                $session->update(['status' => 'cancelled']);
                AuditLogService::logAction('batch_cancelled', $session, user: $user);
                $count++;
            }
        }

        $skipped = count($validated['ids']) - $count;

        $message = "{$count} session(s) cancelled successfully.";
        if ($skipped > 0) {
            $message .= " {$skipped} session(s) skipped (already completed or not accessible).";
        }

        return back()->with('success', $message);
    }

    /**
     * Get barangays accessible to the user.
     */
    private function getAccessibleBarangays($user)
    {
        if ($user->hasRole(['admin', 'municipal'])) {
            return Barangay::orderBy('name')->get(['id', 'name']);
        }

        if ($user->barangay_id) {
            return Barangay::where('id', $user->barangay_id)->get(['id', 'name']);
        }

        return collect();
    }

    /**
     * Check if user can access a specific barangay.
     */
    private function canAccessBarangay($user, string $barangayId): bool
    {
        if ($user->hasRole(['admin', 'municipal'])) {
            return true;
        }

        return $user->barangay_id === $barangayId;
    }
}
