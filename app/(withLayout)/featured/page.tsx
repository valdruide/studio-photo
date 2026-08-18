import { FeaturedGalleryClient } from '@/components/featured-gallery-client';
import { getFeaturedView } from '@/lib/collections/getFeaturedPhotos';

export const dynamic = 'force-dynamic';

export default async function FeaturedPage() {
    const view = await getFeaturedView();

    return <FeaturedGalleryClient view={view} />;
}
