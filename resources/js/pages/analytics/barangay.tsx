import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { StatCard, NutritionalStatusCard, HighRiskChildrenList } from '@/components/dashboard-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Activity, 
    TrendingUp,
    ArrowLeft,
    Users,
    AlertTriangle
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Barangay {
    id: string;
    name: string;
    municipality: string;
    psgc_code: string;
}

interface NutritionalStatus {
    normal: number;
    mam: number;
    sam: number;
    overweight: number;
    total: number;
}

interface MonthlyTrend {
    month: string;
    label: string;
    measurements: number;
    normal: number;
    mam: number;
    sam: number;
}

interface BarangayAnalyticsProps {
    barangay: Barangay;
    nutritionalStatus: NutritionalStatus;
    highRiskChildren: any[];
    monthlyTrends: MonthlyTrend[];
    totalChildren: number;
    measuredChildren: number;
}

export default function BarangayAnalytics({
    barangay,
    nutritionalStatus,
    highRiskChildren,
    monthlyTrends,
    totalChildren,
    measuredChildren,
}: BarangayAnalyticsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Analytics',
            href: '#',
        },
        {
            title: barangay.name,
            href: `/analytics/barangay/${barangay.id}`,
        },
    ];

    const coverageRate = totalChildren > 0 
        ? ((measuredChildren / totalChildren) * 100).toFixed(1)
        : '0.0';

    const malnutritionRate = nutritionalStatus.total > 0
        ? (((nutritionalStatus.mam + nutritionalStatus.sam) / nutritionalStatus.total) * 100).toFixed(1)
        : '0.0';

    // Monthly trends line chart
    const trendChartData = {
        labels: monthlyTrends.map(t => t.label),
        datasets: [
            {
                label: 'Total Measurements',
                data: monthlyTrends.map(t => t.measurements),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    // Nutritional status bar chart
    const statusChartData = {
        labels: monthlyTrends.map(t => t.label),
        datasets: [
            {
                label: 'Normal',
                data: monthlyTrends.map(t => t.normal),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
            {
                label: 'MAM',
                data: monthlyTrends.map(t => t.mam),
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
            },
            {
                label: 'SAM',
                data: monthlyTrends.map(t => t.sam),
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
            },
        ],
    };

    const statusChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${barangay.name} Analytics`} />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mt-2">
                            {barangay.name} Analytics
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {barangay.municipality} • PSGC: {barangay.psgc_code}
                        </p>
                    </div>
                    <Link href={`/children?barangay=${barangay.id}`}>
                        <Button>
                            <Users className="h-4 w-4 mr-2" />
                            View All Children
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Children"
                        value={totalChildren.toLocaleString()}
                        description="Registered in this barangay"
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard
                        title="Coverage Rate"
                        value={`${coverageRate}%`}
                        description={`${measuredChildren} of ${totalChildren} measured`}
                        icon={<Activity className="h-4 w-4" />}
                        className={
                            parseFloat(coverageRate) < 50 
                                ? 'border-red-500' 
                                : parseFloat(coverageRate) < 80 
                                ? 'border-orange-500' 
                                : 'border-green-500'
                        }
                    />
                    <StatCard
                        title="Malnutrition Rate"
                        value={`${malnutritionRate}%`}
                        description={`${nutritionalStatus.mam + nutritionalStatus.sam} children affected`}
                        icon={<AlertTriangle className="h-4 w-4" />}
                        className={
                            parseFloat(malnutritionRate) > 20 
                                ? 'border-red-500' 
                                : parseFloat(malnutritionRate) > 10 
                                ? 'border-orange-500' 
                                : 'border-green-500'
                        }
                    />
                    <StatCard
                        title="High-Risk Children"
                        value={highRiskChildren.length}
                        description="Requiring immediate attention"
                        icon={<AlertTriangle className="h-4 w-4" />}
                        className={highRiskChildren.length > 0 ? 'border-red-500' : ''}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Nutritional Status */}
                    <NutritionalStatusCard
                        normal={nutritionalStatus.normal}
                        mam={nutritionalStatus.mam}
                        sam={nutritionalStatus.sam}
                        overweight={nutritionalStatus.overweight}
                        total={nutritionalStatus.total}
                    />

                    {/* Monthly Trends Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Measurement Activity
                            </CardTitle>
                            <CardDescription>Last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line data={trendChartData} options={trendChartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Nutritional Status Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Nutritional Status Trends</CardTitle>
                        <CardDescription>
                            Distribution of nutritional status over the last 6 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <Bar data={statusChartData} options={statusChartOptions} />
                        </div>
                    </CardContent>
                </Card>

                {/* High-Risk Children */}
                <HighRiskChildrenList children={highRiskChildren} />

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Link href={`/reports/barangay/${barangay.id}`}>
                        <Button variant="outline">
                            Generate Report
                        </Button>
                    </Link>
                    <Link href={`/children/create?barangay=${barangay.id}`}>
                        <Button>
                            Add Child
                        </Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
