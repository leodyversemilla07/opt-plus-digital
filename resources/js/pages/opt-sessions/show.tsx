import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Copy,
    Edit,
    Play,
    Plus,
    Upload,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Measurement {
    id: string;
    measurement_date: string;
    weight_kg: number;
    height_length_cm: number;
    opt_classification: string;
    child: {
        id: string;
        full_name: string;
        sex: string;
    };
}

interface OptSession {
    id: string;
    name: string;
    session_date: string;
    start_date: string | null;
    end_date: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    target_children: number;
    measured_children: number;
    coverage_percentage: number;
    venue: string | null;
    notes: string | null;
    barangay: {
        id: string;
        name: string;
    };
    created_by: {
        id: number;
        name: string;
    };
}

interface Stats {
    target_children: number;
    measured_children: number;
    coverage: number;
    sam_count: number;
    mam_count: number;
    normal_count: number;
    overweight_count: number;
    obese_count: number;
}

interface Props {
    session: OptSession;
    stats: Stats;
    recentMeasurements: Measurement[];
}

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const classificationColors: Record<string, string> = {
    sam: 'bg-red-100 text-red-800',
    mam: 'bg-orange-100 text-orange-800',
    normal: 'bg-green-100 text-green-800',
    overweight: 'bg-yellow-100 text-yellow-800',
    obese: 'bg-purple-100 text-purple-800',
};

