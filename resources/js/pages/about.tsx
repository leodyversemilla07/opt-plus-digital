import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Heart,
    Scale,
    ShieldCheck,
    Target,
    Users,
} from 'lucide-react';

export default function About({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <GuestLayout canRegister={canRegister}>
            <Head title="About - OPT Plus Digital" />

            {/* Page Header */}
            <section className="border-b bg-card py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                    <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        About OPT Plus Digital
                    </h1>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
                        Digitizing Operation Timbang Plus to improve child
                        nutrition monitoring across the Philippines.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col items-center gap-8 sm:gap-12 md:flex-row">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wider text-primary uppercase">
                                <Target className="h-4 w-4" />
                                Our Mission
                            </div>
                            <h2 className="text-2xl font-semibold sm:text-3xl md:text-4xl">
                                Empowering Frontline Health Workers
                            </h2>
                            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                                OPT Plus Digital was created to replace
                                paper-based weighing records with a modern,
                                offline-first digital system. Our goal is to
                                make data collection, analysis, and reporting
                                seamless for Barangay Health Workers (BHWs) and
                                Barangay Nutrition Scholars (BNS) across the
                                country.
                            </p>
                        </div>
                        <div className="w-full max-w-md flex-1">
                            <Card className="border-2 border-primary/20 shadow-lg">
                                <CardContent className="overflow-hidden rounded-lg p-0">
                                    <div className="bg-primary p-6 text-center text-white">
                                        <div className="mb-1 text-sm font-medium opacity-80">
                                            Nutritional Status
                                        </div>
                                        <div className="text-4xl font-semibold">
                                            NORMAL
                                        </div>
                                    </div>
                                    <div className="space-y-4 p-6 sm:p-8">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div className="h-full w-[85%] bg-primary" />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Weight for Age
                                            </span>
                                            <span className="font-semibold">
                                                +0.12 (Normal)
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">
                                                Height for Age
                                            </span>
                                            <span className="font-semibold">
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

            {/* Compliance */}
            <section className="border-t bg-secondary/30 py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-12 text-center sm:mb-16">
                        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
                            Data You Can Trust
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground">
                            Fully aligned with national nutrition monitoring
                            standards and regulations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                        <ComplianceCard
                            icon={
                                <ShieldCheck className="h-8 w-8 text-primary" />
                            }
                            title="NNC & DOH Aligned"
                            description="Our system meets all requirements set by the National Nutrition Council and the Department of Health."
                        />
                        <ComplianceCard
                            icon={<Scale className="h-8 w-8 text-primary" />}
                            title="Data Privacy Act"
                            description="Compliant with the Data Privacy Act of 2012 (RA 10173), ensuring the protection of all child health records."
                        />
                        <ComplianceCard
                            icon={<Heart className="h-8 w-8 text-primary" />}
                            title="WHO Growth Standards"
                            description="Uses validated WHO Child Growth Standards for accurate Z-score computations across all indicators."
                        />
                    </div>
                </div>
            </section>

            {/* Stakeholders */}
            <section className="py-12 sm:py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="mb-12 text-center sm:mb-16">
                        <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
                            Who It's For
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground">
                            Designed for every level of the nutrition monitoring
                            ecosystem.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3">
                        <StakeholderCard
                            icon={<Users className="h-8 w-8" />}
                            title="BHWs & BNS"
                            description="Frontline workers who conduct weighing sessions and record child measurements in their barangays."
                        />
                        <StakeholderCard
                            icon={<Building2 className="h-8 w-8" />}
                            title="Municipal Nutrition Officers"
                            description="Supervisors who oversee multiple barangays, review data quality, and generate consolidated reports."
                        />
                        <StakeholderCard
                            icon={<Target className="h-8 w-8" />}
                            title="Program Managers"
                            description="Decision-makers who use analytics and reports to drive nutrition intervention programs."
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            {!auth.user && (
                <section className="border-t bg-primary/5 py-12 sm:py-16">
                    <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                        <h2 className="mb-4 text-xl font-semibold sm:text-2xl">
                            Ready to make a difference?
                        </h2>
                        <p className="mb-8 text-muted-foreground">
                            Join the effort to improve child nutrition
                            monitoring in your community.
                        </p>
                        <Button size="lg" className="px-8" render={<Link href={login()} />}>
                            Get Started
                        </Button>
                    </div>
                </section>
            )}
        </GuestLayout>
    );
}

function ComplianceCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="border bg-card shadow-sm">
            <CardContent className="space-y-4 p-6 text-center sm:p-8">
                <div className="mx-auto inline-block rounded-2xl bg-primary/10 p-4">
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

function StakeholderCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card className="border shadow-sm transition-transform hover:-translate-y-1">
            <CardContent className="space-y-4 p-6 text-center sm:p-8">
                <div className="mx-auto inline-block rounded-2xl bg-secondary/50 p-4 text-secondary-foreground">
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
