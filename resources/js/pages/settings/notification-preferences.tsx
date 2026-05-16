import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, Mail, Smartphone } from 'lucide-react';
import settings from '@/routes/settings';

interface Preference {
    id: number;
    notification_type: string;
    label: string;
    database: boolean;
    email: boolean;
    push: boolean;
}

interface Props {
    preferences: Preference[];
}

export default function NotificationPreferences({ preferences }: Props) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('settings.title'), href: '/settings' },
        { title: t('settings.notifications'), href: '/settings/notifications' },
    ];

    const toggleChannel = (pref: Preference, channel: 'database' | 'email' | 'push') => {
        router.put(
            settings.notificationPreferences.update.url({ preference: pref.id }),
            {
                [channel]: !pref[channel],
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <SettingsLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.notifications')} />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <Bell className="h-6 w-6" />
                        {t('settings.notifications')}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t('settings.notifications_desc')}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.notification_preferences')}</CardTitle>
                        <CardDescription>
                            {t('settings.notification_preferences_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {preferences.map((pref) => (
                                <div
                                    key={pref.id}
                                    className="rounded-lg border p-4"
                                >
                                    <div className="mb-3 flex items-center gap-2">
                                        <BellOff className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium text-foreground">
                                            {pref.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        {/* In-App / Database channel */}
                                        <label className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50">
                                            <Switch
                                                checked={pref.database}
                                                onCheckedChange={() =>
                                                    toggleChannel(pref, 'database')
                                                }
                                            />
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {t('settings.in_app')}
                                                </span>
                                            </div>
                                        </label>

                                        {/* Email channel */}
                                        <label className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50">
                                            <Switch
                                                checked={pref.email}
                                                onCheckedChange={() =>
                                                    toggleChannel(pref, 'email')
                                                }
                                            />
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {t('settings.email')}
                                                </span>
                                            </div>
                                        </label>

                                        {/* Push channel */}
                                        <label className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent/50">
                                            <Switch
                                                checked={pref.push}
                                                onCheckedChange={() =>
                                                    toggleChannel(pref, 'push')
                                                }
                                            />
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {t('settings.push')}
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
    );
}
