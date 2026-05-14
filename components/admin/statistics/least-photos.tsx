'use client';
import { useState } from 'react';
import { ArrowRight, Lock, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';

type LeastPhotosProps = {
    stats: StatisticsOverview['leastPhotos'];
};

export function LeastPhotos({ stats }: LeastPhotosProps) {
    const [showLockedLeastPhotos, setShowLockedLeastPhotos] = useState(false);

    return (
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
                    {stats.map((photo, index) => (
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
    );
}
