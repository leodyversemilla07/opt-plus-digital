<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Display the dashboard based on user role
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        // Get overall statistics
        $overallStats = $this->analyticsService->getOverallStatistics();
        
        // Get nutritional status breakdown
        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics();
        
        // Get high-risk children
        $highRiskChildren = $this->analyticsService->getHighRiskChildren(limit: 5);
        
        // Get monthly trends
        $monthlyTrends = $this->analyticsService->getMonthlyTrends();
        
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
            'barangayComparison' => $barangayComparison,
        ]);
    }

    /**
     * Get barangay-specific analytics
     */
    public function barangay(Request $request, string $barangayId): Response
    {
        $nutritionalStatus = $this->analyticsService->getLatestMeasurementsStatistics($barangayId);
        $highRiskChildren = $this->analyticsService->getHighRiskChildren($barangayId, 10);
        $monthlyTrends = $this->analyticsService->getMonthlyTrends($barangayId);

        return Inertia::render('analytics/barangay', [
            'barangayId' => $barangayId,
            'nutritionalStatus' => $nutritionalStatus,
            'highRiskChildren' => $highRiskChildren,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }
}
