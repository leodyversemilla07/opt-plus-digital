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
import { useTranslation } from 'react-i18next';
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

export default function ReportsIndex() {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('reports.title'),
            href: '/reports',
        },
    ];
    const reports = [
        {
            title: t('reports.opt_summary'),
            description: t('reports.opt_summary_desc'),
            icon: FileText,
            href: '/reports/opt-summary',
            exportPDF: '/reports/export/opt-summary/pdf',
            exportExcel: '/reports/export/opt-summary/excel',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20',
        },
        {
            title: t('reports.master_list'),
            description: t('reports.master_list_desc'),
            icon: Users,
            href: '/reports/master-list',
            exportPDF: '/reports/export/master-list/pdf',
            exportExcel: '/reports/export/master-list/excel',
            color: 'text-green-600 dark:text-green-400',
            bgColor: 'bg-green-100 dark:bg-green-900/20',
        },
        {
            title: t('reports.target_list'),
            description: t('reports.target_list_desc'),
            icon: AlertTriangle,
            href: '/reports/target-list',
            exportPDF: '/reports/export/target-list/pdf',
            exportExcel: '/reports/export/target-list/excel',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: t('reports.f1k_list'),
            description: t('reports.f1k_list_desc'),
            icon: Baby,
            href: '/reports/f1k-list',
            color: 'text-pink-600 dark:text-pink-400',
            bgColor: 'bg-pink-100 dark:bg-pink-900/20',
        },
        {
            title: t('reports.barangay_comparison'),
            description: t('reports.barangay_comparison_desc'),
            icon: MapPin,
            href: '/reports/barangay-comparison',
            color: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20',
        },
        {
            title: t('reports.form_1c'),
            description: t('reports.form_1c_desc'),
            icon: ClipboardList,
            href: '/reports/form-1c',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: t('reports.nut_status_brgy'),
            description: t('reports.nut_status_brgy_desc'),
            icon: Users,
            href: '/reports/nut-status-brgy',
            color: 'text-indigo-600 dark:text-indigo-400',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
        },
        {
            title: t('reports.muac_list'),
            description: t('reports.muac_list_desc'),
            icon: Ruler,
            href: '/reports/muac-list',
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-100 dark:bg-teal-900/20',
        },
    ];

    const monitoringLists = [
        {
            title: t('reports.monitor_sam'),
            description: t('reports.monitor_sam'),
            icon: AlertTriangle,
            href: '/reports/monitoring/sam',
            color: 'text-red-600 dark:text-red-400',
            bgColor: 'bg-red-100 dark:bg-red-900/20',
        },
        {
            title: t('reports.monitor_mam'),
            description: t('reports.monitor_mam'),
            icon: TrendingDown,
            href: '/reports/monitoring/mam',
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        },
        {
            title: t('reports.monitor_stunted'),
            description: t('reports.monitor_stunted'),
            icon: Scale,
            href: '/reports/monitoring/stunted',
            color: 'text-yellow-600 dark:text-yellow-400',
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
        },
        {
            title: t('reports.monitor_overweight'),
            description: t('reports.monitor_overweight'),
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
            <Head title={t('reports.title')} />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('reports.title')}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        {t('reports.reports_description')}
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
                                            {t('reports.view_report')}
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
                                                {t('reports.pdf')}
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
                                                {t('reports.excel')}
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
                        {t('reports.monitoring_lists')}
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
                                                {t('reports.view_list')}
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
                        <CardTitle>{t('reports.quick_actions')}</CardTitle>
                        <CardDescription>
                            {t('reports.quick_actions_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            {t('reports.monthly_report')}
                        </Button>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            {t('reports.export_all')}
                        </Button>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            {t('reports.custom_report')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            {t('reports.tips_title')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <p>{t('reports.tips_realtime')}</p>
                        <p>{t('reports.tips_filters')}</p>
                        <p>{t('reports.tips_export')}</p>
                        <p>{t('reports.tips_target')}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
