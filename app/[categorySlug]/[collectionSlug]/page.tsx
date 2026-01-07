import SectionCards from '@/components/sectionCards';

export default async function Page({ params }: { params: Promise<{ categorySlug: string; collectionSlug: string }> }) {
    const { categorySlug, collectionSlug } = await params;
    return <SectionCards category={categorySlug} query={collectionSlug} />;
}
