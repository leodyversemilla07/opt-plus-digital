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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NutritionalStatusBadge } from '@/components/ui/nutritional-status-badge';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    CheckCircle,
    Info,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function DesignSystem() {
    const [stepperVal, setStepperVal] = useState(12.5);

    return (
        <>
            <Head title="Kalusugan Design System | OPT Plus Digital" />
            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                        <div className="min-w-0">
                            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-2xl">
                                Kalusugan Design System
                            </h1>
                            <p className="text-xs text-muted-foreground sm:text-sm">
                                v1.0 — NNC/GOVPH Compliant &middot; WCAG 2.1 AA
                            </p>
                        </div>
                        <AppearanceToggleTab />
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                    <div className="flex flex-col gap-10 sm:gap-16">
                        {/* Design Principles */}
                        <Section title="Design Principles">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                                <PrincipleCard
                                    number="01"
                                    title="Clarity over beauty"
                                    description="Users range from IT staff to barangay workers — every element must be immediately understandable."
                                />
                                <PrincipleCard
                                    number="02"
                                    title="Accessibility-first"
                                    description="Readable fonts, strong contrast, keyboard-friendly, large touch targets."
                                />
                                <PrincipleCard
                                    number="03"
                                    title="Calm & trustworthy"
                                    description="No aggressive colors or flashy animations — government systems should feel stable."
                                />
                                <PrincipleCard
                                    number="04"
                                    title="Consistency"
                                    description="Same buttons, forms, and layouts everywhere across all pages and modules."
                                />
                                <PrincipleCard
                                    number="05"
                                    title="Mobile-aware"
                                    description="Many LGU users work on tablets or low-end phones — responsive is non-negotiable."
                                />
                            </div>
                        </Section>

                        {/* Government Identity */}
                        <Section title="Government Identity">
                            <div className="overflow-hidden rounded-lg border shadow-sm">
                                <div className="border-b bg-muted p-2 font-mono text-xs">
                                    Component: GovPHHeader
                                </div>
                                <GovPHHeader />
                            </div>
                        </Section>

                        {/* Color Palette */}
                        <Section title="Color Palette">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Primary Colors
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        <ColorSwatch
                                            name="Government Blue"
                                            token="--primary"
                                            hex="#1E40AF"
                                            description="Trust, authority, official actions"
                                        />
                                        <ColorSwatch
                                            name="Nutrition Green"
                                            token="--color-nutrition-green"
                                            hex="#166534"
                                            description="Health, growth, sustainability"
                                        />
                                        <ColorSwatch
                                            name="Warm Yellow"
                                            token="--accent"
                                            hex="#FACC15"
                                            description="Highlights, warnings, indicators"
                                        />
                                        <ColorSwatch
                                            name="Dark Gray"
                                            token="--foreground"
                                            hex="#374151"
                                            description="Body text, headings"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Semantic Colors
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        <ColorSwatch
                                            name="Success"
                                            token="--color-success"
                                            hex="#16A34A"
                                            description="Positive, complete"
                                        />
                                        <ColorSwatch
                                            name="Warning"
                                            token="--color-warning"
                                            hex="#F59E0B"
                                            description="Caution, attention"
                                        />
                                        <ColorSwatch
                                            name="Error"
                                            token="--color-error"
                                            hex="#DC2626"
                                            description="Destructive, invalid"
                                        />
                                        <ColorSwatch
                                            name="Info"
                                            token="--color-info"
                                            hex="#2563EB"
                                            description="Informational, help"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Surface Colors
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                        <div className="rounded-lg border bg-background p-4">
                                            <p className="text-sm font-medium">
                                                Background
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-background
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-4">
                                            <p className="text-sm font-medium">
                                                Card
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-card
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted p-4">
                                            <p className="text-sm font-medium">
                                                Muted
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-muted
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-primary p-4">
                                            <p className="text-sm font-medium text-primary-foreground">
                                                Primary
                                            </p>
                                            <p className="text-xs text-primary-foreground/80">
                                                bg-primary
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 text-lg font-semibold">
                                        Chart Colors
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <div
                                                key={n}
                                                className="flex flex-col items-center gap-1"
                                            >
                                                <div
                                                    className="h-10 w-10 rounded-md border shadow-inner"
                                                    style={{
                                                        backgroundColor: `var(--chart-${n})`,
                                                    }}
                                                />
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    chart-{n}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Typography */}
                        <Section title="Typography">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Inter — Primary Typeface</CardTitle>
                                    <CardDescription>
                                        Highly readable at all sizes, excellent
                                        for dashboards, forms, and data-heavy
                                        interfaces. Weights: Regular (400),
                                        Medium (500), Semibold (600).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                H1 — 32px
                                            </span>
                                            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-[32px]">
                                                Page titles
                                            </h1>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                H2 — 24px
                                            </span>
                                            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                                Section headers
                                            </h2>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                H3 — 18px
                                            </span>
                                            <h3 className="text-lg font-semibold">
                                                Subsection headers
                                            </h3>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                Body — 16px
                                            </span>
                                            <p className="text-base">
                                                Body text for paragraphs and
                                                descriptions. Use regular weight
                                                for readability.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b pb-3 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                Small — 14px
                                            </span>
                                            <p className="text-sm">
                                                Secondary text, form labels,
                                                table content.
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                                            <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">
                                                Caption — 12px
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                Captions, help text, metadata.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Section>

                        {/* Spacing & Layout */}
                        <Section title="Spacing System (8px Base)">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        {[
                                            { name: '8px', tw: '2', px: 8 },
                                            { name: '16px', tw: '4', px: 16 },
                                            { name: '24px', tw: '6', px: 24 },
                                            { name: '32px', tw: '8', px: 32 },
                                            { name: '48px', tw: '12', px: 48 },
                                        ].map((s) => (
                                            <div
                                                key={s.name}
                                                className="flex items-center gap-4"
                                            >
                                                <span className="w-16 shrink-0 text-right font-mono text-xs text-muted-foreground">
                                                    {s.name}
                                                </span>
                                                <div
                                                    className="h-4 rounded bg-primary/20"
                                                    style={{
                                                        width: `${s.px * 3}px`,
                                                    }}
                                                />
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    p-{s.tw} / gap-{s.tw}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs text-muted-foreground">
                                        12-column grid (desktop), 4-column
                                        (mobile). Max container width: 1280px.
                                    </p>
                                </CardContent>
                            </Card>
                        </Section>

                        {/* Buttons */}
                        <Section title="Buttons & Actions">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Button Variants</CardTitle>
                                    <CardDescription>
                                        Use Primary for main actions, Secondary
                                        for alternate actions, Outline for
                                        tertiary, and Destructive for dangerous
                                        operations.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Button>Save Record</Button>
                                        <Button variant="secondary">
                                            Export
                                        </Button>
                                        <Button variant="outline">
                                            Cancel
                                        </Button>
                                        <Button variant="destructive">
                                            Delete
                                        </Button>
                                        <Button variant="ghost">
                                            View Details
                                        </Button>
                                        <Button disabled>Disabled</Button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Button size="sm">Small</Button>
                                        <Button size="default">Default</Button>
                                        <Button size="lg">Large</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Section>

                        {/* Form Components */}
                        <Section title="Form Components">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Text Inputs</CardTitle>
                                        <CardDescription>
                                            Required fields marked with{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                            . Inline validation, never surprise
                                            errors.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="child-name">
                                                Child Name{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="child-name"
                                                placeholder="Juan dela Cruz"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weight">
                                                Weight (kg){' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                placeholder="12.5"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Enter in kilograms with one
                                                decimal place.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="error-field">
                                                With Error
                                            </Label>
                                            <Input
                                                id="error-field"
                                                className="border-destructive"
                                                defaultValue="abc"
                                            />
                                            <p className="text-xs text-destructive">
                                                Please enter a valid number.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Touch-Optimized Stepper
                                        </CardTitle>
                                        <CardDescription>
                                            Reduces keyboard usage for field
                                            workers under time pressure. Large
                                            touch targets for mobile.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-w-xs">
                                            <HealthFormStepper
                                                label="Weight (kg)"
                                                value={stepperVal}
                                                onChange={setStepperVal}
                                                unit="kg"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </Section>

                        {/* Nutritional Status */}
                        <Section title="Nutrition-Specific Components">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Nutritional Status Badges
                                        </CardTitle>
                                        <CardDescription>
                                            Traffic-light system for rapid
                                            growth assessment. Color + label
                                            ensures accessibility.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-3">
                                            <NutritionalStatusBadge status="normal" />
                                            <NutritionalStatusBadge status="underweight" />
                                            <NutritionalStatusBadge status="severely_underweight" />
                                            <NutritionalStatusBadge status="overweight" />
                                            <NutritionalStatusBadge status="obese" />
                                            <NutritionalStatusBadge status="stunted" />
                                            <NutritionalStatusBadge status="severely_stunted" />
                                            <NutritionalStatusBadge status="wasted" />
                                            <NutritionalStatusBadge status="severely_wasted" />
                                            <NutritionalStatusBadge status="mam" />
                                            <NutritionalStatusBadge status="sam" />
                                            <NutritionalStatusBadge
                                                status={null}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Indicator Cards</CardTitle>
                                        <CardDescription>
                                            For dashboards: malnutrition rates,
                                            beneficiary counts, program
                                            coverage.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            <IndicatorCard
                                                label="Malnutrition Rate"
                                                value="4.2%"
                                                trend="down"
                                            />
                                            <IndicatorCard
                                                label="Children Weighed"
                                                value="1,247"
                                                trend="up"
                                            />
                                            <IndicatorCard
                                                label="Coverage"
                                                value="87%"
                                                trend="up"
                                            />
                                            <IndicatorCard
                                                label="SAM Cases"
                                                value="12"
                                                trend="down"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </Section>

                        {/* Semantic Alerts */}
                        <Section title="Semantic Feedback">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Alert variant="success">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>
                                        Record saved successfully.
                                    </span>
                                </Alert>
                                <Alert variant="warning">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>
                                        Weight seems unusual. Please
                                        double-check.
                                    </span>
                                </Alert>
                                <Alert variant="error">
                                    <XCircle className="h-4 w-4" />
                                    <span>
                                        Required fields are missing.
                                    </span>
                                </Alert>
                                <Alert variant="info">
                                    <Info className="h-4 w-4" />
                                    <span>
                                        Offline mode — data will sync when
                                        reconnected.
                                    </span>
                                </Alert>
                            </div>
                        </Section>

                        {/* Accessibility */}
                        <Section title="Accessibility Checklist">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <AccessItem text="WCAG 2.1 AA compliant color contrast (≥ 4.5:1)" />
                                        <AccessItem text="Full keyboard navigation on all interactive elements" />
                                        <AccessItem text="Large click/touch targets (≥ 44px)" />
                                        <AccessItem text="Error indicators use icon + text, never color-only" />
                                        <AccessItem text="Screen reader friendly labels and ARIA attributes" />
                                        <AccessItem text="Focus visible outlines on all focusable elements" />
                                        <AccessItem text="Reduced motion support via prefers-reduced-motion" />
                                        <AccessItem text="Language toggle ready (English / Filipino)" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Section>

                        {/* Content Guidelines */}
                        <Section title="Content & Copy Guidelines">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <h4 className="mb-3 text-sm font-semibold text-destructive">
                                                Avoid
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                                    "Persist data to datastore"
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                                    "Nutritional Intervention
                                                    Module"
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                                    "Execute batch synchronization"
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="mb-3 text-sm font-semibold text-nutrition-green dark:text-nutrition-green-light">
                                                Prefer
                                            </h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                    "Save record"
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                    "Nutrition Program"
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                                    "Sync data"
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Section>

                        {/* Theme Support */}
                        <Section title="Theme Support">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Light & Dark Mode</CardTitle>
                                    <CardDescription>
                                        All tokens adapt automatically. Use the
                                        toggle above to preview. System
                                        preference is respected by default.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-lg border bg-background p-4">
                                            <p className="font-medium">
                                                Background
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-background
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-card p-4">
                                            <p className="font-medium text-card-foreground">
                                                Card
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-card
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted p-4">
                                            <p className="font-medium">
                                                Muted
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                bg-muted
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-primary p-4">
                                            <p className="font-medium text-primary-foreground">
                                                Primary
                                            </p>
                                            <p className="text-xs text-primary-foreground/80">
                                                bg-primary
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Section>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mt-10 border-t bg-muted py-6 sm:mt-16 sm:py-8">
                    <div className="mx-auto max-w-6xl px-4 text-center text-sm sm:px-6">
                        <p className="font-medium">
                            Kalusugan Design System &middot; NNC/GOVPH Aligned
                        </p>
                        <p className="mt-1 text-muted-foreground">
                            &copy; {new Date().getFullYear()} OPT Plus Digital
                            Project
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ---------- Local sub-components ---------- */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3 sm:space-y-4">
            <h2 className="border-b pb-2 text-xl font-semibold sm:text-2xl">{title}</h2>
            {children}
        </section>
    );
}

function PrincipleCard({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <Card className="border shadow-sm">
            <CardContent className="p-5">
                <span className="mb-2 block font-mono text-xs text-primary">
                    {number}
                </span>
                <h3 className="mb-1 text-sm font-semibold">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function ColorSwatch({
    name,
    token,
    hex,
    description,
}: {
    name: string;
    token: string;
    hex: string;
    description: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div
                className="h-20 w-full rounded-lg border shadow-inner"
                style={{ backgroundColor: `var(${token})` }}
            />
            <div className="space-y-0.5 px-1">
                <p className="text-xs font-semibold">{name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                    {hex}
                </p>
                <p className="text-[10px] text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function IndicatorCard({
    label,
    value,
    trend,
}: {
    label: string;
    value: string;
    trend: 'up' | 'down';
}) {
    return (
        <div className="rounded-lg border bg-card p-2.5 sm:p-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-1 text-lg font-semibold sm:text-xl">{value}</p>
            <span
                className={`text-[10px] font-medium ${trend === 'up' ? 'text-success' : 'text-warning'}`}
            >
                {trend === 'up' ? '↑' : '↓'} vs last quarter
            </span>
        </div>
    );
}

function Alert({
    variant,
    children,
}: {
    variant: 'success' | 'warning' | 'error' | 'info';
    children: React.ReactNode;
}) {
    const styles = {
        success:
            'border-success/30 bg-success/10 text-success dark:bg-success/5',
        warning:
            'border-warning/30 bg-warning/10 text-warning dark:bg-warning/5',
        error: 'border-error/30 bg-error/10 text-error dark:bg-error/5',
        info: 'border-info/30 bg-info/10 text-info dark:bg-info/5',
    };

    return (
        <div
            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium sm:gap-3 sm:px-4 sm:py-3 ${styles[variant]}`}
        >
            {children}
        </div>
    );
}

function AccessItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span className="text-sm">{text}</span>
        </div>
    );
}
