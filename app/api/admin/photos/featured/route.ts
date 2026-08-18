import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { PB_THUMBS } from '@/lib/pb/thumbs';
import { pbFileUrl } from '@/lib/collections/pbUtils';

function firstRecord(value: unknown) {
    if (Array.isArray(value)) return value[0] as Record<string, unknown> | undefined;
    return value as Record<string, unknown> | undefined;
}

export async function GET() {
    return withAdmin(async (pb) => {
        const photos = await pb.collection('photos').getFullList({
            filter: 'isFeatured = true',
            sort: 'featuredOrder,created',
            expand: 'collection,collection.category',
        });

        const items = photos.map((photo) => {
            const collection = firstRecord(photo.expand?.collection);
            const category = firstRecord(collection?.expand as unknown as Record<string, unknown> | undefined)?.category;
            const categoryRecord = firstRecord(category);
            const collectionLocked = Boolean(collection?.lockedByPassword);
            const categoryLocked = Boolean(categoryRecord?.lockedByPassword);

            return {
                id: photo.id,
                name: photo.name ?? 'Untitled photo',
                image: photo.image ?? '',
                isHidden: Boolean(photo.isHidden),
                isFeatured: Boolean(photo.isFeatured),
                featuredOrder: photo.featuredOrder ?? null,
                collectionId: photo.collectionId,
                collectionTitle: collection?.title ?? 'Untitled collection',
                collectionHidden: Boolean(collection?.isHidden),
                categoryTitle: categoryRecord?.title ?? 'Untitled category',
                categoryHidden: Boolean(categoryRecord?.isHidden),
                lockedByPassword: collectionLocked || categoryLocked,
                srcThumb: pbFileUrl(pb.baseURL, photo, 'image', PB_THUMBS.grid),
            };
        });

        return NextResponse.json({ items });
    });
}

export async function PATCH(req: Request) {
    return withAdmin(async (pb) => {
        const body = await req.json().catch(() => ({}));
        const updates = Array.isArray(body?.updates) ? body.updates : [];

        if (!updates.length) {
            return new NextResponse('Missing updates', { status: 400 });
        }

        for (const update of updates) {
            const id = typeof update?.id === 'string' ? update.id.trim() : '';
            const featuredOrder = Number(update?.featuredOrder);

            if (!id) return new NextResponse('Invalid photo id', { status: 400 });
            if (!Number.isFinite(featuredOrder) || featuredOrder < 1) return new NextResponse('Invalid featured order', { status: 400 });

            const photo = await pb.collection('photos').getOne(id);
            if (!photo.isFeatured) return new NextResponse('Photo is not featured', { status: 400 });

            await pb.collection('photos').update(id, { featuredOrder });
        }

        return NextResponse.json({ ok: true, count: updates.length });
    });
}
