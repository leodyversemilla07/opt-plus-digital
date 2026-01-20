<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Display the dashboard based on user role
     */
    public function index(Request $request): Response
    {
        $this->authorize('view analytics');
        $user = $request->user();

        // Get overall statistics
        $overallStats = $this->analyticsService->getOverallStatistics();

        // Get nutritional status breakdown
        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics();

        // Get high-risk children
        $highRiskChildren = $this->analyticsService->getHighRiskChildren(limit: 5);

        // Get monthly trends
        $monthlyTrends = $this->analyticsService->getMonthlyTrends();

        // Get age group breakdown
        $ageGroupBreakdown = $this->analyticsService->getAgeGroupBreakdown();

        // Get sex-disaggregated statistics
        $sexDisaggregated = $this->analyticsService->getSexDisaggregatedStats();

        // Get F1K statistics (0-23 months)
        $f1kStatistics = $this->analyticsService->getF1KStatistics();

        // Get barangay comparison (for municipal/admin users)
        $barangayComparison = [];
        if (in_array($user->role ?? 'bhw', ['municipal', 'admin'])) {
            $barangayComparison = $this->analyticsService->getBarangayComparison();
        }

        return Inertia::render('dashboard', [
            'user' => $user,
            'overallStats' => $overallStats,
            'nutritionalStatus' => $nutritionalStatus,
            'highRiskChildren' => $highRiskChildren,
            'monthlyTrends' => $monthlyTrends,
            'ageGroupBreakdown' => $ageGroupBreakdown,
            'sexDisaggregated' => $sexDisaggregated,
            'f1kStatistics' => $f1kStatistics,
            'barangayComparison' => $barangayComparison,
        ]);
    }

    /**
     * Get barangay-specific analytics
     */
    public function barangay(Request $request, string $barangayId): Response
    {
        $this->authorize('view barangay analytics');
        $barangay = \App\Models\Barangay::findOrFail($barangayId);

        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics($barangayId);
        $highRiskChildren = $this->analyticsService->getHighRiskChildren($barangayId, 10);
        $monthlyTrends = $this->analyticsService->getMonthlyTrends($barangayId);

        $totalChildren = \App\Models\Child::where('barangay_id', $barangayId)->count();
        $measuredChildren = $nutritionalStatus['total'];

        return Inertia::render('analytics/barangay', [
            'barangay' => $barangay,
            'barangayId' => $barangayId,
            'nutritionalStatus' => $nutritionalStatus,
            'highRiskChildren' => $highRiskChildren,
            'monthlyTrends' => $monthlyTrends,
            'totalChildren' => $totalChildren,
            'measuredChildren' => $measuredChildren,
        ]);
    }
}
