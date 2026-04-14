import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { makeCategoryAccessToken, LOCK_ACCESS_TTL_SECONDS } from '@/lib/accessWhenLockedByPassword';
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

        let category: any;
        try {
            category = await pb.collection('categories').getFirstListItem(`slug="${slug}" && isHidden=false`);
        } catch {
            return NextResponse.json({ ok: false, message: 'Category not found' }, { status: 404 });
        }

        if (!category.lockedByPassword) {
            return NextResponse.json({ ok: true });
        }

        const passwordHash = String(category.passwordHash ?? '').trim();

        if (!passwordHash) {
            console.error('Category lock misconfigured', {
                id: category.id,
                slug: category.slug,
            });
            return NextResponse.json({ ok: false, message: 'Password protection misconfigured' }, { status: 500 });
        }

        const isValid = await verifyLockPassword(password, passwordHash);

        if (!isValid) {
            return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
        }

        const token = makeCategoryAccessToken(category.id);
        const res = NextResponse.json({ ok: true });

        res.cookies.set(`cat_access_${category.id}`, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: LOCK_ACCESS_TTL_SECONDS,
        });

        return res;
    } catch (err) {
        console.error('POST /api/public/categories/unlock failed:', err);
        return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
    }
}
