import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { index as massMailIndex, show as massMailShow } from '@/routes/mass-mail/index';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Eye, Mail, Plus, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mass Mail',
        href: '/mass-mail',
    },
];

interface MassMail {
    id: number;
    subject: string;
    recipient_type: string;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    status: string;
    created_at: string;
    sent_at: string | null;
    completed_at: string | null;
    creator: { id: number; name: string };
}

interface Props {
    mails: {
        data: MassMail[];
        current_page: number;
        last_page: number;
        total: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    barangays: { id: number; name: string }[];
    classifications: Record<string, string>;
    recipientTypes: Record<string, string>;
}

function statusBadgeVariant(status: string): BadgeProps['variant'] {
    switch (status) {
        case 'draft':
            return 'secondary';
        case 'queued':
            return 'default';
        case 'sending':
            return 'default';
        case 'sent':
            return 'default'; // green
        case 'partially_sent':
            return 'secondary'; // yellow
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
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

function friendlyRecipientType(type: string): string {
    const labels: Record<string, string> = {
        all_parents: 'All Parents',
        by_barangay: 'By Barangay',
        by_classification: 'By Classification',
        specific_roles: 'Specific Roles',
    };
    return labels[type] ?? type;
}

export default function MassMailIndex({ mails, recipientTypes }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mass Mail" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Mail className="h-6 w-6" />
                            Mass Mail
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Compose and send bulk email notifications
                        </p>
                    </div>
                    <Button render={<Link href={massMailIndex.url() + '/create'} />}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Mass Mail
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mails.total}</p>
                                <p className="text-xs text-muted-foreground">Total Mailings</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
                                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {mails.data.filter((m) => m.status === 'sent').length}
                                </p>
                                <p className="text-xs text-muted-foreground">Successfully Sent</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/20">
                                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {mails.data.reduce((sum, m) => sum + m.total_recipients, 0)}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Recipients</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mailings Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Recipients</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Sent / Failed</TableHead>
                                    <TableHead>Sent By</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mails.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            <Mail className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                                            <p>No mass mailings yet</p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="mt-1"
                                                render={<Link href={massMailIndex.url() + '/create'} />}
                                            >
                                                Create your first mailing
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mails.data.map((mail) => (
                                        <TableRow key={mail.id}>
                                            <TableCell>
                                                <span className="text-sm font-medium">
                                                    {mail.subject}
                                                </span>
                                                <span className="ml-2 text-xs text-muted-foreground">
                                                    ({friendlyRecipientType(mail.recipient_type)})
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {mail.total_recipients}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={statusBadgeVariant(mail.status)}>
                                                    {mail.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-green-600 dark:text-green-400">
                                                    {mail.sent_count}
                                                </span>
                                                {mail.failed_count > 0 && (
                                                    <span className="ml-1 text-sm text-red-600 dark:text-red-400">
                                                        / {mail.failed_count} failed
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {mail.creator?.name ?? 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="text-sm text-muted-foreground"
                                                    title={mail.created_at}
                                                >
                                                    {timeAgo(mail.created_at)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    render={<Link
                                                        href={massMailShow.url({
                                                            mass_mail: mail.id,
                                                        })}
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

                        {/* Pagination */}
                        {mails.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {mails.current_page} of {mails.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {mails.prev_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(mails.prev_page_url!, {
                                                    preserveState: true,
                                                })
                                            }
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {mails.next_page_url && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                router.get(mails.next_page_url!, {
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
