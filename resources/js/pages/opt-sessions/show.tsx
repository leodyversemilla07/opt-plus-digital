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
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Edit,
    Play,
    Upload,
    X,
} from 'lucide-react';

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

const statusLabels: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const classificationColors: Record<string, string> = {
    sam: 'bg-red-100 text-red-800',
    mam: 'bg-orange-100 text-orange-800',
    normal: 'bg-green-100 text-green-800',
    overweight: 'bg-yellow-100 text-yellow-800',
    obese: 'bg-purple-100 text-purple-800',
};

export default function Show({ session, stats, recentMeasurements }: Props) {
    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string };
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'OPT Sessions', href: '/opt-sessions' },
        { title: session.name, href: `/opt-sessions/${session.id}` },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={session.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
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
                                    {statusLabels[session.status]}
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
                    <div className="flex gap-2">
                        {session.status === 'scheduled' && (
                            <>
                                <Button variant="outline" onClick={handleStart}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Session
                                </Button>
                                <Button variant="outline" render={<Link
                                        href={`/opt-sessions/${session.id}/edit`}
                                    />}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </>
                        )}
                        {session.status === 'in_progress' && (
                            <>
                                <Button render={<Link
                                        href={`/import?session=${session.id}`}
                                    />}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Data
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleComplete}
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete
                                </Button>
                            </>
                        )}
                        {session.status !== 'completed' &&
                            session.status !== 'cancelled' && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancel}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
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
                                Coverage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.coverage.toFixed(1)}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.measured_children} /{' '}
                                {stats.target_children} children
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-green-600">
                                Normal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.normal_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                children
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-orange-600">
                                MAM (Moderate)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.mam_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                children
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-600">
                                SAM (Severe)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.sam_count}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                children
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Session Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Session Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Barangay
                                </dt>
                                <dd className="mt-1">
                                    {session.barangay.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Session Date
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
                                        Venue
                                    </dt>
                                    <dd className="mt-1">{session.venue}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Created By
                                </dt>
                                <dd className="mt-1">
                                    {session.created_by.name}
                                </dd>
                            </div>
                        </dl>
                        {session.notes && (
                            <div className="mt-4">
                                <dt className="text-sm font-medium text-muted-foreground">
                                    Notes
                                </dt>
                                <dd className="mt-1">{session.notes}</dd>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Measurements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Measurements</CardTitle>
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
                                        <TableHead>Child</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Weight</TableHead>
                                        <TableHead>Height</TableHead>
                                        <TableHead>Status</TableHead>
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
