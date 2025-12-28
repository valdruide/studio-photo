import SectionCards from '@/components/sectionCards';

export default function Page({ params }: { params: { collection: string } }) {
    return <SectionCards category="nude-art" query={params.collection} />;
}
