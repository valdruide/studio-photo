import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProofingGalleryClient, ProofingGalleryUnlock } from '@/components/proofing/client/proofing-gallery-client';
import { getProofingGallery, getProofingGalleryPhotos } from '@/lib/proofing/getProofingGalleries';
import { resolvePublicProofingAccess } from '@/lib/proofing/publicProofingAccess';

export default async function PublicProofingGalleryPage({ params }: { params: Promise<{ accessKey: string }> }) {
    const { accessKey } = await params;

    try {
        const cookieStore = await cookies();
        const initialAccess = await resolvePublicProofingAccess(accessKey);
        const token = cookieStore.get(`proof_access_${initialAccess.galleryAccess.id}`)?.value;
        const { galleryAccess, hasAccess } = await resolvePublicProofingAccess(accessKey, token);

        if (!hasAccess) {
            return <ProofingGalleryUnlock accessKey={galleryAccess.accessKey} title={galleryAccess.title} />;
        }

        const [gallery, photos] = await Promise.all([getProofingGallery(accessKey), getProofingGalleryPhotos(galleryAccess.id)]);

        return <ProofingGalleryClient gallery={gallery} photos={photos} />;
    } catch (err) {
        console.error('Public proofing gallery page failed:', err);
        notFound();
    }
}
