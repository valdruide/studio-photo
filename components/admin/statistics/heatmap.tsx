'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export type HeatmapPoint = {
    day: number; // 0 = Sunday, 1 = Monday...
    hour: number; // 0 -> 23
    value: number;
};

type ActivityHeatmapProps = {
    title?: string;
    description?: string;
    data: HeatmapPoint[];
    className?: string;
    valueLabel?: string;
    showLegend?: boolean;
    emptyLabel?: string;
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number) {
    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 || 12;

    return `${hour12} ${period}`;
}

function getIntensity(value: number, max: number) {
    if (value <= 0 || max <= 0) return 0;

    const ratio = value / max;

    if (ratio < 0.2) return 1;
    if (ratio < 0.4) return 2;
    if (ratio < 0.7) return 3;
    return 4;
}

function getCellClass(intensity: number) {
    switch (intensity) {
        case 1:
            return 'bg-primary/20';
        case 2:
            return 'bg-primary/40';
        case 3:
            return 'bg-primary/70';
        case 4:
            return 'bg-primary';
        default:
            return 'bg-muted';
    }
}

export function ActivityHeatmap({
    title = 'Activity by day and hour',
    description = 'Distribution of openings by day and hour.',
    data,
    className,
    valueLabel = 'views',
    showLegend = true,
    emptyLabel = 'No activity',
}: ActivityHeatmapProps) {
    const maxValue = Math.max(...data.map((item) => item.value), 0);

    const getValue = (day: number, hour: number) => {
        return data.find((item) => item.day === day && item.hour === hour)?.value ?? 0;
    };

    return (
        <Card className={cn('rounded-xl bg-card', className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto">
                <div className="min-w-[760px]">
                    <div className="grid grid-cols-[48px_repeat(24,minmax(20px,1fr))] gap-1">
                        <div />

                        {HOURS.map((hour) => (
                            <div key={hour} className="text-center text-[10px] text-muted-foreground">
                                {formatHour(hour)}
                            </div>
                        ))}

                        {DAYS.map((dayLabel, dayIndex) => (
                            <React.Fragment key={dayLabel}>
                                <div className="flex h-6 items-center text-xs text-muted-foreground">{dayLabel}</div>

                                {HOURS.map((hour) => {
                                    const value = getValue(dayIndex, hour);
                                    const intensity = getIntensity(value, maxValue);

                                    return (
                                        <div
                                            key={`${dayIndex}-${hour}`}
                                            title={`${dayLabel} ${formatHour(hour)}: ${value} ${valueLabel}`}
                                            className={cn('h-6 rounded-sm transition hover:ring-2 hover:ring-ring', getCellClass(intensity))}
                                        />
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </CardContent>
            {showLegend && (
                <CardFooter className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>{maxValue === 0 ? emptyLabel : `Peak: ${maxValue} ${valueLabel}`}</span>

                    <div className="flex items-center gap-2">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map((intensity) => (
                            <div key={intensity} className={cn('h-3 w-3 rounded-sm', getCellClass(intensity))} />
                        ))}
                        <span>More</span>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
