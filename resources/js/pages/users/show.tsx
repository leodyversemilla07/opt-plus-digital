import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Edit,
    Mail,
    MapPin,
    Phone,
    Shield,
    XCircle,
} from 'lucide-react';

interface UserShowProps {
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        is_active: boolean;
        barangay: { id: string; name: string } | null;
        roles: Array<{ name: string }>;
    };
    permissions: string[];
}

export default function UserShow({ user, permissions }: UserShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/users' },
        { title: user.name, href: `/users/${user.id}` },
    ];

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-red-500',
            municipal: 'bg-blue-500',
            bns: 'bg-green-500',
            bhw: 'bg-orange-500',
        };
        return (
            <Badge className={colors[role.toLowerCase()] || 'bg-slate-500'}>
                {role.toUpperCase()}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mb-2"
                            asChild
                        >
                            <Link href="/users">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to
                                Users
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                {user.name}
                            </h1>
                            {user.is_active ? (
                                <Badge className="border-green-200 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            {user.roles.map((role) => (
                                <span key={role.name}>
                                    {getRoleBadge(role.name)}
                                </span>
                            ))}
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={`/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-muted p-2">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-medium">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-muted p-2">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-medium">
                                        {user.phone || 'Not provided'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-muted p-2">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">
                                        Assigned Barangay
                                    </span>
                                    <span className="text-sm font-medium">
                                        {user.barangay?.name ||
                                            'Municipality-wide'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Permissions & Access
                            </CardTitle>
                            <CardDescription>
                                Active permissions based on assigned roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                {permissions.length > 0 ? (
                                    permissions.map((permission) => (
                                        <div
                                            key={permission}
                                            className="flex items-center gap-2 rounded-md border p-2 text-sm"
                                        >
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            {permission}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-4 text-center text-muted-foreground">
                                        No specific permissions assigned.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                        <CardDescription>
                            Manage user account availability
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center gap-3">
                                {user.is_active ? (
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                ) : (
                                    <XCircle className="h-10 w-10 text-red-500" />
                                )}
                                <div>
                                    <div className="font-bold">
                                        Account is{' '}
                                        {user.is_active
                                            ? 'Active'
                                            : 'Deactivated'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {user.is_active
                                            ? 'User can log in and perform actions based on their role.'
                                            : 'User access is suspended. They cannot log in to the system.'}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant={
                                    user.is_active ? 'destructive' : 'default'
                                }
                                asChild
                            >
                                <Link
                                    href={`/users/${user.id}/toggle-status`}
                                    method="post"
                                    as="button"
                                >
                                    {user.is_active
                                        ? 'Deactivate Account'
                                        : 'Activate Account'}
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
