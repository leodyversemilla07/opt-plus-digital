import {
    HighRiskChildrenList,
    StatCard,
} from '@/components/dashboard-cards';
import F1KProgressCard from '@/components/dashboard-cards/f1k-progress-card';
import { Badge } from '@/components/ui/badge';
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
import { useTranslation } from 'react-i18next';
import {
    Activity,
    ArrowRight,
    Baby,
    BarChart3,
    ClipboardCheck,
    FileText,
    FlaskConical,
    Mail,
    Plus,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

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
    overweight: number;
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
    pendingCertifications: number;
    recentActivity: {
        type: string;
        description: string;
        entity: string;
        barangay: string | null;
        date: string;
        url: string | null;
    }[];
    recentSessions: {
        id: number;
        name: string;
        status: string;
        barangay: { name: string } | null;
        measurement_date: string;
    }[];
    coverageHistory: {
        month: string;
        label: string;
        coverage_rate: number;
        measured: number;
        total: number;
    }[];
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
    pendingCertifications,
    recentActivity,
    recentSessions,
    coverageHistory,
}: DashboardProps) {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    // Trend chart data with SAM/MAM/Normal lines
    const trendChartData = monthlyTrends;
    const chartConfig = {
        measurements: { label: 'Total', color: 'hsl(var(--chart-1))' },
        normal: { label: 'Normal', color: '#22c55e' },
        mam: { label: 'MAM', color: '#f59e0b' },
        sam: { label: 'SAM', color: '#ef4444' },
        overweight: { label: 'Overweight', color: '#8b5cf6' },
    };

    // Coverage donut data
    const coverageData = [
        { name: 'Measured', value: overallStats.children_measured_this_month, color: 'hsl(var(--chart-1))' },
        { name: 'Unmeasured', value: Math.max(0, overallStats.total_children - overallStats.children_measured_this_month), color: '#e5e7eb' },
    ];

    // Nutritional composition for horizontal bar
    const compositionData = [
        { name: 'Normal', value: nutritionalStatus.normal, color: '#22c55e' },
        { name: 'MAM', value: nutritionalStatus.mam, color: '#f59e0b' },
        { name: 'SAM', value: nutritionalStatus.sam, color: '#ef4444' },
        { name: 'Overweight', value: nutritionalStatus.overweight, color: '#8b5cf6' },
    ];
    const compositionTotal = nutritionalStatus.total || 1;

    // Color by status
    const statusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'completed': return 'bg-blue-500';
            case 'cancelled': return 'bg-gray-400';
            default: return 'bg-yellow-500';
        }
    };

    // Rank emoji
    const rankIcon = (i: number) => {
        if (i === 0) return <span className="text-lg">🥇</span>;
        if (i === 1) return <span className="text-lg">🥈</span>;
        if (i === 2) return <span className="text-lg">🥉</span>;
        return <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                {/* Welcome Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground underline decoration-primary/30 underline-offset-8">
                            Mabuhay, {auth.user.name}!
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            {t('dashboard.subtitle')}{' '}
                            <span className="font-bold text-primary">
                                {t('dashboard.barangay', {
                                    name: (
                                        auth.user as SharedData['auth']['user'] & {
                                            barangay?: { name?: string };
                                        }
                                    ).barangay?.name || t('dashboard.assigned_area'),
                                })}
                            </span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="rounded-full px-6 shadow-lg shadow-primary/20"
                            render={<Link href="/children/create" />}
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t('dashboard.add_child')}
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <StatCard
                        title={t('dashboard.total_children')}
                        value={overallStats.total_children.toLocaleString()}
                        description={t('dashboard.target_population')}
                        icon={<Users className="h-5 w-5 text-primary" />}
                    />
                    <StatCard
                        title="F1K (0-23 mos)"
                        value={f1kStatistics.total_children_0to23.toLocaleString()}
                        description={t('dashboard.first_1000_days')}
                        icon={<Baby className="h-5 w-5 text-primary" />}
                    />
                    <StatCard
                        title={t('dashboard.coverage_rate')}
                        value={`${overallStats.coverage_rate}%`}
                        description={t('dashboard.registered_measured')}
                        icon={<BarChart3 className="h-5 w-5 text-secondary-foreground" />}
                    />
                    <StatCard
                        title={t('dashboard.measured_this_month')}
                        value={overallStats.children_measured_this_month.toLocaleString()}
                        description={t('dashboard.monthly_progress')}
                        icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                    />
                    <StatCard
                        title={t('dashboard.high_risk')}
                        value={nutritionalStatus.mam + nutritionalStatus.sam}
                        description={t('dashboard.children_needing_attention')}
                        icon={<Activity className="h-5 w-5 text-destructive" />}
                    />
                    <StatCard
                        title="DQC Pending"
                        value={pendingCertifications}
                        description="Eye-check certifications"
                        icon={<ClipboardCheck className="h-5 w-5 text-amber-600" />}
                    />
                </div>

                {/* Nutritional Composition Stacked Bar — NEW */}
                {compositionTotal > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base text-foreground">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                Nutritional Status Composition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-8 w-full overflow-hidden rounded-lg">
                                {compositionData.filter(d => d.value > 0).map((d) => (
                                    <div
                                        key={d.name}
                                        style={{ width: `${(d.value / compositionTotal) * 100}%` }}
                                        className="flex items-center justify-center text-xs font-bold text-white first:rounded-l-lg last:rounded-r-lg transition-all hover:opacity-80"
                                    >
                                        <div style={{ background: d.color }} className="flex h-full w-full items-center justify-center">
                                            {d.value} {d.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {compositionData.map((d) => (
                                    <div key={d.name} className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                                        {d.name}: {((d.value / compositionTotal) * 100).toFixed(1)}%
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/children/create"
                        className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                    >
                        <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-900/20">
                            <Plus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Register Child</p>
                            <p className="text-xs text-muted-foreground">Add new child record</p>
                        </div>
                    </Link>
                    <Link
                        href="/opt-sessions/create"
                        className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                    >
                        <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-900/20">
                            <FlaskConical className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Start OPT Session</p>
                            <p className="text-xs text-muted-foreground">Begin new measurement round</p>
                        </div>
                    </Link>
                    <Link
                        href="/reports"
                        className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                    >
                        <div className="rounded-lg bg-purple-100 p-2.5 dark:bg-purple-900/20">
                            <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Generate Report</p>
                            <p className="text-xs text-muted-foreground">View nutrition reports</p>
                        </div>
                    </Link>
                    <Link
                        href="/mass-mail/create"
                        className="flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:border-primary hover:bg-accent"
                    >
                        <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-900/20">
                            <Mail className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Send Mass Mail</p>
                            <p className="text-xs text-muted-foreground">Notify parents & workers</p>
                        </div>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* F1K Progress Card */}
                    <div className="lg:col-span-2">
                        <F1KProgressCard
                            totalChildren0to23={f1kStatistics.total_children_0to23}
                            measuredChildren0to23={f1kStatistics.measured_children_0to23}
                            f1kCoverage={f1kStatistics.f1k_coverage}
                            maleF1K={f1kStatistics.male_f1k}
                            femaleF1K={f1kStatistics.female_f1k}
                            malnourishedF1K={f1kStatistics.malnourished_f1k}
                            stuntedF1K={f1kStatistics.stunted_f1k}
                        />
                    </div>

                    {/* Coverage Donut — NEW */}
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Coverage
                                </CardTitle>
                                <CardDescription>
                                    {overallStats.children_measured_this_month.toLocaleString()} of {overallStats.total_children.toLocaleString()} children
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={coverageData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={2}
                                                dataKey="value"
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {coverageData.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">{overallStats.coverage_rate}%</p>
                                    <p className="text-xs text-muted-foreground">This month</p>
                                </div>

                                {/* Coverage mini trend */}
                                {coverageHistory && coverageHistory.length > 0 && (
                                    <div className="mt-3">
                                        <p className="mb-1 text-xs text-muted-foreground">Trend</p>
                                        <ResponsiveContainer width="100%" height={40}>
                                            <AreaChart data={coverageHistory}>
                                                <Area
                                                    type="monotone"
                                                    dataKey="coverage_rate"
                                                    stroke="hsl(var(--chart-1))"
                                                    fill="hsl(var(--chart-1))"
                                                    fillOpacity={0.15}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Trends Chart — UPGRADED: multi-line */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-foreground">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    {t('dashboard.measurement_trends')}
                                </CardTitle>
                                <CardDescription>
                                    {t('dashboard.activity_logs')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-64 w-full text-foreground">
                                <AreaChart data={trendChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Area
                                        type="monotone"
                                        dataKey="sam"
                                        stackId="1"
                                        stroke="#ef4444"
                                        fill="#ef4444"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                        name="SAM"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="mam"
                                        stackId="1"
                                        stroke="#f59e0b"
                                        fill="#f59e0b"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                        name="MAM"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="normal"
                                        stackId="1"
                                        stroke="#22c55e"
                                        fill="#22c55e"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                        name="Normal"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="overweight"
                                        stackId="1"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.6}
                                        strokeWidth={2}
                                        name="Overweight"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent OPT Sessions — NEW */}
                {recentSessions && recentSessions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <FlaskConical className="h-5 w-5 text-primary" />
                                Recent OPT Sessions
                            </CardTitle>
                            <CardDescription>Latest measurement rounds</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {recentSessions.map((session) => (
                                    <div key={session.id} className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50">
                                        <div className={`h-2.5 w-2.5 rounded-full ${statusColor(session.status)}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground">
                                                {session.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.barangay?.name ?? 'All Barangays'}
                                                {' · '}
                                                {new Date(session.measurement_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">
                                            {session.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm" render={
                                            <Link href={`/opt-sessions/${session.id}`} />
                                        }>
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Age Group Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            {t('dashboard.age_distribution')}
                        </CardTitle>
                        <CardDescription>
                            {t('dashboard.children_by_age_group')}
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
                            {t('dashboard.sex_disaggregated')}
                        </CardTitle>
                        <CardDescription>
                            {t('dashboard.nutritional_status_breakdown')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="rounded-lg border bg-background p-3">
                                <p className="mb-3 text-sm font-medium text-foreground">
                                    {t('dashboard.male_children', { count: sexDisaggregated.male })}
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">MAM</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.male_mam}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">SAM</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.male_sam}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Stunted</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.male_stunted}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border bg-background p-3">
                                <p className="mb-3 text-sm font-medium text-foreground">
                                    {t('dashboard.female_children', { count: sexDisaggregated.female })}
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">MAM</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.female_mam}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">SAM</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.female_sam}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Stunted</p>
                                        <p className="text-lg font-bold text-foreground">{sexDisaggregated.female_stunted}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* High-Risk + Barangay Rankings */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <HighRiskChildrenList children={highRiskChildren} />
                    </div>

                    {barangayComparison && barangayComparison.length > 0 && (
                        <Card className="lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg text-foreground">
                                        {t('dashboard.area_performance')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('dashboard.top_malnutrition_rates')}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    render={<Link href="/reports/barangay-comparison" />}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 text-foreground">
                                <div className="space-y-1 px-4 pb-4">
                                    {barangayComparison
                                        .slice(0, 5)
                                        .map((b, i) => (
                                            <div key={b.barangay_id} className="flex items-center gap-2 py-1.5">
                                                <div className="w-6 text-center">{rankIcon(i)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">
                                                        {b.barangay_name}
                                                    </p>
                                                    <div className="mt-0.5 h-1.5 w-full rounded-full bg-muted">
                                                        <div
                                                            className="h-1.5 rounded-full bg-destructive transition-all"
                                                            style={{ width: `${Math.min(b.malnutrition_rate, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span
                                                    className={`shrink-0 text-sm font-bold ${
                                                        b.malnutrition_rate > 10
                                                            ? 'text-destructive'
                                                            : 'text-primary'
                                                    }`}
                                                >
                                                    {b.malnutrition_rate}%
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Activity className="h-5 w-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest measurements and system events
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentActivity.length === 0 ? (
                            <div className="p-6 text-center text-sm text-muted-foreground">
                                No recent activity recorded
                            </div>
                        ) : (
                            <div className="divide-y">
                                {recentActivity.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                            {activity.type === 'measurement' ? (
                                                <FlaskConical className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <Mail className="h-4 w-4 text-rose-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {activity.url ? (
                                                    <Link href={activity.url} className="hover:underline">
                                                        {activity.description}
                                                    </Link>
                                                ) : (
                                                    activity.description
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                <span className="capitalize">
                                                    {activity.type.replace('_', ' ')}
                                                </span>
                                                {activity.barangay && (
                                                    <> · {activity.barangay}</>
                                                )}
                                                {activity.entity && (
                                                    <> · {activity.entity}</>
                                                )}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {activity.date
                                                ? new Date(activity.date).toLocaleDateString()
                                                : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
