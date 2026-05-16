import { Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as notifications from '@/routes/notifications/index';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notifications',
        href: '/notifications',
    },
];

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

export default function NotificationsIndex({ notifications: notificationsData, unreadCount }: Props) {
    const markAsRead = (id: string) => {
        router.post(notifications.markAsRead.url({ id }));
    };

    const markAllAsRead = () => {
        router.post(notifications.markAllRead.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />

            <div className="flex flex-col gap-6 p-6 pb-20 md:pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Bell className="h-6 w-6" />
                            Notifications
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                                : 'No unread notifications'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {notificationsData.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                            <p className="text-lg font-medium text-foreground">
                                No notifications yet
                            </p>
                            <p className="text-sm text-muted-foreground">
                                You'll be notified here when severe malnutrition cases are detected.
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
                                    !notification.read_at && 'border-l-4 border-l-destructive bg-destructive/5',
                                )}
                            >
                                <CardContent className="flex items-start gap-4 p-4">
                                    <div className="mt-1 flex-shrink-0">
                                        {getNotificationIcon()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={cn(
                                                    'text-sm font-medium',
                                                    !notification.read_at && 'text-foreground',
                                                    notification.read_at && 'text-muted-foreground',
                                                )}>
                                                    {getNotificationTitle(notification.data)}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {getNotificationDescription(notification.data)}
                                                </p>
                                            </div>

                                            <Badge
                                                variant="outline"
                                                className="flex-shrink-0 text-xs text-muted-foreground"
                                            >
                                                {timeAgo(notification.created_at)}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2">
                                            {notification.data.child_id && (
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs"
                                                    asChild
                                                >
                                                    <Link
                                                        href={notifications.redirect.url({ id: notification.id })}
                                                        onClick={() => {
                                                            if (!notification.read_at) {
                                                                markAsRead(notification.id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        View Child Profile
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                </Button>
                                            )}

                                            {!notification.read_at && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    Mark as read
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
                                        Previous
                                    </Link>
                                )}
                                <span className="text-sm text-muted-foreground">
                                    Page {notificationsData.current_page} of {notificationsData.last_page}
                                </span>
                                {notificationsData.next_page_url && (
                                    <Link
                                        href={notificationsData.next_page_url}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Next
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
