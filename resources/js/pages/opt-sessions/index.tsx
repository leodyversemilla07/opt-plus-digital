import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Eye, Plus } from 'lucide-react';

interface OptSession {
    id: string;
    name: string;
    session_date: string;
    start_date: string | null;
    end_date: string | null;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    target_children: number;
    measured_children: number;
    coverage_percentage: number;
    barangay: {
        id: string;
        name: string;
    };
    created_by: {
        id: number;
        name: string;
    };
}

interface Props {
    sessions: {
        data: OptSession[];
        current_page: number;
        last_page: number;
        total: number;
    };
    years: number[];
    filters: {
        status?: string;
        year?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'OPT Sessions', href: '/opt-sessions' },
];

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function Index({ sessions, years, filters }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(
            '/opt-sessions',
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OPT Sessions" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            OPT Sessions
                        </h1>
                        <p className="text-muted-foreground">
                            Manage Operation Timbang Plus weighing sessions
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/opt-sessions/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Session
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="w-48">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Statuses
                                        </SelectItem>
                                        <SelectItem value="scheduled">
                                            Scheduled
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            In Progress
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            Completed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32">
                                <Select
                                    value={filters.year || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('year', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Years
                                        </SelectItem>
                                        {years.map((year) => (
                                            <SelectItem
                                                key={year}
                                                value={year.toString()}
                                            >
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sessions Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Barangay</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">
                                        Target
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Measured
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Coverage
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center py-8"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Calendar className="h-8 w-8 text-muted-foreground" />
                                                <p className="text-muted-foreground">
                                                    No OPT sessions found
                                                </p>
                                                <Button asChild variant="outline">
                                                    <Link href="/opt-sessions/create">
                                                        Create your first session
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.data.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-medium">
                                                {session.name}
                                            </TableCell>
                                            <TableCell>
                                                {session.barangay.name}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    session.session_date
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        statusColors[session.status]
                                                    }
                                                >
                                                    {statusLabels[session.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {session.target_children}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {session.measured_children}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span
                                                    className={
                                                        session.coverage_percentage >=
                                                        80
                                                            ? 'text-green-600 font-medium'
                                                            : session.coverage_percentage >=
                                                              50
                                                            ? 'text-yellow-600'
                                                            : 'text-red-600'
                                                    }
                                                >
                                                    {session.coverage_percentage.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/opt-sessions/${session.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination info */}
                {sessions.total > 0 && (
                    <div className="text-sm text-muted-foreground text-center">
                        Showing {sessions.data.length} of {sessions.total} sessions
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
