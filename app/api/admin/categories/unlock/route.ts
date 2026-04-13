import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { makeCategoryAccessToken } from '@/lib/accessWhenLockedByPassword';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        const body = await req.json().catch(() => ({}));
        const slug = String(body?.slug ?? '').trim();
        const password = String(body?.password ?? '').trim();

        if (!slug || !password) {
            return NextResponse.json({ ok: false, message: 'Missing slug or password' }, { status: 400 });
        }

        let category: any;
        try {
            category = await pb.collection('categories').getFirstListItem(`slug="${slug}" && isHidden=false`);
        } catch {
            return NextResponse.json({ ok: false, message: 'Category not found' }, { status: 404 });
        }

        if (!category.lockedByPassword) {
            return NextResponse.json({ ok: true });
        }

        const savedPassword = String(category.password ?? '').trim();

        if (!savedPassword || savedPassword !== password) {
            return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
        }

        const token = makeCategoryAccessToken(category.id);
        const res = NextResponse.json({ ok: true });

        res.cookies.set(`cat_access_${category.id}`, token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 jours
        });

        return res;
    });
}
