import { NextRequest, NextResponse } from 'next/server';
import { verifyProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import { getProofingGalleryPasswordAccess, updateProofingGallery } from '@/lib/proofing/getProofingGalleries';

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

        const updated = await updateProofingGallery(galleryAccess.id, {
            status: 'validated',
            validatedAt: new Date().toISOString(),
        });

        return NextResponse.json(updated);
    } catch (err) {
        console.error('POST /api/public/proofing/galleries/[accessKey]/validate failed:', err);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
