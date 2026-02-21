import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface TerminalDigitData {
    digit: string;
    weightCount: number;
    weightPercentage: number;
    heightCount: number;
    heightPercentage: number;
}

interface TerminalDigitChartProps {
    data: {
        weight: {
            counts: number[];
            percentages: number[];
            has_preference: boolean;
            max_percentage: number;
        };
        height: {
            counts: number[];
            percentages: number[];
            has_preference: boolean;
            max_percentage: number;
        };
    };
}

export default function TerminalDigitChart({ data }: TerminalDigitChartProps) {
    const chartData: TerminalDigitData[] = Array.from(
        { length: 10 },
        (_, i) => ({
            digit: i.toString(),
            weightCount: data.weight.counts[i] || 0,
            weightPercentage: data.weight.percentages[i] || 0,
            heightCount: data.height.counts[i] || 0,
            heightPercentage: data.height.percentages[i] || 0,
        }),
    );

    const chartConfig = {
        weightCount: {
            label: 'Weight Count',
            color: 'hsl(var(--chart-1))',
        },
        weightPercentage: {
            label: 'Weight %',
            color: 'hsl(var(--chart-2))',
        },
        heightCount: {
            label: 'Height Count',
            color: 'hsl(var(--chart-3))',
        },
        heightPercentage: {
            label: 'Height %',
            color: 'hsl(var(--chart-4))',
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg text-foreground">
                    Terminal Digit Preference Analysis
                </CardTitle>
                <CardDescription>
                    Distribution of last digits (0-9) in weight and height
                    values
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    {/* Weight Alert */}
                    <div
                        className={`rounded-lg border p-3 ${
                            data.weight.has_preference
                                ? 'border-destructive bg-destructive/5'
                                : 'border-green-500/20 bg-green-500/5'
                        }`}
                    >
                        <p className="text-sm font-medium text-muted-foreground">
                            Weight Digit Preference
                        </p>
                        <p
                            className={`text-lg font-bold ${
                                data.weight.has_preference
                                    ? 'text-destructive'
                                    : 'text-green-600'
                            }`}
                        >
                            {data.weight.has_preference
                                ? 'DETECTED'
                                : 'None detected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Max digit usage: {data.weight.max_percentage}%
                        </p>
                    </div>

                    {/* Height Alert */}
                    <div
                        className={`rounded-lg border p-3 ${
                            data.height.has_preference
                                ? 'border-destructive bg-destructive/5'
                                : 'border-green-500/20 bg-green-500/5'
                        }`}
                    >
                        <p className="text-sm font-medium text-muted-foreground">
                            Height Digit Preference
                        </p>
                        <p
                            className={`text-lg font-bold ${
                                data.height.has_preference
                                    ? 'text-destructive'
                                    : 'text-green-600'
                            }`}
                        >
                            {data.height.has_preference
                                ? 'DETECTED'
                                : 'None detected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Max digit usage: {data.height.max_percentage}%
                        </p>
                    </div>
                </div>

                <ChartContainer
                    config={chartConfig}
                    className="h-87.5 w-full text-foreground"
                >
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="digit"
                            label="Last Digit (0-9)"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            label={{
                                value: 'Percentage (%)',
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                            dataKey="weightPercentage"
                            fill="var(--chart-2)"
                            name="Weight %"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="heightPercentage"
                            fill="var(--chart-4)"
                            name="Height %"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>

                <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                        ℹ️ <strong>Note:</strong> Terminal digit preference
                        occurs when one digit appears in more than 20% of
                        measurements. This may indicate biased recording or
                        estimation rather than actual measurement.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
