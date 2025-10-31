import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Search, Plus, Edit, Trash2, Eye, Power } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  roles: Array<{ id: number; name: string }>;
  barangay: { id: number; name: string; municipality: string } | null;
}

interface Props {
  users: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    role?: string;
    status?: string;
  };
}

export default function Index({ users, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [role, setRole] = useState(filters.role || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('users.index'), { search, role, status }, { preserveState: true });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      router.delete(route('users.destroy', id));
    }
  };

  const handleToggleStatus = (id: number) => {
    router.post(route('users.toggle-status', id));
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500',
      municipal: 'bg-blue-500',
      bns: 'bg-green-500',
      bhw: 'bg-yellow-500',
    };
    return colors[roleName] || 'bg-gray-500';
  };

  return (
    <AuthenticatedLayout>
      <Head title="User Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    Manage system users and their roles
                  </CardDescription>
                </div>
                <Link href={route('users.create')}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <form onSubmit={handleSearch} className="mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="bns">BNS</SelectItem>
                      <SelectItem value="bhw">BHW</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Apply Filters</Button>
              </form>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Barangay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.data.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.roles.map((role) => (
                              <Badge
                                key={role.id}
                                className={`${getRoleBadgeColor(role.name)} text-white`}
                              >
                                {role.name.toUpperCase()}
                              </Badge>
                            ))}
                          </TableCell>
                          <TableCell>
                            {user.barangay ? (
                              <div className="text-sm">
                                <div className="font-medium">{user.barangay.name}</div>
                                <div className="text-gray-500">{user.barangay.municipality}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_active ? 'default' : 'secondary'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={route('users.show', user.id)}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={route('users.edit', user.id)}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(user.id)}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                              >
                                <Power className={`h-4 w-4 ${user.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Info */}
              {users.data.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {(users.current_page - 1) * users.per_page + 1} to{' '}
                  {Math.min(users.current_page * users.per_page, users.total)} of {users.total} users
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
