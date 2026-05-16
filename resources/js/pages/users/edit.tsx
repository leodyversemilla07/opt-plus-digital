import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import AppLayout from '@/layouts/app-layout';
import {
    index as usersIndex,
    update as usersUpdate,
} from '@/routes/users/index';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, UserCog } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    barangay_id: number | null;
    is_active: boolean;
}

interface Barangay {
    id: number;
    name: string;
    municipality_city: string;
}

interface Props {
    user: User;
    currentRole: string;
    roles: Record<number, string>;
    barangays: Barangay[];
}

export default function Edit({ user, currentRole, roles, barangays }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        phone: user.phone || '',
        barangay_id: user.barangay_id?.toString() || '',
        role: currentRole,
        is_active: user.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(usersUpdate.url(user.id));
    };

    return (
        <AppLayout>
            <Head title="Edit User" />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-3xl">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCog className="h-6 w-6" />
                                        Edit User
                                    </CardTitle>
                                    <CardDescription>
                                        Update user information and permissions
                                    </CardDescription>
                                </div>
                                <Link href={usersIndex.url()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                <FieldGroup>
                                    {/* Name */}
                                    <Field>
                                        <FieldLabel htmlFor="name">
                                            Full Name *
                                        </FieldLabel>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.name && (
                                            <FieldDescription className="text-red-500">
                                                {errors.name}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel htmlFor="email">
                                            Email Address *
                                        </FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            required
                                        />
                                        {errors.email && (
                                            <FieldDescription className="text-red-500">
                                                {errors.email}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Password */}
                                    <Field>
                                        <FieldLabel htmlFor="password">
                                            New Password (Optional)
                                        </FieldLabel>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Leave blank to keep current password"
                                        />
                                        <FieldDescription>
                                            Leave blank to keep the current
                                            password
                                        </FieldDescription>
                                        {errors.password && (
                                            <FieldDescription className="text-red-500">
                                                {errors.password}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="password_confirmation">
                                            Confirm New Password
                                        </FieldLabel>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Confirm new password"
                                        />
                                    </Field>

                                    {/* Phone */}
                                    <Field>
                                        <FieldLabel htmlFor="phone">
                                            Phone Number
                                        </FieldLabel>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="09XX XXX XXXX"
                                        />
                                        {errors.phone && (
                                            <FieldDescription className="text-red-500">
                                                {errors.phone}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Role */}
                                    <Field>
                                        <FieldLabel htmlFor="role">
                                            Role *
                                        </FieldLabel>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) =>
                                                setData('role', value ?? '')
                                            }
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(roles).map(
                                                    ([id, name]) => (
                                                        <SelectItem
                                                            key={id}
                                                            value={name}
                                                        >
                                                            {name.toUpperCase()}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.role && (
                                            <FieldDescription className="text-red-500">
                                                {errors.role}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Barangay */}
                                    <Field>
                                        <FieldLabel htmlFor="barangay_id">
                                            Barangay (Optional)
                                        </FieldLabel>
                                        <Select
                                            value={data.barangay_id || 'none'}
                                            onValueChange={(value) =>
                                                setData(
                                                    'barangay_id',
                                                    value === 'none'
                                                        ? ''
                                                        : (value ?? ''),
                                                )
                                            }
                                        >
                                            <SelectTrigger id="barangay_id">
                                                <SelectValue placeholder="Select a barangay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">
                                                    None
                                                </SelectItem>
                                                {barangays.map((barangay) => (
                                                    <SelectItem
                                                        key={barangay.id}
                                                        value={barangay.id.toString()}
                                                    >
                                                        {barangay.name} -{' '}
                                                        {
                                                            barangay.municipality_city
                                                        }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldDescription>
                                            Assign a barangay if user role
                                            requires it
                                        </FieldDescription>
                                        {errors.barangay_id && (
                                            <FieldDescription className="text-red-500">
                                                {errors.barangay_id}
                                            </FieldDescription>
                                        )}
                                    </Field>

                                    {/* Active Status */}
                                    <Field orientation="horizontal">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <FieldLabel
                                            htmlFor="is_active"
                                            className="cursor-pointer font-normal"
                                        >
                                            Account is active
                                        </FieldLabel>
                                    </Field>
                                </FieldGroup>

                                {/* Submit Buttons */}
                                <Field orientation="horizontal">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Updating...'
                                            : 'Update User'}
                                    </Button>
                                    <Link href={usersIndex.url()}>
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                </Field>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
