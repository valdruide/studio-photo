import { ProofingGalleryEditor } from '@/components/proofing/edit/proofing-gallery-editor';
import { getProofingGallery, getProofingGalleryPhotos } from '@/lib/proofing/getProofingGalleries';

export default async function ProofingGalleryEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [gallery, photos] = await Promise.all([getProofingGallery(id), getProofingGalleryPhotos(id)]);

    return <ProofingGalleryEditor gallery={gallery} photos={photos} />;
}
