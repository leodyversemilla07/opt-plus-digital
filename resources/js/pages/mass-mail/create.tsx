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
import {
    store as massMailStore,
    previewRecipients,
} from '@/routes/mass-mail/index';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Send, Users } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mass Mail', href: '/mass-mail' },
    { title: 'Compose', href: '/mass-mail/create' },
];

interface Barangay {
    id: number;
    name: string;
}

interface MassMailForm {
    subject: string;
    message_body: string;
    recipient_type: string;
    recipient_criteria: Record<string, string | number | string[]>;
}

interface Props {
    barangays: Barangay[];
    classifications: Record<string, string>;
    recipientTypes: Record<string, string>;
}

export default function MassMailCreate({
    barangays,
    classifications,
    recipientTypes,
}: Props) {
    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [countLoading, setCountLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } =
        useForm<MassMailForm>({
            subject: '',
            message_body: '',
            recipient_type: '',
            recipient_criteria: {},
        });

    const [criteriaBarangayId, setCriteriaBarangayId] = useState<string>('');
    const [criteriaClassification, setCriteriaClassification] =
        useState<string>('');
    const [criteriaRoles, setCriteriaRoles] = useState<string[]>([]);

    const updateCriteria = () => {
        const criteria: Record<string, string | number | string[]> = {};

        if (criteriaBarangayId) {
            criteria.barangay_id = Number(criteriaBarangayId);
        }
        if (criteriaClassification) {
            criteria.classification = criteriaClassification;
        }
        if (criteriaRoles.length > 0) {
            criteria.roles = criteriaRoles;
        }

        setData('recipient_criteria', criteria);
    };

    const handleRecipientTypeChange = (value: string | null) => {
        setData('recipient_type', value ?? '');
        setRecipientCount(null);
        setCriteriaBarangayId('');
        setCriteriaClassification('');
        setCriteriaRoles([]);
        setData('recipient_criteria', {});
    };

    const previewRecipientsCount = async () => {
        setCountLoading(true);
        setRecipientCount(null);

        updateCriteria();

        try {
            const response = await fetch(previewRecipients.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    recipient_type: data.recipient_type,
                    recipient_criteria: data.recipient_criteria,
                }),
            });

            const result = await response.json();
            setRecipientCount(result.count);
        } catch {
            // Silently fail
        } finally {
            setCountLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCriteria();
        post(massMailStore.url(), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const availableRoles = ['admin', 'municipal', 'bns', 'bhw'];

    const toggleRole = (role: string) => {
        setCriteriaRoles((prev) => {
            const updated = prev.includes(role)
                ? prev.filter((r) => r !== role)
                : [...prev, role];
            return updated;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compose Mass Mail" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-2"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Compose Mass Mail
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Send bulk email notifications to parents, BNS workers,
                        and LGU officials
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Recipient Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5" />
                                Recipients
                            </CardTitle>
                            <CardDescription>
                                Choose who should receive this message
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="w-full max-w-md">
                                <Label htmlFor="recipient_type">
                                    Recipient Group
                                </Label>
                                <Select
                                    value={data.recipient_type}
                                    onValueChange={handleRecipientTypeChange}
                                >
                                    <SelectTrigger
                                        id="recipient_type"
                                        className="mt-1.5"
                                    >
                                        <SelectValue placeholder="Select recipient group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(recipientTypes).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.recipient_type && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.recipient_type}
                                    </p>
                                )}
                            </div>

                            {data.recipient_type === 'by_barangay' && (
                                <div className="w-full max-w-md">
                                    <Label htmlFor="barangay">Barangay</Label>
                                    <Select
                                        value={criteriaBarangayId}
                                        onValueChange={(value) => {
                                            setCriteriaBarangayId(value ?? '');
                                        }}
                                    >
                                        <SelectTrigger
                                            id="barangay"
                                            className="mt-1.5"
                                        >
                                            <SelectValue placeholder="Select barangay" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {barangays.map((b) => (
                                                <SelectItem
                                                    key={b.id}
                                                    value={String(b.id)}
                                                >
                                                    {b.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {data.recipient_type === 'by_classification' && (
                                <div className="w-full max-w-md">
                                    <Label htmlFor="classification">
                                        Nutritional Classification
                                    </Label>
                                    <Select
                                        value={criteriaClassification}
                                        onValueChange={(value) => {
                                            setCriteriaClassification(
                                                value ?? '',
                                            );
                                        }}
                                    >
                                        <SelectTrigger
                                            id="classification"
                                            className="mt-1.5"
                                        >
                                            <SelectValue placeholder="Select classification" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(
                                                classifications,
                                            ).map(([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {data.recipient_type === 'specific_roles' && (
                                <div className="space-y-2">
                                    <Label>User Roles</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableRoles.map((role) => (
                                            <Button
                                                key={role}
                                                type="button"
                                                variant={
                                                    criteriaRoles.includes(role)
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() => toggleRole(role)}
                                            >
                                                {role.charAt(0).toUpperCase() +
                                                    role.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="w-full max-w-md">
                                        <Label htmlFor="barangay-role">
                                            Filter by Barangay
                                        </Label>
                                        <Select
                                            value={criteriaBarangayId}
                                            onValueChange={(value) => {
                                                setCriteriaBarangayId(
                                                    value ?? '',
                                                );
                                            }}
                                        >
                                            <SelectTrigger
                                                id="barangay-role"
                                                className="mt-1.5"
                                            >
                                                <SelectValue placeholder="All barangays" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">
                                                    All barangays
                                                </SelectItem>
                                                {barangays.map((b) => (
                                                    <SelectItem
                                                        key={b.id}
                                                        value={String(b.id)}
                                                    >
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {data.recipient_type && (
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={previewRecipientsCount}
                                        disabled={countLoading}
                                    >
                                        {countLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Counting...
                                            </>
                                        ) : (
                                            <>
                                                <Users className="mr-2 h-4 w-4" />
                                                Preview Count
                                            </>
                                        )}
                                    </Button>
                                    {recipientCount !== null && (
                                        <span className="text-sm text-muted-foreground">
                                            Estimated recipients:{' '}
                                            <strong className="text-foreground">
                                                {recipientCount}
                                            </strong>
                                        </span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Message Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message</CardTitle>
                            <CardDescription>
                                Write the email subject and body
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) =>
                                        setData('subject', e.target.value)
                                    }
                                    placeholder="e.g., OPT Plus Measurement Schedule for June 2026"
                                    className="mt-1.5"
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.subject}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="message_body">
                                    Message Body
                                </Label>
                                <Textarea
                                    id="message_body"
                                    value={data.message_body}
                                    onChange={(e) =>
                                        setData('message_body', e.target.value)
                                    }
                                    placeholder="Type your message here..."
                                    rows={10}
                                    className="mt-1.5"
                                />
                                {errors.message_body && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.message_body}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !data.recipient_type ||
                                !data.subject ||
                                !data.message_body
                            }
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Mass Mail
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
