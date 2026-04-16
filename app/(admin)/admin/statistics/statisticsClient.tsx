'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Folder, ImageIcon, Layers3, Medal, TrendingUp, TrendingDown, Lock, Calendar1, Funnel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';
import { Calendar } from '@/components/ui/calendar';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';

function rankBadgeClass(rank: number) {
    if (rank === 1) return 'bg-yellow-500/25 text-yellow-400 border-yellow-500';
    if (rank === 2) return 'bg-zinc-500/45 text-zinc-200 border-zinc-500';
    if (rank === 3) return 'bg-orange-500/25 text-orange-100 border-orange-500';
    return 'bg-background/80 text-muted-foreground border-border';
}

type StatisticsClientProps = {
    stats: StatisticsOverview;
    initialPreset?: string;
    initialFrom?: string;
    initialTo?: string;
};

export function StatisticsClient({ stats, initialPreset, initialFrom, initialTo }: StatisticsClientProps) {
    const normalizedPreset =
        initialPreset === '24h' || initialPreset === '7d' || initialPreset === '30d' || initialPreset === 'custom' ? initialPreset : 'all';

    const [rangePreset, setRangePreset] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>(normalizedPreset);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        initialFrom || initialTo
            ? {
                  from: initialFrom ? new Date(initialFrom) : undefined,
                  to: initialTo ? new Date(initialTo) : undefined,
              }
            : undefined,
    );

    const [showLockedTopPhotos, setShowLockedTopPhotos] = useState(false);
    const [showLockedLeastPhotos, setShowLockedLeastPhotos] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function updateUrl(next: { preset?: string; from?: Date; to?: Date }) {
        const params = new URLSearchParams(searchParams.toString());

        if (!next.preset || next.preset === 'all') {
            params.delete('preset');
            params.delete('from');
            params.delete('to');
        } else {
            params.set('preset', next.preset);

            if (next.from) {
                params.set('from', startOfDay(next.from).toISOString());
            } else {
                params.delete('from');
            }

            if (next.to) {
                params.set('to', endOfDay(next.to).toISOString());
            } else {
                params.delete('to');
            }
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    function formatDate(date?: Date) {
        if (!date) return 'N/A';
        return date.toLocaleDateString('fr-FR');
    }

    function applyPreset(preset: 'all' | '24h' | '7d' | '30d' | 'custom') {
        setRangePreset(preset);

        const now = new Date();

        if (preset === 'all') {
            setDateRange(undefined);
            updateUrl({ preset: 'all' });
            return;
        }

        if (preset === '24h') {
            const nextRange = {
                from: addDays(now, -1),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === '7d') {
            const nextRange = {
                from: addDays(now, -7),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === '30d') {
            const nextRange = {
                from: addDays(now, -30),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === 'custom') {
            const nextRange = dateRange ?? {
                from: addDays(now, -7),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button size="lg" variant="outline">
                            <Funnel className="size-5" />
                            Filter options
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <DrawerHeader>
                            <DrawerTitle className="flex items-center gap-2">
                                <Calendar1 className="size-6 text-green-500" />
                                Filter by date
                            </DrawerTitle>
                            <DrawerDescription>
                                {rangePreset === 'all'
                                    ? 'Showing all-time statistics.'
                                    : rangePreset === 'custom'
                                      ? 'Showing statistics for a custom date range.'
                                      : `Showing statistics for the last ${rangePreset}.`}
                            </DrawerDescription>
                        </DrawerHeader>
                        <div className="no-scrollbar overflow-y-auto space-y-5 mt-4">
                            <div className="flex flex-wrap items-center justify-center bg-secondary gap-2 py-2 px-4">
                                <Button
                                    size="sm"
                                    variant={rangePreset === 'all' ? 'default' : 'outline'}
                                    className="border"
                                    onClick={() => applyPreset('all')}
                                >
                                    All time
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rangePreset === '24h' ? 'default' : 'outline'}
                                    className="border"
                                    onClick={() => applyPreset('24h')}
                                >
                                    24h
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rangePreset === '7d' ? 'default' : 'outline'}
                                    className="border"
                                    onClick={() => applyPreset('7d')}
                                >
                                    7d
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rangePreset === '30d' ? 'default' : 'outline'}
                                    className="border"
                                    onClick={() => applyPreset('30d')}
                                >
                                    30d
                                </Button>
                                <Button
                                    size="sm"
                                    variant={rangePreset === 'custom' ? 'default' : 'outline'}
                                    className="border"
                                    onClick={() => applyPreset('custom')}
                                >
                                    Custom
                                </Button>
                            </div>
                            <div className="space-y-5 px-4">
                                <div className="flex flex-wrap items-center gap-1 justify-center text-sm">
                                    <span className="text-muted-foreground">Current range:</span>

                                    {rangePreset === 'all' ? (
                                        <Badge variant="secondary">All time</Badge>
                                    ) : (
                                        <>
                                            <Badge variant="secondary">{formatDate(dateRange?.from)}</Badge>
                                            <span className="text-muted-foreground">→</span>
                                            <Badge variant="secondary">{formatDate(dateRange?.to)}</Badge>
                                        </>
                                    )}
                                </div>
                                {rangePreset !== 'all' && (
                                    <div className="flex justify-center w-full">
                                        <div className="rounded-xl border p-3 w-fit">
                                            <Calendar
                                                onDayClick={() => applyPreset('custom')}
                                                mode="range"
                                                showOutsideDays
                                                selected={dateRange}
                                                onSelect={(range) => {
                                                    setDateRange(range);
                                                    if (range?.from && range?.to) {
                                                        setRangePreset('custom');
                                                        updateUrl({
                                                            preset: 'custom',
                                                            from: range.from,
                                                            to: range.to,
                                                        });
                                                    }
                                                }}
                                                captionLayout="dropdown"
                                                disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                className="rounded-lg"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DrawerFooter>
                            <Button
                                variant="destructive"
                                disabled={rangePreset === 'all'}
                                onClick={() => {
                                    setRangePreset('all');
                                    setDateRange(undefined);
                                    updateUrl({ preset: 'all' });
                                }}
                            >
                                Reset
                            </Button>
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
                <div className="border shadow-xs font-medium text-sm bg-input/30 border-input flex items-center rounded-md px-4">
                    Current filter : <span className="text-primary ml-2">{rangePreset === 'all' ? 'All time' : rangePreset}</span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Eye className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total photo views</p>
                            <p className="text-2xl font-semibold tracking-tight">{stats.totalViews}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ImageIcon className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Most viewed photo</p>
                            <p className="text-2xl font-semibold tracking-tight">{stats.mostViewedPhoto?.name ?? 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Best performing category</p>
                            <p className="text-2xl font-semibold tracking-tight">{stats.bestCategory?.name ?? 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Best performing collection</p>
                            <p className="text-2xl font-semibold tracking-tight">{stats.bestCollection?.name ?? 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top performing photos */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Medal className="size-6 text-primary" />
                                Top 10 photos
                            </CardTitle>
                            <CardDescription className="mt-1 max-w-2xl">Ranked by unique opens in the viewer.</CardDescription>
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch checked={showLockedTopPhotos} onCheckedChange={setShowLockedTopPhotos} />
                            <Label>Show locked photos</Label>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
                        {stats.topPhotos.map((photo, index) => (
                            <div
                                key={photo.id}
                                className={cn(
                                    'group relative aspect-square overflow-hidden rounded-xl border bg-muted/40',
                                    index === 0 && 'ring-1 ring-yellow-500',
                                    index === 1 && 'ring-1 ring-zinc-500',
                                    index === 2 && 'ring-1 ring-orange-600',
                                )}
                            >
                                {photo.lockedByPassword && !showLockedTopPhotos && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-lg">
                                        <Lock className="size-6 text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/90"></div>
                                <img src={photo.srcThumb} alt={photo.name} className="h-full w-full object-cover" />
                                <div className="absolute left-2 top-2">
                                    <Badge variant="outline" className={cn('backdrop-blur-sm', rankBadgeClass(index + 1))}>
                                        #{index + 1}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-white">{photo.name}</p>
                                        <p className="text-xs text-white/70">{photo.views} views</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {/* Top categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Folder className="size-5 text-primary" />
                            Top categories
                        </CardTitle>
                        <CardDescription>Ranked by unique photo views.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {stats.topCategories.map((item, index) => (
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
                                        <span className="text-sm text-muted-foreground">{item.views} photos viewed</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-muted">
                                        <div className="h-2 rounded-full bg-primary" style={{ width: `${100 - index * 12}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                {/* Top collections */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Layers3 className="size-5 text-primary" />
                            Top collections
                        </CardTitle>
                        <CardDescription>Ranked by unique photo views.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {stats.topCollections.map((item, index) => (
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
                                        <span className="text-sm text-muted-foreground">{item.views} photos viewed</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-muted">
                                        <div className="h-2 rounded-full bg-primary" style={{ width: `${100 - index * 12}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            {/* Least performing photos */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <TrendingDown className="size-6 text-destructive" />
                                Least performing photos
                            </CardTitle>
                            <CardDescription className="mt-1 max-w-2xl">Photos with the lowest number of unique opens in the viewer.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={showLockedLeastPhotos} onCheckedChange={setShowLockedLeastPhotos} />
                            <Label>Show locked photos</Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
                        {stats.leastPhotos.map((photo, index) => (
                            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted/30">
                                {photo.lockedByPassword && !showLockedLeastPhotos && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-lg">
                                        <Lock className="size-6 text-white" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/60" />
                                <img src={photo.srcThumb} alt={photo.name} className="h-full w-full object-cover" />
                                <div className="absolute left-2 top-2">
                                    <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive backdrop-blur-sm">
                                        #{index + 1}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="flex items-end justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-white">{photo.name}</p>
                                            <p className="text-xs text-white/70">{photo.views} views</p>
                                        </div>
                                        <TrendingDown className="size-4 shrink-0 text-white/70" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
