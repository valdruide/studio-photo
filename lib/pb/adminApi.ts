import 'server-only';
import { NextResponse } from 'next/server';
import { exportAdminAuthCookie, getPBAdminFromCookie, getPBAdminFromCurrentCookies } from './adminServer';

type AdminPocketBase = NonNullable<Awaited<ReturnType<typeof getPBAdminFromCookie>>>;

export async function withAdmin<T>(fn: (pb: AdminPocketBase) => Promise<T>, req?: Request) {
    const pb = req ? await getPBAdminFromCookie(req.headers.get('cookie')) : await getPBAdminFromCurrentCookies();
    if (!pb) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await fn(pb);

    if (result instanceof NextResponse) {
        result.headers.append('Set-Cookie', exportAdminAuthCookie(pb));
    }

    return result;
}
