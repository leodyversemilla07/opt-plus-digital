import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Check,
    ClipboardCheck,
    FileSpreadsheet,
    Globe,
    LayoutDashboard,
    Shield,
    Users,
    WifiOff,
} from 'lucide-react';

export default function Features({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <GuestLayout canRegister={canRegister}>
            <Head title="Features - OPT Plus Digital" />

            {/* Page Header */}
            <section className="border-b bg-card py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                    <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        Built for the Frontlines
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                        Every feature in OPT Plus Digital is designed for
                        Barangay Health Workers and Barangay Nutrition Scholars
                        working in the field.
                    </p>
                </div>
            </section>

            {/* Core Features */}
            <section className="bg-secondary/30 py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-12 text-center sm:mb-16">
                        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
                            Core Capabilities
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground">
                            The essential tools for streamlining Operation
                            Timbang Plus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                        <FeatureCard
                            icon={
                                <WifiOff className="h-8 w-8 text-secondary-foreground" />
                            }
                            title="Offline Mode"
                            description="Record measurements anywhere, even in remote barangays with no signal. Data syncs automatically when you're back online."
                        />
                        <FeatureCard
                            icon={
                                <ClipboardCheck className="h-8 w-8 text-primary" />
                            }
                            title="WHO Standardized"
                            description="Instant Z-score calculation (WFA, HFA, WFH) based on official WHO Child Growth Standards."
                        />
                        <FeatureCard
                            icon={
                                <BarChart3 className="h-8 w-8 text-primary" />
                            }
                            title="Instant Reporting"
                            description="Generate OPT Plus summary reports, master lists, and target lists with a single click."
                        />
                    </div>
                </div>
            </section>

            {/* Detailed Features */}
            <section className="py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-12 text-center sm:mb-16">
                        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
                            Everything You Need
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground">
                            A comprehensive set of tools to manage nutrition
                            monitoring at every level.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <DetailCard
                            icon={<Users className="h-6 w-6" />}
                            title="Child Records Management"
                            items={[
                                'Complete child profiles with demographics',
                                'Duplicate detection on registration',
                                'Full measurement history per child',
                            ]}
                        />
                        <DetailCard
                            icon={<LayoutDashboard className="h-6 w-6" />}
                            title="OPT Session Tracking"
                            items={[
                                'Create and manage weighing sessions',
                                'Track session status (draft → active → complete)',
                                'Per-barangay session analytics',
                            ]}
                        />
                        <DetailCard
                            icon={<FileSpreadsheet className="h-6 w-6" />}
                            title="Reports & Exports"
                            items={[
                                'OPT Summary, Master List, Target List',
                                'F1K, Form 1C, MUAC reports',
                                'Export to PDF and Excel formats',
                            ]}
                        />
                        <DetailCard
                            icon={<Shield className="h-6 w-6" />}
                            title="Role-Based Access"
                            items={[
                                'BHW, BNS, and Municipal admin roles',
                                'Policy-based authorization',
                                'Two-factor authentication support',
                            ]}
                        />
                        <DetailCard
                            icon={<Globe className="h-6 w-6" />}
                            title="Data Quality Checks"
                            items={[
                                'Automated DQC scoring',
                                'Flag anomalous measurements',
                                'Exportable DQC summary reports',
                            ]}
                        />
                        <DetailCard
                            icon={<WifiOff className="h-6 w-6" />}
                            title="Progressive Web App"
                            items={[
                                'Installable on mobile devices',
                                'Works without internet connection',
                                'Background sync when reconnected',
                            ]}
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            {!auth.user && (
                <section className="border-t bg-primary/5 py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
                            Ready to get started?
                        </h2>
                        <p className="mb-8 text-muted-foreground">
                            Log in to start using OPT Plus Digital for your
                            barangay.
                        </p>
                        <Button size="lg" className="px-8" asChild>
                            <Link href={login()}>Get Started</Link>
                        </Button>
                    </div>
                </section>
            )}
        </GuestLayout>
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
        <Card className="border bg-card shadow-sm transition-transform hover:-translate-y-1">
            <CardContent className="space-y-4 p-6 text-center sm:p-8 md:text-left">
                <div className="mb-2 inline-block rounded-2xl bg-secondary/50 p-4">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold sm:text-xl">{title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function DetailCard({
    icon,
    title,
    items,
}: {
    icon: React.ReactNode;
    title: string;
    items: string[];
}) {
    return (
        <Card className="border shadow-sm">
            <CardContent className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        {icon}
                    </div>
                    <h3 className="text-base font-semibold sm:text-lg">
                        {title}
                    </h3>
                </div>
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {item}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
