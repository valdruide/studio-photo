import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

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
