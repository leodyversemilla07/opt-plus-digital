import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import * as notifications from '@/routes/notifications/index';
import {
    type BreadcrumbItem as BreadcrumbItemType,
    type SharedData,
} from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { unreadNotificationsCount } = usePage<SharedData>().props;

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <Link href={notifications.index()}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9"
                    >
                        <Bell className="h-5 w-5" />
                        {unreadNotificationsCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
                            >
                                {unreadNotificationsCount > 9
                                    ? '9+'
                                    : unreadNotificationsCount}
                            </Badge>
                        )}
                    </Button>
                </Link>
            </div>
        </header>
    );
}
