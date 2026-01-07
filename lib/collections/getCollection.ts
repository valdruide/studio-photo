import type { PhotoCollection } from './types';
import { getPBPublic } from '@/lib/pb/server';
import { normalizeSlug, pbFileUrl } from './pbUtils';
import { PB_THUMBS } from '@/lib/pb/thumbs';

export async function getCollectionBySlug(slug: string): Promise<PhotoCollection | null> {
    const pb = getPBPublic();
    const s = normalizeSlug(slug);
    if (!s) return null;

    try {
        // 1) collection
        const col = await pb.collection('photo_collections').getFirstListItem(`slug="${s}" && isHidden = false`, { expand: 'category' });

        // 2) photos
        const photos = await pb.collection('photos').getFullList({
            filter: `collection="${col.id}" && isHidden=false`,
            sort: 'order', // si tu as "order", sinon enlève
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

        const categorySlug = (col.expand as any)?.category?.slug ?? '';

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
