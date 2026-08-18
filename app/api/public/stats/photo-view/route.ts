import { NextResponse } from 'next/server';
import type { RecordModel } from 'pocketbase';
import { getPBAdmin, getPBAdminFromCookie } from '@/lib/pb/adminServer';

// Group repeated views by minute to avoid counting refresh spam as new activity.
function getOneMinuteBucket(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');

    const bucketMinutes = Math.floor(date.getUTCMinutes() / 1) * 1;
    const minutes = String(bucketMinutes).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}:${minutes}`;
}

function asIdList(value: unknown) {
    if (Array.isArray(value)) return value.map(String);
    if (typeof value === 'string') return [value];
    return [];
}

function relationContains(value: unknown, expectedId: string) {
    return asIdList(value).includes(expectedId);
}

function isValidVisitorId(value: unknown) {
    return typeof value === 'string' && value.length >= 8 && value.length <= 128 && /^[a-zA-Z0-9_.:-]+$/.test(value);
}

async function validatePhotoViewTarget(
    pb: Awaited<ReturnType<typeof getPBAdmin>>,
    {
        photoId,
        collectionId,
        categoryId,
    }: {
        photoId: string;
        collectionId: string;
        categoryId: string;
    },
) {
    const [photo, collection, category] = await Promise.all([
        pb.collection('photos').getOne<RecordModel>(photoId).catch(() => null),
        pb.collection('photo_collections').getOne<RecordModel>(collectionId).catch(() => null),
        pb.collection('categories').getOne<RecordModel>(categoryId).catch(() => null),
    ]);

    if (!photo || !collection || !category) return false;
    if (!relationContains(photo.collection, collectionId)) return false;
    if (!relationContains(collection.category, categoryId)) return false;

    const isVisible = !Boolean(photo.isHidden) && !Boolean(collection.isHidden) && !Boolean(category.isHidden);
    const isFeaturedOverride = Boolean(photo.isFeatured);

    return isVisible || isFeaturedOverride;
}

function getPocketBaseErrorData(error: unknown) {
    if (typeof error !== 'object' || error === null || !('response' in error)) {
        return { message: '', data: {} as Record<string, unknown> };
    }

    const response = (error as { response?: { message?: unknown; data?: unknown } }).response;

    return {
        message: typeof response?.message === 'string' ? response.message : '',
        data: typeof response?.data === 'object' && response.data !== null ? response.data as Record<string, unknown> : {},
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const photoId = typeof body?.photoId === 'string' ? body.photoId.trim() : '';
        const collectionId = typeof body?.collectionId === 'string' ? body.collectionId.trim() : '';
        const categoryId = typeof body?.categoryId === 'string' ? body.categoryId.trim() : '';
        const visitorId = typeof body?.visitorId === 'string' ? body.visitorId.trim() : '';

        if (!photoId || !collectionId || !categoryId || !visitorId) {
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        if (!isValidVisitorId(visitorId)) {
            return NextResponse.json({ ok: false, error: 'Invalid visitorId' }, { status: 400 });
        }

        const pb = await getPBAdmin();

        // Si admin connecté, skip la comptabilisation de la vue pour ne pas polluer les stats.
        if (await getPBAdminFromCookie(req.headers.get('cookie'))) {
            console.log('View skipped (admin)');
            return NextResponse.json({ ok: true, skipped: 'admin' });
        }

        const isValidTarget = await validatePhotoViewTarget(pb, { photoId, collectionId, categoryId });
        if (!isValidTarget) {
            return NextResponse.json({ ok: false, error: 'Invalid photo target' }, { status: 404 });
        }

        const bucketKey = getOneMinuteBucket();
        const viewKey = `${photoId}_${visitorId}_${bucketKey}`;

        try {
            await pb.collection('photos_statistics').create({
                photo: photoId,
                collection: collectionId,
                category: categoryId,
                visitorId,
                viewKey,
            });

            return NextResponse.json({ ok: true, created: true });
        } catch (error: unknown) {
            const { message, data } = getPocketBaseErrorData(error);

            const isDuplicate = message.toLowerCase().includes('unique') || !!data?.viewKey;

            if (isDuplicate) {
                return NextResponse.json({ ok: true, created: false, duplicate: true });
            }

            throw error;
        }
    } catch (error) {
        console.error('photo-view POST failed:', error);
        return NextResponse.json({ ok: false, error: 'Failed to register photo view' }, { status: 500 });
    }
}
