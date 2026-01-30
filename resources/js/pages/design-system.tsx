import AppearanceToggleTab from '@/components/appearance-tabs';
import { GovPHHeader } from '@/components/gov-ph-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { HealthFormStepper } from '@/components/ui/health-form-stepper';
import { NutritionalStatusBadge } from '@/components/ui/nutritional-status-badge';
import { useAppearance } from '@/hooks/use-appearance';
import { Head } from '@inertiajs/react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DesignSystem() {
    const [stepperVal, setStepperVal] = useState(12.5);
    const { appearance } = useAppearance();

    return (
        <>
            <Head title="Design System | OPT Plus Digital" />
            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                OPT Plus Design System
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                OPDS v1.0 – NNC/GOVPH Compliant
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                                Current: {appearance.charAt(0).toUpperCase() + appearance.slice(1)}
                            </span>
                            <AppearanceToggleTab />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mx-auto max-w-6xl px-6 py-8">
                    <div className="flex flex-col gap-12">

                        {/* Theme Support Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Theme Support
                            </h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Light & Dark Mode</CardTitle>
                                    <CardDescription>
                                        Toggle between light, dark, and system themes using the switcher above.
                                        All components and colors adapt automatically.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-lg border border-border bg-background p-4">
                                            <p className="font-medium text-foreground">Background</p>
                                            <p className="text-sm text-muted-foreground">bg-background</p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-card p-4">
                                            <p className="font-medium text-card-foreground">Card</p>
                                            <p className="text-sm text-muted-foreground">bg-card</p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-muted p-4">
                                            <p className="font-medium text-foreground">Muted</p>
                                            <p className="text-sm text-muted-foreground">bg-muted</p>
                                        </div>
                                        <div className="rounded-lg border border-border bg-primary p-4">
                                            <p className="font-medium text-primary-foreground">Primary</p>
                                            <p className="text-sm text-primary-foreground/80">bg-primary</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Government Identity Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Government Identity
                            </h2>
                            <div className="overflow-hidden rounded-lg border border-border shadow-sm">
                                <div className="border-b border-border bg-muted p-2 font-mono text-xs text-foreground">
                                    Component: GovPHHeader
                                </div>
                                <GovPHHeader />
                            </div>
                        </section>

                        {/* Color Palette Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Color Palette (NNC Tokens)
                            </h2>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <ColorSwatch
                                    name="Primary (NNC Green)"
                                    varName="--primary"
                                    hex="#006837"
                                />
                                <ColorSwatch
                                    name="Secondary (Gov Blue)"
                                    varName="--secondary-foreground"
                                    hex="#0038A8"
                                />
                                <ColorSwatch
                                    name="Accent (NNC Yellow)"
                                    varName="--accent"
                                    hex="#FFF200"
                                />
                                <ColorSwatch
                                    name="Destructive (NNC Red)"
                                    varName="--destructive"
                                    hex="#ED1C24"
                                />
                            </div>
                        </section>

                        {/* Nutritional Status Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Nutritional Status Indicators
                            </h2>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Traffic Light System</CardTitle>
                                    <CardDescription>
                                        Visual shorthand for rapid growth assessment.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <NutritionalStatusBadge status="normal" className="text-sm" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Healthy</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <NutritionalStatusBadge status="mam" className="text-sm" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Moderate</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <NutritionalStatusBadge status="sam" className="text-sm" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Critical</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <NutritionalStatusBadge status="overweight" className="text-sm" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">High</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Touch-Optimized Data Entry Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Touch-Optimized Data Entry
                            </h2>
                            <div className="max-w-xs">
                                <HealthFormStepper
                                    label="Weight (kg)"
                                    value={stepperVal}
                                    onChange={setStepperVal}
                                    unit="kg"
                                />
                                <p className="mt-4 text-xs text-muted-foreground italic">
                                    Reduces keyboard usage for field workers under time pressure.
                                </p>
                            </div>
                        </section>

                        {/* Buttons Section */}
                        <section className="space-y-4">
                            <h2 className="border-b border-border pb-2 text-2xl font-bold text-foreground">
                                Buttons & Actions
                            </h2>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button>Default Action</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="destructive">Destructive</Button>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-16 border-t border-border bg-muted py-8">
                    <div className="mx-auto max-w-6xl px-6 text-center text-sm">
                        <p className="font-medium text-foreground">
                            OPT Plus Design System (OPDS) • Aligned with GOVPH & NNC Standards
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            © 2026 Municipality of Gloria, Oriental Mindoro
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function ColorSwatch({
    name,
    varName,
    hex,
}: {
    name: string;
    varName: string;
    hex: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div
                className="h-20 w-full rounded-xl border border-border shadow-inner"
                style={{ backgroundColor: `var(${varName})` }}
            />
            <div className="px-1">
                <p className="text-xs font-bold text-foreground">{name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                    {hex}
                </p>
            </div>
        </div>
    );
}
