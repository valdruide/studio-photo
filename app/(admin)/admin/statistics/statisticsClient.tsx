'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Eye, Folder, ImageIcon, Layers3, Medal, TrendingUp, TrendingDown, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';

function rankBadgeClass(rank: number) {
    if (rank === 1) return 'bg-yellow-500/25 text-yellow-400 border-yellow-500';
    if (rank === 2) return 'bg-zinc-500/45 text-zinc-200 border-zinc-500';
    if (rank === 3) return 'bg-orange-500/25 text-orange-100 border-orange-500';
    return 'bg-background/80 text-muted-foreground border-border';
}

export function StatisticsClient({ stats }: { stats: StatisticsOverview }) {
    const [showLockedTopPhotos, setShowLockedTopPhotos] = useState(false);
    const [showLockedLeastPhotos, setShowLockedLeastPhotos] = useState(false);

    return (
        <div className="space-y-6">
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
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-lg">
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
