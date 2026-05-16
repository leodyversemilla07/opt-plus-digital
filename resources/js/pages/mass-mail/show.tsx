import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Mail,
    User,
    XCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mass Mail', href: '/mass-mail' },
    { title: 'Mail Details', href: '#' },
];

interface MassMail {
    id: number;
    subject: string;
    message_body: string;
    recipient_type: string;
    recipient_criteria: Record<string, unknown> | null;
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
    mail: MassMail;
}

function friendlyRecipientType(type: string): string {
    const labels: Record<string, string> = {
        all_parents: 'All Parents/Guardians',
        by_barangay: 'By Barangay',
        by_classification: 'By Nutritional Classification',
        specific_roles: 'Specific User Roles',
    };
    return labels[type] ?? type;
}

function statusColor(status: string): string {
    switch (status) {
        case 'sent':
            return 'text-green-600 dark:text-green-400';
        case 'partially_sent':
            return 'text-yellow-600 dark:text-yellow-400';
        case 'failed':
            return 'text-red-600 dark:text-red-400';
        case 'queued':
            return 'text-blue-600 dark:text-blue-400';
        default:
            return 'text-gray-600 dark:text-gray-400';
    }
}

export default function MassMailShow({ mail }: Props) {
    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleString();
    };

    const renderCriteria = () => {
        if (!mail.recipient_criteria) return '—';

        const parts: string[] = [];
        const criteria = mail.recipient_criteria;

        if (criteria.barangay_id) {
            parts.push(`Barangay #${criteria.barangay_id}`);
        }
        if (criteria.classification) {
            parts.push(`Classification: ${criteria.classification}`);
        }
        if (Array.isArray(criteria.roles) && criteria.roles.length > 0) {
            parts.push(`Roles: ${(criteria.roles as string[]).join(', ')}`);
        }

        return parts.length > 0 ? parts.join(' | ') : '—';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={mail.subject} />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {mail.subject}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {friendlyRecipientType(mail.recipient_type)} —{' '}
                        {mail.total_recipients} recipient
                        {mail.total_recipients === 1 ? '' : 's'}
                    </p>
                </div>

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Delivery Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <Mail
                                    className={`mb-2 h-6 w-6 ${statusColor(mail.status)}`}
                                />
                                <p className="text-2xl font-bold">
                                    {mail.total_recipients}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Total
                                </p>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <CheckCircle className="mb-2 h-6 w-6 text-green-600 dark:text-green-400" />
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {mail.sent_count}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Sent
                                </p>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <XCircle className="mb-2 h-6 w-6 text-red-600 dark:text-red-400" />
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                    {mail.failed_count}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Failed
                                </p>
                            </div>
                            <div className="flex flex-col items-center rounded-lg border p-4">
                                <Badge
                                    variant={
                                        mail.status === 'sent'
                                            ? 'default'
                                            : mail.status === 'failed'
                                              ? 'destructive'
                                              : 'secondary'
                                    }
                                    className="mb-2"
                                >
                                    {mail.status.replace('_', ' ')}
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                    Status
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Recipient Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Type
                                </span>
                                <span>
                                    {friendlyRecipientType(mail.recipient_type)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Criteria
                                </span>
                                <span className="text-right">
                                    {renderCriteria()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </span>
                                <span>{formatDate(mail.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Sent at
                                </span>
                                <span>{formatDate(mail.sent_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    Completed
                                </span>
                                <span>{formatDate(mail.completed_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    Sent by
                                </span>
                                <span>{mail.creator?.name ?? 'Unknown'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Message Body */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {mail.message_body}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
