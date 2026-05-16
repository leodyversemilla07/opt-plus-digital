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
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';

interface Barangay {
    id: string;
    name: string;
}

interface Props {
    barangays: Barangay[];
}

export default function Create({ barangays }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        barangay_id: '',
        name: '',
        session_date: new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: '',
        target_children: '',
        venue: '',
        notes: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('nav.dashboard'), href: '/dashboard' },
        { title: t('opt_session.title'), href: '/opt-sessions' },
        { title: t('opt_session.create'), href: '/opt-sessions/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/opt-sessions');
    };

    // Auto-generate session name when barangay and date are selected
    const handleBarangayChange = (barangayId: string | null) => {
        setData('barangay_id', barangayId ?? '');
        const barangay = barangays.find((b) => b.id === barangayId);
        if (barangay && data.session_date) {
            const date = new Date(data.session_date);
            const monthYear = date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            });
            setData('name', `OPT ${monthYear} - ${barangay.name}`);
        }
    };

    const handleDateChange = (date: string) => {
        setData('session_date', date);
        if (data.barangay_id && date) {
            const barangay = barangays.find((b) => b.id === data.barangay_id);
            if (barangay) {
                const dateObj = new Date(date);
                const monthYear = dateObj.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                });
                setData('name', `OPT ${monthYear} - ${barangay.name}`);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('opt_session.create')} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/opt-sessions')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {t('opt_session.create')}
                        </h1>
                        <p className="text-muted-foreground">
                            {t('opt_session.manage_sessions')}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('opt_session.session_details')}</CardTitle>
                            <CardDescription>
                                Enter the details for the new OPT session
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Barangay */}
                            <div className="space-y-2">
                                <Label htmlFor="barangay_id">{t('opt_session.barangay')} *</Label>
                                <Select
                                    value={data.barangay_id}
                                    onValueChange={handleBarangayChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('opt_session.barangay')} />
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
                                    <p className="text-sm text-red-600">
                                        {errors.barangay_id}
                                    </p>
                                )}
                            </div>

                            {/* Session Date */}
                            <div className="space-y-2">
                                <Label htmlFor="session_date">
                                    {t('opt_session.session_date')} *
                                </Label>
                                <Input
                                    id="session_date"
                                    type="date"
                                    value={data.session_date}
                                    onChange={(e) =>
                                        handleDateChange(e.target.value)
                                    }
                                />
                                {errors.session_date && (
                                    <p className="text-sm text-red-600">
                                        {errors.session_date}
                                    </p>
                                )}
                            </div>

                            {/* Session Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('opt_session.session_name')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="e.g., OPT October 2025 - Barangay Name"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        {t('opt_session.start_date')}
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
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        {t('opt_session.end_date')}
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Target Children */}
                            <div className="space-y-2">
                                <Label htmlFor="target_children">
                                    {t('opt_session.target_children')}
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
                                    placeholder="Leave blank to auto-calculate"
                                />
                                <p className="text-sm text-muted-foreground">
                                    If left blank, will be calculated from
                                    registered children 0-59 months
                                </p>
                            </div>

                            {/* Venue */}
                            <div className="space-y-2">
                                <Label htmlFor="venue">{t('opt_session.venue')}</Label>
                                <Input
                                    id="venue"
                                    value={data.venue}
                                    onChange={(e) =>
                                        setData('venue', e.target.value)
                                    }
                                    placeholder="e.g., Barangay Health Center"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">{t('opt_session.notes')}</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="Additional notes about the session"
                                    rows={3}
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        router.visit('/opt-sessions')
                                    }
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('opt_session.create_session')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
