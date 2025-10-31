import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { StatCard, NutritionalStatusCard, HighRiskChildrenList } from '@/components/dashboard-cards';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Users, 
    Activity, 
    MapPin, 
    TrendingUp,
    Percent
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface OverallStats {
    total_children: number;
    total_measurements: number;
    total_barangays: number;
    children_measured_this_month: number;
    measurements_this_month: number;
    coverage_rate: number;
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

interface BarangayData {
    barangay_id: string;
    barangay_name: string;
    municipality: string;
    total_children: number;
    measured_children: number;
    coverage_rate: number;
    normal: number;
    mam: number;
    sam: number;
    overweight: number;
    malnutrition_rate: number;
}

interface HighRiskChild {
    child: {
        id: string;
        full_name: string;
        sex: 'male' | 'female';
        age_in_months: number;
        barangay: {
            name: string;
            municipality: string;
        };
    };
    measurement: {
        opt_classification: string;
        wfa_zscore: number | null;
        hfa_zscore: number | null;
        wfh_zscore: number | null;
        measurement_date: string;
    };
    days_since_measurement: number;
}

interface DashboardProps {
    overallStats: OverallStats;
    nutritionalStatus: NutritionalStatus;
    highRiskChildren: HighRiskChild[];
    monthlyTrends: MonthlyTrend[];
    barangayComparison: BarangayData[];
}

export default function Dashboard({
    overallStats,
    nutritionalStatus,
    highRiskChildren,
    monthlyTrends,
    barangayComparison,
}: DashboardProps) {
    // Chart data for monthly trends
    const trendChartData = monthlyTrends.map(t => ({
        month: t.label,
        measurements: t.measurements,
    }));

    const chartConfig = {
        measurements: {
            label: "Measurements",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of child nutrition monitoring system
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Children"
                        value={overallStats.total_children.toLocaleString()}
                        description="Registered in the system"
                        icon={<Users className="h-4 w-4" />}
                    />
                    <StatCard
                        title="Coverage Rate"
                        value={`${overallStats.coverage_rate}%`}
                        description="Children with measurements"
                        icon={<Percent className="h-4 w-4" />}
                    />
                    <StatCard
                        title="Measurements This Month"
                        value={overallStats.measurements_this_month.toLocaleString()}
                        description={`${overallStats.children_measured_this_month} children measured`}
                        icon={<Activity className="h-4 w-4" />}
                    />
                    <StatCard
                        title="Active Barangays"
                        value={overallStats.total_barangays}
                        description="With registered children"
                        icon={<MapPin className="h-4 w-4" />}
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
                                Measurement Trends
                            </CardTitle>
                            <CardDescription>Last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <AreaChart data={trendChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="month" 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="measurements"
                                        stroke="hsl(var(--chart-1))"
                                        fill="hsl(var(--chart-1))"
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* High-Risk Children */}
                <HighRiskChildrenList children={highRiskChildren} />

                {/* Barangay Comparison Table (for municipal/admin users) */}
                {barangayComparison.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Barangay Comparison</CardTitle>
                            <CardDescription>
                                Malnutrition rates across barangays (sorted by highest rate)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Barangay</th>
                                            <th className="text-left p-2">Municipality</th>
                                            <th className="text-right p-2">Total Children</th>
                                            <th className="text-right p-2">Coverage</th>
                                            <th className="text-right p-2">Normal</th>
                                            <th className="text-right p-2">MAM</th>
                                            <th className="text-right p-2">SAM</th>
                                            <th className="text-right p-2">Malnutrition Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {barangayComparison.map((barangay) => (
                                            <tr key={barangay.barangay_id} className="border-b hover:bg-accent/50">
                                                <td className="p-2 font-medium">{barangay.barangay_name}</td>
                                                <td className="p-2 text-muted-foreground">{barangay.municipality}</td>
                                                <td className="p-2 text-right">{barangay.total_children}</td>
                                                <td className="p-2 text-right">{barangay.coverage_rate}%</td>
                                                <td className="p-2 text-right text-green-600 dark:text-green-400">
                                                    {barangay.normal}
                                                </td>
                                                <td className="p-2 text-right text-orange-600 dark:text-orange-400">
                                                    {barangay.mam}
                                                </td>
                                                <td className="p-2 text-right text-red-600 dark:text-red-400">
                                                    {barangay.sam}
                                                </td>
                                                <td className="p-2 text-right font-semibold">
                                                    <span className={
                                                        barangay.malnutrition_rate > 20 
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : barangay.malnutrition_rate > 10
                                                            ? 'text-orange-600 dark:text-orange-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }>
                                                        {barangay.malnutrition_rate}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
