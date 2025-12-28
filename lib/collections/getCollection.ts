import type { PhotoCollection } from './types';
import { getPB } from '@/lib/pb/server';
import { normalizeSlug, pbFileUrl } from './pbUtils';

export async function getCollectionBySlug(slug: string): Promise<PhotoCollection | null> {
    const pb = getPB();
    const s = normalizeSlug(slug);

    try {
        // 1) collection
        const col = await pb.collection('photo_collections').getFirstListItem(`slug="${s}" && isHidden=false`, { expand: 'category' });

        // 2) photos
        const photos = await pb.collection('photos').getFullList({
            filter: `collection="${col.id}" && isHidden=false`,
            sort: 'order', // si tu as "order", sinon enlève
        });

        const items = photos.map((p) => ({
            id: p.id,
            name: (p as any).name ?? '',
            description: (p as any).description ?? undefined,
            src: pbFileUrl(pb.baseUrl, p, 'image'),
        }));

        const categorySlug = (col.expand as any)?.category?.slug ?? '';

        return {
            slug: (col as any).slug,
            title: (col as any).title,
            description: (col as any).description ?? undefined,
            category: categorySlug,
            items,
        };
    } catch {
        return null;
    }
}
