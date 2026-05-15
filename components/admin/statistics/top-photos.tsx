'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Medal, Lock, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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

type TopPhotosProps = {
    maxNumberOfPhotos: number;
    photos: StatisticsOverview['topPhotos'];
    isOverview?: boolean;
    className?: string;
};

export function TopPhotos({ maxNumberOfPhotos, photos, isOverview, className }: TopPhotosProps) {
    const [showLockedTopPhotos, setShowLockedTopPhotos] = useState(false);
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Medal className="size-5 text-primary" />
                            {maxNumberOfPhotos === 1 ? 'Best performing photo' : `Top ${maxNumberOfPhotos} photos`}
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
                <div className="space-y-4">
                    <div className={cn(maxNumberOfPhotos <= 1 ? 'flex justify-center' : 'grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5')}>
                        {photos.length === 0 && <p className="text-sm text-muted-foreground">Not enough data available</p>}
                        {photos.slice(0, maxNumberOfPhotos).map((photo, index) => (
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
                                        <p className="text-xs text-white/70">
                                            {photo.views} {photo.views === 1 ? 'view' : 'views'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isOverview && (
                        <div className="text-center">
                            <Button variant="outline" asChild>
                                <Link href="/admin/statistics/photos">
                                    <ArrowRight className="size-4" />
                                    View all top photos
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
