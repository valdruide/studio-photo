import { getPBAdmin } from '@/lib/pb/adminServer';
import { pbFileUrl } from '@/lib/collections/pbUtils';
import { PB_THUMBS } from '@/lib/pb/thumbs';
import type { RecordModel } from 'pocketbase';

type RankedPhoto = {
    id: string;
    name: string;
    views: number;
    srcThumb?: string;
    lockedByPassword?: boolean;
};

type LastViewedPhoto = {
    id: string;
    name: string;
    viewDate: string;
    srcThumb?: string;
    lockedByPassword?: boolean;
    totalPhotoViews: number;
};

type RankedEntity = {
    id: string;
    name: string;
    views: number;
};

type KpiTrend = {
    value: number;
    label: string;
};

export type StatisticsHeatmapPoint = {
    day: number; // 0 = dimanche, 1 = lundi...
    hour: number; // 0 -> 23
    value: number;
};

export type StatisticsViewsChartPoint = {
    month: string;
    views: number;
};

export type StatisticsOverview = {
    totalViews: number;
    mostViewedPhoto: RankedPhoto | null;
    bestCategory: RankedEntity | null;
    bestCollection: RankedEntity | null;
    topPhotos: RankedPhoto[];
    leastPhotos: RankedPhoto[];
    topCollections: RankedEntity[];
    topCategories: RankedEntity[];
    heatmapData: StatisticsHeatmapPoint[];
    viewsChartData: StatisticsViewsChartPoint[];
    lastPhotosViewed: LastViewedPhoto[];
    trends?: {
        totalViews?: KpiTrend;
        bestCategory?: KpiTrend;
        bestCollection?: KpiTrend;
        mostViewedPhoto?: KpiTrend;
    };
};

type CounterMap = Map<
    string,
    {
        id: string;
        name: string;
        views: number;
        srcThumb?: string;
        lockedByPassword: boolean;
    }
>;

type EntityRecord = RecordModel & {
    name?: string;
    title?: string;
    isHidden?: boolean;
    lockedByPassword?: boolean;
    expand?: {
        collection?: EntityRecord;
        category?: EntityRecord;
    };
};

type StatisticRecord = RecordModel & {
    created: string;
    expand?: {
        photo?: EntityRecord;
        collection?: EntityRecord;
        category?: EntityRecord;
    };
};

function incrementCounter(map: CounterMap, id: string, name: string, srcThumb?: string, lockedByPassword: boolean = false) {
    const existing = map.get(id);

    if (existing) {
        existing.views += 1;
        return;
    }

    map.set(id, {
        id,
        name,
        views: 1,
        srcThumb,
        lockedByPassword,
    });
}

function incrementHeatmapCounter(map: Map<string, StatisticsHeatmapPoint>, created: string) {
    const createdAt = new Date(created);

    if (Number.isNaN(createdAt.getTime())) {
        return;
    }

    const day = createdAt.getDay(); // 0 = dimanche
    const hour = createdAt.getHours(); // 0 -> 23
    const key = `${day}-${hour}`;

    const existing = map.get(key);

    if (existing) {
        existing.value += 1;
        return;
    }

    map.set(key, {
        day,
        hour,
        value: 1,
    });
}

type StatisticsRange = {
    preset?: string;
    from?: string;
    to?: string;
};

type StatisticsSummary = {
    records: StatisticRecord[];
    photosMap: CounterMap;
    collectionsMap: CounterMap;
    categoriesMap: CounterMap;
    heatmapMap: Map<string, StatisticsHeatmapPoint>;
};

function getRangeFilter(range?: StatisticsRange) {
    const filters: string[] = [];

    if (range?.from) {
        filters.push(`created >= "${range.from}"`);
    }

    if (range?.to) {
        filters.push(`created <= "${range.to}"`);
    }

    return filters.length ? filters.join(' && ') : undefined;
}

async function getStatisticsRecords(pb: Awaited<ReturnType<typeof getPBAdmin>>, range?: StatisticsRange) {
    return (await pb.collection('photos_statistics').getFullList({
        sort: '-created',
        expand: 'photo,collection,category',
        filter: getRangeFilter(range),
    })) as unknown as StatisticRecord[];
}