export default function Show({ session, stats, recentMeasurements }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('opt_session.title'), href: '/opt-sessions' },
        { title: session.name, href: `/opt-sessions/${session.id}` },
    ];

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            scheduled: t('opt_session.scheduled'),
            in_progress: t('opt_session.in_progress'),
            completed: t('opt_session.completed'),
            cancelled: t('opt_session.cancelled'),
        };
        return labels[status] || status;
    };

    const handleStart = () => {
        router.post(`/opt-sessions/${session.id}/start`);
    };

    const handleComplete = () => {
        router.post(`/opt-sessions/${session.id}/complete`);
    };

    const handleCancel = () => {
        if (confirm('Are you sure you want to cancel this session?')) {
            router.post(`/opt-sessions/${session.id}/cancel`);
        }
    };

    const handleDuplicate = () => {
        router.post(`/opt-sessions/${session.id}/duplicate`);
    };

    // Quick Measurement Form
    const [quickForm, setQuickForm] = useState({
        child_id: '',
        measurement_date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_length_cm: '',
    });
    const [quickSubmitting, setQuickSubmitting] = useState(false);
    const [availableChildren, setAvailableChildren] = useState<
        Array<{ id: string; full_name: string; sex: string }>
    >([]);

    useEffect(() => {
        if (session.status === 'in_progress') {
            fetch(`/opt-sessions/${session.id}/children-available`)
                .then((res) => res.json())
                .then((data) => {
                    setAvailableChildren(data.children);
                })
                .catch(() => {
                    // silently fail — children dropdown will just be empty
                });
        }
    }, [session.id, session.status]);

    const handleQuickFormChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setQuickForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleQuickMeasurement = (e: React.FormEvent) => {
        e.preventDefault();

        if (!quickForm.child_id) return;

        setQuickSubmitting(true);
        router.post(
            `/opt-sessions/${session.id}/measurements/quick`,
            {
                child_id: quickForm.child_id,
                opt_session_id: session.id,
                measurement_date: quickForm.measurement_date,
                weight_kg: quickForm.weight_kg,
                height_length_cm: quickForm.height_length_cm,
            } as Record<string, string>,
            {
                preserveState: true,
                onFinish: () => {
                    setQuickSubmitting(false);
                    setQuickForm({
                        child_id: '',
                        measurement_date:
                            new Date().toISOString().split('T')[0],
                        weight_kg: '',
                        height_length_cm: '',
                    });
                    // Refresh available children
                    fetch(`/opt-sessions/${session.id}/children-available`)
                        .then((res) => res.json())
                        .then((data) => {
                            setAvailableChildren(data.children);
                        });
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={session.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit('/opt-sessions')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">
                                    {session.name}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={statusColors[session.status]}
                                >
                                    {getStatusLabel(session.status)}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {session.barangay.name} •{' '}
                                {new Date(
                                    session.session_date,
                                ).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {session.status === 'scheduled' && (
                            <>
                                <Button variant="outline" onClick={handleStart}>
                                    <Play className="mr-2 h-4 w-4" />
                                    {t('opt_session.start_session')}
                                </Button>
                                <Button
                                    variant="outline"
                                    render={
                                        <Link
                                            href={`/opt-sessions/${session.id}/edit`}
                                        />
                                    }
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit')}
                                </Button>
                            </>
                        )}
                        {session.status === 'in_progress' && (
                            <>
                                <Button
                                    render={
                                        <Link
                                            href={`/import?session=${session.id}`}
                                        />
                                    }
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    {t('opt_session.import_data')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleComplete}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t('opt_session.complete')}
                                </Button>
                            </>
                        )}
                        {session.status !== 'cancelled' && (
                            <Button
                                variant="outline"
                                onClick={handleDuplicate}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </Button>
                        )}
                        {session.status !== 'completed' &&
                            session.status !== 'cancelled' && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancel}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    {t('opt_session.cancel')}
                                </Button>
                            )}
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('opt_session.coverage_title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.coverage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.measured_children} /{' '}
                                {stats.target_children} {t('opt_session.children')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">
                                {t('opt_session.normal')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.normal_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('opt_session.children')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600">
                                {t('opt_session.mam')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.mam_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('opt_session.children')}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">
                                {t('opt_session.sam')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.sam_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t('opt_session.children')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Session Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('opt_session.session_details')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    {t('opt_session.barangay')}
                                </dt>
                                <dd className="mt-1">
                                    {session.barangay.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    {t('opt_session.date')}
                                </dt>
                                <dd className="mt-1">
                                    {new Date(
                                        session.session_date,
                                    ).toLocaleDateString()}
                                </dd>
                            </div>
                            {session.venue && (
                                <div>
                                    <dt className="text-sm font-medium text-muted-foreground">
                                        {t('opt_session.venue_label')}
                                    </dt>
                                    <dd className="mt-1">{session.venue}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    {t('opt_session.created_by')}
                                </dt>
                                <dd className="mt-1">
                                    {session.created_by.name}
                                </dd>
                            </div>
                        </dl>
                        {session.notes && (
                            <div className="mt-4">
                                <dt className="text-sm font-medium text-muted-foreground">
                                    {t('opt_session.notes_label')}
                                </dt>
                                <dd className="mt-1">{session.notes}</dd>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Add Measurement (in-progress sessions only) */}
                {session.status === 'in_progress' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                Quick Add Measurement
                            </CardTitle>
                            <CardDescription>
                                Quickly record a measurement for a child in this session
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleQuickMeasurement}
                                className="space-y-4"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Child
                                        </label>
                                        <select
                                            name="child_id"
                                            required
                                            value={quickForm.child_id}
                                            onChange={handleQuickFormChange}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        >
                                            <option value="">
                                                Select a child...
                                            </option>
                                            {availableChildren.map((child) => (
                                                <option
                                                    key={child.id}
                                                    value={child.id}
                                                >
                                                    {child.full_name} ({child.sex === 'male' ? 'M' : 'F'})
                                                </option>
                                            ))}
                                        </select>
                                        {availableChildren.length === 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                All children in this barangay have been measured
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Measurement Date
                                        </label>
                                        <input
                                            type="date"
                                            name="measurement_date"
                                            required
                                            value={quickForm.measurement_date}
                                            onChange={handleQuickFormChange}
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            name="weight_kg"
                                            step="0.01"
                                            min="1"
                                            max="30"
                                            required
                                            value={quickForm.weight_kg}
                                            onChange={handleQuickFormChange}
                                            placeholder="e.g. 12.5"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Height / Length (cm)
                                        </label>
                                        <input
                                            type="number"
                                            name="height_length_cm"
                                            step="0.1"
                                            min="40"
                                            max="125"
                                            required
                                            value={quickForm.height_length_cm}
                                            onChange={handleQuickFormChange}
                                            placeholder="e.g. 95.5"
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={quickSubmitting}
                                    >
                                        {quickSubmitting
                                            ? 'Saving...'
                                            : 'Record Measurement'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Measurements */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('opt_session.recent_measurements')}</CardTitle>
                        <CardDescription>
                            Latest measurements recorded for this session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {recentMeasurements.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                No measurements recorded yet
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('opt_session.child')}</TableHead>
                                        <TableHead>{t('opt_session.sex')}</TableHead>
                                        <TableHead>{t('opt_session.date')}</TableHead>
                                        <TableHead>{t('opt_session.weight')}</TableHead>
                                        <TableHead>{t('opt_session.height')}</TableHead>
                                        <TableHead>{t('opt_session.status_label')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentMeasurements.map((measurement) => (
                                        <TableRow key={measurement.id}>
                                            <TableCell className="font-medium">
                                                <Link
                                                    href={`/children/${measurement.child.id}`}
                                                    className="hover:underline"
                                                >
                                                    {
                                                        measurement.child
                                                            .full_name
                                                    }
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {measurement.child.sex ===
                                                'male'
                                                    ? 'M'
                                                    : 'F'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    measurement.measurement_date,
                                                ).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {measurement.weight_kg} kg
                                            </TableCell>
                                            <TableCell>
                                                {measurement.height_length_cm}{' '}
                                                cm
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        classificationColors[
                                                            measurement
                                                                .opt_classification
                                                        ] || ''
                                                    }
                                                >
                                                    {measurement.opt_classification?.toUpperCase() ||
                                                        'N/A'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
