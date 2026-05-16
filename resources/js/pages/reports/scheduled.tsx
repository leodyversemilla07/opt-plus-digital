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
import { useTranslation } from 'react-i18next';
import { Calendar, Download, FileText } from 'lucide-react';
import scheduled from '@/routes/reports/scheduled';

interface Report {
    id: number;
    type: string;
    title: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    generated_at: string;
    generator: { name: string } | null;
}

interface Props {
    reports: {
        data: Report[];
        total: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getTypeBadge(type: string): string {
    const colors: Record<string, string> = {
        monthly: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        quarterly: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        adhoc: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[type] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
}

export default function ScheduledReports({ reports }: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('reports.title'), href: '/reports' },
        { title: t('reports.scheduled_reports'), href: '/reports/scheduled' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('reports.scheduled_reports')} />

            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <Calendar className="h-6 w-6" />
                        {t('reports.scheduled_reports')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('reports.scheduled_reports_desc')}
                    </p>
                </div>

                {reports.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium text-foreground">
                                {t('reports.no_scheduled_reports')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('reports.no_scheduled_reports_desc')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {reports.data.map((report) => (
                            <Card key={report.id} className="transition-colors hover:border-primary">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">
                                                    {report.title}
                                                </CardTitle>
                                                <Badge
                                                    variant="secondary"
                                                    className={getTypeBadge(report.type)}
                                                >
                                                    {report.type}
                                                </Badge>
                                            </div>
                                            <CardDescription className="mt-1">
                                                {t('reports.generated_on')}: {new Date(report.generated_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                {report.generator && ` — ${t('reports.by')} ${report.generator.name}`}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {formatFileSize(report.file_size)} — {report.mime_type ?? 'PDF'}
                                        </span>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link
                                                href={scheduled.download.url({ scheduledReport: report.id })}
                                                preserveState
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                {t('reports.download')}
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {reports.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                {reports.prev_page_url && (
                                    <Link
                                        href={reports.prev_page_url}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {t('common.previous')}
                                    </Link>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    {t('common.page')} {reports.current_page} {t('common.of')}{' '}
                                    {reports.last_page}
                                </span>
                                {reports.next_page_url && (
                                    <Link
                                        href={reports.next_page_url}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {t('common.next')}
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
