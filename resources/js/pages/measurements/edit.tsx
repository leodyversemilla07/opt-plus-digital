import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface MeasurementEditProps {
    child: {
        id: string;
        full_name: string;
        barangay: { name: string };
    };
    measurement: {
        id: string;
        measurement_date: string;
        weight_kg: number;
        height_length_cm: number;
        measurement_type: string;
        muac_cm: number | null;
        notes: string | null;
    };
}

export default function MeasurementEdit({
    child,
    measurement,
}: MeasurementEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: child.full_name, href: `/children/${child.id}` },
        {
            title: 'Edit Measurement',
            href: `/children/${child.id}/measurements/${measurement.id}/edit`,
        },
    ];

    const { data, setData, put, processing, errors } = useForm({
        measurement_date: measurement.measurement_date,
        weight_kg: measurement.weight_kg,
        height_length_cm: measurement.height_length_cm,
        measurement_type: measurement.measurement_type,
        muac_cm: measurement.muac_cm || '',
        notes: measurement.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/children/${child.id}/measurements/${measurement.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Measurement: ${child.full_name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <Button variant="ghost" size="sm" className="mb-2" asChild>
                        <Link
                            href={`/children/${child.id}/measurements/${measurement.id}`}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Edit Measurement
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Update measurement data for {child.full_name}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid gap-6 md:grid-cols-2"
                >
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Measurement Data</CardTitle>
                            <CardDescription>
                                Enter the physical measurements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="measurement_date">
                                    Measurement Date
                                </Label>
                                <Input
                                    id="measurement_date"
                                    type="date"
                                    value={data.measurement_date}
                                    onChange={(e) =>
                                        setData(
                                            'measurement_date',
                                            e.target.value,
                                        )
                                    }
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.measurement_date && (
                                    <p className="text-sm text-destructive">
                                        {errors.measurement_date}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="weight_kg">
                                        Weight (kg)
                                    </Label>
                                    <Input
                                        id="weight_kg"
                                        type="number"
                                        step="0.01"
                                        value={data.weight_kg}
                                        onChange={(e) =>
                                            setData(
                                                'weight_kg',
                                                parseFloat(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.weight_kg && (
                                        <p className="text-sm text-destructive">
                                            {errors.weight_kg}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height_length_cm">
                                        Height/Length (cm)
                                    </Label>
                                    <Input
                                        id="height_length_cm"
                                        type="number"
                                        step="0.1"
                                        value={data.height_length_cm}
                                        onChange={(e) =>
                                            setData(
                                                'height_length_cm',
                                                parseFloat(e.target.value),
                                            )
                                        }
                                    />
                                    {errors.height_length_cm && (
                                        <p className="text-sm text-destructive">
                                            {errors.height_length_cm}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="measurement_type">
                                    Measurement Type
                                </Label>
                                <Select
                                    value={data.measurement_type}
                                    onValueChange={(value) =>
                                        setData('measurement_type', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="length">
                                            Recumbent Length (lying down)
                                        </SelectItem>
                                        <SelectItem value="height">
                                            Standing Height
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.measurement_type && (
                                    <p className="text-sm text-destructive">
                                        {errors.measurement_type}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="muac_cm">
                                    MUAC (cm) - Optional
                                </Label>
                                <Input
                                    id="muac_cm"
                                    type="number"
                                    step="0.1"
                                    value={data.muac_cm}
                                    onChange={(e) =>
                                        setData('muac_cm', e.target.value)
                                    }
                                    placeholder="Mid-Upper Arm Circumference"
                                />
                                {errors.muac_cm && (
                                    <p className="text-sm text-destructive">
                                        {errors.muac_cm}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Additional Info</CardTitle>
                            <CardDescription>
                                Notes and observations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={5}
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="Add any observations or remarks here..."
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={`/children/${child.id}/measurements/${measurement.id}`}
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Measurement
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
