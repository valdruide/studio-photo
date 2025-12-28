import type { CategorySlug, CategoryView, PhotoItem } from '@/lib/collections/types';
import { LOCAL_COLLECTIONS } from '@/lib/collections/localCollections';

function normalizeSlug(v: string) {
    return v.trim().toLowerCase().replace(/\s+/g, '-');
}

export async function getCategoryView(category: CategorySlug, query: string): Promise<CategoryView | null> {
    const q = normalizeSlug(query || 'all');

    const collectionsInCategory = Object.values(LOCAL_COLLECTIONS).filter((c) => c.category === category);

    if (collectionsInCategory.length === 0) return null;

    if (q === 'all') {
        const items: PhotoItem[] = collectionsInCategory.flatMap((c) =>
            c.items.map((it) => ({
                ...it,
                collectionSlug: c.slug,
            }))
        );

        return { category, query: 'all', title: 'All projects', description: 'All series and photos in the category', items };
    }

    const collection = collectionsInCategory.find((c) => c.slug === q);
    if (!collection) return null;

    return {
        category,
        query: q,
        title: collection.title,
        description: collection.description,
        items: collection.items.map((it) => ({ ...it, collectionSlug: collection.slug })),
    };
}
