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
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Baby,
    Calendar,
    ClipboardList,
    Download,
    FileDown,
    FileSpreadsheet,
    FileText,
    Heart,
    MapPin,
    Ruler,
    Scale,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/reports',
    },
];

export default function ReportsIndex() {
    const reports = [
        {
            title: 'OPT Plus Summary',
            description: 'Complete overview of nutritional status and coverage',
            icon: FileText,
            href: '/reports/opt-summary',
            exportPDF: '/reports/export/opt-summary/pdf',
            exportExcel: '/reports/export/opt-summary/excel',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: 'Master List',
            description:
                'Complete list of all registered children with measurements',
            icon: Users,
            href: '/reports/master-list',
            exportPDF: '/reports/export/master-list/pdf',
            exportExcel: '/reports/export/master-list/excel',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: 'Target List',
            description: 'High-risk children requiring immediate intervention',
            icon: AlertTriangle,
            href: '/reports/target-list',
            exportPDF: '/reports/export/target-list/pdf',
            exportExcel: '/reports/export/target-list/excel',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: 'First 1000 Days (F1K)',
            description:
                'Priority list for children 0-23 months requiring early intervention',
            icon: Baby,
            href: '/reports/f1k-list',
            color: 'text-pink-600 dark:text-pink-400',
            bgColor: 'bg-pink-100 dark:bg-pink-900/20',
        },
        {
            title: 'Barangay Comparison',
            description: 'Compare nutritional status across all barangays',
            icon: MapPin,
            href: '/reports/barangay-comparison',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            title: 'Form 1C - At-Risk Children',
            description:
                'Comprehensive list of affected and at-risk children by category',
            icon: ClipboardList,
            href: '/reports/form-1c',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: 'NutStatusBrgy',
            description: 'Sex-disaggregated nutritional status summary',
            icon: Users,
            href: '/reports/nut-status-brgy',
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        },
        {
            title: 'MUAC Monitoring',
            description:
                'Mid-Upper Arm Circumference list for children 6-59 months',
            icon: Ruler,
            href: '/reports/muac-list',
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-100 dark:bg-teal-900/20',
        },
    ];

    const monitoringLists = [
        {
            title: 'SAM (Severe Acute Malnutrition)',
            description:
                'Children with severe wasting requiring therapeutic feeding',
            icon: AlertTriangle,
            href: '/reports/monitoring/sam',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: 'MAM (Moderate Acute Malnutrition)',
            description:
                'Children with moderate wasting requiring supplementary feeding',
            icon: TrendingDown,
            href: '/reports/monitoring/mam',
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
        {
            title: 'Stunted Children',
            description:
                'Children with chronic malnutrition (low height-for-age)',
            icon: Scale,
            href: '/reports/monitoring/stunted',
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            title: 'Overweight/Obese Children',
            description: 'Children with elevated weight-for-height',
            icon: TrendingUp,
            href: '/reports/monitoring/overweight',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
    ];

    const handleExport = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Reports
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Generate and view various reports for nutrition
                        monitoring
                    </p>
                </div>

                {/* Report Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {reports.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Card
                                key={report.href}
                                className="h-full transition-colors hover:border-primary"
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
                                                {report.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                        <div
                                            className={`rounded-2xl p-3 ${report.bgColor} border border-black/5 shadow-sm`}
                                        >
                                            <Icon
                                                className={`h-6 w-6 ${report.color}`}
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={report.href}>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                        >
                                            View Report
                                        </Button>
                                    </Link>
                                    {report.exportPDF && report.exportExcel && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    handleExport(
                                                        report.exportPDF!,
                                                    )
                                                }
                                            >
                                                <FileDown className="mr-2 h-4 w-4" />
                                                PDF
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                    handleExport(
                                                        report.exportExcel!,
                                                    )
                                                }
                                            >
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                Excel
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Monitoring Lists Section */}
                <div>
                    <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                        <Heart className="h-5 w-5 text-red-500" />
                        Monitoring Lists
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {monitoringLists.map((list) => {
                            const Icon = list.icon;
                            return (
                                <Card
                                    key={list.href}
                                    className="transition-colors hover:border-primary"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`rounded-lg p-2 ${list.bgColor}`}
                                            >
                                                <Icon
                                                    className={`h-5 w-5 ${list.color}`}
                                                />
                                            </div>
                                            <CardTitle className="text-base">
                                                {list.title}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-3 text-xs">
                                            {list.description}
                                        </CardDescription>
                                        <Link href={list.href}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                View List
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common reporting tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Monthly Report (Current Month)
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export All Data
                        </Button>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Custom Report
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Report Generation Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <p>
                            • Reports are generated in real-time based on
                            current data
                        </p>
                        <p>
                            • Use filters to generate barangay-specific reports
                        </p>
                        <p>
                            • Export to PDF for printing or Excel for further
                            analysis
                        </p>
                        <p>
                            • Target list shows children requiring immediate
                            intervention
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
