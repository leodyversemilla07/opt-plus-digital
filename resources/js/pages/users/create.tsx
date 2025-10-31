import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Barangay {
  id: number;
  name: string;
  municipality: string;
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

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('users.store'));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Create User" />

      <div className="py-12">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
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
                <Link href={route('users.index')}>
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoFocus
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => setData('phone', e.target.value)}
                    placeholder="09XX XXX XXXX"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                    <SelectTrigger>
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
                  {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                </div>

                {/* Barangay */}
                <div className="space-y-2">
                  <Label htmlFor="barangay_id">Barangay (Optional)</Label>
                  <Select
                    value={data.barangay_id}
                    onValueChange={(value) => setData('barangay_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {barangays.map((barangay) => (
                        <SelectItem key={barangay.id} value={barangay.id.toString()}>
                          {barangay.name} - {barangay.municipality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.barangay_id && (
                    <p className="text-sm text-red-500">{errors.barangay_id}</p>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Account is active
                  </Label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Creating...' : 'Create User'}
                  </Button>
                  <Link href={route('users.index')}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
