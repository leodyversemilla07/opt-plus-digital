import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type BreadcrumbItem } from '@/types';

interface Child {
    id: string;
    full_name: string;
    sex: 'male' | 'female';
    date_of_birth: string;
    age_in_months: number;
}

interface Props {
    child: Child;
}

export default function Create({ child }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        measurement_date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_length_cm: '',
        muac_cm: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
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

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Add Measurement
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {child.full_name} •{' '}
                                {child.sex === 'male' ? 'Male' : 'Female'} •{' '}
                                {getAgeDisplay(child.age_in_months)}
                            </p>
                        </div>
                    </div>

                    {/* Info Alert */}
                    <Alert className="mb-6">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            WHO z-scores and nutritional status will be
                            calculated automatically based on the child's age,
                            sex, and measurements.
                        </AlertDescription>
                    </Alert>

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {/* Measurement Data */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Measurement Data</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="measurement_date">
                                            Measurement Date{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.measurement_date}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div>
                                            <Label htmlFor="weight_kg">
                                                Weight (kg){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
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
                                            <p className="mt-1 text-xs text-gray-500">
                                                Range: 1-30 kg
                                            </p>
                                            {errors.weight_kg && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.weight_kg}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="height_length_cm">
                                                Height/Length (cm){' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
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
                                            <p className="mt-1 text-xs text-gray-500">
                                                Range: 40-125 cm
                                            </p>
                                            {errors.height_length_cm && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.height_length_cm}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="muac_cm">
                                                MUAC (cm)
                                            </Label>
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
                                            <p className="mt-1 text-xs text-gray-500">
                                                Mid-Upper Arm
                                            </p>
                                            {errors.muac_cm && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.muac_cm}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.notes}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Measurement Tips */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Measurement Tips</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-700">
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
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? 'Saving...'
                                        : 'Save Measurement'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
