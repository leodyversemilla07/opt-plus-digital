import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
        measurement_method: string;
        muac_cm: number | null;
        has_edema: boolean;
        edema_grade: string | null;
        has_disability: boolean;
        disability_notes: string | null;
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
        measurement_method: measurement.measurement_method || 'weight_height',
        muac_cm: measurement.muac_cm || '',
        has_edema: measurement.has_edema || false,
        edema_grade: measurement.edema_grade || '',
        has_disability: measurement.has_disability || false,
        disability_notes: measurement.disability_notes || '',
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

                            <div className="space-y-2">
                                <Label htmlFor="measurement_method">
                                    Measurement Method
                                </Label>
                                <Select
                                    value={data.measurement_method}
                                    onValueChange={(value) =>
                                        setData('measurement_method', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="weight_height">
                                            Weight & Height
                                        </SelectItem>
                                        <SelectItem value="muac_only">
                                            MUAC Only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.measurement_method && (
                                    <p className="text-sm text-destructive">
                                        {errors.measurement_method}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Clinical Observations</CardTitle>
                            <CardDescription>
                                Edema, disability, and notes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_edema"
                                        checked={data.has_edema}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'has_edema',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="has_edema"
                                        className="text-sm leading-none font-medium"
                                    >
                                        Bilateral Pitting Edema Present
                                    </Label>
                                </div>
                                {data.has_edema && (
                                    <div className="space-y-2 pl-6">
                                        <Label htmlFor="edema_grade">
                                            Edema Grade
                                        </Label>
                                        <Select
                                            value={data.edema_grade}
                                            onValueChange={(value) =>
                                                setData('edema_grade', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="+1">
                                                    +1 (Mild - feet/ankles)
                                                </SelectItem>
                                                <SelectItem value="+2">
                                                    +2 (Moderate - lower legs)
                                                </SelectItem>
                                                <SelectItem value="+3">
                                                    +3 (Severe - generalized)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.edema_grade && (
                                            <p className="text-sm text-destructive">
                                                {errors.edema_grade}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has_disability"
                                        checked={data.has_disability}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'has_disability',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="has_disability"
                                        className="text-sm leading-none font-medium"
                                    >
                                        Child has Disability
                                    </Label>
                                </div>
                                {data.has_disability && (
                                    <div className="space-y-2 pl-6">
                                        <Label htmlFor="disability_notes">
                                            Disability Details
                                        </Label>
                                        <Textarea
                                            id="disability_notes"
                                            rows={2}
                                            value={data.disability_notes}
                                            onChange={(e) =>
                                                setData(
                                                    'disability_notes',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Describe the disability..."
                                        />
                                        {errors.disability_notes && (
                                            <p className="text-sm text-destructive">
                                                {errors.disability_notes}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <Label htmlFor="notes">Additional Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={3}
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
