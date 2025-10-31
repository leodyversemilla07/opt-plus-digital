import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';

interface Barangay {
    id: string;
    name: string;
    municipality: string;
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

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link href="/children">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Register New Child
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Fill in the child's information below
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit}>
                        <div className="space-y-6 rounded-lg bg-white p-6 shadow">
                            {/* Child Information */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Child Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="family_serial_number">
                                            Family Serial Number{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="family_serial_number"
                                            value={data.family_serial_number}
                                            onChange={(e) =>
                                                setData(
                                                    'family_serial_number',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        {errors.family_serial_number && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.family_serial_number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="first_name">
                                            First Name{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="first_name"
                                            value={data.first_name}
                                            onChange={(e) =>
                                                setData(
                                                    'first_name',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="middle_name">
                                            Middle Name
                                        </Label>
                                        <Input
                                            id="middle_name"
                                            value={data.middle_name}
                                            onChange={(e) =>
                                                setData(
                                                    'middle_name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="last_name">
                                            Last Name{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) =>
                                                setData(
                                                    'last_name',
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="suffix">Suffix</Label>
                                        <Input
                                            id="suffix"
                                            value={data.suffix}
                                            onChange={(e) =>
                                                setData('suffix', e.target.value)
                                            }
                                            placeholder="Jr., Sr., III, etc."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="sex">
                                            Sex{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.sex}
                                            onValueChange={(value) =>
                                                setData('sex', value)
                                            }
                                        >
                                            <SelectTrigger>
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
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.sex}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="date_of_birth">
                                            Date of Birth{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="date_of_birth"
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) =>
                                                setData(
                                                    'date_of_birth',
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
                                        {errors.date_of_birth && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.date_of_birth}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="birth_weight_kg">
                                            Birth Weight (kg)
                                        </Label>
                                        <Input
                                            id="birth_weight_kg"
                                            type="number"
                                            step="0.01"
                                            value={data.birth_weight_kg}
                                            onChange={(e) =>
                                                setData(
                                                    'birth_weight_kg',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="2.5"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="birth_length_cm">
                                            Birth Length (cm)
                                        </Label>
                                        <Input
                                            id="birth_length_cm"
                                            type="number"
                                            step="0.1"
                                            value={data.birth_length_cm}
                                            onChange={(e) =>
                                                setData(
                                                    'birth_length_cm',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="48.0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Address
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="barangay_id">
                                            Barangay{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.barangay_id}
                                            onValueChange={(value) =>
                                                setData('barangay_id', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select barangay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {barangays.map((barangay) => (
                                                    <SelectItem
                                                        key={barangay.id}
                                                        value={barangay.id}
                                                    >
                                                        {barangay.name},{' '}
                                                        {barangay.municipality}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.barangay_id && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.barangay_id}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="purok_sitio">
                                            Purok/Sitio
                                        </Label>
                                        <Input
                                            id="purok_sitio"
                                            value={data.purok_sitio}
                                            onChange={(e) =>
                                                setData(
                                                    'purok_sitio',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Purok 1"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Parents/Guardian */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Parents/Guardian Information
                                </h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="mother_name">
                                            Mother's Name
                                        </Label>
                                        <Input
                                            id="mother_name"
                                            value={data.mother_name}
                                            onChange={(e) =>
                                                setData(
                                                    'mother_name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="father_name">
                                            Father's Name
                                        </Label>
                                        <Input
                                            id="father_name"
                                            value={data.father_name}
                                            onChange={(e) =>
                                                setData(
                                                    'father_name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="guardian_name">
                                            Guardian's Name (if applicable)
                                        </Label>
                                        <Input
                                            id="guardian_name"
                                            value={data.guardian_name}
                                            onChange={(e) =>
                                                setData(
                                                    'guardian_name',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="guardian_relationship">
                                            Guardian Relationship
                                        </Label>
                                        <Input
                                            id="guardian_relationship"
                                            value={data.guardian_relationship}
                                            onChange={(e) =>
                                                setData(
                                                    'guardian_relationship',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Grandmother, Aunt, etc."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="contact_number">
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contact_number"
                                            value={data.contact_number}
                                            onChange={(e) =>
                                                setData(
                                                    'contact_number',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="09XX XXX XXXX"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Indigenous People */}
                            <div>
                                <h2 className="mb-4 text-lg font-semibold">
                                    Additional Information
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_indigenous_people"
                                            checked={data.is_indigenous_people}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_indigenous_people',
                                                    checked as boolean
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_indigenous_people">
                                            Indigenous People
                                        </Label>
                                    </div>

                                    {data.is_indigenous_people && (
                                        <div>
                                            <Label htmlFor="indigenous_group">
                                                Indigenous Group/Tribe
                                            </Label>
                                            <Input
                                                id="indigenous_group"
                                                value={data.indigenous_group}
                                                onChange={(e) =>
                                                    setData(
                                                        'indigenous_group',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Lumad, Mangyan, etc."
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            rows={3}
                                            placeholder="Additional notes or remarks..."
                                        />
                                    </div>
                                </div>
                            </div>

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
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
