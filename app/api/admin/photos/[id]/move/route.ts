import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

function isPocketBaseId(value: unknown): value is string {
    return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);
}

function relationContains(relation: unknown, id: string) {
    if (Array.isArray(relation)) return relation.includes(id);
    return relation === id;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const targetCollectionId = body?.targetCollectionId;

        if (!isPocketBaseId(id)) return new NextResponse('Invalid photo id', { status: 400 });
        if (!isPocketBaseId(targetCollectionId)) return new NextResponse('Invalid target collection id', { status: 400 });

        const [photo, targetCollection] = await Promise.all([
            pb.collection('photos').getOne(id).catch(() => null),
            pb.collection('photo_collections').getOne(targetCollectionId).catch(() => null),
        ]);

        if (!photo) return new NextResponse('Photo not found', { status: 404 });
        if (!targetCollection) return new NextResponse('Target collection not found', { status: 404 });

        if (relationContains(photo.collection, targetCollectionId)) {
            return new NextResponse('Photo is already in this collection', { status: 400 });
        }

        const last = await pb.collection('photos').getList(1, 1, {
            sort: '-order',
            filter: `collection="${targetCollectionId}" || collection~"${targetCollectionId}"`,
        });

        const nextOrder = Number(last.items?.[0]?.order ?? 0) + 1;

        try {
            const updated = await pb.collection('photos').update(id, {
                collection: targetCollectionId,
                order: nextOrder,
            });

            return NextResponse.json(updated);
        } catch {
            const updated = await pb.collection('photos').update(id, {
                collection: [targetCollectionId],
                order: nextOrder,
            });

            return NextResponse.json(updated);
        }
    }, req);
}
