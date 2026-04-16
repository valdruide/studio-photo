import { getPBAdmin } from '@/lib/pb/adminServer';
import { pbFileUrl } from '@/lib/collections/pbUtils';
import { PB_THUMBS } from '@/lib/pb/thumbs';

type RankedPhoto = {
    id: string;
    name: string;
    views: number;
    srcThumb?: string;
    lockedByPassword?: boolean;
};

type RankedEntity = {
    id: string;
    name: string;
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

type StatisticsRange = {
    from?: string;
    to?: string;
};

export async function getStatisticsOverview(range?: StatisticsRange): Promise<StatisticsOverview> {
    const pb = await getPBAdmin();

    const allPhotos = await pb.collection('photos').getFullList({
        filter: 'isHidden=false',
        sort: 'order',
        expand: 'collection,collection.category',
    });

    const filters: string[] = [];

    if (range?.from) {
        filters.push(`created >= "${range.from}"`);
    }

    if (range?.to) {
        filters.push(`created <= "${range.to}"`);
    }

    const records = await pb.collection('photos_statistics').getFullList({
        sort: '-created',
        expand: 'photo,collection,category',
        filter: filters.length ? filters.join(' && ') : undefined,
    });

    const photosMap: CounterMap = new Map();
    const collectionsMap: CounterMap = new Map();
    const categoriesMap: CounterMap = new Map();

    for (const record of records as any[]) {
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
                pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.grid),
                isLockedByPassword,
            );
        }

        if (isCollectionVisible) {
            incrementCounter(collectionsMap, collection.id, collection.title ?? 'Untitled collection');
        }

        if (isCategoryVisible) {
            incrementCounter(categoriesMap, category.id, category.title ?? 'Untitled category');
        }
    }

    const topPhotos = Array.from(photosMap.values())
        .sort((a, b) => {
            if (b.views !== a.views) return b.views - a.views;
            return a.name.localeCompare(b.name);
        })
        .slice(0, 10);

    const leastPhotos = allPhotos
        .filter((photo: any) => {
            const collection = photo.expand?.collection;
            const category = photo.expand?.collection?.expand?.category;

            return !photo.isHidden && collection && !collection.isHidden && category && !category.isHidden;
        })
        .map((photo: any) => {
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

    return {
        totalViews: records.length,
        mostViewedPhoto: topPhotos[0] ?? null,
        bestCategory: topCategories[0] ?? null,
        bestCollection: topCollections[0] ?? null,
        topPhotos,
        leastPhotos,
        topCollections,
        topCategories,
    };
}
