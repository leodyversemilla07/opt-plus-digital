import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import * as notifications from '@/routes/notifications/index';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, ChevronRight } from 'lucide-react';

interface NotificationData {
    measurement_id: string;
    child_id: string;
    child_name: string;
    barangay_name?: string;
    measurement_date: string;
    age_in_months?: number;
    weight_kg?: number;
    height_length_cm?: number;
    opt_classification: string;
    type: string;
}

interface NotificationItem {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: {
        data: NotificationItem[];
        total: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    unreadCount: number;
}

function timeAgo(dateString: string, t: (key: string, options?: Record<string, string | number>) => string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.time_ago.just_now');
    if (diffMins < 60) return t('notifications.time_ago.minutes_ago', { count: diffMins });
    if (diffHours < 24) return t('notifications.time_ago.hours_ago', { count: diffHours });
    if (diffDays < 7) return t('notifications.time_ago.days_ago', { count: diffDays });
    return date.toLocaleDateString();
}

function getNotificationIcon() {
    return <Bell className="h-5 w-5 text-destructive" />;
}

function getNotificationTitle(data: NotificationData): string {
    if (data.type === 'severe_malnutrition') {
        return `SAM Alert: ${data.child_name}`;
    }

    return 'Notification';
}

function getNotificationDescription(data: NotificationData): string {
    if (data.type === 'severe_malnutrition') {
        return `${data.child_name} from ${data.barangay_name ?? 'Unknown'} was classified as Severely Malnourished (SAM). ${data.age_in_months !== undefined ? `Age: ${data.age_in_months} months.` : ''} Please take immediate action.`;
    }

    return 'New notification';
}

export default function NotificationsIndex({
    notifications: notificationsData,
    unreadCount,
}: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('notifications.title'),
            href: '/notifications',
        },
    ];

    const markAsRead = (id: string) => {
        router.post(notifications.markAsRead.url({ id }));
    };

    const markAllAsRead = () => {
        router.post(notifications.markAllRead.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('notifications.title')} />

            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Bell className="h-6 w-6" />
                            {t('notifications.title')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? t('notifications.unread_count', { count: unreadCount })
                                : t('notifications.no_notifications')}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            {t('notifications.mark_all_read')}
                        </Button>
                    )}
                </div>

                {notificationsData.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium text-foreground">
                                {t('notifications.no_notifications')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('notifications.no_notifications_desc')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {notificationsData.data.map((notification) => (
                            <Card
                                key={notification.id}
                                className={cn(
                                    'transition-colors hover:bg-accent/50',
                                    !notification.read_at &&
                                        'border-l-4 border-l-destructive bg-destructive/5',
                                )}
                            >
                                <CardContent className="flex items-start gap-4 p-4">
                                    <div className="mt-1 flex-shrink-0">
                                        {getNotificationIcon()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        !notification.read_at &&
                                                            'text-foreground',
                                                        notification.read_at &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {getNotificationTitle(
                                                        notification.data,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {getNotificationDescription(
                                                        notification.data,
                                                    )}
                                                </p>
                                            </div>

                                            <Badge
                                                variant="outline"
                                                className="flex-shrink-0 text-xs text-muted-foreground"
                                            >
                                                {timeAgo(
                                                    notification.created_at,
                                                    t,
                                                )}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            {notification.data.child_id && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs"
                                                    render={
                                                        <Link
                                                            href={notifications.redirect.url(
                                                                {
                                                                    id: notification.id,
                                                                },
                                                            )}
                                                            onClick={() => {
                                                                if (
                                                                    !notification.read_at
                                                                ) {
                                                                    markAsRead(
                                                                        notification.id,
                                                                    );
                                                                }
                                                            }}
                                                            className="flex items-center gap-1"
                                                        />
                                                    }
                                                >
                                                    {t('notifications.view_child')}
                                                    <ChevronRight className="h-3 w-3" />
                                                </Button>
                                            )}

                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        markAsRead(
                                                            notification.id,
                                                        )
                                                    }
                                                >
                                                    {t('notifications.mark_read')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {notificationsData.last_page > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                {notificationsData.prev_page_url && (
                                    <Link
                                        href={notificationsData.prev_page_url}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        {t('common.previous')}
                                    </Link>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    {t('common.page')} {notificationsData.current_page} {t('common.of')}{' '}
                                    {notificationsData.last_page}
                                </span>
                                {notificationsData.next_page_url && (
                                    <Link
                                        href={notificationsData.next_page_url}
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
