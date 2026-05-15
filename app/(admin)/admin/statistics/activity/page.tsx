'use client';
import { useState } from 'react';
import { useStatistics } from '@/components/admin/statistics/statistics-provider';
import { ActivityHeatmap } from '@/components/admin/statistics/heatmap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Eye, Lock } from 'lucide-react';

export default function ActivityStatisticsPage() {
    const { stats, isLoading, error } = useStatistics();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [showLockedTopPhotos, setShowLockedTopPhotos] = useState(false);

    if (isLoading && !stats) {
        return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading statistics...</div>;
    }

    if (error && !stats) {
        return <div className="rounded-lg border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</div>;
    }

    if (!stats) {
        return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No statistics available.</div>;
    }

    const bestDays = stats.heatmapData.reduce(
        (days, point) => {
            days[point.day] = (days[point.day] ?? 0) + point.value;
            return days;
        },
        {} as Record<number, number>,
    );

    const topDays = Object.entries(bestDays)
        .map(([day, value]) => ({ day: Number(day), value }))
        .filter((point) => point.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

    return (
        <div className="space-y-4">
            <ActivityHeatmap
                title="Global activity"
                description="Hours when visitors open photos the most."
                data={stats.heatmapData}
                valueLabel="openings"
            />
            <div className="grid xl:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Best days</CardTitle>
                        <CardDescription>Days when visitors open photos the most.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topDays.map((point) => (
                            <div key={point.day} className="flex items-center justify-between">
                                <span>{dayNames[point.day]}</span>
                                <span>{point.value} openings</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Best hours</CardTitle>
                        <CardDescription>Hours when visitors open photos the most.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.heatmapData
                            .filter((point) => point.value > 0)
                            .sort((a, b) => b.value - a.value)
                            .slice(0, 3)
                            .map((point, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span>
                                        {point.hour}:00 - {point.hour + 1}:00
                                    </span>
                                    <span>{point.value} openings</span>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle>Last views</CardTitle>
                            <CardDescription>Last photos opened by visitors</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch checked={showLockedTopPhotos} onCheckedChange={setShowLockedTopPhotos} />
                            <Label>Show locked photos</Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                        {stats.lastPhotosViewed.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent views.</p>
                        ) : (
                            stats.lastPhotosViewed.map((photo) => (
                                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted/40">
                                    {photo.lockedByPassword && !showLockedTopPhotos && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-lg">
                                            <Lock className="size-6 text-white" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/90"></div>
                                    <img src={photo.srcThumb} alt={photo.name} className="h-full w-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="truncate text-sm font-medium text-white">{photo.name}</p>
                                        <div className="flex justify-between">
                                            <div className="flex gap-1 items-center text-white/70">
                                                <Clock className="size-4" />
                                                <p className="text-xs ">
                                                    {new Date(photo.viewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <p className="text-xs ">
                                                {photo.totalPhotoViews} {photo.totalPhotoViews === 1 ? 'view' : 'views'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
