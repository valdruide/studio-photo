import type { RecordModel } from 'pocketbase';
import type { CategoryView, PhotoItem } from '@/lib/collections/types';
import { getPBAdmin } from '@/lib/pb/adminServer';
import { PB_THUMBS } from '@/lib/pb/thumbs';
import { pbFileUrl } from '@/lib/collections/pbUtils';
import { getSiteSettings } from '@/lib/pb/site-settings';

function firstRecord(value: unknown): RecordModel | null {
    if (Array.isArray(value)) return (value[0] as RecordModel | undefined) ?? null;
    return (value as RecordModel | undefined) ?? null;
}

export async function getFeaturedView(): Promise<CategoryView> {
    const pb = await getPBAdmin();
    const settings = await getSiteSettings();
    const featuredName = settings?.featured_name?.trim() || 'Featured';

    const photos = await pb.collection('photos').getFullList({
        filter: 'isFeatured = true',
        sort: 'featuredOrder,created',
        expand: 'collection,collection.category',
    });

    const items: PhotoItem[] = photos.slice(0, 3).flatMap((photo) => {
        if (!photo.image) return [];

        const collection = firstRecord(photo.expand?.collection);
        const category = firstRecord(collection?.expand?.category);

        return [
            {
                id: photo.id,
                name: photo.name ?? '',
                description: photo.description ?? undefined,
                srcThumb: pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.grid),
                srcMedium: pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.modal),
                srcOriginal: pbFileUrl(pb.baseURL, photo, 'image'),
                width: photo.width ?? 0,
                height: photo.height ?? 0,
                collectionId: collection?.id ?? '',
                collectionSlug: collection?.slug ?? '',
                categoryId: category?.id ?? '',
                categorySlug: category?.slug ?? '',
            },
        ];
    });

    return {
        category: 'featured',
        query: 'featured',
        title: featuredName,
        description: undefined,
        items,
    };
}
