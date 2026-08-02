import { NextResponse } from 'next/server';

import { getFallbackBuilderData } from '@/lib/page-builder/fallback-data';
import { getSitePageBySlug } from '@/lib/page-builder/site-pages';
import type { BuilderPage } from '@/lib/page-builder/types';
import { withAdmin } from '@/lib/pb/adminApi';

const builderPages: BuilderPage[] = ['homepage', 'about'];

export async function GET(req: Request) {
    return withAdmin(async (pb) => {
        const items = await Promise.all(
            builderPages.map(async (slug) => {
                const item = await getSitePageBySlug(pb, slug);
                const fallbackData = getFallbackBuilderData(slug);

                return {
                    id: item?.id ?? slug,
                    slug,
                    title: item?.title ?? (slug === 'homepage' ? 'Homepage' : 'About'),
                    status: item?.status ?? 'draft',
                    draftBlocksCount: item?.draftData?.content.length ?? fallbackData.content.length,
                    publishedBlocksCount: item?.publishedData?.content.length ?? 0,
                    publishedAt: item?.publishedAt ?? null,
                    updated: item?.updated ?? null,
                    schemaVersion: item?.schemaVersion ?? '1',
                    hasRecord: Boolean(item),
                    hasPublishedData: Boolean(item?.publishedData),
                };
            }),
        );

        return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
    }, req);
}
