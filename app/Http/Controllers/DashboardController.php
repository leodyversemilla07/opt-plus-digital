<?php

namespace App\Http\Controllers;

use App\Models\Barangay;
use App\Models\Child;
use App\Models\OptSession;
use App\Services\AnalyticsService;
use App\Services\DataQualityControlService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private AnalyticsService $analyticsService,
        private DataQualityControlService $dqcService
    ) {}

    /**
     * Display the dashboard based on user role
     */
    public function index(Request $request): Response
    {
        $this->authorize('view analytics');
        $user = $request->user();
        $barangayId = $user->barangay_id;

        // Get overall statistics
        $overallStats = $this->analyticsService->getOverallStatistics();

        // Get nutritional status breakdown
        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics($barangayId);

        // Get high-risk children
        $highRiskChildren = $this->analyticsService->getHighRiskChildren($barangayId, limit: 5);

        // Get monthly trends
        $monthlyTrends = $this->analyticsService->getMonthlyTrends($barangayId);

        // Get age group breakdown
        $ageGroupBreakdown = $this->analyticsService->getAgeGroupBreakdown($barangayId);

        // Get sex-disaggregated statistics
        $sexDisaggregated = $this->analyticsService->getSexDisaggregatedStats($barangayId);

        // Get F1K statistics (0-23 months)
        $f1kStatistics = $this->analyticsService->getF1KStatistics($barangayId);

        // Get barangay comparison (for municipal/admin users)
        $barangayComparison = [];
        if ($user->hasRole(['municipal', 'admin'])) {
            $barangayComparison = $this->analyticsService->getBarangayComparison();
        }

        // DQC: Pending certifications count
        $pendingCertifications = $this->dqcService->countPendingCertifications($barangayId);

        // Recent system activity
        $recentActivity = $this->analyticsService->getRecentActivity(8);

        // Recent OPT sessions
        $recentSessions = OptSession::with('barangay')
            ->when($barangayId, fn ($q) => $q->where('barangay_id', $barangayId))
            ->latest()
            ->take(3)
            ->get()
            ->toArray();

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
            'pendingCertifications' => $pendingCertifications,
            'recentActivity' => $recentActivity,
            'recentSessions' => $recentSessions,
        ]);
    }

    /**
     * Get barangay-specific analytics
     */
    public function barangay(Request $request, string $barangayId): Response
    {
        $this->authorize('view barangay analytics');
        $barangay = Barangay::findOrFail($barangayId);

        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics($barangayId);
        $highRiskChildren = $this->analyticsService->getHighRiskChildren($barangayId, 10);
        $monthlyTrends = $this->analyticsService->getMonthlyTrends($barangayId);

        $totalChildren = Child::where('barangay_id', $barangayId)->count();
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
