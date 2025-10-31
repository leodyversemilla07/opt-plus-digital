import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';

interface Child {
    id: string;
    family_serial_number: string;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    name_extension: string | null;
    sex: 'male' | 'female';
    date_of_birth: string;
    place_of_birth: string | null;
    barangay_id: string;
    purok: string | null;
    address_details: string | null;
    mother_name: string | null;
    father_name: string | null;
    guardian_name: string | null;
    is_indigenous_people: boolean;
    indigenous_people_group: string | null;
    qr_code: string | null;
}

interface Barangay {
    id: string;
    name: string;
    municipality: string;
}

interface Props {
    child: Child;
    barangays: Barangay[];
}

export default function Edit({ child, barangays }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        family_serial_number: child.family_serial_number,
        last_name: child.last_name,
        first_name: child.first_name,
        middle_name: child.middle_name || '',
        name_extension: child.name_extension || '',
        sex: child.sex,
        date_of_birth: child.date_of_birth,
        place_of_birth: child.place_of_birth || '',
        barangay_id: child.barangay_id,
        purok: child.purok || '',
        address_details: child.address_details || '',
        mother_name: child.mother_name || '',
        father_name: child.father_name || '',
        guardian_name: child.guardian_name || '',
        is_indigenous_people: child.is_indigenous_people,
        indigenous_people_group: child.indigenous_people_group || '',
        qr_code: child.qr_code || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/children/${child.id}`);
    };

    const selectedBarangay = barangays.find((b) => b.id === data.barangay_id);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: `${child.first_name} ${child.last_name}`, href: `/children/${child.id}` },
        { title: 'Edit', href: `/children/${child.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Child - ${child.first_name} ${child.last_name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Edit Child Information
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Update child registration details
                            </p>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="space-y-6">
                            {/* Child Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Child Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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

                                    <div className="grid gap-4 md:grid-cols-2">
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
                                            <Label htmlFor="name_extension">
                                                Name Extension
                                            </Label>
                                            <Input
                                                id="name_extension"
                                                value={data.name_extension}
                                                onChange={(e) =>
                                                    setData(
                                                        'name_extension',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Jr., Sr., III"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
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
                                                    setData(
                                                        'sex',
                                                        value as
                                                            | 'male'
                                                            | 'female'
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
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
                                    </div>

                                    <div>
                                        <Label htmlFor="place_of_birth">
                                            Place of Birth
                                        </Label>
                                        <Input
                                            id="place_of_birth"
                                            value={data.place_of_birth}
                                            onChange={(e) =>
                                                setData(
                                                    'place_of_birth',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Address</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                                        {barangay.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedBarangay && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Municipality:{' '}
                                                {selectedBarangay.municipality}
                                            </p>
                                        )}
                                        {errors.barangay_id && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {errors.barangay_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="purok">Purok</Label>
                                            <Input
                                                id="purok"
                                                value={data.purok}
                                                onChange={(e) =>
                                                    setData(
                                                        'purok',
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="address_details">
                                                Address Details
                                            </Label>
                                            <Input
                                                id="address_details"
                                                value={data.address_details}
                                                onChange={(e) =>
                                                    setData(
                                                        'address_details',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="House number, street, etc."
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Parents/Guardian */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Parents/Guardian</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="mother_name">
                                                Mother's Full Name
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
                                                Father's Full Name
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
                                    </div>

                                    <div>
                                        <Label htmlFor="guardian_name">
                                            Guardian's Full Name (if
                                            applicable)
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
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Additional Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                            <Label htmlFor="indigenous_people_group">
                                                Indigenous People Group{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="indigenous_people_group"
                                                value={
                                                    data.indigenous_people_group
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'indigenous_people_group',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="e.g., Manobo, Ata, Bagobo"
                                                required={
                                                    data.is_indigenous_people
                                                }
                                            />
                                            {errors.indigenous_people_group && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {
                                                        errors.indigenous_people_group
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="qr_code">QR Code</Label>
                                        <Input
                                            id="qr_code"
                                            value={data.qr_code}
                                            onChange={(e) =>
                                                setData('qr_code', e.target.value)
                                            }
                                            placeholder="Auto-generated or manual"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Leave blank to auto-generate
                                        </p>
                                    </div>
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
                                        ? 'Updating...'
                                        : 'Update Child'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
