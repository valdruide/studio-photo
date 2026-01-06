import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { optimizeToJpeg } from '@/lib/images/optimize';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    return withAdmin(async (pb) => {
        const url = new URL(req.url);
        const collectionId = url.searchParams.get('collectionId');

        if (!collectionId) {
            return new NextResponse('Missing collectionId', { status: 400 });
        }

        const items = await pb.collection('photos').getFullList({
            sort: 'order',
            filter: `collection="${collectionId}"`,
        });

        return NextResponse.json({ items });
    });
}

/**
 * Body attendu :
 * { updates: [{ id: string, order: number }, ...] }
 */
export async function PATCH(req: Request) {
    return withAdmin(async (pb) => {
        const body = await req.json().catch(() => ({}));
        const updates = Array.isArray(body?.updates) ? body.updates : [];

        if (!updates.length) {
            return new NextResponse('Missing updates', { status: 400 });
        }

        // MVP: updates séquentiels (ça suffit très largement)
        for (const u of updates) {
            if (!u?.id) continue;
            const n = Number(u.order);
            if (!Number.isFinite(n)) {
                return new NextResponse('Invalid order', { status: 400 });
            }
            await pb.collection('photos').update(u.id, { order: n });
        }

        return NextResponse.json({ ok: true, count: updates.length });
    });
}

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        try {
            const form = await req.formData();

            const collectionId = String(form.get('collectionId') ?? '').trim();
            if (!collectionId) return new NextResponse('Missing collectionId', { status: 400 });

            const files = form.getAll('files').filter((v) => v instanceof File) as File[];
            if (!files.length) return new NextResponse('Missing files', { status: 400 });

            const name = String(form.get('name') ?? '').trim();
            if (!name) return new NextResponse('Missing name', { status: 400 });

            const description = String(form.get('description') ?? '');

            const orderRaw = String(form.get('order') ?? '').trim();
            const orderFromClient = orderRaw !== '' ? Number(orderRaw) : null;
            if (orderFromClient !== null && !Number.isFinite(orderFromClient)) {
                return new NextResponse('Invalid order', { status: 400 });
            }

            // last order + 1
            const last = await pb.collection('photos').getList(1, 1, {
                sort: '-order',
                filter: `collection~"${collectionId}" || collection="${collectionId}"`,
            });

            let nextOrder = (last.items?.[0]?.order ?? 0) + 1;

            const created: any[] = [];

            for (const file of files) {
                // 1) Optimise en JPEG + récupère width/height
                const inputAB = await file.arrayBuffer();
                const opt = await optimizeToJpeg(inputAB);

                const outName = file.name.replace(/\.[^/.]+$/, '') + '.' + opt.filenameExt;

                // File (Node) à partir du buffer optimisé
                const outFile = new File([opt.buffer], outName, { type: 'image/jpeg' });

                // 2) Build FormData pour PocketBase
                const fd = new FormData();

                // order final : soit celui du client, soit "append"
                const orderToUse = orderFromClient !== null ? orderFromClient : nextOrder;

                fd.set('collection', collectionId);
                fd.set('name', name);
                fd.set('description', description);
                fd.set('order', String(orderToUse));
                fd.set('isHidden', 'false');
                fd.set('width', String(opt.width ?? 0));
                fd.set('height', String(opt.height ?? 0));
                fd.set('image', outFile);

                try {
                    const rec = await pb.collection('photos').create(fd);
                    created.push(rec);
                } catch (err: any) {
                    // Retry: relation multiple -> ["id"]
                    const fd2 = new FormData();
                    fd2.set('collection', JSON.stringify([collectionId]));
                    fd2.set('name', name);
                    fd2.set('description', description);
                    fd2.set('order', String(orderToUse));
                    fd2.set('isHidden', 'false');
                    fd2.set('width', String(opt.width ?? 0));
                    fd2.set('height', String(opt.height ?? 0));
                    fd2.set('image', outFile);

                    const rec2 = await pb.collection('photos').create(fd2);
                    created.push(rec2);
                }

                nextOrder++;
            }

            return NextResponse.json({ items: created });
        } catch (err: any) {
            console.error('POST /api/admin/photos failed:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json({ message: err?.message ?? 'Internal Server Error', pb: err?.response ?? null }, { status: 500 });
        }
    });
}
