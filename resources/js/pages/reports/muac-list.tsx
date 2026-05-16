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
import { ArrowLeft, FileDown, FileSpreadsheet, Ruler } from 'lucide-react';

interface MUACChild {
    id: string;
    fsn: string | null;
    name: string;
    sex: string;
    date_of_birth: string;
    age_months: number;
    barangay: string;
    measurement_date: string | null;
    muac_cm: number | null;
    muac_status: string | null;
    weight_kg: number | null;
    height_cm: number | null;
    opt_classification: string | null;
    days_since_measurement: number | null;
}

interface Props {
    children: MUACChild[];
    barangayId: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'MUAC List', href: '/reports/muac-list' },
];

const getMUACStatusColor = (status: string | null): string => {
    switch (status) {
        case 'SAM':
            return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
        case 'MAM':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800';
        case 'At Risk':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
        case 'Normal':
            return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
};

export default function MUACList({ children, barangayId }: Props) {
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/muac-list/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    // Calculate statistics
    const stats = {
        total: children.length,
        sam: children.filter((c) => c.muac_status === 'SAM').length,
        mam: children.filter((c) => c.muac_status === 'MAM').length,
        atRisk: children.filter((c) => c.muac_status === 'At Risk').length,
        normal: children.filter((c) => c.muac_status === 'Normal').length,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="MUAC Monitoring List" />
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
                            <Ruler className="h-8 w-8 text-primary" />
                            MUAC Monitoring List
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Mid-Upper Arm Circumference measurements for
                            children 6-59 months
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
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                                SAM (&lt;11.5cm)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                                {stats.sam}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                MAM (11.5-12.4cm)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {stats.mam}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                At Risk (12.5-13.4cm)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                                {stats.atRisk}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                                Normal (≥13.5cm)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {stats.normal}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Card */}
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CardContent className="py-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>MUAC Classification (6-59 months):</strong>{' '}
                            SAM: &lt;11.5cm | MAM: 11.5-12.4cm | At Risk:
                            12.5-13.4cm | Normal: ≥13.5cm
                        </p>
                    </CardContent>
                </Card>

                {/* Children Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Children with MUAC Measurements</CardTitle>
                        <CardDescription>
                            {children.length} children with MUAC data
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
                                    <TableHead className="text-center">
                                        MUAC (cm)
                                    </TableHead>
                                    <TableHead className="text-center">
                                        MUAC Status
                                    </TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Height</TableHead>
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
                                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                                            : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
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
                                            <TableCell className="text-center font-mono font-bold">
                                                {child.muac_cm?.toFixed(1) ??
                                                    '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {child.muac_status && (
                                                    <Badge
                                                        className={getMUACStatusColor(
                                                            child.muac_status,
                                                        )}
                                                    >
                                                        {child.muac_status}
                                                    </Badge>
                                                )}
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
                                                {child.measurement_date ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    render={<Link
                                                        href={`/children/${child.id}`}
                                                    />}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="py-8 text-center text-muted-foreground"
                                        >
                                            No children with MUAC measurements
                                            found
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
