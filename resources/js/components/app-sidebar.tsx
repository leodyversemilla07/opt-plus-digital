import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import * as auditLogs from '@/routes/audit-logs/index';
import children from '@/routes/children';
import * as massMail from '@/routes/mass-mail/index';
import * as notifications from '@/routes/notifications/index';
import reports from '@/routes/reports';
import users from '@/routes/users';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Baby,
    Bell,
    FileBarChart,
    FileCheck,
    History,
    LayoutDashboard,
    Mail,
    Settings,
    UserCog,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        {
            title: t('nav.dashboard'),
            href: dashboard(),
            icon: LayoutDashboard,
        },
        {
            title: t('nav.children'),
            href: children.index(),
            icon: Baby,
        },
        {
            title: t('nav.notifications'),
            href: notifications.index(),
            icon: Bell,
        },
        {
            title: t('nav.reports'),
            href: reports.index(),
            icon: FileBarChart,
        },
        {
            title: t('nav.dqc'),
            href: '/dqc',
            icon: FileCheck,
        },
        {
            title: t('nav.mass_mail'),
            href: massMail.index(),
            icon: Mail,
        },
        {
            title: t('nav.audit_logs'),
            href: auditLogs.index(),
            icon: History,
        },
        {
            title: t('nav.users'),
            href: users.index(),
            icon: UserCog,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('nav.settings'),
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            render={<Link href={dashboard()} prefetch />}
                        >
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
