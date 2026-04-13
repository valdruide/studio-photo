import { cookies } from 'next/headers';
import type { PhotoCollection } from './types';
import { getPBPublic } from '@/lib/pb/server';
import { normalizeSlug, pbFileUrl } from './pbUtils';
import { PB_THUMBS } from '@/lib/pb/thumbs';
import { verifyCategoryAccessToken, verifyCollectionAccessToken } from '@/lib/accessWhenLockedByPassword';

export async function getCollectionBySlug(slug: string): Promise<PhotoCollection | null> {
    const pb = getPBPublic();
    const s = normalizeSlug(slug);
    if (!s) return null;

    try {
        // 1) collection + category
        const col = await pb.collection('photo_collections').getFirstListItem(`slug="${s}" && isHidden = false`, {
            expand: 'category',
        });

        const category = (col.expand as any)?.category;
        if (!category || category.isHidden) return null;

        const cookieStore = await cookies();

        // 2) lock catégorie
        const categoryLocked = Boolean(category.lockedByPassword);
        if (categoryLocked) {
            const categoryToken = cookieStore.get(`cat_access_${category.id}`)?.value;
            const hasCategoryAccess = categoryToken ? verifyCategoryAccessToken(categoryToken, category.id) : false;

            if (!hasCategoryAccess) return null;
        }

        // 3) lock collection
        const collectionLocked = Boolean((col as any).lockedByPassword);
        if (collectionLocked) {
            const collectionToken = cookieStore.get(`col_access_${col.id}`)?.value;
            const hasCollectionAccess = collectionToken ? verifyCollectionAccessToken(collectionToken, col.id) : false;

            if (!hasCollectionAccess) return null;
        }

        // 4) photos
        const photos = await pb.collection('photos').getFullList({
            filter: `collection="${col.id}" && isHidden=false`,
            sort: 'order',
        });

        const items = photos.map((p) => ({
            id: p.id,
            name: (p as any).name ?? '',
            description: (p as any).description ?? undefined,
            srcThumb: pbFileUrl(pb.baseURL, p, 'image', PB_THUMBS.grid),
            srcMedium: pbFileUrl(pb.baseURL, p, 'image', PB_THUMBS.modal),
            srcOriginal: pbFileUrl(pb.baseURL, p, 'image'),
            width: (p as any).width ?? 0,
            height: (p as any).height ?? 0,
        }));

        const categorySlug = category.slug ?? '';

        return {
            slug: (col as any).slug,
            title: (col as any).title,
            description: (col as any).description ?? '',
            category: categorySlug,
            items,
        };
    } catch {
        return null;
    }
}