function summarizeRecords(records: StatisticRecord[], pbBaseUrl: string): StatisticsSummary {
    const photosMap: CounterMap = new Map();
    const collectionsMap: CounterMap = new Map();
    const categoriesMap: CounterMap = new Map();
    const heatmapMap = new Map<string, StatisticsHeatmapPoint>();

    for (const record of records) {
        const photo = record.expand?.photo;
        const collection = record.expand?.collection;
        const category = record.expand?.category;

        const isCategoryVisible = !!category && !category.isHidden;
        const isCollectionVisible = !!collection && !collection.isHidden && isCategoryVisible;
        const isPhotoVisible = !!photo && !photo.isHidden && isCollectionVisible;

        const isLockedByPassword = Boolean(collection?.lockedByPassword || category?.lockedByPassword);

        if (isPhotoVisible) {
            incrementCounter(
                photosMap,
                photo.id,
                photo.name ?? 'Untitled photo',
                pbFileUrl(pbBaseUrl, photo, 'image', PB_THUMBS.grid),
                isLockedByPassword,
            );
            incrementHeatmapCounter(heatmapMap, record.created);
        }

        if (isCollectionVisible) {
            incrementCounter(collectionsMap, collection.id, collection.title ?? 'Untitled collection');
        }

        if (isCategoryVisible) {
            incrementCounter(categoriesMap, category.id, category.title ?? 'Untitled category');
        }
    }

    return {
        records,
        photosMap,
        collectionsMap,
        categoriesMap,
        heatmapMap,
    };
}

function getTrendValue(current: number, previous: number) {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Math.round(((current - previous) / previous) * 100);
}

function getTrendLabel(preset?: string) {
    if (preset === '24h') return 'vs previous 24h';
    if (preset === '7d') return 'vs previous 7 days';
    if (preset === '30d') return 'vs previous 30 days';

    return 'vs previous period';
}

function getMonthKey(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function startOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
    return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getLatestRecordDate(records: StatisticRecord[]) {
    return records.reduce<Date | null>((latest, record) => {
        const date = new Date(record.created);

        if (Number.isNaN(date.getTime())) {
            return latest;
        }

        if (!latest || date > latest) {
            return date;
        }

        return latest;
    }, null);
}

function getEarliestRecordDate(records: StatisticRecord[]) {
    return records.reduce<Date | null>((earliest, record) => {
        const date = new Date(record.created);

        if (Number.isNaN(date.getTime())) {
            return earliest;
        }

        if (!earliest || date < earliest) {
            return date;
        }

        return earliest;
    }, null);
}

function getViewsChartRange(records: StatisticRecord[]) {
    const earliestRecordDate = getEarliestRecordDate(records);
    const latestRecordDate = getLatestRecordDate(records);
    const to = startOfMonth(latestRecordDate ?? new Date());
    const minimumFrom = addMonths(to, -5);
    const from = startOfMonth(earliestRecordDate && earliestRecordDate < minimumFrom ? earliestRecordDate : minimumFrom);

    return from <= to ? { from, to } : { from: to, to: from };
}

function getViewsChartData(records: StatisticRecord[]): StatisticsViewsChartPoint[] {
    const { from, to } = getViewsChartRange(records);
    const afterTo = addMonths(to, 1);
    const buckets = new Map<string, StatisticsViewsChartPoint>();

    for (let month = from; month <= to; month = addMonths(month, 1)) {
        buckets.set(getMonthKey(month), {
            month: month.toLocaleDateString('en-US', { month: 'long' }),
            views: 0,
        });
    }

    for (const record of records) {
        const date = new Date(record.created);

        if (Number.isNaN(date.getTime()) || date < from || date >= afterTo) {
            continue;
        }

        const existing = buckets.get(getMonthKey(date));

        if (existing) {
            existing.views += 1;
        }
    }

    return Array.from(buckets.values());
}

function getPreviousRange(range?: StatisticsRange): StatisticsRange | null {
    if (!range?.from || !range.to) return null;

    const from = new Date(range.from);
    const to = new Date(range.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
        return null;
    }

    const durationMs = to.getTime() - from.getTime();
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - durationMs);

    return {
        from: previousFrom.toISOString(),
        to: previousTo.toISOString(),
    };
}

