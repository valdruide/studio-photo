'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';

type TotalViewsChartProps = {
    data: StatisticsOverview['viewsChartData'];
    trend?: {
        value: number;
        label: string;
    };
};

const chartConfig = {
    views: {
        label: 'Views',
        color: 'var(--chart-2)',
    },
    label: {
        color: 'var(--background)',
    },
} satisfies ChartConfig;

export function TotalViewsChart({ data, trend }: TotalViewsChartProps) {
    const hasTrend = trend && Number.isFinite(trend.value);
    const isPositive = hasTrend && trend.value > 0;
    const isNegative = hasTrend && trend.value < 0;
    const hasData = data.length > 0;

    return (
        <Card className="border">
            <CardHeader>
                <CardTitle>Total views</CardTitle>
                <CardDescription>All-time monthly comparison.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            accessibilityLayer
                            data={data}
                            margin={{
                                top: 22,
                            }}
                        >
                            <CartesianGrid horizontal={false} />
                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis dataKey="views" type="number" allowDecimals={false} hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                            <Bar dataKey="views" fill="var(--color-views)" radius={8} minPointSize={6}>
                                <LabelList dataKey="views" position="top" offset={8} className="fill-foreground" fontSize={12} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex aspect-video items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No views recorded for this period.
                    </div>
                )}
            </CardContent>
            {hasTrend && (
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 leading-none font-medium">
                        {isPositive && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                        {isNegative && <TrendingDown className="h-4 w-4 text-destructive" />}
                        {trend.value > 0 ? '+' : ''}
                        {trend.value}% {trend.label}
                    </div>
                    <div className="leading-none text-muted-foreground">Showing all-time total views by month.</div>
                </CardFooter>
            )}
        </Card>
    );
}
