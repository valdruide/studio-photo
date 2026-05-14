'use client';
import { Eye, Folder, ImageIcon, Layers3 } from 'lucide-react';

import { useStatistics } from '@/components/admin/statistics/statistics-provider';
import { KpiCard } from '@/components/admin/statistics/kpi-card';
import { TopPhotos } from '@/components/admin/statistics/top-photos';
import { TopCategoryOrTopCollection } from '@/components/admin/statistics/top-category-and-collection';

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
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <KpiCard title="Total photo views" value={stats.totalViews} icon={<Eye className="size-5" />} />
                <KpiCard title="Most viewed photo" value={stats.mostViewedPhoto?.name ?? 'N/A'} icon={<ImageIcon className="size-5" />} />
                <KpiCard title="Best performing category" value={stats.bestCategory?.name ?? 'N/A'} icon={<Folder className="size-5" />} />
                <KpiCard title="Best performing collection" value={stats.bestCollection?.name ?? 'N/A'} icon={<Layers3 className="size-5" />} />
            </div>

            {/* Top performing photos */}
            <div className="grid xl:grid-cols-2 gap-4 items-start">
                <TopPhotos photos={stats.topPhotos} maxNumberOfPhotos={1} isOverview />
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
                    {/* Top categories */}
                    <TopCategoryOrTopCollection topCategory={stats.topCategories} maxNumberOfCategories={2} isOverview type="category" />
                    {/* Top collections */}
                    <TopCategoryOrTopCollection topCollection={stats.topCollections} maxNumberOfCategories={2} isOverview type="collection" />
                </div>
            </div>
        </div>
    );
}
