import SectionCards from '@/components/sectionCards';

export default async function Page({ params }: { params: Promise<{ collection: string }> }) {
    const { collection } = await params;

    return <SectionCards category="nude-art" query={collection} />;
}
