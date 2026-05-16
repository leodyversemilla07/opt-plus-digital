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
import children from '@/routes/children';
import reports from '@/routes/reports';
import users from '@/routes/users';
import * as auditLogs from '@/routes/audit-logs/index';
import * as notifications from '@/routes/notifications/index';
import * as massMail from '@/routes/mass-mail/index';
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
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Children Registry',
        href: children.index(),
        icon: Baby,
    },
    {
        title: 'Notifications',
        href: notifications.index(),
        icon: Bell,
    },
    {
        title: 'Reports',
        href: reports.index(),
        icon: FileBarChart,
    },
    {
        title: 'Data Quality Control',
        href: '/dqc',
        icon: FileCheck,
    },
    {
        title: 'Mass Mail',
        href: massMail.index(),
        icon: Mail,
    },
    {
        title: 'Audit Logs',
        href: auditLogs.index(),
        icon: History,
    },
    {
        title: 'User Management',
        href: users.index(),
        icon: UserCog,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href={dashboard()} prefetch />}>
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
