'use client';

import dynamic from 'next/dynamic';
import type { CategorySlug } from '@/lib/collections/types';

const SectionCards = dynamic(() => import('./section-cards'), {
    ssr: false,
});

export function MasonryProvider({ category }: { category: CategorySlug }) {
    return <SectionCards category={category} />;
}
