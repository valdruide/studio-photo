import SectionCards from '@/components/sectionCards';

export default async function Page({ params }: { params: Promise<{ categorySlug: string }> }) {
    const { categorySlug } = await params;
    return <SectionCards category={categorySlug} query="all" />;
}
