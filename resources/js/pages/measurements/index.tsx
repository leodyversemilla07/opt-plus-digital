import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
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
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Measurement {
    id: string;
    measurement_date: string;
    weight_kg: number;
    height_length_cm: number;
    muac_cm: number | null;
    weight_for_age_zscore: number | null;
    height_for_age_zscore: number | null;
    weight_for_height_zscore: number | null;
    weight_for_age_status: string | null;
    height_for_age_status: string | null;
    weight_for_height_status: string | null;
    opt_classification: string;
    is_flagged: boolean;
    notes: string | null;
    measured_by: {
        id: string;
        name: string;
    };
}

interface Child {
    id: string;
    full_name: string;
    sex: 'male' | 'female';
    age_in_months: number;
}

interface Props {
    child: Child;
    measurements: Measurement[];
}

export default function Index({ child, measurements }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
        { title: 'Measurements', href: `/children/${child.id}/measurements` },
    ];

    const getStatusBadge = (classification: string) => {
        const variants: Record<
            string,
            'default' | 'destructive' | 'secondary'
        > = {
            normal: 'default',
            severely_malnourished: 'destructive',
            moderately_malnourished: 'destructive',
            overweight: 'secondary',
            obese: 'destructive',
        };

        return (
            <Badge variant={variants[classification] || 'default'}>
                {classification.replace(/_/g, ' ').toUpperCase()}
            </Badge>
        );
    };

    const getZScoreColor = (zscore: number | null) => {
        if (!zscore) return 'text-gray-500';
        if (zscore < -3) return 'text-red-600 font-semibold';
        if (zscore < -2) return 'text-orange-600';
        if (zscore > 3) return 'text-red-600 font-semibold';
        if (zscore > 2) return 'text-orange-600';
        return 'text-green-600';
    };

    const getWeightChange = (index: number) => {
        if (index === measurements.length - 1) return null;
        const current = measurements[index];
        const previous = measurements[index + 1];
        const change = current.weight_kg - previous.weight_kg;
        return change;
    };

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years}y ${months}m`;
        }
        return `${months}m`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Measurements - ${child.full_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Measurement History
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {child.full_name} •{' '}
                                {getAgeDisplay(child.age_in_months)} •{' '}
                                {measurements.length} measurement
                                {measurements.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Link
                            href={`/children/${child.id}/measurements/create`}
                        >
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Measurement
                            </Button>
                        </Link>
                    </div>

                    {/* Latest Measurement Summary */}
                    {measurements.length > 0 && (
                        <div className="mb-6 grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Latest Weight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {measurements[0].weight_kg} kg
                                    </div>
                                    <p
                                        className={`text-sm ${getZScoreColor(
                                            measurements[0]
                                                .weight_for_age_zscore
                                        )}`}
                                    >
                                        Z-score:{' '}
                                        {measurements[0].weight_for_age_zscore?.toFixed(
                                            2
                                        ) || 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Latest Height
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {measurements[0].height_length_cm} cm
                                    </div>
                                    <p
                                        className={`text-sm ${getZScoreColor(
                                            measurements[0]
                                                .height_for_age_zscore
                                        )}`}
                                    >
                                        Z-score:{' '}
                                        {measurements[0].height_for_age_zscore?.toFixed(
                                            2
                                        ) || 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {getStatusBadge(
                                        measurements[0].opt_classification
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-gray-600">
                                        Last Measured
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-semibold">
                                        {new Date(
                                            measurements[0].measurement_date
                                        ).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        by {measurements[0].measured_by.name}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Measurements Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Measurements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {measurements.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <p className="mb-4">
                                        No measurements recorded yet.
                                    </p>
                                    <Link
                                        href={`/children/${child.id}/measurements/create`}
                                    >
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Measurement
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Weight</TableHead>
                                                <TableHead>Height</TableHead>
                                                <TableHead>MUAC</TableHead>
                                                <TableHead>WFA</TableHead>
                                                <TableHead>HFA</TableHead>
                                                <TableHead>WFH</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>
                                                    Measured By
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {measurements.map(
                                                (measurement, index) => {
                                                    const weightChange =
                                                        getWeightChange(index);
                                                    return (
                                                        <TableRow
                                                            key={measurement.id}
                                                            className={
                                                                measurement.is_flagged
                                                                    ? 'bg-yellow-50'
                                                                    : ''
                                                            }
                                                        >
                                                            <TableCell className="font-medium">
                                                                {new Date(
                                                                    measurement.measurement_date
                                                                ).toLocaleDateString()}
                                                                {measurement.is_flagged && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2 text-xs"
                                                                    >
                                                                        Flagged
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    <span>
                                                                        {
                                                                            measurement.weight_kg
                                                                        }{' '}
                                                                        kg
                                                                    </span>
                                                                    {weightChange !==
                                                                        null && (
                                                                        <span
                                                                            className={`text-xs ${
                                                                                weightChange >
                                                                                0
                                                                                    ? 'text-green-600'
                                                                                    : 'text-red-600'
                                                                            }`}
                                                                        >
                                                                            {weightChange >
                                                                            0 ? (
                                                                                <TrendingUp className="inline h-3 w-3" />
                                                                            ) : (
                                                                                <TrendingDown className="inline h-3 w-3" />
                                                                            )}
                                                                            {Math.abs(
                                                                                weightChange
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {
                                                                    measurement.height_length_cm
                                                                }{' '}
                                                                cm
                                                            </TableCell>
                                                            <TableCell>
                                                                {measurement.muac_cm ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={getZScoreColor(
                                                                    measurement.weight_for_age_zscore
                                                                )}
                                                            >
                                                                {measurement.weight_for_age_zscore?.toFixed(
                                                                    2
                                                                ) || 'N/A'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={getZScoreColor(
                                                                    measurement.height_for_age_zscore
                                                                )}
                                                            >
                                                                {measurement.height_for_age_zscore?.toFixed(
                                                                    2
                                                                ) || 'N/A'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={getZScoreColor(
                                                                    measurement.weight_for_height_zscore
                                                                )}
                                                            >
                                                                {measurement.weight_for_height_zscore?.toFixed(
                                                                    2
                                                                ) || 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusBadge(
                                                                    measurement.opt_classification
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-600">
                                                                {
                                                                    measurement
                                                                        .measured_by
                                                                        .name
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Legend */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Z-Score Interpretation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 text-sm md:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-600">●</span>
                                    <span>
                                        Normal: -2 to +2 SD
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-orange-600">●</span>
                                    <span>
                                        Moderate: -3 to -2 or +2 to +3 SD
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-600">●</span>
                                    <span>
                                        Severe: &lt;-3 or &gt;+3 SD
                                    </span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-gray-500">
                                WFA = Weight-for-Age | HFA = Height-for-Age |
                                WFH = Weight-for-Height | MUAC = Mid-Upper Arm
                                Circumference
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
