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
import { ArrowLeft, FileDown, FileSpreadsheet, Users } from 'lucide-react';

interface SexStats {
    male: number;
    female: number;
    total: number;
}

interface NutStatusReport {
    report_title: string;
    generated_at: string;
    barangay: string;
    total_children: number;
    male_count: number;
    female_count: number;
    wfa: Record<string, SexStats>;
    hfa: Record<string, SexStats>;
    wfh: Record<string, SexStats>;
    age_groups: Record<string, SexStats>;
}

interface Props {
    report: NutStatusReport;
    barangayId: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'NutStatusBrgy', href: '/reports/nut-status-brgy' },
];

export default function NutStatusBrgy({ report, barangayId }: Props) {
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/nut-status-brgy/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    const formatLabel = (key: string): string => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    };

    const calculatePercentage = (value: number, total: number): string => {
        if (total === 0) return '0.0';
        return ((value / total) * 100).toFixed(1);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="NutStatusBrgy - Sex-Disaggregated Report" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
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
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <Users className="h-8 w-8 text-primary" />
                            Sex-Disaggregated Nutritional Status
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {report.barangay} • Generated: {report.generated_at}
                        </p>
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

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">
                                Total Children
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {report.total_children}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-700">
                                Male
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-700">
                                {report.male_count}
                            </p>
                            <p className="text-sm text-blue-600">
                                {calculatePercentage(
                                    report.male_count,
                                    report.total_children,
                                )}
                                %
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-pink-200 bg-pink-50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-pink-700">
                                Female
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-pink-700">
                                {report.female_count}
                            </p>
                            <p className="text-sm text-pink-600">
                                {calculatePercentage(
                                    report.female_count,
                                    report.total_children,
                                )}
                                %
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Age Group Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Age Group Distribution</CardTitle>
                        <CardDescription>
                            Children by age group and sex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Age Group</TableHead>
                                    <TableHead className="text-center text-blue-600">
                                        Male
                                    </TableHead>
                                    <TableHead className="text-center text-pink-600">
                                        Female
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(report.age_groups).map(
                                    ([group, stats]) => (
                                        <TableRow key={group}>
                                            <TableCell className="font-medium">
                                                {group}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.male}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.female}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {stats.total}
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Weight-for-Age (WFA) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weight-for-Age (WFA)</CardTitle>
                        <CardDescription>
                            Underweight classification by sex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Classification</TableHead>
                                    <TableHead className="text-center text-blue-600">
                                        Male
                                    </TableHead>
                                    <TableHead className="text-center text-pink-600">
                                        Female
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-center">
                                        % of Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(report.wfa).map(
                                    ([status, stats]) => (
                                        <TableRow key={status}>
                                            <TableCell className="font-medium">
                                                {formatLabel(status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.male}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.female}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {stats.total}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {calculatePercentage(
                                                    stats.total,
                                                    report.total_children,
                                                )}
                                                %
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Height-for-Age (HFA) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Height-for-Age (HFA)</CardTitle>
                        <CardDescription>
                            Stunting classification by sex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Classification</TableHead>
                                    <TableHead className="text-center text-blue-600">
                                        Male
                                    </TableHead>
                                    <TableHead className="text-center text-pink-600">
                                        Female
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-center">
                                        % of Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(report.hfa).map(
                                    ([status, stats]) => (
                                        <TableRow key={status}>
                                            <TableCell className="font-medium">
                                                {formatLabel(status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.male}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.female}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {stats.total}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {calculatePercentage(
                                                    stats.total,
                                                    report.total_children,
                                                )}
                                                %
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Weight-for-Height (WFH) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weight-for-Height (WFH)</CardTitle>
                        <CardDescription>
                            Wasting and overweight classification by sex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Classification</TableHead>
                                    <TableHead className="text-center text-blue-600">
                                        Male
                                    </TableHead>
                                    <TableHead className="text-center text-pink-600">
                                        Female
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-center">
                                        % of Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(report.wfh).map(
                                    ([status, stats]) => (
                                        <TableRow key={status}>
                                            <TableCell className="font-medium">
                                                {formatLabel(status)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.male}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {stats.female}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {stats.total}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {calculatePercentage(
                                                    stats.total,
                                                    report.total_children,
                                                )}
                                                %
                                            </TableCell>
                                        </TableRow>
                                    ),
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
