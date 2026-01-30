import { GovPHHeader } from '@/components/gov-ph-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ClipboardCheck,
    LayoutDashboard,
    ShieldCheck,
    WifiOff,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <Head title="Welcome to OPT Plus Digital" />

            <GovPHHeader />

            {/* Hero Section */}
            <header className="relative overflow-hidden border-b bg-card py-12 md:py-24">
                <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                    <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="grid"
                                width="40"
                                height="40"
                                patternUnits="userSpaceOnUse"
                            >
                                <path
                                    d="M 40 0 L 0 0 0 40"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative container mx-auto flex flex-col items-center px-6 text-center">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-primary p-3 shadow-lg shadow-primary/20">
                            <svg
                                width="40"
                                height="40"
                                viewBox="0 0 512 512"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect
                                    width="512"
                                    height="512"
                                    rx="64"
                                    fill="transparent"
                                />
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
                        <span className="text-2xl font-bold tracking-tight text-primary">
                            OPT Plus Digital
                        </span>
                    </div>

                    <h1 className="mb-4 max-w-3xl text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
                        Revolutionizing Nutrition Monitoring in the Philippines
                    </h1>
                    <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                        A robust, offline-first digital tool for BHWs and BNS to
                        streamline "Operation Timbang Plus" and improve child
                        health outcomes.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {auth.user ? (
                            <Button
                                size="lg"
                                className="rounded-full px-8 shadow-lg shadow-primary/20"
                                asChild
                            >
                                <Link href={dashboard()}>
                                    <LayoutDashboard className="mr-2 h-5 w-5" />
                                    Go to Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    size="lg"
                                    className="rounded-full px-8 shadow-lg shadow-primary/20"
                                    asChild
                                >
                                    <Link href={login()}>Get Started</Link>
                                </Button>
                                {canRegister && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-full bg-background/50 px-8 backdrop-blur-sm"
                                        asChild
                                    >
                                        <Link href={register()}>
                                            Register Account
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="bg-secondary/30 py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold">
                            Frontline-First Design
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground">
                            Built specifically for the challenges of
                            community-based health monitoring.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={
                                <WifiOff className="h-8 w-8 text-secondary-foreground" />
                            }
                            title="Offline Mode"
                            description="Record measurements anywhere. Data syncs automatically when you're back online."
                        />
                        <FeatureCard
                            icon={
                                <ClipboardCheck className="h-8 w-8 text-primary" />
                            }
                            title="WHO Standardized"
                            description="Instant Z-score calculation (WFA, HFA, WFH) based on official WHO standards."
                        />
                        <FeatureCard
                            icon={
                                <BarChart3 className="h-8 w-8 text-accent-foreground" />
                            }
                            title="Instant Reporting"
                            description="Generate OPT Plus summary reports and target lists with a single click."
                        />
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="border-t py-16 md:py-24">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center gap-12 md:flex-row">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold tracking-wider text-primary uppercase">
                                <ShieldCheck className="h-4 w-4" />
                                NNC & DOH Aligned
                            </div>
                            <h2 className="text-3xl font-bold md:text-4xl">
                                Data You Can Trust
                            </h2>
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                Our system is fully aligned with the National
                                Nutrition Council's requirements, ensuring that
                                every measurement is accurate and every report
                                is ready for official submission.
                            </p>
                            <div className="flex flex-col gap-4">
                                <CheckItem text="Compliant with Data Privacy Act of 2012" />
                                <CheckItem text="Validated Growth Charts for Filipino Children" />
                                <CheckItem text="Multi-level Access (BHW, BNS, Municipal)" />
                            </div>
                        </div>
                        <div className="w-full max-w-md flex-1">
                            <Card className="rotate-2 border-2 border-primary/20 shadow-2xl">
                                <CardContent className="overflow-hidden rounded-lg p-0">
                                    <div className="bg-primary p-6 text-center text-white">
                                        <div className="mb-1 text-sm font-medium opacity-80">
                                            Nutritional Status
                                        </div>
                                        <div className="text-4xl font-bold">
                                            NORMAL
                                        </div>
                                    </div>
                                    <div className="space-y-4 p-8">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full w-[85%] bg-primary" />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Weight for Age
                                            </span>
                                            <span className="font-bold">
                                                +0.12 (Normal)
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Height for Age
                                            </span>
                                            <span className="font-bold">
                                                -0.54 (Normal)
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto border-t bg-card py-12">
                <div className="container mx-auto flex flex-col items-center justify-between gap-8 px-6 md:flex-row">
                    <div className="flex items-center gap-2 opacity-60 grayscale transition-all hover:grayscale-0">
                        <div className="rounded-lg bg-primary p-1.5">
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
                        <span className="text-lg font-bold">
                            OPT Plus Digital
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                        <Link
                            href="#"
                            className="transition-colors hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="#"
                            className="transition-colors hover:text-primary"
                        >
                            Terms of Service
                        </Link>
                        <a
                            href="https://www.nnc.gov.ph"
                            className="transition-colors hover:text-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Official NNC Website
                        </a>
                        <a
                            href="https://www.doh.gov.ph"
                            className="transition-colors hover:text-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Department of Health
                        </a>
                    </div>

                    <div className="text-xs text-muted-foreground opacity-60">
                        &copy; {new Date().getFullYear()} OPT Plus Digital
                        Project.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="border-none bg-card shadow-xl shadow-black/5 transition-transform hover:-translate-y-1">
            <CardContent className="space-y-4 p-8 text-center md:text-left">
                <div className="mb-2 inline-block rounded-2xl bg-secondary/50 p-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="leading-relaxed text-muted-foreground italic">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function CheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
}
