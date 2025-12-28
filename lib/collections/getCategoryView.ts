import type { CategorySlug, CategoryView, PhotoItem } from '@/lib/collections/types';
import { getPB } from '@/lib/pb/server';
import { normalizeSlug, pbFileUrl } from './pbUtils';
import { sanitizeRichText } from '@/lib/security/sanitizeRichText';

export async function getCategoryView(category: CategorySlug, query: string): Promise<CategoryView | null> {
    const pb = getPB();
    const cat = normalizeSlug(category);
    const q = normalizeSlug(query || 'all');

    // Vérifie que la catégorie existe et n’est pas hidden
    let catRecord: any;
    try {
        catRecord = await pb.collection('categories').getFirstListItem(`slug="${cat}" && isHidden=false`);
    } catch {
        return null;
    }

    // Cas ALL : on récupère toutes les photos des collections de cette catégorie
    if (q === 'all') {
        const photos = await pb.collection('photos').getFullList({
            filter: `isHidden=false && collection.category="${catRecord.id}" && collection.isHidden=false`,
            sort: 'order',
            expand: 'collection',
        });

        const items: PhotoItem[] = photos.map((p) => ({
            id: p.id,
            name: (p as any).name ?? '',
            description: (p as any).description ?? undefined,
            src: pbFileUrl(pb.baseUrl, p, 'image'),
            collectionSlug: (p.expand as any)?.collection?.slug ?? '',
        }));

        return {
            category: cat,
            query: 'all',
            title: 'All projects',
            description: 'All series and photos in the category',
            items,
        };
    }

    // Cas collection slug
    let collection: any;
    try {
        collection = await pb.collection('photo_collections').getFirstListItem(`slug="${q}" && isHidden=false && category="${catRecord.id}"`);
    } catch {
        return null;
    }

    const photos = await pb.collection('photos').getFullList({
        filter: `collection="${collection.id}" && isHidden=false`,
        sort: 'order',
    });

    const items: PhotoItem[] = photos.map((p) => ({
        id: p.id,
        name: (p as any).name ?? '',
        description: sanitizeRichText((p as any).description) ?? undefined,
        src: pbFileUrl(pb.baseUrl, p, 'image'),
        collectionSlug: (collection as any).slug,
    }));

    return {
        category: cat,
        query: q,
        title: (collection as any).title,
        description: sanitizeRichText((collection as any).description) ?? undefined,
        items,
    };
}
