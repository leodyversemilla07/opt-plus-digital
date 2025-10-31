import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Measurement {
    measurement_date: string;
    weight_kg?: number;
    height_length_cm?: number;
    weight_for_age_zscore?: number | null;
    height_for_age_zscore?: number | null;
}

interface GrowthChartProps {
    measurements: Measurement[];
    type: 'weight' | 'height' | 'weight-zscore' | 'height-zscore';
    sex: 'male' | 'female';
}

export default function GrowthChart({
    measurements,
    type,
    sex,
}: GrowthChartProps) {
    const sortedMeasurements = [...measurements].sort(
        (a, b) =>
            new Date(a.measurement_date).getTime() -
            new Date(b.measurement_date).getTime()
    );

    const getChartTitle = () => {
        switch (type) {
            case 'weight':
                return 'Weight Growth Curve';
            case 'height':
                return 'Height Growth Curve';
            case 'weight-zscore':
                return 'Weight-for-Age Z-Score';
            case 'height-zscore':
                return 'Height-for-Age Z-Score';
        }
    };

    const getChartDescription = () => {
        if (measurements.length === 0) return 'No data available';
        const firstDate = new Date(
            sortedMeasurements[0].measurement_date
        ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const lastDate = new Date(
            sortedMeasurements[sortedMeasurements.length - 1].measurement_date
        ).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return `${firstDate} - ${lastDate}`;
    };

    const getDataKey = () => {
        switch (type) {
            case 'weight':
                return 'weight';
            case 'height':
                return 'height';
            case 'weight-zscore':
                return 'weightZScore';
            case 'height-zscore':
                return 'heightZScore';
        }
    };

    const getYAxisLabel = () => {
        switch (type) {
            case 'weight':
                return 'Weight (kg)';
            case 'height':
                return 'Height (cm)';
            case 'weight-zscore':
            case 'height-zscore':
                return 'Z-Score (SD)';
        }
    };

    const chartData = sortedMeasurements.map((m) => ({
        date: new Date(m.measurement_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
        weight: m.weight_kg || 0,
        height: m.height_length_cm || 0,
        weightZScore: m.weight_for_age_zscore || 0,
        heightZScore: m.height_for_age_zscore || 0,
    }));

    const chartConfig = {
        [getDataKey()]: {
            label: getChartTitle(),
            color: sex === 'male' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-5))',
        },
    } satisfies ChartConfig;

    if (measurements.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{getChartTitle()}</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500">
                        No measurement data available
                    </div>
                </CardContent>
            </Card>
        );
    }

    const isZScore = type.includes('zscore');

    return (
        <Card>
            <CardHeader>
                <CardTitle>{getChartTitle()}</CardTitle>
                <CardDescription>{getChartDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            label={{
                                value: getYAxisLabel(),
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' },
                            }}
                            domain={
                                isZScore
                                    ? [-4, 4]
                                    : ['auto', 'auto']
                            }
                            ticks={
                                isZScore
                                    ? [-4, -3, -2, -1, 0, 1, 2, 3, 4]
                                    : undefined
                            }
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => {
                                        if (type === 'weight') {
                                            return `${Number(value).toFixed(2)} kg`;
                                        } else if (type === 'height') {
                                            return `${Number(value).toFixed(1)} cm`;
                                        } else {
                                            return `${Number(value).toFixed(2)} SD`;
                                        }
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey={getDataKey()}
                            type="natural"
                            stroke={`var(--color-${getDataKey()})`}
                            strokeWidth={2}
                            dot={{
                                fill: `var(--color-${getDataKey()})`,
                                r: 4,
                            }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
