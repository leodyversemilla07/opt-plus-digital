import {
    HighRiskChildrenList,
    NutritionalStatusCard,
    StatCard,
} from '@/components/dashboard-cards';
import F1KProgressCard from '@/components/dashboard-cards/f1k-progress-card';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Plus,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
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
    municipality_city: string;
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
            municipality_city: string;
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
    ageGroupBreakdown: Record<string, number>;
    sexDisaggregated: {
        total: number;
        male: number;
        female: number;
        male_mam: number;
        male_sam: number;
        male_stunted: number;
        female_mam: number;
        female_sam: number;
        female_stunted: number;
    };
    f1kStatistics: {
        total_children_0to23: number;
        measured_children_0to23: number;
        f1k_coverage: number;
        male_f1k: number;
        female_f1k: number;
        malnourished_f1k: number;
        stunted_f1k: number;
    };
}

export default function Dashboard({
    overallStats,
    nutritionalStatus,
    highRiskChildren,
    monthlyTrends,
    barangayComparison,
    ageGroupBreakdown,
    sexDisaggregated,
    f1kStatistics,
}: DashboardProps) {
    const { auth } = usePage<SharedData>().props;

    // Chart data for monthly trends
    const trendChartData = monthlyTrends.map((t) => ({
        month: t.label,
        measurements: t.measurements,
    }));

    const chartConfig = {
        measurements: {
            label: 'Measurements',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                {/* Welcome Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground underline decoration-primary/30 underline-offset-8">
                            Mabuhay, {auth.user.name}!
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            Nutrition monitoring overview for{' '}
                            <span className="font-bold text-primary">
                                Barangay{' '}
                                {(
                                    auth.user as SharedData['auth']['user'] & {
                                        barangay?: { name?: string };
                                    }
                                ).barangay?.name || 'Assigned Area'}
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="rounded-full px-6 shadow-lg shadow-primary/20"
                            asChild
                        >
                            <Link href="/children/create">
                                <Plus className="mr-2 h-4 w-4" /> Add Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Children"
                        value={overallStats.total_children.toLocaleString()}
                        description="Target population"
                        icon={<Users className="h-5 w-5 text-primary" />}
                    />
                    <StatCard
                        title="F1K (0-23 mos)"
                        value={f1kStatistics.total_children_0to23.toLocaleString()}
                        description="First 1000 Days"
                        icon={<Users className="h-5 w-5 text-primary" />}
                    />
                    <StatCard
                        title="Coverage Rate"
                        value={`${overallStats.coverage_rate}%`}
                        description="Registered children measured"
                        icon={
                            <BarChart3 className="h-5 w-5 text-secondary-foreground" />
                        }
                    />
                    <StatCard
                        title="Measured (Month)"
                        value={overallStats.children_measured_this_month.toLocaleString()}
                        description="Progress this month"
                        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                    />
                    <StatCard
                        title="High Risk"
                        value={nutritionalStatus.mam + nutritionalStatus.sam}
                        description="Children needing attention"
                        icon={<Activity className="h-5 w-5 text-destructive" />}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* F1K Progress Card */}
                    <div className="lg:col-span-2">
                        <F1KProgressCard
                            totalChildren0to23={
                                f1kStatistics.total_children_0to23
                            }
                            measuredChildren0to23={
                                f1kStatistics.measured_children_0to23
                            }
                            f1kCoverage={f1kStatistics.f1k_coverage}
                            maleF1K={f1kStatistics.male_f1k}
                            femaleF1K={f1kStatistics.female_f1k}
                            malnourishedF1K={f1kStatistics.malnourished_f1k}
                            stuntedF1K={f1kStatistics.stunted_f1k}
                        />
                    </div>

                    {/* Nutritional Status */}
                    <div className="lg:col-span-1">
                        <NutritionalStatusCard
                            normal={nutritionalStatus.normal}
                            mam={nutritionalStatus.mam}
                            sam={nutritionalStatus.sam}
                            overweight={nutritionalStatus.overweight}
                            total={nutritionalStatus.total}
                        />
                    </div>

                    {/* Monthly Trends Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Measurement Trends
                                </CardTitle>
                                <CardDescription>
                                    Activity logs for the last 6 months
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig}
                                className="h-60 w-full text-foreground"
                            >
                                <AreaChart data={trendChartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
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
                                    <ChartTooltip
                                        content={<ChartTooltipContent />}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="measurements"
                                        stroke="var(--primary)"
                                        fill="var(--primary)"
                                        fillOpacity={0.1}
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Age Group Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Age Distribution
                        </CardTitle>
                        <CardDescription>
                            Children by age group (months)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {Object.entries(ageGroupBreakdown).map(
                                ([group, count]) => (
                                    <div
                                        key={group}
                                        className="flex flex-col items-center rounded-lg border bg-background p-3"
                                    >
                                        <p className="text-lg font-bold text-foreground">
                                            {count}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {group}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sex-Disaggregated Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Users className="h-5 w-5 text-primary" />
                            Sex-Disaggregated Statistics
                        </CardTitle>
                        <CardDescription>
                            Nutritional status breakdown by sex
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Male Stats */}
                            <div className="rounded-lg border bg-background p-3">
                                <p className="mb-3 text-sm font-medium text-foreground">
                                    Male Children ({sexDisaggregated.male})
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            MAM
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.male_mam}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            SAM
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.male_sam}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Stunted
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.male_stunted}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Female Stats */}
                            <div className="rounded-lg border bg-background p-3">
                                <p className="mb-3 text-sm font-medium text-foreground">
                                    Female Children ({sexDisaggregated.female})
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            MAM
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.female_mam}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            SAM
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.female_sam}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Stunted
                                        </p>
                                        <p className="text-lg font-bold text-foreground">
                                            {sexDisaggregated.female_stunted}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* High-Risk Children */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <HighRiskChildrenList children={highRiskChildren} />
                    </div>

                    {/* Barangay Rankings (Only for Admin/Municipal) */}
                    {barangayComparison && barangayComparison.length > 0 && (
                        <Card className="lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-foreground">
                                        Area Performance
                                    </CardTitle>
                                    <CardDescription>
                                        Top malnutrition rates
                                    </CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/reports/barangay-comparison">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 text-foreground">
                                <div className="overflow-x-auto text-xs">
                                    <table className="w-full">
                                        <tbody className="divide-y">
                                            {barangayComparison
                                                .slice(0, 5)
                                                .map((b) => (
                                                    <tr
                                                        key={b.barangay_id}
                                                        className="transition-colors hover:bg-muted/50"
                                                    >
                                                        <td className="px-4 py-3 font-bold">
                                                            {b.barangay_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span
                                                                className={
                                                                    b.malnutrition_rate >
                                                                    10
                                                                        ? 'font-bold text-destructive'
                                                                        : 'font-medium text-primary'
                                                                }
                                                            >
                                                                {
                                                                    b.malnutrition_rate
                                                                }
                                                                %
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            {b.malnutrition_rate >
                                                            10 ? (
                                                                <TrendingUp className="h-3 w-3 text-destructive" />
                                                            ) : (
                                                                <TrendingDown className="h-3 w-3 text-primary" />
                                                            )}
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
            </div>
        </AppLayout>
    );
}
