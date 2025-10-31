import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    Users, 
    AlertTriangle,
    MapPin,
    Download,
    Calendar,
    FileDown,
    FileSpreadsheet
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
            description: 'Complete list of all registered children with measurements',
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
            title: 'Barangay Comparison',
            description: 'Compare nutritional status across all barangays',
            icon: MapPin,
            href: '/reports/barangay-comparison',
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
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        Generate and view various reports for nutrition monitoring
                    </p>
                </div>

                {/* Report Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {reports.map((report) => {
                        const Icon = report.icon;
                        return (
                            <Card key={report.href} className="hover:border-primary transition-colors h-full">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {report.title}
                                            </CardTitle>
                                            <CardDescription className="mt-2">
                                                {report.description}
                                            </CardDescription>
                                        </div>
                                        <div className={`p-3 rounded-lg ${report.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${report.color}`} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Link href={report.href}>
                                        <Button variant="outline" className="w-full">
                                            View Report
                                        </Button>
                                    </Link>
                                    {report.exportPDF && report.exportExcel && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => handleExport(report.exportPDF!)}
                                            >
                                                <FileDown className="h-4 w-4 mr-2" />
                                                PDF
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => handleExport(report.exportExcel!)}
                                            >
                                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                                Excel
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common reporting tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Calendar className="h-4 w-4 mr-2" />
                            Monthly Report (Current Month)
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                        </Button>
                        <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Custom Report
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Report Generation Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p>• Reports are generated in real-time based on current data</p>
                        <p>• Use filters to generate barangay-specific reports</p>
                        <p>• Export to PDF for printing or Excel for further analysis</p>
                        <p>• Target list shows children requiring immediate intervention</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
