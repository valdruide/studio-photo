import { PagesManager, type AdminBuilderPageRow } from '@/components/admin/pages/pages-manager';
import { getFallbackBuilderData } from '@/lib/page-builder/fallback-data';
import { getSitePageBySlug } from '@/lib/page-builder/site-pages';
import type { BuilderPage } from '@/lib/page-builder/types';
import { getPBAdminFromCurrentCookies } from '@/lib/pb/adminServer';
import { redirect } from 'next/navigation';

const builderPages: BuilderPage[] = ['homepage', 'about'];

export default async function PagesAdminPage() {
    const pb = await getPBAdminFromCurrentCookies();
    if (!pb) redirect('/login');

    const pages = await Promise.all(
        builderPages.map(async (slug): Promise<AdminBuilderPageRow> => {
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

    return <PagesManager initialPages={pages} />;
}
