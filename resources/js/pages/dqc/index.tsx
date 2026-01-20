import DQCAlertCard from '@/components/dqc/dqc-alert-card';
import TerminalDigitChart from '@/components/dqc/terminal-digit-chart';
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
import {
    AlertCircle,
    ArrowRight,
    CheckCircle,
    RefreshCw,
    UserCheck,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Quality Control',
        href: '/dqc',
    },
];

interface DQCPageProps {
    user: any;
    dqcSummary: {
        total_measurements: number;
        flagged_records_count: number;
        overaged_records_count: number;
        stunted_records_count: number;
        duplicates: any[];
        terminal_digit_analysis: any;
        children_needing_attention: any[];
    };
    flaggedMeasurements: any[];
    overagedChildren: any[];
    stuntedChildren: any[];
    barangayId: string | null;
}

export default function DQCPage({
    user,
    dqcSummary,
    flaggedMeasurements,
    overagedChildren,
    stuntedChildren,
    barangayId,
}: DQCPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Quality Control" />
            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground underline decoration-primary/30 underline-offset-8">
                            Data Quality Control
                        </h1>
                        <p className="mt-3 text-muted-foreground">
                            Monitor data quality and identify potential issues
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* DQC Summary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-l-4 border-l-primary shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Measurements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-foreground">
                                {dqcSummary.total_measurements.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-l-4 shadow-md ${
                            dqcSummary.flagged_records_count > 0
                                ? 'border-l-destructive'
                                : 'border-l-green-600'
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Flagged Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-3xl font-bold ${
                                    dqcSummary.flagged_records_count > 0
                                        ? 'text-destructive'
                                        : 'text-green-600'
                                }`}
                            >
                                {dqcSummary.flagged_records_count.toLocaleString()}
                            </p>
                            {dqcSummary.flagged_records_count > 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Z-scores outside ±6 SD
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-l-4 shadow-md ${
                            dqcSummary.duplicates.length > 0
                                ? 'border-l-destructive'
                                : 'border-l-green-600'
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Duplicate Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-3xl font-bold ${
                                    dqcSummary.duplicates.length > 0
                                        ? 'text-destructive'
                                        : 'text-green-600'
                                }`}
                            >
                                {dqcSummary.duplicates.length.toLocaleString()}
                            </p>
                            {dqcSummary.duplicates.length > 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Review for potential duplicates
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-l-4 shadow-md ${
                            dqcSummary.stunted_records_count > 0
                                ? 'border-l-destructive'
                                : 'border-l-green-600'
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Stunted Children
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-3xl font-bold ${
                                    dqcSummary.stunted_records_count > 0
                                        ? 'text-destructive'
                                        : 'text-green-600'
                                }`}
                            >
                                {dqcSummary.stunted_records_count.toLocaleString()}
                            </p>
                            {dqcSummary.stunted_records_count > 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Height-for-age below -2 SD
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* DQC Alert Card */}
                <DQCAlertCard summary={dqcSummary} />

                {/* Terminal Digit Chart */}
                <TerminalDigitChart data={dqcSummary.terminal_digit_analysis} />

                {/* Children Needing Attention */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between text-foreground">
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-primary" />
                                Children Needing Attention
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                {dqcSummary.children_needing_attention
                                    ?.length || 0}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Children requiring immediate follow-up
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {dqcSummary.children_needing_attention &&
                        dqcSummary.children_needing_attention.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Child Name</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Barangay</TableHead>
                                        <TableHead>Days Since</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dqcSummary.children_needing_attention.map(
                                        (item: any, index: number) => (
                                            <TableRow
                                                key={item.child.id}
                                                className={`transition-colors hover:bg-muted/50 ${
                                                    index < 3
                                                        ? 'bg-destructive/5'
                                                        : ''
                                                }`}
                                            >
                                                <TableCell className="font-medium">
                                                    {item.child.full_name}
                                                </TableCell>
                                                <TableCell>
                                                    {
                                                        item.measurement
                                                            .age_in_months
                                                    }{' '}
                                                    mos
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            item.priority === 1
                                                                ? 'destructive'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {item.reason}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {item.child.barangay.name}
                                                </TableCell>
                                                <TableCell>
                                                    {item.days_since_measurement ===
                                                    999
                                                        ? 'N/A'
                                                        : `${item.days_since_measurement}d`}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/children/${item.child.id}`}
                                                        >
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <CheckCircle className="mb-4 h-16 w-16 text-green-600" />
                                <p className="text-lg font-medium text-foreground">
                                    No children requiring attention
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    All children's data quality is within
                                    acceptable limits
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Flagged Measurements Detail */}
                {flaggedMeasurements.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-foreground">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Flagged Measurements
                            </CardTitle>
                            <CardDescription>
                                Z-scores outside ±6 SD - require verification
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Child</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Weight (kg)</TableHead>
                                        <TableHead>Height (cm)</TableHead>
                                        <TableHead>WFA Z-Score</TableHead>
                                        <TableHead>Classification</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {flaggedMeasurements
                                        .slice(0, 10)
                                        .map((m: any) => (
                                            <TableRow
                                                key={m.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <TableCell className="font-medium">
                                                    {m.child_name}
                                                </TableCell>
                                                <TableCell>
                                                    {m.age_months} mos
                                                </TableCell>
                                                <TableCell>
                                                    {m.weight_kg}
                                                </TableCell>
                                                <TableCell>
                                                    {m.height_cm}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        {Math.abs(
                                                            m.wfa_zscore,
                                                        ).toFixed(2)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            m.opt_classification ===
                                                            'sam'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {m.opt_classification?.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {m.measurement_date}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/children/${m.child.id}`}
                                                        >
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                            {flaggedMeasurements.length > 10 && (
                                <div className="mt-4 text-center">
                                    <Button variant="outline" size="sm">
                                        View All ({flaggedMeasurements.length})
                                        Records
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
