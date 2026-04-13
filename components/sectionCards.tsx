import { cookies } from 'next/headers';
import { getPBPublic } from '@/lib/pb/server';
import { normalizeSlug } from '@/lib/collections/pbUtils';
import { verifyCategoryAccessToken, verifyCollectionAccessToken } from '@/lib/accessWhenLockedByPassword';
import { getCategoryView } from '@/lib/collections/getCategoryView';
import SectionCardsClient from './sectionCardsClient';

export default async function SectionCards({ category, query }: { category: string; query: string }) {
    const pb = getPBPublic();
    const categorySlug = normalizeSlug(category);
    const querySlug = normalizeSlug(query || 'all');

    let catRecord: any;
    try {
        catRecord = await pb.collection('categories').getFirstListItem(`slug="${categorySlug}" && isHidden=false`);
    } catch {
        return (
            <div className="text-xl">
                ⚠️ Can&apos;t find category : <span className="font-bold text-destructive">“{category}”</span>
            </div>
        );
    }

    const cookieStore = await cookies();

    // 1) lock catégorie
    const categoryLocked = Boolean(catRecord.lockedByPassword);
    const categoryToken = cookieStore.get(`cat_access_${catRecord.id}`)?.value;
    const hasCategoryAccess = !categoryLocked || (categoryToken ? verifyCategoryAccessToken(categoryToken, catRecord.id) : false);

    if (!hasCategoryAccess) {
        return <SectionCardsClient locked categorySlug={categorySlug} categoryTitle={catRecord.title} />;
    }

    // 2) lock collection si on n'est pas sur "all"
    if (querySlug !== 'all') {
        let colRecord: any;

        try {
            colRecord = await pb
                .collection('photo_collections')
                .getFirstListItem(`slug="${querySlug}" && isHidden=false && category="${catRecord.id}"`);
        } catch {
            return (
                <div className="text-xl">
                    ⚠️ Can&apos;t find project : <span className="font-bold text-destructive">“{query}”</span>
                </div>
            );
        }

        const collectionLocked = Boolean(colRecord.lockedByPassword);
        const collectionToken = cookieStore.get(`col_access_${colRecord.id}`)?.value;
        const hasCollectionAccess = !collectionLocked || (collectionToken ? verifyCollectionAccessToken(collectionToken, colRecord.id) : false);

        if (!hasCollectionAccess) {
            return <SectionCardsClient lockedCollection collectionSlug={querySlug} collectionTitle={colRecord.title} />;
        }
    }

    const view = await getCategoryView(category, query);

    if (!view) {
        return (
            <div className="text-xl">
                ⚠️ Can&apos;t find project : <span className="font-bold text-destructive">“{query}”</span>
            </div>
        );
    }

    return <SectionCardsClient view={view} query={query} />;
}
