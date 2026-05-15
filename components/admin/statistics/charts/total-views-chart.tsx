'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';
import { cn } from '@/lib/utils';

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

export function TotalViewsChart({ data }: TotalViewsChartProps) {
    const hasData = data.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Total views</CardTitle>
                <CardDescription>All-time monthly comparison</CardDescription>
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
        </Card>
    );
}
