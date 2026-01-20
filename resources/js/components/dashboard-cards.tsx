import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="mt-2 flex items-center">
                        <TrendingUp
                            className={`mr-1 h-3 w-3 ${
                                trend.positive !== false
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                        />
                        <span
                            className={`text-xs ${
                                trend.positive !== false
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            {trend.value > 0 ? '+' : ''}
                            {trend.value}% {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface NutritionalStatusCardProps {
    normal: number;
    mam: number;
    sam: number;
    overweight: number;
    total: number;
}

export function NutritionalStatusCard({
    normal,
    mam,
    sam,
    overweight,
    total,
}: NutritionalStatusCardProps) {
    const getPercentage = (value: number) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nutritional Status Breakdown</CardTitle>
                <CardDescription>Based on latest measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">Normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {getPercentage(normal)}%
                        </span>
                        <span className="text-sm font-bold">{normal}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <span className="text-sm font-medium">MAM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {getPercentage(mam)}%
                        </span>
                        <span className="text-sm font-bold">{mam}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-sm font-medium">SAM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {getPercentage(sam)}%
                        </span>
                        <span className="text-sm font-bold">{sam}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium">Overweight</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {getPercentage(overweight)}%
                        </span>
                        <span className="text-sm font-bold">{overweight}</span>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                            Total Measured
                        </span>
                        <span className="text-sm font-bold">{total}</span>
                    </div>
                </div>

                {/* Visualization bar */}
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                    {normal > 0 && (
                        <div
                            className="bg-green-500"
                            style={{ width: `${getPercentage(normal)}%` }}
                            title={`Normal: ${normal}`}
                        />
                    )}
                    {mam > 0 && (
                        <div
                            className="bg-orange-500"
                            style={{ width: `${getPercentage(mam)}%` }}
                            title={`MAM: ${mam}`}
                        />
                    )}
                    {sam > 0 && (
                        <div
                            className="bg-red-500"
                            style={{ width: `${getPercentage(sam)}%` }}
                            title={`SAM: ${sam}`}
                        />
                    )}
                    {overweight > 0 && (
                        <div
                            className="bg-blue-500"
                            style={{ width: `${getPercentage(overweight)}%` }}
                            title={`Overweight: ${overweight}`}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface HighRiskChild {
    child: {
        id: string;
        full_name: string;
        sex: 'male' | 'female';
        age_in_months: number;
        barangay: {
            name: string;
            municipality_city: string;
        };
    };
    measurement: {
        opt_classification: string;
        wfa_zscore: number | null;
        hfa_zscore: number | null;
        wfh_zscore: number | null;
        measurement_date: string;
    };
    days_since_measurement: number;
}

interface HighRiskChildrenListProps {
    children: HighRiskChild[];
}

export function HighRiskChildrenList({ children }: HighRiskChildrenListProps) {
    if (children.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>High-Risk Children</CardTitle>
                    <CardDescription>
                        Children requiring immediate attention
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No high-risk children found. Great job! 🎉
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    High-Risk Children
                </CardTitle>
                <CardDescription>
                    {children.length}{' '}
                    {children.length === 1 ? 'child' : 'children'} requiring
                    immediate attention
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {children.map((item) => (
                        <div
                            key={item.child.id}
                            className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/children/${item.child.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {item.child.full_name}
                                    </a>
                                    <Badge
                                        variant={
                                            item.measurement
                                                .opt_classification === 'sam'
                                                ? 'destructive'
                                                : 'default'
                                        }
                                        className={
                                            item.measurement
                                                .opt_classification === 'sam'
                                                ? ''
                                                : 'bg-orange-500 hover:bg-orange-600'
                                        }
                                    >
                                        {item.measurement.opt_classification.toUpperCase()}
                                    </Badge>
                                </div>
                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="capitalize">
                                        {item.child.sex}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {item.child.age_in_months} months
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {item.child.barangay.name}
                                    </span>
                                </div>
                                <div className="mt-2 text-xs">
                                    <span className="text-muted-foreground">
                                        Last measured:
                                    </span>
                                    <span className="ml-1 font-medium">
                                        {item.days_since_measurement === 0
                                            ? 'Today'
                                            : `${item.days_since_measurement} days ago`}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 text-right text-xs">
                                {item.measurement.wfa_zscore !== null && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            WFA:
                                        </span>
                                        <span className="ml-1 font-mono font-medium">
                                            {item.measurement.wfa_zscore.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {item.measurement.hfa_zscore !== null && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            HFA:
                                        </span>
                                        <span className="ml-1 font-mono font-medium">
                                            {item.measurement.hfa_zscore.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
