import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { AlertTriangle, Baby, TrendingUp } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface F1KProgressCardProps {
    totalChildren0to23: number;
    measuredChildren0to23: number;
    f1kCoverage: number;
    maleF1K: number;
    femaleF1K: number;
    malnourishedF1K: number;
    stuntedF1K: number;
}

export default function F1KProgressCard({
    totalChildren0to23,
    measuredChildren0to23,
    f1kCoverage,
    maleF1K,
    femaleF1K,
    malnourishedF1K,
    stuntedF1K,
}: F1KProgressCardProps) {
    const chartData = [
        { name: 'Male', value: maleF1K },
        { name: 'Female', value: femaleF1K },
    ];

    const chartConfig = {
        value: {
            label: 'Children',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <Baby className="h-5 w-5 text-primary" />
                    First 1000 Days Coverage (F1K)
                </CardTitle>
                <CardDescription>
                    Children 0-23 months - critical intervention window
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Coverage Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-background p-4">
                        <p className="text-sm text-muted-foreground">
                            Total F1K Children
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                            {totalChildren0to23.toLocaleString()}
                        </p>
                    </div>
                    <div
                        className={`rounded-lg border p-4 ${
                            f1kCoverage >= 90
                                ? 'border-green-500 bg-green-500/5'
                                : f1kCoverage >= 70
                                  ? 'border-yellow-500 bg-yellow-500/5'
                                  : 'border-destructive bg-destructive/5'
                        }`}
                    >
                        <p className="text-sm text-muted-foreground">
                            Coverage Rate
                        </p>
                        <p
                            className={`text-2xl font-bold ${
                                f1kCoverage >= 90
                                    ? 'text-green-600'
                                    : f1kCoverage >= 70
                                      ? 'text-yellow-600'
                                      : 'text-destructive'
                            }`}
                        >
                            {f1kCoverage.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Sex Breakdown Chart */}
                <div className="rounded-lg border bg-background p-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                        F1K Children by Sex
                    </p>
                    <ChartContainer
                        config={chartConfig}
                        className="h-[200px] w-full text-foreground"
                    >
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar
                                dataKey="value"
                                fill="var(--chart-1)"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </div>

                {/* Health Indicators */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div
                        className={`rounded-lg border p-4 ${
                            malnourishedF1K === 0
                                ? 'border-green-500 bg-green-500/5'
                                : 'border-destructive bg-destructive/5'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle
                                className={`h-5 w-5 ${
                                    malnourishedF1K === 0
                                        ? 'text-green-600'
                                        : 'text-destructive'
                                }`}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Malnourished (MAM+SAM)
                                </p>
                                <p
                                    className={`text-2xl font-bold ${
                                        malnourishedF1K === 0
                                            ? 'text-green-600'
                                            : 'text-destructive'
                                    }`}
                                >
                                    {malnourishedF1K}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div
                        className={`rounded-lg border p-4 ${
                            stuntedF1K === 0
                                ? 'border-green-500 bg-green-500/5'
                                : 'border-destructive bg-destructive/5'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <TrendingUp
                                className={`h-5 w-5 ${
                                    stuntedF1K === 0
                                        ? 'text-green-600'
                                        : 'text-destructive'
                                }`}
                            />
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Stunted Children
                                </p>
                                <p
                                    className={`text-2xl font-bold ${
                                        stuntedF1K === 0
                                            ? 'text-green-600'
                                            : 'text-destructive'
                                    }`}
                                >
                                    {stuntedF1K}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                        <p className="mb-2 text-sm text-muted-foreground">
                            F1K Priority
                        </p>
                        <Badge
                            variant={
                                f1kCoverage >= 90
                                    ? 'default'
                                    : f1kCoverage >= 70
                                      ? 'secondary'
                                      : 'destructive'
                            }
                            className="w-full justify-center py-3"
                        >
                            {f1kCoverage >= 90
                                ? 'EXCELLENT (≥90%)'
                                : f1kCoverage >= 70
                                  ? 'GOOD (≥70%)'
                                  : 'NEEDS ATTENTION'}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
