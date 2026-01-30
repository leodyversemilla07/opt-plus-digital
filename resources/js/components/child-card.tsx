import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, QrCode, Users, Eye } from 'lucide-react';

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
    is_indigenous_people: boolean;
    indigenous_people_group: string | null;
    qr_code: string | null;
    latest_measurement?: {
        opt_classification: string;
        measurement_date: string;
    } | null;
}

interface ChildCardProps {
    child: Child;
    showActions?: boolean;
}

export default function ChildCard({ child, showActions = true }: ChildCardProps) {
    const getAgeDisplay = (ageInMonths: number) => {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
        }
        return `${months} month${months > 1 ? 's' : ''}`;
    };

    const getStatusBadge = (classification: string) => {
        const variants: Record<
            string,
            'default' | 'destructive' | 'secondary'
        > = {
            normal: 'default',
            severely_malnourished: 'destructive',
            moderately_malnourished: 'destructive',
            overweight: 'secondary',
            obese: 'destructive',
        };

        return (
            <Badge variant={variants[classification] || 'default'} className="text-xs">
                {classification.replace(/_/g, ' ').toUpperCase()}
            </Badge>
        );
    };

    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        {/* Name and Sex */}
                        <div className="mb-3 flex items-start gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                                {child.full_name}
                            </h3>
                            <Badge
                                variant={
                                    child.sex === 'male' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                            >
                                {child.sex === 'male' ? 'Male' : 'Female'}
                            </Badge>
                            {child.is_indigenous_people && (
                                <Badge variant="outline" className="text-xs">
                                    IP
                                </Badge>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">FSN:</span>
                                <span>{child.family_serial_number}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(
                                        child.date_of_birth
                                    ).toLocaleDateString()}{' '}
                                    ({getAgeDisplay(child.age_in_months)})
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    {child.barangay.name},{' '}
                                    {child.barangay.municipality_city}
                                </span>
                            </div>

                            {child.is_indigenous_people &&
                                child.indigenous_people_group && (
                                    <div className="text-xs">
                                        <span className="font-medium">
                                            Indigenous Group:
                                        </span>{' '}
                                        {child.indigenous_people_group}
                                    </div>
                                )}

                            {child.qr_code && (
                                <div className="flex items-center gap-2">
                                    <QrCode className="h-4 w-4" />
                                    <span className="font-mono text-xs">
                                        {child.qr_code}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Latest Measurement Status */}
                        {child.latest_measurement && (
                            <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted p-2">
                                <span className="text-xs text-muted-foreground">
                                    Latest Status:
                                </span>
                                {getStatusBadge(
                                    child.latest_measurement.opt_classification
                                )}
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {new Date(
                                        child.latest_measurement.measurement_date
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="ml-4">
                            <Link href={`/children/${child.id}`}>
                                <Button variant="outline" size="sm">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
