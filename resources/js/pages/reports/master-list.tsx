import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { useTranslation } from 'react-i18next';
import { FileDown, FileSpreadsheet, Filter, Search } from 'lucide-react';

interface MasterListProps {
    children: Array<{
        fsn: string;
        name: string;
        sex: string;
        date_of_birth: string;
        age_months: number;
        barangay: string;
        municipality: string;
        latest_measurement_date: string | null;
        weight_kg: number | null;
        height_cm: number | null;
        wfa_zscore: number | null;
        hfa_zscore: number | null;
        wfh_zscore: number | null;
        nutritional_status: string | null;
        is_indigenous: string;
        ip_group: string | null;
    }>;
    barangayId?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Master List', href: '/reports/master-list' },
];

export default function MasterList({ children, barangayId }: MasterListProps) {
    const { t } = useTranslation();
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/master-list/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    const getStatusBadge = (status: string | null) => {
        return <NutritionalStatusBadge status={status} />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.master_list')} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('reports.master_list')}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            {t('reports.master_list_subtitle')}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('pdf')}
                        >
                            <FileDown className="mr-2 h-4 w-4" /> {t('reports.pdf')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExport('excel')}
                        >
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> {t('reports.excel')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <CardTitle>{t('reports.children_records')}</CardTitle>
                                <CardDescription>
                                    {t('reports.showing_records', { count: children.length })}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('reports.search_records')}
                                        className="pl-8"
                                    />
                                </div>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>FSN</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Age (Mos)</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Weight (kg)
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Height (cm)
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {children.length > 0 ? (
                                    children.map((child, index) => (
                                        <TableRow key={`${child.fsn}-${index}`}>
                                            <TableCell className="font-mono text-xs">
                                                {child.fsn}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {child.name}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {child.sex}
                                            </TableCell>
                                            <TableCell>
                                                {child.age_months}
                                            </TableCell>
                                            <TableCell>
                                                {child.barangay}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    child.nutritional_status,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {child.weight_kg ?? '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {child.height_cm ?? '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="py-10 text-center text-muted-foreground"
                                        >
                                            No records found.
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
