import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { NutritionalStatusBadge } from '@/components/ui/nutritional-status-badge';
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
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Baby,
    Calendar,
    FileDown,
    FileSpreadsheet,
    Users,
} from 'lucide-react';

interface F1KChild {
    id: string;
    fsn: string | null;
    name: string;
    sex: string;
    date_of_birth: string;
    age_months: number;
    age_group: string;
    barangay: string;
    latest_measurement_date: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    wfa_status: string | null;
    hfa_status: string | null;
    wfh_status: string | null;
    opt_classification: string | null;
    is_indigenous: boolean;
    priority: number;
    days_since_measurement: number | null;
    needs_measurement: boolean;
}

interface F1KStatistics {
    total: number;
    measured: number;
    coverage: number;
    male: number;
    female: number;
    malnourished: number;
    stunted: number;
}

interface Props {
    children: F1KChild[];
    statistics: F1KStatistics;
    barangayId: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'First 1000 Days', href: '/reports/f1k-list' },
];

const priorityColors: Record<number, string> = {
    1: 'bg-red-100 text-red-800 border-red-300',
    2: 'bg-orange-100 text-orange-800 border-orange-300',
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    4: 'bg-green-100 text-green-800 border-green-300',
};

const priorityLabels: Record<number, string> = {
    1: 'Critical',
    2: 'High',
    3: 'Medium',
    4: 'Normal',
};

export default function F1KList({ children, statistics, barangayId }: Props) {
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/f1k-list/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    const criticalCount = children.filter((c) => c.priority === 1).length;
    const highCount = children.filter((c) => c.priority === 2).length;
    const needsMeasurementCount = children.filter((c) => c.needs_measurement).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="First 1000 Days List" />
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
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <Baby className="h-8 w-8 text-primary" />
                            First 1000 Days (F1K)
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Children 0-23 months requiring priority monitoring
                            and intervention
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

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total F1K Children
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <span className="text-2xl font-bold">
                                    {statistics.total}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                Coverage Rate
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {statistics.coverage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {statistics.measured} measured
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-1 text-sm font-medium text-red-600">
                                <AlertTriangle className="h-4 w-4" />
                                Critical
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {criticalCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600">
                                High Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {highCount}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                                <Calendar className="h-4 w-4" />
                                Needs Weighing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {needsMeasurementCount}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                No recent measurement
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Children Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>F1K Children List</CardTitle>
                        <CardDescription>
                            Showing {children.length} children aged 0-23 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-24 text-center">
                                        Priority
                                    </TableHead>
                                    <TableHead>Child Name</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Age Group</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Measured</TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {children.length > 0 ? (
                                    children.map((child) => (
                                        <TableRow
                                            key={child.id}
                                            className={
                                                child.needs_measurement
                                                    ? 'bg-yellow-50'
                                                    : ''
                                            }
                                        >
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        priorityColors[
                                                            child.priority
                                                        ]
                                                    }
                                                >
                                                    {
                                                        priorityLabels[
                                                            child.priority
                                                        ]
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/children/${child.id}`}
                                                    className="hover:underline"
                                                >
                                                    {child.name}
                                                </Link>
                                                {child.is_indigenous && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-2 text-xs"
                                                    >
                                                        IP
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {child.age_months} mos
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {child.age_group}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {child.barangay}
                                            </TableCell>
                                            <TableCell>
                                                {child.opt_classification ? (
                                                    <NutritionalStatusBadge
                                                        status={
                                                            child.opt_classification
                                                        }
                                                    />
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {child.latest_measurement_date ? (
                                                    <span
                                                        className={
                                                            child.needs_measurement
                                                                ? 'text-yellow-600'
                                                                : ''
                                                        }
                                                    >
                                                        {
                                                            child.latest_measurement_date
                                                        }
                                                        {child.days_since_measurement !==
                                                            null && (
                                                            <span className="ml-1 text-xs text-muted-foreground">
                                                                (
                                                                {
                                                                    child.days_since_measurement
                                                                }
                                                                d)
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600">
                                                        Never measured
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/children/${child.id}/measurements/create`}
                                                    >
                                                        Measure
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No F1K children found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
