import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { createProofingGallery, getProofingGalleries, type CreateProofingGalleryInput } from '@/lib/proofing/getProofingGalleries';

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

export async function GET() {
    return withAdmin(async () => {
        try {
            const items = await getProofingGalleries();
            return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
        } catch (err) {
            console.error('GET /api/admin/proofing/galleries failed:', err);
            return errorResponse(err);
        }
    });
}

export async function POST(req: Request) {
    return withAdmin(async () => {
        try {
            const body = (await req.json().catch(() => ({}))) as Partial<CreateProofingGalleryInput>;
            const title = String(body.title ?? '').trim();

            if (!title) return new NextResponse('Missing title', { status: 400 });

            const selectionLimit = Number(body.selectionLimit ?? 1);
            if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
                return new NextResponse('Invalid selectionLimit', { status: 400 });
            }

            const created = await createProofingGallery({
                title,
                clientName: typeof body.clientName === 'string' ? body.clientName : '',
                clientEmail: typeof body.clientEmail === 'string' ? body.clientEmail : '',
                accessKey: typeof body.accessKey === 'string' ? body.accessKey : '',
                password: typeof body.password === 'string' ? body.password : '',
                selectionLimit,
                expiresAt: body.expiresAt || null,
                status: body.status,
                notes: typeof body.notes === 'string' ? body.notes : '',
            });

            return NextResponse.json({ items: [created] }, { status: 201 });
        } catch (err) {
            console.error('POST /api/admin/proofing/galleries failed:', err);
            return errorResponse(err);
        }
    });
}
