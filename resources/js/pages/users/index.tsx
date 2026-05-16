import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    toggleStatus,
    create as usersCreate,
    destroy as usersDestroy,
    edit as usersEdit,
    index as usersIndex,
    show as usersShow,
} from '@/routes/users/index';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Plus, Power, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/users',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    email_verified_at: string | null;
    created_at: string;
    roles: Array<{ id: number; name: string }>;
    barangay: { id: number; name: string; municipality_city: string } | null;
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
    const [role, setRole] = useState(filters.role || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const handleSearch = () => {
        router.get(
            usersIndex.url(),
            {
                search,
                role: role !== 'all' ? role : undefined,
                status: status !== 'all' ? status : undefined,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        setUserToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(usersDestroy.url(userToDelete));
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const handleToggleStatus = (id: number) => {
        router.post(toggleStatus.url(id));
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        User Management
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Manage system users and their roles
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Link href={usersCreate.url()}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add User
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <form
                            onSubmit={handleSearch}
                            className="mb-6 space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select
                                    value={role}
                                    onValueChange={(value) =>
                                        setRole(value ?? '')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Roles
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                        <SelectItem value="municipal">
                                            Municipal
                                        </SelectItem>
                                        <SelectItem value="bns">BNS</SelectItem>
                                        <SelectItem value="bhw">BHW</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={status}
                                    onValueChange={(value) =>
                                        setStatus(value ?? '')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
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
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-muted-foreground"
                                            >
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
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
                                                            <div className="font-medium">
                                                                {
                                                                    user
                                                                        .barangay
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                {
                                                                    user
                                                                        .barangay
                                                                        .municipality_city
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            N/A
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            user.is_active
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {user.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={usersShow.url(
                                                                user.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={usersEdit.url(
                                                                user.id,
                                                            )}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    user.id,
                                                                )
                                                            }
                                                            title={
                                                                user.is_active
                                                                    ? 'Deactivate'
                                                                    : 'Activate'
                                                            }
                                                        >
                                                            <Power
                                                                className={`h-4 w-4 ${user.is_active ? 'text-green-500' : 'text-muted-foreground'}`}
                                                            />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    user.id,
                                                                )
                                                            }
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
                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing{' '}
                                {(users.current_page - 1) * users.per_page + 1}{' '}
                                to{' '}
                                {Math.min(
                                    users.current_page * users.per_page,
                                    users.total,
                                )}{' '}
                                of {users.total} users
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user? This
                            action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
