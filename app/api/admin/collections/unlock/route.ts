import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { makeCollectionAccessToken } from '@/lib/accessWhenLockedByPassword';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        const body = await req.json().catch(() => ({}));
        const slug = String(body?.slug ?? '').trim();
        const password = String(body?.password ?? '').trim();

        if (!slug || !password) {
            return NextResponse.json({ ok: false, message: 'Missing slug or password' }, { status: 400 });
        }

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

        const savedPassword = String(collection.password ?? '').trim();

        if (!savedPassword || savedPassword !== password) {
            return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
        }

        const token = makeCollectionAccessToken(collection.id);
        const res = NextResponse.json({ ok: true });

        res.cookies.set(`col_access_${collection.id}`, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });

        return res;
    });
}
