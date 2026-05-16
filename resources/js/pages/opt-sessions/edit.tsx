import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

interface Barangay {
    id: string;
    name: string;
}

interface OptSession {
    id: string;
    name: string;
    session_date: string;
    start_date: string | null;
    end_date: string | null;
    status: string;
    target_children: number;
    venue: string | null;
    notes: string | null;
    barangay_id: string;
}

interface Props {
    session: OptSession;
    barangays: Barangay[];
}

export default function Edit({ session, barangays }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: session.name,
        barangay_id: session.barangay_id,
        session_date: session.session_date,
        start_date: session.start_date || '',
        end_date: session.end_date || '',
        target_children: session.target_children?.toString() || '',
        venue: session.venue || '',
        notes: session.notes || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'OPT Sessions', href: '/opt-sessions' },
        { title: session.name, href: `/opt-sessions/${session.id}` },
        { title: 'Edit', href: `/opt-sessions/${session.id}/edit` },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/opt-sessions/${session.id}`);
    };

    const generateSessionName = (barangayId: string, date: string) => {
        if (!barangayId || !date) return;
        const barangay = barangays.find((b) => b.id === barangayId);
        if (barangay) {
            const sessionDate = new Date(date);
            const monthYear = sessionDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            });
            setData('name', `${barangay.name} - ${monthYear}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${session.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            router.visit(`/opt-sessions/${session.id}`)
                        }
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit OPT Session
                        </h1>
                        <p className="text-muted-foreground">
                            Update session details
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Information</CardTitle>
                            <CardDescription>
                                Edit the OPT Plus session details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="barangay_id">
                                        Barangay
                                    </Label>
                                    <Select
                                        value={data.barangay_id}
                                        onValueChange={(value) => {
                                            setData('barangay_id', value ?? '');
                                            generateSessionName(
                                                value ?? '',
                                                data.session_date,
                                            );
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select barangay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barangays.map((barangay) => (
                                                <SelectItem
                                                    key={barangay.id}
                                                    value={barangay.id}
                                                >
                                                    {barangay.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.barangay_id && (
                                        <p className="text-sm text-destructive">
                                            {errors.barangay_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Session Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="e.g., Barangay San Jose - January 2025"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="session_date">
                                        Session Date (Month)
                                    </Label>
                                    <Input
                                        id="session_date"
                                        type="date"
                                        value={data.session_date}
                                        onChange={(e) => {
                                            setData(
                                                'session_date',
                                                e.target.value,
                                            );
                                            generateSessionName(
                                                data.barangay_id,
                                                e.target.value,
                                            );
                                        }}
                                    />
                                    {errors.session_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.session_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Start Date (Optional)
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData(
                                                'start_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.start_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.start_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        End Date (Optional)
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                    />
                                    {errors.end_date && (
                                        <p className="text-sm text-destructive">
                                            {errors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="target_children">
                                        Target Children
                                    </Label>
                                    <Input
                                        id="target_children"
                                        type="number"
                                        min="0"
                                        value={data.target_children}
                                        onChange={(e) =>
                                            setData(
                                                'target_children',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Auto-calculated if empty"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        If left empty, will be calculated from
                                        registered children
                                    </p>
                                    {errors.target_children && (
                                        <p className="text-sm text-destructive">
                                            {errors.target_children}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="venue">
                                        Venue (Optional)
                                    </Label>
                                    <Input
                                        id="venue"
                                        value={data.venue}
                                        onChange={(e) =>
                                            setData('venue', e.target.value)
                                        }
                                        placeholder="e.g., Barangay Health Center"
                                    />
                                    {errors.venue && (
                                        <p className="text-sm text-destructive">
                                            {errors.venue}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="Any additional notes about the session..."
                                    rows={3}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">
                                        {errors.notes}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit(
                                            `/opt-sessions/${session.id}`,
                                        )
                                    }
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
