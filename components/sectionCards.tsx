import type { CategorySlug } from '@/lib/collections/types';
import { getCategoryView } from '@/lib/collections/getCategoryView';
import SectionCardsClient from './sectionCardsClient';

export default async function SectionCards({ category, query }: { category: CategorySlug; query: string }) {
    const view = await getCategoryView(category, query);

    if (!view) {
        return (
            <div className="p-6 text-xl">
                ⚠️ Can't find project : <span className="font-bold text-destructive">“{query}”</span>
            </div>
        );
    }

    return <SectionCardsClient view={view} query={query} />;
}
