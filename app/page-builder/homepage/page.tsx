import { PuckPageBuilder } from '@/components/admin/page-builder/puck-page-builder';
import { getFallbackBuilderData } from '@/lib/page-builder/fallback-data';
import { getSitePageBySlug } from '@/lib/page-builder/site-pages';
import { getPBAdminFromCurrentCookies } from '@/lib/pb/adminServer';
import { redirect } from 'next/navigation';

export default async function HomepageBuilderPage() {
    const pb = await getPBAdminFromCurrentCookies();
    if (!pb) redirect('/login');

    const page = await getSitePageBySlug(pb, 'homepage');
    const initialData = page?.draftData ?? page?.publishedData ?? getFallbackBuilderData('homepage');

    return <PuckPageBuilder page="homepage" initialData={initialData} />;
}
