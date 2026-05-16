import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { deleteProofingGallery, getProofingGallery, updateProofingGallery } from '@/lib/proofing/getProofingGalleries';

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

            const item = await getProofingGallery(id);
            return NextResponse.json(item, { headers: { 'Cache-Control': 'no-store' } });
        } catch (err) {
            console.error('GET /api/admin/proofing/galleries/[id] failed:', err);
            return errorResponse(err);
        }
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async () => {
        try {
            const { id } = await ctx.params;
            if (!id) return new NextResponse('Missing id', { status: 400 });

            const result = await deleteProofingGallery(id);
            return NextResponse.json(result);
        } catch (err) {
            console.error('DELETE /api/admin/proofing/galleries/[id] failed:', err);
            return errorResponse(err);
        }
    });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async () => {
        try {
            const { id } = await ctx.params;
            if (!id) return new NextResponse('Missing id', { status: 400 });

            const body = await req.json().catch(() => ({}));
            const selectionLimit = body?.selectionLimit !== undefined ? Number(body.selectionLimit) : undefined;

            if (selectionLimit !== undefined && (!Number.isFinite(selectionLimit) || selectionLimit <= 0)) {
                return new NextResponse('Invalid selectionLimit', { status: 400 });
            }

            const updated = await updateProofingGallery(id, {
                title: typeof body?.title === 'string' ? body.title : undefined,
                clientName: typeof body?.clientName === 'string' ? body.clientName : undefined,
                clientEmail: typeof body?.clientEmail === 'string' ? body.clientEmail : undefined,
                accessKey: typeof body?.accessKey === 'string' ? body.accessKey : undefined,
                password: typeof body?.password === 'string' ? body.password : undefined,
                selectionLimit,
                expiresAt: typeof body?.expiresAt === 'string' || body?.expiresAt === null ? body.expiresAt : undefined,
                status: typeof body?.status === 'string' ? body.status : undefined,
                validatedAt: typeof body?.validatedAt === 'string' || body?.validatedAt === null ? body.validatedAt : undefined,
                notes: typeof body?.notes === 'string' ? body.notes : undefined,
            });

            return NextResponse.json(updated);
        } catch (err) {
            console.error('PATCH /api/admin/proofing/galleries/[id] failed:', err);
            return errorResponse(err);
        }
    });
}
