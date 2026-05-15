import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type KpiCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
};

export function KpiCard({ title, value, icon, trend }: KpiCardProps) {
    const hasTrend = trend && Number.isFinite(trend.value);
    const isPositive = hasTrend && trend.value > 0;
    const isNegative = hasTrend && trend.value < 0;

    return (
        <Card>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-semibold tracking-tight">{value}</p>
                    </div>
                </div>
                {hasTrend && (
                    <>
                        <Separator className="my-2" />
                        <div
                            className={cn(
                                'flex items-center gap-1 text-xs font-medium',
                                isPositive && 'text-emerald-600',
                                isNegative && 'text-destructive',
                                !isPositive && !isNegative && 'text-muted-foreground',
                            )}
                        >
                            {isPositive && <TrendingUp className="size-3" />}
                            {isNegative && <TrendingDown className="size-3" />}

                            <span>
                                {trend.value > 0 ? '+' : ''}
                                {trend.value}% {trend.label}
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
