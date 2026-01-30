import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { index as childrenIndex, show as childrenShow, edit as childrenEdit } from '@/routes/children';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, User, Calendar, MapPin } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Child {
    id: string;
    full_name: string;
    family_serial_number: string;
    sex: 'male' | 'female';
    date_of_birth: string;
    age_in_months: number;
    barangay: {
        name: string;
        municipality_city: string;
    };
    mother_name: string | null;
    father_name: string | null;
    created_at: string;
}

interface DuplicateGroup {
    criteria: string;
    match_value: string;
    children: Child[];
    confidence: 'high' | 'medium' | 'low';
}

interface Props {
    duplicates: DuplicateGroup[];
}

export default function Duplicates({ duplicates }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Children', href: '/children' },
        { title: 'Duplicates', href: '/children/duplicates' },
    ];

    const getConfidenceBadge = (confidence: string) => {
        const variants: Record<
            string,
            'default' | 'destructive' | 'secondary'
        > = {
            high: 'destructive',
            medium: 'secondary',
            low: 'default',
        };

        return (
            <Badge variant={variants[confidence] || 'default'}>
                {confidence.toUpperCase()} CONFIDENCE
            </Badge>
        );
    };

    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years}y ${months}m`;
        }
        return `${months}m`;
    };

    const getCriteriaDescription = (criteria: string) => {
        const descriptions: Record<string, string> = {
            exact_name_dob:
                'Exact match on full name and date of birth',
            exact_name_similar_dob:
                'Exact name match with similar date of birth (±7 days)',
            similar_name_exact_dob:
                'Similar name with exact date of birth match',
            same_parents:
                'Same mother and father names with similar age',
            same_fsn: 'Same family serial number',
            qr_code: 'Same QR code',
        };
        return descriptions[criteria] || criteria;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Potential Duplicate Children" />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto max-w-7xl w-full">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Potential Duplicate Children
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Review and resolve potential duplicate
                            registrations
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl w-full">

                    {/* Alert */}
                    {duplicates.length > 0 && (
                        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                                        {duplicates.length} Potential Duplicate
                                        Group{duplicates.length > 1 ? 's' : ''}{' '}
                                        Found
                                    </h3>
                                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                                        Please review these potential duplicates
                                        carefully. If they are the same child,
                                        consider merging or deleting duplicate
                                        records.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Duplicate Groups */}
                    {duplicates.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <User className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight">
                                    No Duplicates Found
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    All child registrations appear to be unique.
                                </p>
                                <Link href={childrenIndex.url()} className="mt-4 inline-block">
                                    <Button>Back to Children List</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {duplicates.map((group, groupIndex) => (
                                <Card key={groupIndex}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>
                                                    Duplicate Group #{groupIndex + 1}
                                                </CardTitle>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {getCriteriaDescription(
                                                        group.criteria
                                                    )}
                                                </p>
                                            </div>
                                            {getConfidenceBadge(
                                                group.confidence
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {group.children.map(
                                                (child, childIndex) => (
                                                    <div
                                                        key={child.id}
                                                        className={`rounded-lg border p-4 ${childIndex === 0
                                                                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                                                                : 'border-border bg-card'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold tracking-tight">
                                                                        {
                                                                            child.full_name
                                                                        }
                                                                    </h4>
                                                                    <Badge
                                                                        variant={
                                                                            child.sex ===
                                                                                'male'
                                                                                ? 'default'
                                                                                : 'secondary'
                                                                        }
                                                                    >
                                                                        {child.sex ===
                                                                            'male'
                                                                            ? 'Male'
                                                                            : 'Female'}
                                                                    </Badge>
                                                                    {childIndex ===
                                                                        0 && (
                                                                            <Badge variant="outline">
                                                                                Original
                                                                            </Badge>
                                                                        )}
                                                                </div>

                                                                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <Calendar className="h-4 w-4" />
                                                                        <span>
                                                                            Born:{' '}
                                                                            {new Date(
                                                                                child.date_of_birth
                                                                            ).toLocaleDateString()}{' '}
                                                                            (
                                                                            {getAgeDisplay(
                                                                                child.age_in_months
                                                                            )}
                                                                            )
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                                        <MapPin className="h-4 w-4" />
                                                                        <span>
                                                                            {
                                                                                child
                                                                                    .barangay
                                                                                    .name
                                                                            }
                                                                            ,{' '}
                                                                            {
                                                                                child
                                                                                    .barangay
                                                                                    .municipality_city
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-muted-foreground">
                                                                        <span className="font-medium">
                                                                            FSN:
                                                                        </span>{' '}
                                                                        {
                                                                            child.family_serial_number
                                                                        }
                                                                    </div>
                                                                    {child.mother_name && (
                                                                        <div className="text-muted-foreground">
                                                                            <span className="font-medium">
                                                                                Mother:
                                                                            </span>{' '}
                                                                            {
                                                                                child.mother_name
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    {child.father_name && (
                                                                        <div className="text-muted-foreground">
                                                                            <span className="font-medium">
                                                                                Father:
                                                                            </span>{' '}
                                                                            {
                                                                                child.father_name
                                                                            }
                                                                        </div>
                                                                    )}
                                                                    <div className="text-muted-foreground">
                                                                        <span className="font-medium">
                                                                            Registered:
                                                                        </span>{' '}
                                                                        {new Date(
                                                                            child.created_at
                                                                        ).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="ml-4 flex gap-2">
                                                                <Link
                                                                    href={childrenShow.url(child.id)}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        View
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    href={childrenEdit.url(child.id)}
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex gap-2 border-t pt-4">
                                            <p className="flex-1 text-sm text-muted-foreground">
                                                <span className="font-medium">
                                                    Action Required:
                                                </span>{' '}
                                                If these are the same child,
                                                please merge or delete duplicate
                                                records.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Info Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>How Duplicates Are Detected</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                    <span className="font-semibold">
                                        High Confidence:
                                    </span>{' '}
                                    Exact match on name and date of birth, or
                                    same QR code
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Medium Confidence:
                                    </span>{' '}
                                    Similar names with close dates of birth, or
                                    same parents
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Low Confidence:
                                    </span>{' '}
                                    Same family serial number or other partial
                                    matches
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
