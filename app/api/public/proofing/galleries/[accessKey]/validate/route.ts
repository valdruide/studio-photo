import { NextRequest, NextResponse } from 'next/server';
import { verifyProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import { createLocalNotification } from '@/lib/notifications/notifications';
import {
    getProofingGallery,
    getProofingGalleryPasswordAccess,
    getProofingGalleryPhotos,
    updateProofingGallery,
} from '@/lib/proofing/getProofingGalleries';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, ctx: { params: Promise<{ accessKey: string }> }) {
    try {
        const { accessKey } = await ctx.params;
        if (!accessKey) return new NextResponse('Missing accessKey', { status: 400 });

        const galleryAccess = await getProofingGalleryPasswordAccess(accessKey);
        const token = req.cookies.get(`proof_access_${galleryAccess.id}`)?.value;
        const hasAccess =
            !galleryAccess.hasPassword || (token ? verifyProofingGalleryAccessToken(token, galleryAccess.id) : false);

        if (!hasAccess) return new NextResponse('Unauthorized', { status: 401 });

        const [gallery, photos] = await Promise.all([getProofingGallery(accessKey), getProofingGalleryPhotos(galleryAccess.id)]);
        const wasAlreadyValidated = gallery.status === 'validated';
        const selectedCount = photos.filter((photo) => photo.isSelected).length;

        const updated = await updateProofingGallery(galleryAccess.id, {
            status: 'validated',
            validatedAt: new Date().toISOString(),
        });

        if (!wasAlreadyValidated) {
            try {
                await createLocalNotification({
                    title: 'Gallery validated',
                    message: `The gallery "${updated.title}" was validated with ${selectedCount} selected photo${selectedCount > 1 ? 's' : ''}.`,
                    type: 'proofing_gallery_validated',
                    targetUrl: `/proofing/edit/${updated.id}`,
                    metadata: {
                        galleryId: updated.id,
                        galleryTitle: updated.title,
                        clientName: updated.clientName,
                        clientEmail: updated.clientEmail,
                        selectedCount,
                    },
                });
            } catch (notificationError) {
                console.error('Failed to create proofing validation notification:', notificationError);
            }
        }

        return NextResponse.json(updated);
    } catch (err) {
        console.error('POST /api/public/proofing/galleries/[accessKey]/validate failed:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
