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
import { useTranslation } from 'react-i18next';
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

const statusColors: Record<string, string> = {
    scheduled:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Index({ sessions, years, filters }: Props) {
    const { t } = useTranslation();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<
        'start' | 'complete' | 'cancel' | null
    >(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('opt_session.title'), href: '/opt-sessions' },
    ];

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            scheduled: t('opt_session.scheduled'),
            in_progress: t('opt_session.in_progress'),
            completed: t('opt_session.completed'),
            cancelled: t('opt_session.cancelled'),
        };
        return labels[status] || status;
    };

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
        start: t('opt_session.batch_start'),
        complete: t('opt_session.batch_complete'),
        cancel: t('opt_session.batch_cancel'),
    };

    const confirmDescription = {
        start: `Are you sure you want to start ${selectedIds.size} scheduled session(s)? Only sessions in "scheduled" status will be affected.`,
        complete: `Are you sure you want to complete ${selectedIds.size} in-progress session(s)? Only sessions in "in progress" status will be affected.`,
        cancel: `Are you sure you want to cancel ${selectedIds.size} session(s)? Completed sessions will be skipped.`,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('opt_session.title')} />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {t('opt_session.title')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('opt_session.manage_sessions')}
                        </p>
                    </div>
                    <Button render={<Link href="/opt-sessions/create" />}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('opt_session.new_session')}
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('opt_session.filters')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <div className="w-48">
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange(
                                            'status',
                                            value ?? '',
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('common.status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            {t('opt_session.all_statuses')}
                                        </SelectItem>
                                        <SelectItem value="scheduled">
                                            {t('opt_session.scheduled')}
                                        </SelectItem>
                                        <SelectItem value="in_progress">
                                            {t('opt_session.in_progress')}
                                        </SelectItem>
                                        <SelectItem value="completed">
                                            {t('opt_session.completed')}
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            {t('opt_session.cancelled')}
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
                                            {t('opt_session.all_years')}
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
                            {selectedIds.size} {t('opt_session.session')}
                            {selectedIds.size === 1 ? '' : 's'} {t('opt_session.selected')}
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleBatchAction('start')}
                                disabled={isProcessing}
                            >
                                <Play className="mr-1.5 h-4 w-4" />
                                {t('opt_session.batch_start')}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleBatchAction('complete')}
                                disabled={isProcessing}
                            >
                                <CheckCheck className="mr-1.5 h-4 w-4" />
                                {t('opt_session.batch_complete')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBatchAction('cancel')}
                                disabled={isProcessing}
                            >
                                <SquareX className="mr-1.5 h-4 w-4" />
                                {t('opt_session.batch_cancel')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds(new Set())}
                                disabled={isProcessing}
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                {t('opt_session.clear')}
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
                                    <TableHead>{t('opt_session.session')}</TableHead>
                                    <TableHead>{t('opt_session.barangay')}</TableHead>
                                    <TableHead>{t('opt_session.date')}</TableHead>
                                    <TableHead>{t('opt_session.status')}</TableHead>
                                    <TableHead className="text-center">
                                        {t('opt_session.target')}
                                    </TableHead>
                                    <TableHead className="text-center">
                                        {t('opt_session.measured')}
                                    </TableHead>
                                    <TableHead className="text-center">
                                        {t('opt_session.coverage')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('opt_session.actions')}
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
                                                <p>{t('opt_session.no_sessions')}</p>
                                                <Button
                                                    render={
                                                        <Link href="/opt-sessions/create" />
                                                    }
                                                    variant="outline"
                                                >
                                                    {t('opt_session.create_first')}
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
                                                        toggleSelect(session.id)
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
                                                    {getStatusLabel(
                                                        session.status,
                                                    )}
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
                                                <div className="flex items-center justify-end gap-1">
                                                    {session.status === 'scheduled' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    `/opt-sessions/${session.id}/start`,
                                                                    undefined,
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                )
                                                            }
                                                            title="Start session"
                                                        >
                                                            <Play className="h-4 w-4 text-green-600" />
                                                        </Button>
                                                    )}
                                                    {session.status === 'in_progress' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    `/opt-sessions/${session.id}/complete`,
                                                                    undefined,
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                )
                                                            }
                                                            title="Complete session"
                                                        >
                                                            <CheckCheck className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    )}
                                                    {(session.status === 'scheduled' ||
                                                        session.status === 'in_progress') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                router.post(
                                                                    `/opt-sessions/${session.id}/cancel`,
                                                                    undefined,
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                )
                                                            }
                                                            title="Cancel session"
                                                        >
                                                            <SquareX className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        render={
                                                            <Link
                                                                href={`/opt-sessions/${session.id}`}
                                                            />
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                        {t('opt_session.showing')} {sessions.data.length} {t('opt_session.of')} {sessions.total}{' '}
                        {t('opt_session.session')}
                        {sessions.total === 1 ? '' : 's'}
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
                                    : t('opt_session.confirm')}
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
                                {t('opt_session.cancel')}
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
                                {isProcessing ? t('opt_session.processing') : t('opt_session.confirm')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
