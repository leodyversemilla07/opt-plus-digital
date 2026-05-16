import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppearance } from '@/hooks/use-appearance';
import { about, dashboard, features, home, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    LogIn,
    Menu,
    Monitor,
    Moon,
    Sun,
    UserPlus,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Header({ canRegister = true }: { canRegister?: boolean }) {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();

    const cycleAppearance = () => {
        const modes = ['light', 'dark', 'system'] as const;
        const currentIndex = modes.indexOf(appearance);
        const nextIndex = (currentIndex + 1) % modes.length;
        updateAppearance(modes[nextIndex]);
    };

    const AppearanceIcon =
        appearance === 'dark' ? Moon : appearance === 'light' ? Sun : Monitor;
    const appearanceLabel =
        appearance === 'dark'
            ? t('common.dark')
            : appearance === 'light'
              ? t('common.light')
              : t('common.system');

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                >
                    <div className="rounded-xl bg-primary p-1.5 shadow-sm shadow-primary/20">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 512 512"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M256 128V384"
                                stroke="white"
                                strokeWidth="48"
                                strokeLinecap="round"
                            />
                            <path
                                d="M128 256H384"
                                stroke="white"
                                strokeWidth="48"
                                strokeLinecap="round"
                            />
                            <circle
                                cx="256"
                                cy="256"
                                r="180"
                                stroke="white"
                                strokeWidth="32"
                                strokeDasharray="30 30"
                                fill="none"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold tracking-tight">
                        {t('app.name')}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    <Link
                        href={home()}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t('nav.home')}
                    </Link>
                    <Link
                        href={features()}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t('nav.features')}
                    </Link>
                    <Link
                        href={about()}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {t('nav.about')}
                    </Link>
                </div>

                {/* Desktop Auth Actions */}
                <div className="hidden items-center gap-3 md:flex">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={cycleAppearance}
                                >
                                    <AppearanceIcon className="h-4 w-4" />
                                    <span className="sr-only">
                                        {t('common.toggle_theme')} ({appearanceLabel})
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('common.theme')}: {appearanceLabel}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {auth.user ? (
                        <Button
                            size="sm"
                            className="px-5"
                            render={<Link href={dashboard()} />}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            {t('nav.dashboard')}
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-5"
                                render={<Link href={login()} />}
                            >
                                <LogIn className="mr-2 h-4 w-4" />
                                {t('auth.login')}
                            </Button>
                            {canRegister && (
                                <Button
                                    size="sm"
                                    className="px-5"
                                    render={<Link href={register()} />}
                                >
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {t('auth.register')}
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-72 bg-background"
                        >
                            <SheetTitle className="sr-only">
                                {t('common.navigation_menu')}
                            </SheetTitle>
                            <SheetHeader className="text-left">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-xl bg-primary p-1.5">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 512 512"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M256 128V384"
                                                stroke="white"
                                                strokeWidth="48"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                d="M128 256H384"
                                                stroke="white"
                                                strokeWidth="48"
                                                strokeLinecap="round"
                                            />
                                            <circle
                                                cx="256"
                                                cy="256"
                                                r="180"
                                                stroke="white"
                                                strokeWidth="32"
                                                strokeDasharray="30 30"
                                                fill="none"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-semibold tracking-tight">
                                        {t('app.name')}
                                    </span>
                                </div>
                            </SheetHeader>

                            <div className="mt-8 flex flex-col gap-4 px-1">
                                <Link
                                    href={home()}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {t('nav.home')}
                                </Link>
                                <Link
                                    href={features()}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {t('nav.features')}
                                </Link>
                                <Link
                                    href={about()}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {t('nav.about')}
                                </Link>

                                <div className="my-2 border-t" />

                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={cycleAppearance}
                                >
                                    <AppearanceIcon className="mr-2 h-4 w-4" />
                                    {t('common.theme')}: {appearanceLabel}
                                </Button>

                                <div className="my-2 border-t" />

                                {auth.user ? (
                                    <Button
                                        className="w-full"
                                        render={<Link href={dashboard()} />}
                                    >
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        {t('nav.dashboard')}
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            render={<Link href={login()} />}
                                        >
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {t('auth.login')}
                                        </Button>
                                        {canRegister && (
                                            <Button
                                                className="w-full"
                                                render={
                                                    <Link href={register()} />
                                                }
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                {t('auth.register')}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
