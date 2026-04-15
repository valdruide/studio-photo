import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

// Limite à 10 secondes pour éviter les vues multiples lors du rafraîchissement de la page.
// N'utiliser seulement que pour les tests en local.
// En production utiliser getTenMinuteBucket() pour limiter à 10 minutes.
function getTenSecondBucket(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');

    const bucketSeconds = Math.floor(date.getUTCSeconds() / 10) * 10;
    const seconds = String(bucketSeconds).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
}

function getTenMinuteBucket(date = new Date()) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');

    const bucketMinutes = Math.floor(date.getUTCMinutes() / 10) * 10;
    const minutes = String(bucketMinutes).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}:${minutes}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { photoId, collectionId, categoryId, visitorId } = body ?? {};

        if (!photoId || !collectionId || !categoryId || !visitorId) {
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

        // Charger le cookie utilisateur
        const cookieStore = await cookies();
        pb.authStore.loadFromCookie(cookieStore.toString());

        // Si admin connecté → skip la comptabilisation de la vue pour ne pas poluer les stats
        if (pb.authStore.isValid) {
            console.log('View skipped (admin)');
            return NextResponse.json({ ok: true, skipped: 'admin' });
        }

        const bucketKey = getTenMinuteBucket(); // À utiliser en production pour limiter à 10 minutes
        // const bucketKey = getTenSecondBucket(); // À utiliser pour les tests en local, limite à 10 secondes
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
        } catch (error: any) {
            const message = error?.response?.message ?? '';
            const data = error?.response?.data ?? {};

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
