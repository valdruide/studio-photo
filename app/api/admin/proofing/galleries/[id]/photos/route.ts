import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import {
    createProofingGalleryPhotos,
    getProofingGalleryPhotos,
    reorderProofingGalleryPhotos,
} from '@/lib/proofing/getProofingGalleries';

export const runtime = 'nodejs';

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

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async () => {
        try {
            const { id } = await ctx.params;
            if (!id) return new NextResponse('Missing id', { status: 400 });

            const items = await getProofingGalleryPhotos(id);
            return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
        } catch (err) {
            console.error('GET /api/admin/proofing/galleries/[id]/photos failed:', err);
            return errorResponse(err);
        }
    });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async () => {
        try {
            const { id } = await ctx.params;
            if (!id) return new NextResponse('Missing id', { status: 400 });

            const form = await req.formData();
            const files = form.getAll('files').filter((value) => value instanceof File) as File[];

            if (!files.length) return new NextResponse('Missing files', { status: 400 });

            const items = await createProofingGalleryPhotos(id, files);
            return NextResponse.json({ items }, { status: 201 });
        } catch (err) {
            console.error('POST /api/admin/proofing/galleries/[id]/photos failed:', err);
            return errorResponse(err);
        }
    });
}

export async function PATCH(req: Request) {
    return withAdmin(async () => {
        try {
            const body = await req.json().catch(() => ({}));
            const updates = Array.isArray(body?.updates) ? body.updates : [];

            if (!updates.length) return new NextResponse('Missing updates', { status: 400 });

            const result = await reorderProofingGalleryPhotos(
                updates.map((update: { id?: unknown; order?: unknown }) => ({
                    id: String(update?.id ?? ''),
                    order: Number(update?.order),
                })),
            );

            return NextResponse.json(result);
        } catch (err) {
            console.error('PATCH /api/admin/proofing/galleries/[id]/photos failed:', err);
            return errorResponse(err);
        }
    });
}
