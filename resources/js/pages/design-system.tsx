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
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function DesignSystem() {
    const [stepperVal, setStepperVal] = useState(12.5);

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Design System', href: '/design-system' }]}
        >
            <Head title="Design System" />
            <div className="flex flex-col gap-8 p-6 pb-24">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">
                        OPT Plus Design System
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Foundation and components for nutrition monitoring in
                        the Philippines.
                    </p>
                </div>

                <section className="space-y-4">
                    <h2 className="border-b pb-2 text-2xl font-bold">
                        Government Identity
                    </h2>
                    <div className="overflow-hidden rounded-lg border shadow-sm">
                        <div className="border-b bg-muted p-2 font-mono text-xs">
                            Component: GovPHHeader
                        </div>
                        <GovPHHeader />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="border-b pb-2 text-2xl font-bold">
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

                <section className="space-y-4">
                    <h2 className="border-b pb-2 text-2xl font-bold">
                        Nutritional Status Indicators
                    </h2>
                    <Card>
                        <CardHeader>
                            <CardTitle>Traffic Light System</CardTitle>
                            <CardDescription>
                                Visual shorthand for rapid growth assessment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <NutritionalStatusBadge
                                    status="normal"
                                    className="text-sm"
                                />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Healthy
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <NutritionalStatusBadge
                                    status="mam"
                                    className="text-sm"
                                />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Moderate
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <NutritionalStatusBadge
                                    status="sam"
                                    className="text-sm"
                                />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    Critical
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <NutritionalStatusBadge
                                    status="overweight"
                                    className="text-sm"
                                />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                    High
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="border-b pb-2 text-2xl font-bold">
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
                            Reduces keyboard usage for field workers under time
                            pressure.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="border-b pb-2 text-2xl font-bold">
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
        </AppLayout>
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
                className="h-20 w-full rounded-xl border border-black/5 shadow-inner"
                style={{ backgroundColor: `var(${varName})` }}
            />
            <div className="px-1">
                <p className="text-xs font-bold">{name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                    {hex}
                </p>
            </div>
        </div>
    );
}
