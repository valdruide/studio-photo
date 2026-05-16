import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { deleteProofingGalleryPhoto, updateProofingGalleryPhoto } from '@/lib/proofing/getProofingGalleries';

function errorResponse(err: unknown, fallback = 'Internal Server Error') {
    const payload =
        typeof err === 'object' && err !== null
            ? {
                  message: 'message' in err && typeof err.message === 'string' ? err.message : fallback,
                  pb: 'response' in err ? err.response : null,
              }
            : { message: fallback, pb: null };

    return NextResponse.json(payload, { status: 500 });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ photoId: string }> }) {
    return withAdmin(async () => {
        try {
            const { photoId } = await ctx.params;
            if (!photoId) return new NextResponse('Missing photoId', { status: 400 });

            const body = await req.json().catch(() => ({}));
            const updated = await updateProofingGalleryPhoto(photoId, {
                order: body?.order !== undefined ? Number(body.order) : undefined,
                isSelected: body?.isSelected !== undefined ? Boolean(body.isSelected) : undefined,
                clientNote: typeof body?.clientNote === 'string' ? body.clientNote : undefined,
            });

            return NextResponse.json(updated);
        } catch (err) {
            console.error('PATCH /api/admin/proofing/gallery-photos/[photoId] failed:', err);
            return errorResponse(err);
        }
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ photoId: string }> }) {
    return withAdmin(async () => {
        try {
            const { photoId } = await ctx.params;
            if (!photoId) return new NextResponse('Missing photoId', { status: 400 });

            const result = await deleteProofingGalleryPhoto(photoId);
            return NextResponse.json(result);
        } catch (err) {
            console.error('DELETE /api/admin/proofing/gallery-photos/[photoId] failed:', err);
            return errorResponse(err);
        }
    });
}
