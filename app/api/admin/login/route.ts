import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    try {
        const auth = await pb.collection('admin_users').authWithPassword(email, password);

        const cookie = pb.authStore.exportToCookie({
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        const res = NextResponse.json({ ok: true, user: auth.record });
        res.headers.append('Set-Cookie', cookie);
        return res;
    } catch (e: any) {
        // log précis côté serveur
        console.error('PB login failed:', e?.status, e?.response);
        return NextResponse.json({ ok: false, error: 'Failed to authenticate', details: e?.response ?? null }, { status: 401 });
    }
}
