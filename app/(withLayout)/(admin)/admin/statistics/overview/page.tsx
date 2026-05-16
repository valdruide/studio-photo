'use client';
import { Eye, Folder } from 'lucide-react';

import { useStatistics } from '@/components/admin/statistics/statistics-provider';
import { KpiCard } from '@/components/admin/statistics/kpi-card';
import { TopPhotos } from '@/components/admin/statistics/top-photos';
import { TopCategoryOrTopCollection } from '@/components/admin/statistics/top-category-and-collection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TotalViewsChart } from '@/components/admin/statistics/charts/total-views-chart';
import { TopPhotoEvolutionChart } from '@/components/admin/statistics/charts/top-photo-evolution';

export default function OverviewPage() {
    const { stats, isLoading, error } = useStatistics();

    if (isLoading && !stats) {
        return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading statistics...</div>;
    }

    if (error && !stats) {
        return <div className="rounded-lg border border-destructive/30 bg-card p-6 text-sm text-destructive">{error}</div>;
    }

    if (!stats) {
        return <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">No statistics available.</div>;
    }

    return (
        <div className="space-y-4">
            {/* Top performing photos */}
            <div className="grid xl:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <KpiCard
                            title="Total photo views"
                            value={stats.totalViews}
                            icon={<Eye className="size-5" />}
                            trend={stats.trends?.totalViews}
                        />
                        <KpiCard
                            title="Best performing category"
                            value={stats.bestCategory?.name ?? 'N/A'}
                            icon={<Folder className="size-5" />}
                            trend={stats.trends?.bestCategory}
                        />
                    </div>
                    <TopPhotos photos={stats.topPhotos} maxNumberOfPhotos={1} isOverview className="flex-1" />
                </div>
                <div className="space-y-4">
                    {/* Top categories */}
                    <TopCategoryOrTopCollection topCategory={stats.topCategories} maxNumberOfCategories={2} isOverview type="category" />
                    {/* Top collections */}
                    <TopCategoryOrTopCollection topCollection={stats.topCollections} maxNumberOfCategories={2} isOverview type="collection" />
                </div>
            </div>
            {/* Period summary */}

            <div className="grid gap-4 md:grid-cols-2 items-start">
                <TotalViewsChart data={stats.viewsChartData} />
                <TopPhotoEvolutionChart data={stats.topPhotoEvolution} />
            </div>
        </div>
    );
}
