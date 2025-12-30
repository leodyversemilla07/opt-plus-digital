import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NutritionalStatusBadge } from '@/components/ui/nutritional-status-badge';
import { useOnlineStatus } from '@/hooks/use-online-status';
import AppLayout from '@/layouts/app-layout';
import { offlineDB } from '@/lib/offline-db';
import {
    edit as childrenEdit,
    index as childrenIndex,
} from '@/routes/children';
import { create as measurementsCreate } from '@/routes/children/measurements';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Cloud, Download, Edit, Plus, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

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
        municipality_city: string;
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
    const isOnline = useOnlineStatus();
    const [isCached, setIsCached] = useState(false);
    const [isCaching, setIsCaching] = useState(false);
    const [cacheTimestamp, setCacheTimestamp] = useState<Date | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Children Registry', href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
    ];

    useEffect(() => {
        const checkCacheStatus = async () => {
            try {
                const cachedChild = await offlineDB.getCachedChild(child.id);
                setIsCached(!!cachedChild);
                if (
                    cachedChild &&
                    cachedChild.cachedAt &&
                    typeof cachedChild.cachedAt === 'string'
                ) {
                    setCacheTimestamp(new Date(cachedChild.cachedAt));
                }
            } catch (error) {
                console.error('Failed to check cache status:', error);
            }
        };

        const cacheChildData = async () => {
            if (isOnline) {
                try {
                    await offlineDB.cacheChild({
                        ...child,
                        cachedAt: new Date().toISOString(),
                    } as any);
                    setIsCached(true);
                    setCacheTimestamp(new Date());
                } catch (error) {
                    console.error('Failed to cache child:', error);
                }
            } else {
                await checkCacheStatus();
            }
        };

        cacheChildData();
    }, [child, isOnline]);

    const handleCacheForOffline = async () => {
        setIsCaching(true);
        try {
            await offlineDB.cacheChild({
                ...child,
                cachedAt: new Date().toISOString(),
            } as any);
            setIsCached(true);
            setCacheTimestamp(new Date());
            alert('Child data cached for offline access');
        } catch (error) {
            console.error('Failed to cache child:', error);
            alert('Failed to cache child data. Please try again.');
        } finally {
            setIsCaching(false);
        }
    };

    const getCacheFreshness = () => {
        if (!cacheTimestamp) return '';
        const now = new Date();
        const diff = now.getTime() - cacheTimestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
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
            <Head title={child.full_name} />

            <div className="flex flex-col gap-6 p-6">
                {!isOnline && isCached && (
                    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                        <Cloud className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                            Viewing cached data from {getCacheFreshness()}.
                            Changes will sync when online.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <Link href={childrenIndex.url()}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {child.full_name}
                            </h1>
                            <p className="mt-1 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                {child.sex} •{' '}
                                {getAgeDisplay(child.age_in_months)}
                                {isCached && (
                                    <span className="ml-2 tracking-normal text-primary">
                                        • CACHED {getCacheFreshness()}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={childrenEdit.url(child.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Link href={measurementsCreate.url(child.id)}>
                            <Button size="sm">
                                <Plus className="mr-2 h-4 w-4" /> Add
                                Measurement
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-6 md:col-span-2">
                        {latestMeasurement && (
                            <Card className="border-primary/20 shadow-lg shadow-primary/5">
                                <CardHeader className="border-b bg-primary/5 pb-4">
                                    <CardTitle className="text-lg">
                                        Latest Nutritional Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">
                                                Classification
                                            </p>
                                            <NutritionalStatusBadge
                                                status={
                                                    latestMeasurement.opt_classification
                                                }
                                                className="px-4 py-1 text-lg"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">
                                                    Weight
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {
                                                        latestMeasurement.weight_kg
                                                    }{' '}
                                                    kg
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    WFA Z:{' '}
                                                    {latestMeasurement.weight_for_age_zscore?.toFixed(
                                                        2,
                                                    ) || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">
                                                    Height
                                                </p>
                                                <p className="text-2xl font-bold">
                                                    {
                                                        latestMeasurement.height_length_cm
                                                    }{' '}
                                                    cm
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    HFA Z:{' '}
                                                    {latestMeasurement.height_for_age_zscore?.toFixed(
                                                        2,
                                                    ) || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t pt-6 text-xs text-muted-foreground italic">
                                        <span>
                                            Measured:{' '}
                                            {new Date(
                                                latestMeasurement.measurement_date,
                                            ).toLocaleDateString()}
                                        </span>
                                        <span>
                                            By:{' '}
                                            {latestMeasurement.measured_by.name}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Date of Birth
                                    </p>
                                    <p className="font-bold">
                                        {new Date(
                                            child.date_of_birth,
                                        ).toLocaleDateString('en-US', {
                                            dateStyle: 'long',
                                        })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Sex
                                    </p>
                                    <p className="font-bold tracking-wide uppercase">
                                        {child.sex}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Family Serial Number
                                    </p>
                                    <p className="font-mono font-bold text-primary">
                                        {child.family_serial_number}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Address (Purok/Sitio)
                                    </p>
                                    <p className="font-bold">
                                        {child.purok_sitio || 'Not specified'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Parents / Guardian
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 text-sm sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Mother
                                    </p>
                                    <p className="font-bold">
                                        {child.mother_name || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Father
                                    </p>
                                    <p className="font-bold">
                                        {child.father_name || 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                        Contact Number
                                    </p>
                                    <p className="font-bold">
                                        {child.contact_number || 'N/A'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                                    Child QR Identity
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="rounded-2xl border-2 border-primary/20 bg-white p-4 shadow-inner">
                                    <QrCode className="h-40 w-40 text-primary" />
                                </div>
                                <p className="rounded-full bg-muted px-4 py-1 font-mono text-sm font-bold">
                                    {child.qr_code}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full font-bold"
                                >
                                    <Download className="mr-2 h-4 w-4" />{' '}
                                    Download QR Card
                                </Button>
                            </CardContent>
                        </Card>

                        {child.is_indigenous_people && (
                            <Card className="border-accent/50 bg-accent/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-widest text-accent-foreground uppercase">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-accent-foreground" />
                                        Indigenous People
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-bold">
                                        {child.indigenous_group ||
                                            'Verified IP member'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                                    Audit Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-[10px] font-medium">
                                <p>Created by: {child.created_by.name}</p>
                                <p>Barangay: {child.barangay.name}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
