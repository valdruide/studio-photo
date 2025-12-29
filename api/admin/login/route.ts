import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
    const auth = await pb.collection('admin_users').authWithPassword(email, password);

    // PB fournit un cookie "pb_auth=..."
    const cookie = pb.authStore.exportToCookie({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });

    const res = NextResponse.json({ ok: true, user: auth.record });
    res.headers.append('Set-Cookie', cookie);
    return res;
}
