import { GalleriesManager } from '@/components/proofing/galleries/galleries-manager';
import { getProofingGalleries } from '@/lib/proofing/getProofingGalleries';

export default async function ProofingPage() {
    const galleries = await getProofingGalleries();

    return <GalleriesManager initialGalleries={galleries} />;
}
