'use client';

import { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';

type TopPhotoEvolutionChartProps = {
    data: StatisticsOverview['topPhotoEvolution'];
};

const lineColors = ['var(--chart-1)', 'var(--chart-4)', 'var(--chart-5)'];

export function TopPhotoEvolutionChart({ data }: TopPhotoEvolutionChartProps) {
    const chartConfig = useMemo(
        () =>
            data.photos.reduce<ChartConfig>((config, photo, index) => {
                config[photo.key] = {
                    label: photo.name,
                    color: lineColors[index],
                };

                return config;
            }, {}),
        [data.photos],
    );
    const hasData = data.photos.length > 0 && data.chartData.some((point) => data.photos.some((photo) => (point[photo.key] ?? 0) > 0));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Trending photos</CardTitle>
                <CardDescription>Fastest growing photos over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig}>
                        <LineChart
                            accessibilityLayer
                            data={data.chartData}
                            margin={{
                                left: 22,
                                right: 22,
                            }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis allowDecimals={false} hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            {data.photos.map((photo) => (
                                <Line
                                    key={photo.id}
                                    dataKey={photo.key}
                                    type="monotone"
                                    stroke={`var(--color-${photo.key})`}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ChartContainer>
                ) : (
                    <div className="flex aspect-video items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                        No photo is growing faster than last week yet.
                    </div>
                )}
            </CardContent>
            {hasData && (
                <CardFooter>
                    <div className="flex w-full items-start gap-2 text-sm">
                        <div className="grid gap-2">
                            <div className="flex flex-wrap gap-4 justify-between">
                                {data.photos.map((photo) => (
                                    <div key={photo.id} className="flex flex-col items-center gap-2 font-medium">
                                        {photo.srcThumb && <img src={photo.srcThumb} alt={photo.name} className="size-12 rounded object-cover" />}
                                        <span className="truncate">
                                            {photo.name}
                                            <span className="text-emerald-600"> +{photo.growth}%</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-muted-foreground text-xs">
                                Rapid growth matters more than all-time views. A photo trending at +200% this week is more relevant than a photo with
                                3K views over 2 years.
                            </div>
                        </div>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
