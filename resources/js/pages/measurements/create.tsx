import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, WifiOff, Cloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { offlineDB } from '@/lib/offline-db';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

interface Child {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    sex: 'male' | 'female';
    date_of_birth: string;
    age_in_months: number;
}

interface CreateMeasurementProps {
    child: Child;
}

export default function CreateMeasurement({ child }: CreateMeasurementProps) {
    const isOnline = useOnlineStatus();
    const [isSavingOffline, setIsSavingOffline] = useState(false);
    const [offlineSaveSuccess, setOfflineSaveSuccess] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        measurement_date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_length_cm: '',
        muac_cm: '',
        notes: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        // If offline, save to IndexedDB
        if (!isOnline) {
            setIsSavingOffline(true);
            try {
                await offlineDB.addMeasurement({
                    child_id: child.id,
                    measurement_date: data.measurement_date,
                    weight_kg: parseFloat(data.weight_kg),
                    height_length_cm: parseFloat(data.height_length_cm),
                    muac_cm: data.muac_cm ? parseFloat(data.muac_cm) : undefined,
                    notes: data.notes || undefined,
                });
                
                setOfflineSaveSuccess(true);
                setIsSavingOffline(false);

                // Reset form after 2 seconds and redirect
                setTimeout(() => {
                    window.location.href = `/children/${child.id}`;
                }, 2000);
            } catch (error) {
                console.error('Failed to save offline:', error);
                setIsSavingOffline(false);
                alert('Failed to save measurement offline. Please try again.');
            }
            return;
        }

        // If online, use normal Inertia post
        post(`/children/${child.id}/measurements`);
    };

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
        }
        return `${months} month${months > 1 ? 's' : ''}`;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
        { title: 'Add Measurement', href: `/children/${child.id}/measurements/create` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Add Measurement - ${child.full_name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto max-w-3xl w-full">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Add Measurement
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {child.full_name} •{' '}
                            {child.sex === 'male' ? 'Male' : 'Female'} •{' '}
                            {getAgeDisplay(child.age_in_months)}
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl w-full">

                    {/* Info Alert */}
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            WHO z-scores and nutritional status will be
                            calculated automatically based on the child's age,
                            sex, and measurements.
                        </AlertDescription>
                    </Alert>

                    {/* Offline Status Alert */}
                    {!isOnline && (
                        <Alert className="mb-6 border-amber-500 bg-amber-50">
                            <WifiOff className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                You are currently offline. This measurement will be saved
                                locally and automatically synced when you reconnect to the internet.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Offline Save Success */}
                    {offlineSaveSuccess && (
                        <Alert className="mb-6 border-green-500 bg-green-50">
                            <Cloud className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                ✓ Measurement saved offline successfully! It will be synced automatically
                                when you're back online. Redirecting...
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {/* Measurement Data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Measurement Data</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FieldGroup>
                                        <Field>
                                            <FieldLabel htmlFor="measurement_date">
                                                Measurement Date{' '}
                                                <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="measurement_date"
                                                type="date"
                                                value={data.measurement_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'measurement_date',
                                                        e.target.value
                                                    )
                                                }
                                                max={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                required
                                            />
                                            {errors.measurement_date && (
                                                <FieldDescription className="text-red-500">
                                                    {errors.measurement_date}
                                                </FieldDescription>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="weight_kg">
                                                Weight (kg){' '}
                                                <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="weight_kg"
                                                type="number"
                                                step="0.01"
                                                min="1"
                                                max="30"
                                                value={data.weight_kg}
                                                onChange={(e) =>
                                                    setData(
                                                        'weight_kg',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="9.5"
                                                required
                                            />
                                            <FieldDescription>
                                                Range: 1-30 kg
                                            </FieldDescription>
                                            {errors.weight_kg && (
                                                <FieldDescription className="text-red-500">
                                                    {errors.weight_kg}
                                                </FieldDescription>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="height_length_cm">
                                                Height/Length (cm){' '}
                                                <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="height_length_cm"
                                                type="number"
                                                step="0.1"
                                                min="40"
                                                max="125"
                                                value={data.height_length_cm}
                                                onChange={(e) =>
                                                    setData(
                                                        'height_length_cm',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="75.0"
                                                required
                                            />
                                            <FieldDescription>
                                                Range: 40-125 cm
                                            </FieldDescription>
                                            {errors.height_length_cm && (
                                                <FieldDescription className="text-red-500">
                                                    {errors.height_length_cm}
                                                </FieldDescription>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="muac_cm">
                                                MUAC (cm)
                                            </FieldLabel>
                                            <Input
                                                id="muac_cm"
                                                type="number"
                                                step="0.1"
                                                min="10"
                                                max="20"
                                                value={data.muac_cm}
                                                onChange={(e) =>
                                                    setData(
                                                        'muac_cm',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="13.5"
                                            />
                                            <FieldDescription>
                                                Mid-Upper Arm Circumference
                                            </FieldDescription>
                                            {errors.muac_cm && (
                                                <FieldDescription className="text-red-500">
                                                    {errors.muac_cm}
                                                </FieldDescription>
                                            )}
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) =>
                                                    setData('notes', e.target.value)
                                                }
                                                rows={3}
                                                placeholder="Any observations or remarks..."
                                            />
                                            {errors.notes && (
                                                <FieldDescription className="text-red-500">
                                                    {errors.notes}
                                                </FieldDescription>
                                            )}
                                        </Field>
                                    </FieldGroup>
                                </CardContent>
                            </Card>

                            {/* Measurement Tips */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Measurement Tips</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex gap-2">
                                            <span className="font-semibold">
                                                Weight:
                                            </span>
                                            <span>
                                                Use a calibrated scale. Child
                                                should be in light clothing,
                                                without shoes.
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-semibold">
                                                Height/Length:
                                            </span>
                                            <span>
                                                For children under 2 years,
                                                measure length (lying down). For
                                                2+ years, measure height
                                                (standing).
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="font-semibold">
                                                MUAC:
                                            </span>
                                            <span>
                                                Measure the mid-point between
                                                shoulder and elbow on the left
                                                arm.
                                            </span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <Link href={`/children/${child.id}`}>
                                    <Button variant="outline" type="button">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing || isSavingOffline || offlineSaveSuccess}
                                >
                                    {isSavingOffline && 'Saving Offline...'}
                                    {offlineSaveSuccess && 'Saved ✓'}
                                    {!isSavingOffline && !offlineSaveSuccess && (
                                        processing ? 'Saving...' : (
                                            !isOnline ? 'Save Offline' : 'Save Measurement'
                                        )
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
