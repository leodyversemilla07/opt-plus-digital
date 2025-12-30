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
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    FileDown,
    FileSpreadsheet,
    Phone,
} from 'lucide-react';

interface TargetListProps {
    children: Array<{
        priority: string;
        fsn: string;
        name: string;
        sex: string;
        age_months: number;
        barangay: string;
        classification: string;
        wfa_zscore: number | null;
        hfa_zscore: number | null;
        wfh_zscore: number | null;
        weight_kg: number | null;
        height_cm: number | null;
        measurement_date: string;
        days_since_measurement: number;
        mother_name: string | null;
        father_name: string | null;
        contact_info: string;
    }>;
    barangayId?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Target List', href: '/reports/target-list' },
];

export default function TargetList({ children, barangayId }: TargetListProps) {
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/target-list/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Target List" />
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
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                            Target List
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            High-risk children requiring immediate intervention
                            and follow-up
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

                <Card className="border-red-200 dark:border-red-900/50">
                    <CardHeader className="bg-red-50 pb-3 dark:bg-red-950/20">
                        <CardTitle className="text-red-900 dark:text-red-100">
                            Children Requiring Attention
                        </CardTitle>
                        <CardDescription className="text-red-700 dark:text-red-300">
                            Showing {children.length} high-risk children
                            identified from latest measurements
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
                                    <TableHead>Age (Mos)</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead>Parent/Guardian</TableHead>
                                    <TableHead>Last Measured</TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {children.length > 0 ? (
                                    children.map((child, index) => (
                                        <TableRow key={`${child.fsn}-${index}`}>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        child.priority ===
                                                        'URGENT'
                                                            ? 'destructive'
                                                            : 'default'
                                                    }
                                                    className={
                                                        child.priority !==
                                                        'URGENT'
                                                            ? 'bg-orange-500'
                                                            : ''
                                                    }
                                                >
                                                    {child.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">
                                                        {child.name}
                                                    </span>
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {child.fsn}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {child.age_months}
                                            </TableCell>
                                            <TableCell>
                                                {child.barangay}
                                            </TableCell>
                                            <TableCell>
                                                <NutritionalStatusBadge
                                                    status={
                                                        child.classification
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {child.mother_name ||
                                                        child.father_name ||
                                                        'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span>
                                                        {child.measurement_date}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {
                                                            child.days_since_measurement
                                                        }{' '}
                                                        days ago
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No high-risk children identified in
                                            this selection.
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
