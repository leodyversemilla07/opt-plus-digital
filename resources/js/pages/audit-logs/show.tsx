import {
    Badge,
    type BadgeProps,
} from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as auditLogsIndex } from '@/routes/audit-logs/index';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Globe,
    History,
    Monitor,
    Shield,
    User,
} from 'lucide-react';

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

interface AuditableModel {
    id: number;
    [key: string]: unknown;
}

interface Props {
    log: AuditLog;
    auditable: AuditableModel | null;
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

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
}

function JsonDiffViewer({
    oldValues,
    newValues,
}: {
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
}) {
    if (!oldValues && !newValues) {
        return (
            <p className="text-sm italic text-muted-foreground">
                No data recorded
            </p>
        );
    }

    const allKeys = new Set([
        ...Object.keys(oldValues ?? {}),
        ...Object.keys(newValues ?? {}),
    ]);

    const ignoredKeys = ['updated_at', 'created_at'];

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-left">
                        <th className="pb-2 pr-4 font-medium text-muted-foreground">
                            Field
                        </th>
                        <th className="pb-2 pr-4 font-medium text-muted-foreground">
                            Old Value
                        </th>
                        <th className="pb-2 font-medium text-muted-foreground">
                            New Value
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(allKeys)
                        .filter((key) => !ignoredKeys.includes(key))
                        .map((key) => {
                            const oldVal = oldValues?.[key];
                            const newVal = newValues?.[key];
                            const changed =
                                JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <tr
                                    key={key}
                                    className={
                                        changed
                                            ? 'border-b bg-yellow-50 dark:bg-yellow-950/20'
                                            : 'border-b'
                                    }
                                >
                                    <td className="py-2 pr-4 font-mono text-xs">
                                        {key}
                                    </td>
                                    <td className="py-2 pr-4">
                                        <code className="whitespace-pre-wrap break-all rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {formatValue(oldVal)}
                                        </code>
                                    </td>
                                    <td className="py-2">
                                        <code className="whitespace-pre-wrap break-all rounded bg-muted px-1.5 py-0.5 text-xs">
                                            {formatValue(newVal)}
                                        </code>
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val);
}

export default function AuditLogShow({ log, auditable }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Audit Logs', href: '/audit-logs' },
        { title: `Log #${log.id}`, href: `/audit-logs/${log.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Audit Log #${log.id}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Back button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.visit(auditLogsIndex.url())}
                    className="w-fit"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Audit Logs
                </Button>

                {/* Summary Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" />
                                    Audit Log #{log.id}
                                </CardTitle>
                                <CardDescription>
                                    Logged action details
                                </CardDescription>
                            </div>
                            <Badge variant={actionBadgeVariant(log.action)} className="text-sm">
                                {log.action}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <Shield className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Performed By
                                    </p>
                                    <p className="text-sm font-medium">
                                        {log.user?.name ?? (
                                            <span className="italic text-muted-foreground">
                                                System
                                            </span>
                                        )}
                                    </p>
                                    {log.user && (
                                        <p className="text-xs text-muted-foreground">
                                            ID: {log.user.id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Affected Model
                                    </p>
                                    <p className="text-sm font-medium">
                                        {friendlyModelName(log.auditable_type)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        ID: #{log.auditable_id}
                                        {auditable && (
                                            <>
                                                {' · '}
                                                <Link
                                                    href={`/${log.auditable_type === 'App\\Models\\User' ? 'users' : `${log.auditable_type === 'App\\Models\\Child' ? 'children' : `${log.auditable_type === 'App\\Models\\Measurement' ? 'children' : '#'}`}`}/${log.auditable_id}`}
                                                    className="underline hover:no-underline"
                                                >
                                                    View
                                                </Link>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Timestamp
                                    </p>
                                    <p className="text-sm font-medium">
                                        {formatDateTime(log.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Globe className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        IP Address
                                    </p>
                                    <p className="font-mono text-sm">
                                        {log.ip_address ?? '—'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 md:col-span-2 lg:col-span-2">
                                <Monitor className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        User Agent
                                    </p>
                                    <p className="truncate text-sm font-mono">
                                        {log.user_agent ?? '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Changes Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            Data Changes
                        </CardTitle>
                        <CardDescription>
                            {log.action === 'created'
                                ? 'The following data was recorded when this record was created.'
                                : log.action === 'deleted'
                                  ? 'The following data was recorded before this record was deleted.'
                                  : 'Comparison of values before and after the change.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <JsonDiffViewer
                            oldValues={log.old_values}
                            newValues={log.new_values}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
