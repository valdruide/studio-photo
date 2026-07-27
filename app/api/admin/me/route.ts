import { NextResponse } from 'next/server';
import { exportAdminAuthCookie, getPBAdminFromCookie } from '@/lib/pb/adminServer';

export async function GET(req: Request) {
    const pb = await getPBAdminFromCookie(req.headers.get('cookie'));
    const res = NextResponse.json({ isAdmin: Boolean(pb) }, { headers: { 'Cache-Control': 'no-store' } });

    if (pb) {
        res.headers.append('Set-Cookie', exportAdminAuthCookie(pb));
    }

    return res;
}
