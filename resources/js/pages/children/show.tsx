import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Edit, Plus, QrCode } from 'lucide-react';

interface Measurement {
    id: string;
    measurement_date: string;
    weight_kg: number;
    height_length_cm: number;
    weight_for_age_zscore: number | null;
    height_for_age_zscore: number | null;
    weight_for_height_zscore: number | null;
    opt_classification: string;
    measured_by: {
        id: string;
        name: string;
    };
}

interface Child {
    id: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: 'male' | 'female';
    date_of_birth: string;
    age_in_months: number;
    family_serial_number: string;
    qr_code: string;
    birth_weight_kg: number | null;
    birth_length_cm: number | null;
    is_indigenous_people: boolean;
    indigenous_group: string | null;
    purok_sitio: string | null;
    mother_name: string | null;
    father_name: string | null;
    guardian_name: string | null;
    guardian_relationship: string | null;
    contact_number: string | null;
    notes: string | null;
    barangay: {
        id: string;
        name: string;
        municipality: string;
        province: string;
    };
    measurements: Measurement[];
    created_by: {
        id: string;
        name: string;
    };
}

interface Props {
    child: Child;
    latestMeasurement: Measurement | null;
}

export default function Show({ child, latestMeasurement }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Children Registry', href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
    ];

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
        }
        return `${months} month${months > 1 ? 's' : ''}`;
    };

    const getStatusBadge = (classification: string) => {
        const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={child.full_name} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/children">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {child.full_name}
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    {child.sex === 'male' ? 'Male' : 'Female'} •{' '}
                                    {getAgeDisplay(child.age_in_months)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/children/${child.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Button>
                            </Link>
                            <Link
                                href={`/children/${child.id}/measurements/create`}
                            >
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Measurement
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-6 md:col-span-2">
                            {/* Latest Status */}
                            {latestMeasurement && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Current Nutritional Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    OPT Classification
                                                </p>
                                                <div className="mt-1">
                                                    {getStatusBadge(
                                                        latestMeasurement.opt_classification
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Weight
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {latestMeasurement.weight_kg}{' '}
                                                        kg
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Z-score:{' '}
                                                        {latestMeasurement.weight_for_age_zscore?.toFixed(
                                                            2
                                                        ) || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Height
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {
                                                            latestMeasurement.height_length_cm
                                                        }{' '}
                                                        cm
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Z-score:{' '}
                                                        {latestMeasurement.height_for_age_zscore?.toFixed(
                                                            2
                                                        ) || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Last Measured
                                                    </p>
                                                    <p className="text-lg font-semibold">
                                                        {new Date(
                                                            latestMeasurement.measurement_date
                                                        ).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        by{' '}
                                                        {
                                                            latestMeasurement
                                                                .measured_by.name
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Personal Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="grid grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-600">
                                                Date of Birth
                                            </dt>
                                            <dd className="mt-1 text-sm">
                                                {new Date(
                                                    child.date_of_birth
                                                ).toLocaleDateString()}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-600">
                                                Sex
                                            </dt>
                                            <dd className="mt-1 text-sm">
                                                {child.sex === 'male'
                                                    ? 'Male'
                                                    : 'Female'}
                                            </dd>
                                        </div>
                                        {child.birth_weight_kg && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Birth Weight
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.birth_weight_kg} kg
                                                </dd>
                                            </div>
                                        )}
                                        {child.birth_length_cm && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Birth Length
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.birth_length_cm} cm
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Address</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">
                                        {child.purok_sitio && (
                                            <>{child.purok_sitio}, </>
                                        )}
                                        {child.barangay.name},{' '}
                                        {child.barangay.municipality},{' '}
                                        {child.barangay.province}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Parents/Guardian */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Parents/Guardian Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="space-y-3">
                                        {child.mother_name && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Mother's Name
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.mother_name}
                                                </dd>
                                            </div>
                                        )}
                                        {child.father_name && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Father's Name
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.father_name}
                                                </dd>
                                            </div>
                                        )}
                                        {child.guardian_name && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Guardian's Name
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.guardian_name}
                                                    {child.guardian_relationship && (
                                                        <span className="text-gray-500">
                                                            {' '}
                                                            (
                                                            {
                                                                child.guardian_relationship
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>
                                        )}
                                        {child.contact_number && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-600">
                                                    Contact Number
                                                </dt>
                                                <dd className="mt-1 text-sm">
                                                    {child.contact_number}
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </CardContent>
                            </Card>

                            {/* Recent Measurements */}
                            {child.measurements.length > 0 && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>
                                            Recent Measurements
                                        </CardTitle>
                                        <Link
                                            href={`/children/${child.id}/measurements`}
                                        >
                                            <Button variant="ghost" size="sm">
                                                View All
                                            </Button>
                                        </Link>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {child.measurements
                                                .slice(0, 5)
                                                .map((measurement) => (
                                                    <div
                                                        key={measurement.id}
                                                        className="flex items-center justify-between border-b pb-3 last:border-0"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {new Date(
                                                                    measurement.measurement_date
                                                                ).toLocaleDateString()}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    measurement.weight_kg
                                                                }{' '}
                                                                kg •{' '}
                                                                {
                                                                    measurement.height_length_cm
                                                                }{' '}
                                                                cm
                                                            </p>
                                                        </div>
                                                        {getStatusBadge(
                                                            measurement.opt_classification
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* QR Code */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>QR Code</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center">
                                        <div className="rounded-lg border-2 border-gray-300 p-4">
                                            <QrCode className="h-32 w-32 text-gray-400" />
                                        </div>
                                        <p className="mt-2 font-mono text-sm">
                                            {child.qr_code}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-4"
                                        >
                                            Download QR Code
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Identifiers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identifiers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <dl className="space-y-3">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-600">
                                                Family Serial Number
                                            </dt>
                                            <dd className="mt-1 font-mono text-sm">
                                                {child.family_serial_number}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-600">
                                                QR Code
                                            </dt>
                                            <dd className="mt-1 font-mono text-sm">
                                                {child.qr_code}
                                            </dd>
                                        </div>
                                    </dl>
                                </CardContent>
                            </Card>

                            {/* Indigenous People */}
                            {child.is_indigenous_people && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Indigenous People Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge variant="outline">
                                            Indigenous People
                                        </Badge>
                                        {child.indigenous_group && (
                                            <p className="mt-2 text-sm">
                                                Group: {child.indigenous_group}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Notes */}
                            {child.notes && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700">
                                            {child.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Metadata */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Record Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-600">
                                        Registered by {child.created_by.name}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
