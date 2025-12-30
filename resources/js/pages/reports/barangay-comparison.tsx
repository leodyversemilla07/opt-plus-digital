import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    FileDown,
    MapPin,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

interface BarangayComparisonProps {
    report: {
        report_title: string;
        generated_at: string;
        total_barangays: number;
        barangays: Array<{
            id: string;
            name: string;
            total_children: number;
            measured_children: number;
            coverage_rate: number;
            malnutrition_rate: number;
            sam_count: number;
            mam_count: number;
            normal_count: number;
            overweight_count: number;
        }>;
        summary: {
            highest_malnutrition: any;
            lowest_malnutrition: any;
            average_coverage: number;
            average_malnutrition_rate: number;
        };
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Barangay Comparison', href: '/reports/barangay-comparison' },
];

export default function BarangayComparison({
    report,
}: BarangayComparisonProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Barangay Comparison" />
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
                            Barangay Comparison
                        </h1>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                                Comparing {report.total_barangays} Barangays
                            </span>
                            <span>•</span>
                            <span>Generated: {report.generated_at}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-2 h-4 w-4" /> PDF Report
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Avg. Coverage Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {report.summary.average_coverage.toFixed(1)}%
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Municipality average
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Highest Malnutrition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {report.summary.highest_malnutrition?.name ||
                                    'N/A'}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {report.summary.highest_malnutrition?.malnutrition_rate.toFixed(
                                    1,
                                ) || 0}
                                % rate
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Lowest Malnutrition
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {report.summary.lowest_malnutrition?.name ||
                                    'N/A'}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {report.summary.lowest_malnutrition?.malnutrition_rate.toFixed(
                                    1,
                                ) || 0}
                                % rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Barangay Rankings</CardTitle>
                        <CardDescription>
                            Barangays ranked by malnutrition rate (Highest to
                            Lowest)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead className="text-right">
                                        Total Children
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Coverage %
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Malnutrition %
                                    </TableHead>
                                    <TableHead className="text-right">
                                        SAM
                                    </TableHead>
                                    <TableHead className="text-right">
                                        MAM
                                    </TableHead>
                                    <TableHead>Trend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {report.barangays.map((barangay) => (
                                    <TableRow key={barangay.id}>
                                        <TableCell className="font-medium">
                                            {barangay.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {barangay.total_children}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={
                                                    barangay.coverage_rate < 90
                                                        ? 'font-medium text-red-600'
                                                        : ''
                                                }
                                            >
                                                {barangay.coverage_rate.toFixed(
                                                    1,
                                                )}
                                                %
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={
                                                    barangay.malnutrition_rate >
                                                    10
                                                        ? 'font-bold text-red-600'
                                                        : ''
                                                }
                                            >
                                                {barangay.malnutrition_rate.toFixed(
                                                    1,
                                                )}
                                                %
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {barangay.sam_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {barangay.mam_count}
                                        </TableCell>
                                        <TableCell>
                                            {barangay.malnutrition_rate >
                                            report.summary
                                                .average_malnutrition_rate ? (
                                                <TrendingUp className="h-4 w-4 text-red-500" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-green-500" />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
