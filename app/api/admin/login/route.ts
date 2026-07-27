import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { exportAdminAuthCookie, exportClearLogoutMarkerCookie } from '@/lib/pb/adminServer';

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    try {
        const auth = await pb.collection('_superusers').authWithPassword(email, password);

        const res = NextResponse.json({ ok: true, user: auth.record }, { headers: { 'Cache-Control': 'no-store' } });
        res.headers.append('Set-Cookie', exportAdminAuthCookie(pb));
        res.headers.append('Set-Cookie', exportClearLogoutMarkerCookie());
        return res;
    } catch (e: any) {
        // log précis côté serveur
        console.error('PB login failed:', e?.status, e?.response);
        return NextResponse.json({ ok: false, error: 'Failed to authenticate', details: e?.response ?? null }, { status: 401 });
    }
}
