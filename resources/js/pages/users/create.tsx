import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { index as usersIndex, store as usersStore } from '@/routes/users/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

interface Barangay {
  id: number;
  name: string;
  municipality_city: string;
}

interface Props {
  roles: Record<number, string>;
  barangays: Barangay[];
}

export default function Create({ roles, barangays }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    barangay_id: '',
    role: '',
    is_active: true,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(usersStore.url());
  };  return (
    <AppLayout>
      <Head title="Create User" />

      <div className="flex flex-col gap-6 p-6">
        <div className="max-w-3xl w-full mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-6 w-6" />
                    Create New User
                  </CardTitle>
                  <CardDescription>Add a new user to the system</CardDescription>
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
                    <FieldLabel htmlFor="name">Full Name *</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      required
                      autoFocus
                    />
                    {errors.name && (
                      <FieldDescription className="text-red-500">{errors.name}</FieldDescription>
                    )}
                  </Field>

                  {/* Email */}
                  <Field>
                    <FieldLabel htmlFor="email">Email Address *</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                    />
                    {errors.email && (
                      <FieldDescription className="text-red-500">{errors.email}</FieldDescription>
                    )}
                  </Field>

                  {/* Password */}
                  <Field>
                    <FieldLabel htmlFor="password">Password *</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                    />
                    <FieldDescription>Must be at least 8 characters long</FieldDescription>
                    {errors.password && (
                      <FieldDescription className="text-red-500">{errors.password}</FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password_confirmation">Confirm Password *</FieldLabel>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      required
                    />
                  </Field>

                  {/* Phone */}
                  <Field>
                    <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                    <Input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      placeholder="09XX XXX XXXX"
                    />
                    {errors.phone && (
                      <FieldDescription className="text-red-500">{errors.phone}</FieldDescription>
                    )}
                  </Field>

                  {/* Role */}
                  <Field>
                    <FieldLabel htmlFor="role">Role *</FieldLabel>
                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roles).map(([id, name]) => (
                          <SelectItem key={id} value={name}>
                            {name.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Assign user role and permissions</FieldDescription>
                    {errors.role && (
                      <FieldDescription className="text-red-500">{errors.role}</FieldDescription>
                    )}
                  </Field>

                  {/* Barangay */}
                  <Field>
                    <FieldLabel htmlFor="barangay_id">Barangay (Optional)</FieldLabel>
                    <Select
                      value={data.barangay_id || 'none'}
                      onValueChange={(value) => setData('barangay_id', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger id="barangay_id">
                        <SelectValue placeholder="Select a barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {barangays.map((barangay) => (
                          <SelectItem key={barangay.id} value={barangay.id.toString()}>
                            {barangay.name} - {barangay.municipality_city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Required for BHW and BNS roles</FieldDescription>
                    {errors.barangay_id && (
                      <FieldDescription className="text-red-500">{errors.barangay_id}</FieldDescription>
                    )}
                  </Field>

                  {/* Active Status */}
                  <Field orientation="horizontal">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                    />
                    <FieldLabel htmlFor="is_active" className="font-normal">
                      Account is active
                    </FieldLabel>
                  </Field>
                </FieldGroup>

                {/* Submit Buttons */}
                <Field orientation="horizontal">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create User'}
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
