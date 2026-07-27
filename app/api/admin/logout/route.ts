import { NextResponse } from 'next/server';
import { exportClearAdminAuthCookie, exportLogoutMarkerCookie } from '@/lib/pb/adminServer';

function applyLogoutCookies(res: NextResponse) {
    res.headers.append('Set-Cookie', exportClearAdminAuthCookie());
    res.headers.append('Set-Cookie', 'pb_auth=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
    res.headers.append('Set-Cookie', 'pb_auth=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
    res.headers.append('Set-Cookie', exportLogoutMarkerCookie());

    return res;
}

export async function GET(req: Request) {
    const res = NextResponse.redirect(new URL('/', req.url));
    res.headers.set('Cache-Control', 'no-store');
    return applyLogoutCookies(res);
}

export async function POST() {
    const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    return applyLogoutCookies(res);
}
