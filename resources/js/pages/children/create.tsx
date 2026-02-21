import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
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
import { FormEventHandler } from 'react';

interface Barangay {
    id: string;
    name: string;
    municipality_city: string;
    province: string;
}

interface Props {
    barangays: Barangay[];
}

export default function Create({ barangays }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        family_serial_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: '',
        date_of_birth: '',
        birth_weight_kg: '',
        birth_length_cm: '',
        barangay_id: '',
        purok_sitio: '',
        mother_name: '',
        father_name: '',
        guardian_name: '',
        guardian_relationship: '',
        contact_number: '',
        is_indigenous_people: false,
        indigenous_group: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/children');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Children Registry', href: '/children' },
        { title: 'Register New Child', href: '/children/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Register Child" />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-4xl">
                    {/* Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Child Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Child Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="family_serial_number">
                                            Family Serial Number{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="family_serial_number"
                                            value={data.family_serial_number}
                                            onChange={(e) =>
                                                setData(
                                                    'family_serial_number',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.family_serial_number && (
                                            <FieldDescription className="text-red-500">
                                                {errors.family_serial_number}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="first_name">
                                            First Name{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    'first_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.first_name && (
                                            <FieldDescription className="text-red-500">
                                                {errors.first_name}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="middle_name">
                                            Middle Name
                                        </FieldLabel>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={(e) =>
                                                setData(
                                                    'middle_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="last_name">
                                            Last Name{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    'last_name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.last_name && (
                                            <FieldDescription className="text-red-500">
                                                {errors.last_name}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="suffix">
                                            Suffix
                                        </FieldLabel>
                                        <Input
                                            id="suffix"
                                            value={data.suffix}
                                            onChange={(e) =>
                                                setData(
                                                    'suffix',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Jr., Sr., III, etc."
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="sex">
                                            Sex{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Select
                                            value={data.sex}
                                            onValueChange={(value) =>
                                                setData('sex', value)
                                            }
                                        >
                                            <SelectTrigger id="sex">
                                                <SelectValue placeholder="Select sex" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="female">
                                                    Female
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.sex && (
                                            <FieldDescription className="text-red-500">
                                                {errors.sex}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="date_of_birth">
                                            Date of Birth{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) =>
                                                setData(
                                                    'date_of_birth',
                                                    e.target.value,
                                                )
                                            }
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split('T')[0]
                                            }
                                            required
                                        />
                                        {errors.date_of_birth && (
                                            <FieldDescription className="text-red-500">
                                                {errors.date_of_birth}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="birth_weight_kg">
                                            Birth Weight (kg)
                                        </FieldLabel>
                                        <Input
                                            id="birth_weight_kg"
                                            type="number"
                                            step="0.01"
                                            value={data.birth_weight_kg}
                                            onChange={(e) =>
                                                setData(
                                                    'birth_weight_kg',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="2.5"
                                        />
                                        <FieldDescription>
                                            Optional: Weight at birth
                                        </FieldDescription>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="birth_length_cm">
                                            Birth Length (cm)
                                        </FieldLabel>
                                        <Input
                                            id="birth_length_cm"
                                            type="number"
                                            step="0.1"
                                            value={data.birth_length_cm}
                                            onChange={(e) =>
                                                setData(
                                                    'birth_length_cm',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="48.0"
                                        />
                                        <FieldDescription>
                                            Optional: Length at birth
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Address</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="barangay_id">
                                            Barangay{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Select
                                            value={data.barangay_id}
                                            onValueChange={(value) =>
                                                setData('barangay_id', value)
                                            }
                                        >
                                            <SelectTrigger id="barangay_id">
                                                <SelectValue placeholder="Select barangay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {barangays.map((barangay) => (
                                                    <SelectItem
                                                        key={barangay.id}
                                                        value={barangay.id}
                                                    >
                                                        {barangay.name},{' '}
                                                        {
                                                            barangay.municipality_city
                                                        }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.barangay_id && (
                                            <FieldDescription className="text-red-500">
                                                {errors.barangay_id}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="purok_sitio">
                                            Purok/Sitio
                                        </FieldLabel>
                                        <Input
                                            id="purok_sitio"
                                            value={data.purok_sitio}
                                            onChange={(e) =>
                                                setData(
                                                    'purok_sitio',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Purok 1"
                                        />
                                        <FieldDescription>
                                            Specify the purok or sitio within
                                            the barangay
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Parents/Guardian */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Parents/Guardian Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="mother_name">
                                            Mother's Name
                                        </FieldLabel>
                                        <Input
                                            id="mother_name"
                                            value={data.mother_name}
                                            onChange={(e) =>
                                                setData(
                                                    'mother_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="father_name">
                                            Father's Name
                                        </FieldLabel>
                                        <Input
                                            id="father_name"
                                            value={data.father_name}
                                            onChange={(e) =>
                                                setData(
                                                    'father_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="guardian_name">
                                            Guardian's Name (if applicable)
                                        </FieldLabel>
                                        <Input
                                            id="guardian_name"
                                            value={data.guardian_name}
                                            onChange={(e) =>
                                                setData(
                                                    'guardian_name',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="guardian_relationship">
                                            Guardian Relationship
                                        </FieldLabel>
                                        <Input
                                            id="guardian_relationship"
                                            value={data.guardian_relationship}
                                            onChange={(e) =>
                                                setData(
                                                    'guardian_relationship',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Grandmother, Aunt, etc."
                                        />
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="contact_number">
                                            Contact Number
                                        </FieldLabel>
                                        <Input
                                            id="contact_number"
                                            value={data.contact_number}
                                            onChange={(e) =>
                                                setData(
                                                    'contact_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="09XX XXX XXXX"
                                        />
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Indigenous People */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FieldGroup>
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="is_indigenous_people"
                                            checked={data.is_indigenous_people}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_indigenous_people',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <FieldLabel
                                            htmlFor="is_indigenous_people"
                                            className="font-normal"
                                        >
                                            Indigenous People
                                        </FieldLabel>
                                    </Field>

                                    {data.is_indigenous_people && (
                                        <Field>
                                            <FieldLabel htmlFor="indigenous_group">
                                                Indigenous Group/Tribe
                                            </FieldLabel>
                                            <Input
                                                id="indigenous_group"
                                                value={data.indigenous_group}
                                                onChange={(e) =>
                                                    setData(
                                                        'indigenous_group',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g., Lumad, Mangyan, etc."
                                            />
                                        </Field>
                                    )}

                                    <Field>
                                        <FieldLabel htmlFor="notes">
                                            Notes
                                        </FieldLabel>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            rows={3}
                                            placeholder="Additional notes or remarks..."
                                        />
                                        <FieldDescription>
                                            Any additional information about the
                                            child
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex justify-end gap-2">
                            <Link href="/children">
                                <Button variant="outline" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Registering...'
                                    : 'Register Child'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
