import { NutritionalStatusCard, StatCard } from '@/components/dashboard-cards';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileDown,
    FileSpreadsheet,
    MapPin,
    Users,
} from 'lucide-react';

interface OPTSummaryProps {
    summary: {
        report_title: string;
        generated_at: string;
        barangay: string;
        period: string;
        total_children: number;
        by_age_group: Record<string, number>;
        by_sex: { male: number; female: number };
        nutritional_status: {
            weight_for_age: {
                normal: number;
                underweight: number;
                severely_underweight: number;
                overweight: number;
                total: number;
            };
            height_for_age: {
                normal: number;
                stunted: number;
                severely_stunted: number;
                tall: number;
                total: number;
            };
            weight_for_height: {
                normal: number;
                wasted: number;
                severely_wasted: number;
                overweight: number;
                obese: number;
                total: number;
            };
            overall: {
                normal: number;
                mam: number;
                sam: number;
                overweight: number;
                total: number;
            };
        };
        coverage_summary: {
            total_children: number;
            measured_children: number;
            unmeasured_children: number;
            coverage_rate: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'OPT Plus Summary', href: '/reports/opt-summary' },
];

export default function OPTSummary({ summary }: OPTSummaryProps) {
    const handleExport = (type: 'pdf' | 'excel') => {
        window.open(`/reports/export/opt-summary/${type}`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OPT Plus Summary" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {summary.report_title}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{' '}
                                {summary.barangay}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{' '}
                                {summary.period}
                            </span>
                            <span>Generated: {summary.generated_at}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('pdf')}
                        >
                            <FileDown className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('excel')}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Children"
                        value={summary.total_children}
                        icon={<Users className="h-4 w-4" />}
                        description="Target population"
                    />
                    <StatCard
                        title="Measured"
                        value={summary.coverage_summary.measured_children}
                        description={`${summary.coverage_summary.coverage_rate}% coverage rate`}
                    />
                    <StatCard
                        title="Unmeasured"
                        value={summary.coverage_summary.unmeasured_children}
                        description="Remaining to be measured"
                    />
                    <StatCard
                        title="Malnutrition Rate"
                        value={`${(((summary.nutritional_status.overall.mam + summary.nutritional_status.overall.sam) / summary.nutritional_status.overall.total) * 100 || 0).toFixed(1)}%`}
                        description="MAM + SAM combined"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <NutritionalStatusCard
                        normal={summary.nutritional_status.overall.normal}
                        mam={summary.nutritional_status.overall.mam}
                        sam={summary.nutritional_status.overall.sam}
                        overweight={
                            summary.nutritional_status.overall.overweight
                        }
                        total={summary.nutritional_status.overall.total}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>By Sex</CardTitle>
                            <CardDescription>
                                Distribution of children by sex
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Male
                                </span>
                                <span className="font-bold">
                                    {summary.by_sex.male}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Female
                                </span>
                                <span className="font-bold">
                                    {summary.by_sex.female}
                                </span>
                            </div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{
                                        width: `${(summary.by_sex.male / summary.total_children) * 100}%`,
                                    }}
                                />
                                <div
                                    className="h-full bg-pink-500"
                                    style={{
                                        width: `${(summary.by_sex.female / summary.total_children) * 100}%`,
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>By Age Group</CardTitle>
                            <CardDescription>
                                Age distribution in months
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {Object.entries(summary.by_age_group).map(
                                ([age, count]) => (
                                    <div
                                        key={age}
                                        className="flex items-center justify-between text-sm"
                                    >
                                        <span>{age}</span>
                                        <span className="font-medium">
                                            {count}
                                        </span>
                                    </div>
                                ),
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
