import { NextRequest, NextResponse } from 'next/server';
import { verifyProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import {
    getProofingGallery,
    getProofingGalleryPasswordAccess,
    getProofingGalleryPhotos,
    updateProofingGalleryPhoto,
} from '@/lib/proofing/getProofingGalleries';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ accessKey: string; photoId: string }> }) {
    try {
        const { accessKey, photoId } = await ctx.params;
        if (!accessKey || !photoId) return new NextResponse('Missing accessKey or photoId', { status: 400 });

        const galleryAccess = await getProofingGalleryPasswordAccess(accessKey);
        const token = req.cookies.get(`proof_access_${galleryAccess.id}`)?.value;
        const hasAccess =
            !galleryAccess.hasPassword || (token ? verifyProofingGalleryAccessToken(token, galleryAccess.id) : false);

        if (!hasAccess) return new NextResponse('Unauthorized', { status: 401 });

        const body = await req.json().catch(() => ({}));
        const hasSelectedUpdate = body?.isSelected !== undefined;
        const nextSelected = hasSelectedUpdate ? Boolean(body.isSelected) : undefined;
        const nextNote = typeof body?.clientNote === 'string' ? body.clientNote : undefined;

        if (!hasSelectedUpdate && nextNote === undefined) {
            return new NextResponse('Missing update', { status: 400 });
        }

        const [gallery, photos] = await Promise.all([getProofingGallery(accessKey), getProofingGalleryPhotos(galleryAccess.id)]);
        const currentPhoto = photos.find((photo) => photo.id === photoId);

        if (!currentPhoto) return new NextResponse('Photo not found', { status: 404 });

        if (nextSelected === true && !currentPhoto.isSelected) {
            const selectedCount = photos.filter((photo) => photo.isSelected).length;
            if (selectedCount >= gallery.selectionLimit) {
                return NextResponse.json({ message: 'Selection limit reached' }, { status: 409 });
            }
        }

        const updated = await updateProofingGalleryPhoto(photoId, {
            isSelected: nextSelected,
            clientNote: nextNote,
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('PATCH /api/public/proofing/galleries/[accessKey]/photos/[photoId] failed:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
