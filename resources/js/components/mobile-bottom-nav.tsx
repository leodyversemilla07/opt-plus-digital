import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { FileText, LayoutDashboard, Settings, Users } from 'lucide-react';

export function MobileBottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'Children',
            href: '/children',
            icon: Users,
        },
        {
            title: 'Reports',
            href: '/reports',
            icon: FileText,
        },
        {
            title: 'Settings',
            href: '/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <div className="pb-safe fixed right-0 bottom-0 left-0 z-50 border-t bg-background/80 backdrop-blur-lg md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => {
                    const isActive = url.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex h-full w-full flex-col items-center justify-center gap-1 transition-colors',
                                isActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <Icon
                                className={cn(
                                    'h-5 w-5',
                                    isActive && 'stroke-[2.5px]',
                                )}
                            />
                            <span className="text-[10px] font-bold tracking-tight uppercase">
                                {item.title}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
