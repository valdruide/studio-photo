import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function rankBadgeClass(rank: number) {
    if (rank === 1) return 'bg-yellow-500/25 text-yellow-400 border-yellow-500';
    if (rank === 2) return 'bg-zinc-500/45 text-zinc-200 border-zinc-500';
    if (rank === 3) return 'bg-orange-500/25 text-orange-100 border-orange-500';
    return 'bg-background/80 text-muted-foreground border-border';
}

type TopCategoryProps = {
    topCategory?: StatisticsOverview['topCategories'];
    topCollection?: StatisticsOverview['topCollections'];
    maxNumberOfCategories: number;
    isOverview?: boolean;
    type: 'category' | 'collection';
};

export function TopCategoryOrTopCollection({ topCategory, topCollection, maxNumberOfCategories, isOverview, type }: TopCategoryProps) {
    const stats = type === 'category' ? (topCategory ?? []) : (topCollection ?? []);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Folder className="size-5 text-primary" />
                    {type === 'category' ? 'Top categories' : 'Top collections'}
                </CardTitle>
                <CardDescription>Ranked by unique photo views.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                {stats.length === 0 && <p className="text-center text-sm text-muted-foreground">Not enough data available</p>}
                {stats.slice(0, maxNumberOfCategories).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                        <div
                            className={cn(
                                'flex size-9 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold',
                                rankBadgeClass(index + 1),
                            )}
                        >
                            {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                                <p className="truncate font-medium">{item.name}</p>
                                <span className="text-sm text-muted-foreground">
                                    {item.views} {item.views <= 1 ? 'photo viewed' : 'photos viewed'}
                                </span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-muted">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${100 - index * 12}%` }} />
                            </div>
                        </div>
                    </div>
                ))}
                {isOverview && (
                    <div className="text-right">
                        <Button variant="link" asChild className="text-foreground hover:text-primary">
                            <Link href="/admin/statistics/photos">
                                <ArrowRight className="size-4" />
                                View all top {type === 'category' ? 'categories' : 'collections'}
                            </Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
