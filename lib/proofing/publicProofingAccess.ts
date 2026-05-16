import { verifyProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import { getProofingGalleryPasswordAccess } from '@/lib/proofing/getProofingGalleries';

export async function resolvePublicProofingAccess(accessKey: string, token?: string) {
    const galleryAccess = await getProofingGalleryPasswordAccess(accessKey);
    const hasAccess =
        !galleryAccess.hasPassword || (token ? verifyProofingGalleryAccessToken(token, galleryAccess.id) : false);

    return { galleryAccess, hasAccess };
}
