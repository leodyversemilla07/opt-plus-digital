import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
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
import { create as measurementsCreate } from '@/routes/children/measurements';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

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
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.children'), href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
        { title: t('measurement.title'), href: `/children/${child.id}/measurements` },
    ];

    const getStatusBadge = (classification: string) => {
        return <NutritionalStatusBadge status={classification} />;
    };

    const getZScoreColor = (zscore: number | null) => {
        if (!zscore) return 'text-muted-foreground';
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
            <Head title={`${t('measurement.title')} - ${child.full_name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {t('measurement.history')}
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                {child.full_name} •{' '}
                                {getAgeDisplay(child.age_in_months)} •{' '}
                                {measurements.length} measurement
                                {measurements.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Link href={measurementsCreate.url(child.id)}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('measurement.add_measurement')}
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-7xl">
                    {measurements.length > 0 && (
                        <div className="mb-6 grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {t('measurement.latest_weight')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {measurements[0].weight_kg} kg
                                    </div>
                                    <p
                                        className={`text-sm ${getZScoreColor(
                                            measurements[0]
                                                .weight_for_age_zscore,
                                        )}`}
                                    >
                                        Z-score:{' '}
                                        {measurements[0]
                                            .weight_for_age_zscore != null
                                            ? Number(
                                                  measurements[0]
                                                      .weight_for_age_zscore,
                                              ).toFixed(2)
                                            : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {t('measurement.latest_height')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {measurements[0].height_length_cm} cm
                                    </div>
                                    <p
                                        className={`text-sm ${getZScoreColor(
                                            measurements[0]
                                                .height_for_age_zscore,
                                        )}`}
                                    >
                                        Z-score:{' '}
                                        {measurements[0]
                                            .height_for_age_zscore != null
                                            ? Number(
                                                  measurements[0]
                                                      .height_for_age_zscore,
                                              ).toFixed(2)
                                            : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {t('common.status')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {getStatusBadge(
                                        measurements[0].opt_classification,
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {t('measurement.last_measured')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-semibold">
                                        {new Date(
                                            measurements[0].measurement_date,
                                        ).toLocaleDateString()}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        by {measurements[0].measured_by.name}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('measurement.all_measurements')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {measurements.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="mb-4">
                                        {t('measurement.no_measurements')}
                                    </p>
                                    <Link
                                        href={measurementsCreate.url(child.id)}
                                    >
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            {t('measurement.add_first')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('measurement.date')}</TableHead>
                                                <TableHead>{t('measurement.weight')}</TableHead>
                                                <TableHead>{t('measurement.height')}</TableHead>
                                                <TableHead>{t('measurement.muac')}</TableHead>
                                                <TableHead>WFA</TableHead>
                                                <TableHead>HFA</TableHead>
                                                <TableHead>WFH</TableHead>
                                                <TableHead>{t('common.status')}</TableHead>
                                                <TableHead>Measured By</TableHead>
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
                                                                    ? 'bg-yellow-50 dark:bg-yellow-900/10'
                                                                    : ''
                                                            }
                                                        >
                                                            <TableCell className="font-medium">
                                                                {new Date(
                                                                    measurement.measurement_date,
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
                                                                                weightChange,
                                                                            ).toFixed(
                                                                                2,
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
                                                                    measurement.weight_for_age_zscore,
                                                                )}
                                                            >
                                                                {measurement.weight_for_age_zscore !=
                                                                null
                                                                    ? Number(
                                                                          measurement.weight_for_age_zscore,
                                                                      ).toFixed(
                                                                          2,
                                                                      )
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={getZScoreColor(
                                                                    measurement.height_for_age_zscore,
                                                                )}
                                                            >
                                                                {measurement.height_for_age_zscore !=
                                                                null
                                                                    ? Number(
                                                                          measurement.height_for_age_zscore,
                                                                      ).toFixed(
                                                                          2,
                                                                      )
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell
                                                                className={getZScoreColor(
                                                                    measurement.weight_for_height_zscore,
                                                                )}
                                                            >
                                                                {measurement.weight_for_height_zscore !=
                                                                null
                                                                    ? Number(
                                                                          measurement.weight_for_height_zscore,
                                                                      ).toFixed(
                                                                          2,
                                                                      )
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {getStatusBadge(
                                                                    measurement.opt_classification,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {
                                                                    measurement
                                                                        .measured_by
                                                                        .name
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                },
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{t('measurement.zscore_interpretation')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 text-sm md:grid-cols-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none font-bold text-green-600">
                                        •
                                    </span>
                                    <span>Normal: -2 to +2 SD</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none font-bold text-orange-600">
                                        •
                                    </span>
                                    <span>
                                        Moderate: -3 to -2 or +2 to +3 SD
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg leading-none font-bold text-red-600">
                                        •
                                    </span>
                                    <span>Severe: &lt;-3 or &gt;+3 SD</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground italic">
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
