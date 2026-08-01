import { verifyProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import { getProofingGalleryPasswordAccess } from '@/lib/proofing/getProofingGalleries';

type ProofingGalleryAccess = Awaited<ReturnType<typeof getProofingGalleryPasswordAccess>>;

export type PublicProofingAccessBlockReason = 'draft' | 'archived' | 'expired' | 'expiresAt' | 'invalidExpiresAt';

export function isPocketBaseNotFoundError(error: unknown) {
    return typeof error === 'object' && error !== null && 'status' in error && error.status === 404;
}

export function getPublicProofingGalleryBlockReason(
    gallery: Pick<ProofingGalleryAccess, 'expiresAt' | 'status'>,
): PublicProofingAccessBlockReason | null {
    if (gallery.status === 'validated') return null;
    if (gallery.status === 'draft') return 'draft';
    if (gallery.status === 'archived') return 'archived';
    if (gallery.status === 'expired') return 'expired';
    if (gallery.status !== 'active') return 'draft';

    if (!gallery.expiresAt) return null;

    const expiresAt = Date.parse(gallery.expiresAt);
    if (!Number.isFinite(expiresAt)) return 'invalidExpiresAt';

    return expiresAt > Date.now() ? null : 'expiresAt';
}

export function isPublicProofingGalleryAccessible(gallery: Pick<ProofingGalleryAccess, 'expiresAt' | 'status'>) {
    return getPublicProofingGalleryBlockReason(gallery) === null;
}

export async function resolvePublicProofingAccess(accessKey: string, token?: string) {
    const galleryAccess = await getProofingGalleryPasswordAccess(accessKey);
    const blockReason = getPublicProofingGalleryBlockReason(galleryAccess);
    const isAccessible = blockReason === null;
    const hasAccess =
        isAccessible &&
        (!galleryAccess.hasPassword || (token ? verifyProofingGalleryAccessToken(token, galleryAccess.id) : false));

    return { galleryAccess, hasAccess, isAccessible, blockReason };
}
