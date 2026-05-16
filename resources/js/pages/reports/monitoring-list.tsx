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
    FileDown,
    FileSpreadsheet,
    Scale,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';

interface MonitoringChild {
    id: string;
    fsn: string | null;
    name: string;
    sex: string;
    date_of_birth: string;
    age_months: number;
    barangay: string;
    measurement_date: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    wfa_zscore: number | null;
    hfa_zscore: number | null;
    wfh_zscore: number | null;
    wfa_status: string | null;
    hfa_status: string | null;
    wfh_status: string | null;
    opt_classification: string | null;
    muac_cm: number | null;
    days_since_measurement: number | null;
    guardian_name: string | null;
    contact: string | null;
}

interface Props {
    type: 'sam' | 'mam' | 'stunted' | 'overweight' | 'obese';
    children: MonitoringChild[];
    barangayId: string | null;
}

const typeConfig: Record<
    string,
    { title: string; description: string; icon: React.ReactNode }
> = {
    sam: {
        title: 'SAM (Severe Acute Malnutrition)',
        description:
            'Children with severe wasting requiring immediate therapeutic feeding',
        icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
    },
    mam: {
        title: 'MAM (Moderate Acute Malnutrition)',
        description:
            'Children with moderate wasting requiring supplementary feeding',
        icon: <TrendingDown className="h-8 w-8 text-orange-600" />,
    },
    stunted: {
        title: 'Stunted Children',
        description: 'Children with chronic malnutrition (low height-for-age)',
        icon: <Scale className="h-8 w-8 text-yellow-600" />,
    },
    overweight: {
        title: 'Overweight Children',
        description: 'Children with elevated weight-for-height',
        icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
    },
    obese: {
        title: 'Obese Children',
        description: 'Children with severely elevated weight-for-height',
        icon: <TrendingUp className="h-8 w-8 text-red-600" />,
    },
};

export default function MonitoringList({ type, children, barangayId }: Props) {
    const config = typeConfig[type];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '/reports' },
        { title: config.title, href: `/reports/monitoring/${type}` },
    ];

    const handleExport = (exportType: 'pdf' | 'excel') => {
        let url = `/reports/export/monitoring/${type}/${exportType}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={config.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            {config.icon}
                            {config.title}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {config.description}
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

                {/* Summary Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">
                            Monitoring Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Children
                                </p>
                                <p className="text-2xl font-bold">
                                    {children.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Male
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        children.filter((c) => c.sex === 'Male')
                                            .length
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Female
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        children.filter(
                                            (c) => c.sex === 'Female',
                                        ).length
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Need Follow-up
                                </p>
                                <p className="text-2xl font-bold">
                                    {
                                        children.filter(
                                            (c) =>
                                                c.days_since_measurement ===
                                                    null ||
                                                c.days_since_measurement > 30,
                                        ).length
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Children Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Children List</CardTitle>
                        <CardDescription>
                            Showing {children.length} children with{' '}
                            {type.toUpperCase()} status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Child Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Age (Mos)</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Height</TableHead>
                                    <TableHead>Z-Scores</TableHead>
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
                                        <TableRow key={child.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/children/${child.id}`}
                                                    className="hover:underline"
                                                >
                                                    {child.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        child.sex === 'Male'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-pink-50 text-pink-700'
                                                    }
                                                >
                                                    {child.sex}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {child.age_months}
                                            </TableCell>
                                            <TableCell>
                                                {child.barangay}
                                            </TableCell>
                                            <TableCell>
                                                {child.weight_kg
                                                    ? `${child.weight_kg} kg`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {child.height_cm
                                                    ? `${child.height_cm} cm`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-xs">
                                                    {child.wfa_zscore !==
                                                        null && (
                                                        <div>
                                                            WFA:{' '}
                                                            <span className="font-mono">
                                                                {child.wfa_zscore.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {child.hfa_zscore !==
                                                        null && (
                                                        <div>
                                                            HFA:{' '}
                                                            <span className="font-mono">
                                                                {child.hfa_zscore.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {child.wfh_zscore !==
                                                        null && (
                                                        <div>
                                                            WFH:{' '}
                                                            <span className="font-mono">
                                                                {child.wfh_zscore.toFixed(
                                                                    2,
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {child.opt_classification && (
                                                    <NutritionalStatusBadge
                                                        status={
                                                            child.opt_classification
                                                        }
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {child.measurement_date ? (
                                                    <span
                                                        className={
                                                            child.days_since_measurement &&
                                                            child.days_since_measurement >
                                                                30
                                                                ? 'text-yellow-600'
                                                                : ''
                                                        }
                                                    >
                                                        {child.measurement_date}
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
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        render={<Link
                                                            href={`/children/${child.id}`}
                                                        />}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        render={<Link
                                                            href={`/children/${child.id}/measurements/create`}
                                                        />}
                                                    >
                                                        Measure
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No children found with{' '}
                                            {type.toUpperCase()} status
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
