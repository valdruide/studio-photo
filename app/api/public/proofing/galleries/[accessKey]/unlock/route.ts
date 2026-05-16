import { NextResponse } from 'next/server';
import { LOCK_ACCESS_TTL_SECONDS, makeProofingGalleryAccessToken } from '@/lib/accessWhenLockedByPassword';
import { verifyLockPassword } from '@/lib/passwordLock';
import { getProofingGalleryPasswordAccess } from '@/lib/proofing/getProofingGalleries';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ accessKey: string }> }) {
    try {
        const { accessKey } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const password = String(body?.password ?? '').trim();

        if (!accessKey || !password) {
            return NextResponse.json({ ok: false, message: 'Missing password' }, { status: 400 });
        }

        const gallery = await getProofingGalleryPasswordAccess(accessKey);

        if (!gallery.hasPassword) {
            return NextResponse.json({ ok: true });
        }

        if (!gallery.passwordHash) {
            return NextResponse.json({ ok: false, message: 'Password protection misconfigured' }, { status: 500 });
        }

        const isValid = await verifyLockPassword(password, gallery.passwordHash);
        if (!isValid) {
            return NextResponse.json({ ok: false, message: 'Invalid password' }, { status: 401 });
        }

        const res = NextResponse.json({ ok: true });
        const isHttps =
            process.env.NODE_ENV === 'production' &&
            (process.env.APP_URL?.startsWith('https://') || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://'));

        res.cookies.set(`proof_access_${gallery.id}`, makeProofingGalleryAccessToken(gallery.id), {
            httpOnly: true,
            sameSite: 'lax',
            secure: isHttps,
            path: '/',
            maxAge: LOCK_ACCESS_TTL_SECONDS,
        });

        return res;
    } catch (err) {
        console.error('POST /api/public/proofing/galleries/[accessKey]/unlock failed:', err);
        return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
    }
}
