import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import {
    Calendar,
    CheckCheck,
    Eye,
    Play,
    Plus,
    SquareX,
    X,
} from 'lucide-react';
import { useState } from 'react';

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
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function Index({ sessions, years, filters }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<
        'start' | 'complete' | 'cancel' | null
    >(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        // Clear selection when filters change
        setSelectedIds(new Set());
        router.get(
            '/opt-sessions',
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true },
        );
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedIds(next);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sessions.data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sessions.data.map((s) => s.id)));
        }
    };

    const handleBatchAction = (action: 'start' | 'complete' | 'cancel') => {
        setConfirmAction(action);
    };

    const executeBatchAction = () => {
        if (selectedIds.size === 0 || !confirmAction) return;

        setIsProcessing(true);

        const routeMap = {
            start: '/opt-sessions/batch/start',
            complete: '/opt-sessions/batch/complete',
            cancel: '/opt-sessions/batch/cancel',
        };

        router.post(
            routeMap[confirmAction],
            { ids: Array.from(selectedIds) },
            {
                preserveState: true,
                onFinish: () => {
                    setIsProcessing(false);
                    setConfirmAction(null);
                    setSelectedIds(new Set());
                },
            },
        );
    };

    const confirmTitle = {
        start: 'Batch Start Sessions',
        complete: 'Batch Complete Sessions',
        cancel: 'Batch Cancel Sessions',
    };

    const confirmDescription = {
        start: `Are you sure you want to start ${selectedIds.size} scheduled session(s)? Only sessions in "scheduled" status will be affected.`,
        complete: `Are you sure you want to complete ${selectedIds.size} in-progress session(s)? Only sessions in "in progress" status will be affected.`,
        cancel: `Are you sure you want to cancel ${selectedIds.size} session(s)? Completed sessions will be skipped.`,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="OPT Sessions" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            OPT Sessions
                        </h1>
                        <p className="text-muted-foreground">
                            Manage Operation Timbang Plus weighing sessions
                        </p>
                    </div>
                    <Button render={<Link href="/opt-sessions/create" />}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Session
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
                                        handleFilterChange('status', value ?? '')
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
                                        handleFilterChange('year', value ?? '')
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

                {/* Batch Action Bar */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
                        <span className="text-sm font-medium">
                            {selectedIds.size} session{selectedIds.size === 1 ? '' : 's'} selected
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleBatchAction('start')}
                                disabled={isProcessing}
                            >
                                <Play className="mr-1.5 h-4 w-4" />
                                Batch Start
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleBatchAction('complete')}
                                disabled={isProcessing}
                            >
                                <CheckCheck className="mr-1.5 h-4 w-4" />
                                Batch Complete
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBatchAction('cancel')}
                                disabled={isProcessing}
                            >
                                <SquareX className="mr-1.5 h-4 w-4" />
                                Batch Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds(new Set())}
                                disabled={isProcessing}
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Sessions Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={
                                                sessions.data.length > 0 &&
                                                selectedIds.size ===
                                                    sessions.data.length
                                            }
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
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
                                            colSpan={9}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Calendar className="h-8 w-8 text-muted-foreground/50" />
                                                <p>No OPT sessions found</p>
                                                <Button
                                                    render={<Link href="/opt-sessions/create" />}
                                                    variant="outline"
                                                >
                                                    Create your first
                                                    session
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.data.map((session) => (
                                        <TableRow
                                            key={session.id}
                                            className={
                                                selectedIds.has(session.id)
                                                    ? 'bg-accent/50'
                                                    : ''
                                            }
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.has(
                                                        session.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleSelect(
                                                            session.id,
                                                        )
                                                    }
                                                    aria-label={`Select ${session.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {session.name}
                                            </TableCell>
                                            <TableCell>
                                                {session.barangay.name}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(
                                                    session.session_date,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        statusColors[
                                                            session.status
                                                        ]
                                                    }
                                                >
                                                    {
                                                        statusLabels[
                                                            session.status
                                                        ]
                                                    }
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
                                                            ? 'font-medium text-green-600 dark:text-green-400'
                                                            : session.coverage_percentage >=
                                                                50
                                                              ? 'text-yellow-600 dark:text-yellow-400'
                                                              : 'text-red-600 dark:text-red-400'
                                                    }
                                                >
                                                    {session.coverage_percentage.toFixed(
                                                        1,
                                                    )}
                                                    %
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    render={<Link
                                                        href={`/opt-sessions/${session.id}`}
                                                    />}
                                                >
                                                    <Eye className="h-4 w-4" />
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
                    <div className="text-center text-sm text-muted-foreground">
                        Showing {sessions.data.length} of {sessions.total}{' '}
                        sessions
                    </div>
                )}

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmAction !== null}
                    onOpenChange={() => setConfirmAction(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {confirmAction
                                    ? confirmTitle[confirmAction]
                                    : 'Confirm'}
                            </DialogTitle>
                            <DialogDescription>
                                {confirmAction
                                    ? confirmDescription[confirmAction]
                                    : ''}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setConfirmAction(null)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={
                                    confirmAction === 'cancel'
                                        ? 'destructive'
                                        : 'default'
                                }
                                onClick={executeBatchAction}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Confirm'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
