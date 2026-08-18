import { PuckPageBuilder } from '@/components/admin/page-builder/puck-page-builder';
import { getFallbackBuilderData } from '@/lib/page-builder/fallback-data';
import { getSitePageBySlug } from '@/lib/page-builder/site-pages';
import { getPBAdminFromCurrentCookies } from '@/lib/pb/adminServer';
import { redirect } from 'next/navigation';

export default async function AboutBuilderPage() {
    const pb = await getPBAdminFromCurrentCookies();
    if (!pb) redirect('/login');

    const page = await getSitePageBySlug(pb, 'about');
    const initialData = page?.draftData ?? page?.publishedData ?? getFallbackBuilderData('about');

    return <PuckPageBuilder page="about" initialData={initialData} />;
}
