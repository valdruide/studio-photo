import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { makeCollectionAccessToken, LOCK_ACCESS_TTL_SECONDS } from '@/lib/accessWhenLockedByPassword';
import { verifyLockPassword } from '@/lib/passwordLock';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const slug = String(body?.slug ?? '').trim();
        const password = String(body?.password ?? '').trim();

        if (!slug || !password) {
            return NextResponse.json({ ok: false, message: 'Missing slug or password' }, { status: 400 });
        }

        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
        await pb.collection('_superusers').authWithPassword(process.env.PB_ADMIN_EMAIL!, process.env.PB_ADMIN_PASSWORD!);

        let collection: any;
        try {
            collection = await pb.collection('photo_collections').getFirstListItem(`slug="${slug}" && isHidden=false`, {
                expand: 'category',
            });
        } catch {
            return NextResponse.json({ ok: false, message: 'Collection not found' }, { status: 404 });
        }

        if ((collection.expand as any)?.category?.isHidden) {
            return NextResponse.json({ ok: false, message: 'Category hidden' }, { status: 404 });
        }

        if (!collection.lockedByPassword) {
            return NextResponse.json({ ok: true });
        }

        const passwordHash = String(collection.passwordHash ?? '').trim();

        if (!passwordHash) {
            console.error('Collection lock misconfigured', {
                id: collection.id,
                slug: collection.slug,
            });
            return NextResponse.json({ ok: false, message: 'Password protection misconfigured' }, { status: 500 });
        }

        const isValid = await verifyLockPassword(password, passwordHash);

        if (!isValid) {
            return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
        }

        const token = makeCollectionAccessToken(collection.id);
        const res = NextResponse.json({ ok: true });

        res.cookies.set(`col_access_${collection.id}`, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: LOCK_ACCESS_TTL_SECONDS,
        });

        return res;
    } catch (err) {
        console.error('POST /api/public/collections/unlock failed:', err);
        return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
    }
}
