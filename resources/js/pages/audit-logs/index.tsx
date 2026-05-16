import {
    Badge,
    type BadgeProps,
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    index as auditLogsIndex,
    show as auditLogsShow,
} from '@/routes/audit-logs/index';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    Filter,
    History,
    Search,
    Shield,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: '/audit-logs',
    },
];

interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, unknown> | null;
    new_values: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
}

interface Props {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    actions: string[];
    types: string[];
    filters: {
        search?: string;
        action?: string;
        type?: string;
        user_id?: string;
        from?: string;
        until?: string;
    };
}

function actionBadgeVariant(action: string): BadgeProps['variant'] {
    switch (action) {
        case 'created':
            return 'default';
        case 'updated':
            return 'secondary';
        case 'deleted':
            return 'destructive';
        default:
            return 'outline';
    }
}

function friendlyModelName(type: string): string {
    const parts = type.split('\\');
    return parts[parts.length - 1] ?? type;
}

function timeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function AuditLogsIndex({ logs, actions, types, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [fromDate, setFromDate] = useState(filters.from || '');
    const [untilDate, setUntilDate] = useState(filters.until || '');

    const applyFilters = () => {
        router.get(
            auditLogsIndex.url(),
            {
                search: search || undefined,
                action: actionFilter !== 'all' ? actionFilter : undefined,
                type: typeFilter !== 'all' ? typeFilter : undefined,
                from: fromDate || undefined,
                until: untilDate || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setActionFilter('all');
        setTypeFilter('all');
        setFromDate('');
        setUntilDate('');
        router.get(auditLogsIndex.url(), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters =
        search || actionFilter !== 'all' || typeFilter !== 'all' || fromDate || untilDate;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <History className="h-6 w-6" />
                            Audit Logs
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Track all changes made across the system
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {logs.total} log{logs.total === 1 ? '' : 's'}
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-3 p-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search action, model, IP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="w-[160px]">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Action
                            </label>
                            <Select
                                value={actionFilter}
                                onValueChange={setActionFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All actions</SelectItem>
                                    {actions.map((act) => (
                                        <SelectItem key={act} value={act}>
                                            {act.charAt(0).toUpperCase() + act.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[200px]">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Model Type
                            </label>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All types</SelectItem>
                                    {types.map((typ) => (
                                        <SelectItem key={typ} value={typ}>
                                            {friendlyModelName(typ)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[160px]">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                From
                            </label>
                            <Input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="w-[160px]">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Until
                            </label>
                            <Input
                                type="date"
                                value={untilDate}
                                onChange={(e) => setUntilDate(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={applyFilters} size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Logs Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>IP Address</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            <History className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                            <p>No audit logs found</p>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="mt-1"
                                                >
                                                    Clear filters
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant={actionBadgeVariant(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {friendlyModelName(log.auditable_type)}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        #{log.auditable_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {log.user?.name ?? 'System'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    {log.ip_address ?? '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm" title={log.created_at}>
                                                        {timeAgo(log.created_at)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={auditLogsShow.url({ audit_log: log.id })}
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

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {logs.current_page} of {logs.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {logs.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(logs.prev_page_url!, {
                                                    preserveState: true,
                                                })
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {logs.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(logs.next_page_url!, {
                                                    preserveState: true,
                                                })
                                            }
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