export async function getStatisticsOverview(range?: StatisticsRange): Promise<StatisticsOverview> {
    const pb = await getPBAdmin();

    const allPhotos = await pb.collection('photos').getFullList({
        filter: 'isHidden=false',
        sort: 'order',
        expand: 'collection,collection.category',
    });

    const records = await getStatisticsRecords(pb, range);
    const allRecords = await getStatisticsRecords(pb);
    const { photosMap, collectionsMap, categoriesMap, heatmapMap } = summarizeRecords(records, pb.baseURL);
    const viewsChartData = getViewsChartData(allRecords);

    const topPhotos = Array.from(photosMap.values())
        .sort((a, b) => {
            if (b.views !== a.views) return b.views - a.views;
            return a.name.localeCompare(b.name);
        })
        .slice(0, 10);

    const leastPhotos = (allPhotos as unknown as EntityRecord[])
        .filter((photo) => {
            const collection = photo.expand?.collection;
            const category = photo.expand?.collection?.expand?.category;

            return !photo.isHidden && collection && !collection.isHidden && category && !category.isHidden;
        })
        .map((photo) => {
            const existing = photosMap.get(photo.id);
            const collection = photo.expand?.collection;
            const category = photo.expand?.collection?.expand?.category;
            const lockedByPassword = Boolean(collection?.lockedByPassword || category?.lockedByPassword);

            return {
                id: photo.id,
                name: photo.name ?? 'Untitled photo',
                views: existing?.views ?? 0,
                srcThumb: pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.grid),
                lockedByPassword,
            };
        })
        .sort((a, b) => {
            if (a.views !== b.views) return a.views - b.views;
            return a.name.localeCompare(b.name);
        })
        .slice(0, 10);

    const topCollections = Array.from(collectionsMap.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(({ id, name, views }) => ({ id, name, views }));

    const topCategories = Array.from(categoriesMap.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(({ id, name, views }) => ({ id, name, views }));

    const heatmapData = Array.from(heatmapMap.values()).sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.hour - b.hour;
    });

    const previousRange = range?.preset === 'all' ? null : getPreviousRange(range);
    const previousSummary = previousRange ? summarizeRecords(await getStatisticsRecords(pb, previousRange), pb.baseURL) : null;
    const trendLabel = getTrendLabel(range?.preset);
    const mostViewedPhotoPreviousViews = topPhotos[0] ? (previousSummary?.photosMap.get(topPhotos[0].id)?.views ?? 0) : 0;
    const bestCategoryPreviousViews = topCategories[0] ? (previousSummary?.categoriesMap.get(topCategories[0].id)?.views ?? 0) : 0;
    const bestCollectionPreviousViews = topCollections[0] ? (previousSummary?.collectionsMap.get(topCollections[0].id)?.views ?? 0) : 0;
    const trends =
        previousSummary && range?.preset !== 'all'
            ? {
                  totalViews: {
                      value: getTrendValue(records.length, previousSummary.records.length),
                      label: trendLabel,
                  },
                  mostViewedPhoto: topPhotos[0]
                      ? {
                            value: getTrendValue(topPhotos[0].views, mostViewedPhotoPreviousViews),
                            label: trendLabel,
                        }
                      : undefined,
                  bestCategory: topCategories[0]
                      ? {
                            value: getTrendValue(topCategories[0].views, bestCategoryPreviousViews),
                            label: trendLabel,
                        }
                      : undefined,
                  bestCollection: topCollections[0]
                      ? {
                            value: getTrendValue(topCollections[0].views, bestCollectionPreviousViews),
                            label: trendLabel,
                        }
                      : undefined,
              }
            : undefined;

    const lastPhotosViewed = records
        .flatMap((record) => {
            const photo = record.expand?.photo;

            return photo && !photo.isHidden ? [{ record, photo }] : [];
        })
        .slice(0, 10)
        .map(({ record, photo }) => {
            const collection = record.expand?.collection;
            const category = record.expand?.category;
            const lockedByPassword = Boolean(collection?.lockedByPassword || category?.lockedByPassword);
            const viewDate = record.created;

            return {
                id: photo.id,
                name: photo.name ?? 'Untitled photo',
                viewDate: viewDate ?? 'N/A',
                totalPhotoViews: photosMap.get(photo.id)?.views ?? 0,
                srcThumb: pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.grid),
                lockedByPassword,
            };
        });

    return {
        totalViews: records.length,
        mostViewedPhoto: topPhotos[0] ?? null,
        bestCategory: topCategories[0] ?? null,
        bestCollection: topCollections[0] ?? null,
        topPhotos,
        leastPhotos,
        topCollections,
        topCategories,
        lastPhotosViewed,
        heatmapData,
        viewsChartData,
        trends,
    };
}
