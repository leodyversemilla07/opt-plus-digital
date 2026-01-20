import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    FileWarning,
} from 'lucide-react';

interface DQCAlertCardProps {
    summary: {
        total_measurements: number;
        flagged_records_count: number;
        overaged_records_count: number;
        stunted_records_count: number;
        duplicates: any[];
        terminal_digit_analysis: {
            weight: { has_preference: boolean };
            height: { has_preference: boolean };
        };
    };
}

export default function DQCAlertCard({ summary }: DQCAlertCardProps) {
    const hasAnyIssue =
        summary.flagged_records_count > 0 ||
        summary.overaged_records_count > 0 ||
        summary.stunted_records_count > 0 ||
        summary.duplicates.length > 0 ||
        summary.terminal_digit_analysis.weight.has_preference ||
        summary.terminal_digit_analysis.height.has_preference;

    return (
        <Card
            className={`${
                hasAnyIssue
                    ? 'border-destructive bg-destructive/5'
                    : 'border-green-500/20 bg-green-500/5'
            }`}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    {hasAnyIssue ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    Data Quality Alerts
                </CardTitle>
                <CardDescription>
                    Summary of data quality issues detected
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Flagged Records */}
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-3">
                        {summary.flagged_records_count > 0 ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Flagged Records
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Z-scores outside ±6 SD
                            </p>
                        </div>
                    </div>
                    {summary.flagged_records_count > 0 ? (
                        <Badge
                            variant="destructive"
                            className="text-sm font-bold"
                        >
                            {summary.flagged_records_count}
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-600 text-sm font-bold text-white"
                        >
                            0
                        </Badge>
                    )}
                </div>

                {/* Overaged Records */}
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-3">
                        {summary.overaged_records_count > 0 ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Overaged Children
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Age ≥ 60 months (5 years)
                            </p>
                        </div>
                    </div>
                    {summary.overaged_records_count > 0 ? (
                        <Badge
                            variant="destructive"
                            className="text-sm font-bold"
                        >
                            {summary.overaged_records_count}
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-600 text-sm font-bold text-white"
                        >
                            0
                        </Badge>
                    )}
                </div>

                {/* Duplicate Records */}
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-3">
                        {summary.duplicates.length > 0 ? (
                            <FileWarning className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Duplicate Records
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Same name, DOB, barangay
                            </p>
                        </div>
                    </div>
                    {summary.duplicates.length > 0 ? (
                        <Badge
                            variant="destructive"
                            className="text-sm font-bold"
                        >
                            {summary.duplicates.length}
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-600 text-sm font-bold text-white"
                        >
                            0
                        </Badge>
                    )}
                </div>

                {/* Stunted Children */}
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-3">
                        {summary.stunted_records_count > 0 ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Stunted Children
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Height-for-age below -2 SD
                            </p>
                        </div>
                    </div>
                    {summary.stunted_records_count > 0 ? (
                        <Badge
                            variant="destructive"
                            className="text-sm font-bold"
                        >
                            {summary.stunted_records_count}
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-600 text-sm font-bold text-white"
                        >
                            0
                        </Badge>
                    )}
                </div>

                {/* Terminal Digit Preference */}
                <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                    <div className="flex items-center gap-3">
                        {summary.terminal_digit_analysis.weight
                            .has_preference ||
                        summary.terminal_digit_analysis.height
                            .has_preference ? (
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Terminal Digit Preference
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Weight or height bias detected
                            </p>
                        </div>
                    </div>
                    {summary.terminal_digit_analysis.weight.has_preference ||
                    summary.terminal_digit_analysis.height.has_preference ? (
                        <Badge
                            variant="destructive"
                            className="text-sm font-bold"
                        >
                            DETECTED
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-green-600 text-sm font-bold text-white"
                        >
                            None
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
