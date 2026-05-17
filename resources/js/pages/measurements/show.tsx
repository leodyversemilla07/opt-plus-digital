import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Info, Ruler, Trash2, Weight } from 'lucide-react';

interface MeasurementShowProps {
    child: {
        id: string;
        full_name: string;
        sex: string;
        age_in_months: number;
        barangay: { name: string };
    };
    measurement: {
        id: string;
        measurement_date: string;
        weight_kg: number;
        height_length_cm: number;
        measurement_type: string;
        muac_cm: number | null;
        wfa_zscore: number | null;
        hfa_zscore: number | null;
        wfh_zscore: number | null;
        wfa_classification: string | null;
        hfa_classification: string | null;
        wfh_classification: string | null;
        opt_classification: string;
        notes: string | null;
        measured_by: { name: string } | null;
    };
}

export default function MeasurementShow({
    child,
    measurement,
}: MeasurementShowProps) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.children'), href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
        {
            title: t('measurement.measurement_details'),
            href: `/children/${child.id}/measurements/${measurement.id}`,
        },
    ];

    const getStatusColor = (status: string | null) => {
        if (!status) return 'bg-slate-500';
        const s = status.toLowerCase();
        if (s === 'normal') return 'bg-green-500';
        if (
            s.includes('underweight') ||
            s.includes('stunted') ||
            s.includes('wasted')
        ) {
            return s.includes('severely') ? 'bg-red-600' : 'bg-orange-500';
        }
        if (s.includes('overweight') || s.includes('obese'))
            return 'bg-blue-500';
        return 'bg-slate-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${t('measurement.measurement_details')}: ${child.full_name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2"
                            render={
                                <Link
                                    href={`/children/${child.id}/measurements`}
                                />
                            }
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t('measurement.back_to_history')}
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {t('measurement.measurement_details')}
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Recorded on {measurement.measurement_date} for{' '}
                            {child.full_name}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            render={
                                <Link
                                    href={`/children/${child.id}/measurements/${measurement.id}/edit`}
                                />
                            }
                        >
                            <Edit className="mr-2 h-4 w-4" /> {t('measurement.edit')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            render={
                                <Link
                                    href={`/children/${child.id}/measurements/${measurement.id}`}
                                    method="delete"
                                    as="button"
                                />
                            }
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> {t('common.delete')}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>{t('measurement.core_metrics')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Weight className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="font-medium">{t('measurement.weight')}</span>
                                </div>
                                <span className="text-xl font-bold">
                                    {measurement.weight_kg} kg
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                                        <Ruler className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="font-medium">{t('measurement.height')}</span>
                                </div>
                                <span className="text-xl font-bold">
                                    {measurement.height_length_cm} cm
                                </span>
                            </div>
                            {measurement.muac_cm && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                                            <Info className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <span className="font-medium">
                                            MUAC
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {measurement.muac_cm} cm
                                    </span>
                                </div>
                            )}
                            <div className="border-t pt-4 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Measurement Type:</span>
                                    <span className="capitalize">
                                        {measurement.measurement_type}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-muted-foreground">
                                    <span>Measured By:</span>
                                    <span>
                                        {measurement.measured_by?.name ||
                                            'System'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>
                                {t('measurement.who_z_scores')}
                            </CardTitle>
                            <CardDescription>
                                Automatically calculated based on WHO Child
                                Growth Standards
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                                        {t('measurement.zscore_wfa')}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {measurement.wfa_zscore?.toFixed(2) ||
                                            'N/A'}
                                    </div>
                                    <Badge
                                        className={`mt-2 ${getStatusColor(measurement.wfa_classification)}`}
                                    >
                                        {measurement.wfa_classification?.toUpperCase() ||
                                            'N/A'}
                                    </Badge>
                                </div>
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                                        {t('measurement.zscore_hfa')}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {measurement.hfa_zscore?.toFixed(2) ||
                                            'N/A'}
                                    </div>
                                    <Badge
                                        className={`mt-2 ${getStatusColor(measurement.hfa_classification)}`}
                                    >
                                        {measurement.hfa_classification?.toUpperCase() ||
                                            'N/A'}
                                    </Badge>
                                </div>
                                <div className="rounded-lg border bg-muted/20 p-4">
                                    <div className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                                        {t('measurement.zscore_wfh')}
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {measurement.wfh_zscore?.toFixed(2) ||
                                            'N/A'}
                                    </div>
                                    <Badge
                                        className={`mt-2 ${getStatusColor(measurement.wfh_classification)}`}
                                    >
                                        {measurement.wfh_classification?.toUpperCase() ||
                                            'N/A'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-6 rounded-lg border bg-primary/5 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    <span className="font-bold">
                                        Overall OPT Plus Classification
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Summary nutritional status:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className={`px-4 py-1 text-lg font-bold ${getStatusColor(measurement.opt_classification)} border-transparent text-white`}
                                    >
                                        {measurement.opt_classification.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {measurement.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('measurement.measurement_notes')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{measurement.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
