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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface ChildRecord {
    id: string;
    fsn: string | null;
    name: string;
    sex: string;
    age_months: number;
    barangay: string;
    weight_kg: number | null;
    height_cm: number | null;
    wfa_zscore: number | null;
    hfa_zscore: number | null;
    wfh_zscore: number | null;
    measurement_date: string | null;
    mother_name: string | null;
    contact: string | null;
}

interface Form1CReport {
    report_title: string;
    generated_at: string;
    barangay: string;
    summary: {
        sam_count: number;
        mam_count: number;
        stunted_count: number;
        overweight_obese_count: number;
    };
    categories: {
        sam: ChildRecord[];
        mam: ChildRecord[];
        stunted: ChildRecord[];
        overweight_obese: ChildRecord[];
    };
}

interface Props {
    report: Form1CReport;
    barangayId: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Form 1C', href: '/reports/form-1c' },
];

function ChildTable({ children }: { children: ChildRecord[] }) {
    if (children.length === 0) {
        return (
            <div className="py-8 text-center text-muted-foreground">
                No children in this category
            </div>
        );
    }

    return (
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
                    <TableHead>Guardian</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {children.map((child) => (
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
                        <TableCell>{child.age_months}</TableCell>
                        <TableCell>{child.barangay}</TableCell>
                        <TableCell>
                            {child.weight_kg ? `${child.weight_kg} kg` : '-'}
                        </TableCell>
                        <TableCell>
                            {child.height_cm ? `${child.height_cm} cm` : '-'}
                        </TableCell>
                        <TableCell>
                            <div className="space-y-1 text-xs">
                                {child.wfa_zscore !== null && (
                                    <div>
                                        WFA:{' '}
                                        <span className="font-mono">
                                            {child.wfa_zscore.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {child.hfa_zscore !== null && (
                                    <div>
                                        HFA:{' '}
                                        <span className="font-mono">
                                            {child.hfa_zscore.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {child.wfh_zscore !== null && (
                                    <div>
                                        WFH:{' '}
                                        <span className="font-mono">
                                            {child.wfh_zscore.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                                {child.mother_name || '-'}
                            </div>
                            {child.contact && (
                                <div className="text-xs text-muted-foreground">
                                    {child.contact}
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/children/${child.id}`}>
                                        View
                                    </Link>
                                </Button>
                                <Button variant="default" size="sm" asChild>
                                    <Link
                                        href={`/children/${child.id}/measurements/create`}
                                    >
                                        Measure
                                    </Link>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function Form1C({ report, barangayId }: Props) {
    const handleExport = (type: 'pdf' | 'excel') => {
        let url = `/reports/export/form-1c/${type}`;
        if (barangayId) url += `?barangay=${barangayId}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form 1C - Affected/At-Risk Children" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                            OPT Plus Form 1C
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            List of Affected/At-Risk Children • {report.barangay}{' '}
                            • {report.generated_at}
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
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <CardTitle className="text-lg text-red-700">
                                    SAM
                                </CardTitle>
                            </div>
                            <CardDescription className="text-red-600">
                                Severe Acute Malnutrition
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-700">
                                {report.summary.sam_count}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-orange-200 bg-orange-50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-orange-600" />
                                <CardTitle className="text-lg text-orange-700">
                                    MAM
                                </CardTitle>
                            </div>
                            <CardDescription className="text-orange-600">
                                Moderate Acute Malnutrition
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-orange-700">
                                {report.summary.mam_count}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Scale className="h-5 w-5 text-yellow-600" />
                                <CardTitle className="text-lg text-yellow-700">
                                    Stunted
                                </CardTitle>
                            </div>
                            <CardDescription className="text-yellow-600">
                                Low Height-for-Age
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-yellow-700">
                                {report.summary.stunted_count}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-purple-200 bg-purple-50">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                                <CardTitle className="text-lg text-purple-700">
                                    Overweight/Obese
                                </CardTitle>
                            </div>
                            <CardDescription className="text-purple-600">
                                High Weight-for-Height
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-purple-700">
                                {report.summary.overweight_obese_count}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for each category */}
                <Card>
                    <CardHeader>
                        <CardTitle>Children by Category</CardTitle>
                        <CardDescription>
                            Select a category to view the list of affected
                            children
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="sam" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger
                                    value="sam"
                                    className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                                >
                                    SAM ({report.summary.sam_count})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mam"
                                    className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                                >
                                    MAM ({report.summary.mam_count})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="stunted"
                                    className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700"
                                >
                                    Stunted ({report.summary.stunted_count})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="overweight"
                                    className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
                                >
                                    Overweight (
                                    {report.summary.overweight_obese_count})
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="sam"
                                className="mt-4 overflow-x-auto"
                            >
                                <ChildTable children={report.categories.sam} />
                            </TabsContent>
                            <TabsContent
                                value="mam"
                                className="mt-4 overflow-x-auto"
                            >
                                <ChildTable children={report.categories.mam} />
                            </TabsContent>
                            <TabsContent
                                value="stunted"
                                className="mt-4 overflow-x-auto"
                            >
                                <ChildTable
                                    children={report.categories.stunted}
                                />
                            </TabsContent>
                            <TabsContent
                                value="overweight"
                                className="mt-4 overflow-x-auto"
                            >
                                <ChildTable
                                    children={report.categories.overweight_obese}
                                />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
