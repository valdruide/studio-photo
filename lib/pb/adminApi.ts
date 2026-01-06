import 'server-only';
import { NextResponse } from 'next/server';
import { getPBAdmin, requireAdmin } from './adminServer';

export async function withAdmin<T>(fn: (pb: Awaited<ReturnType<typeof getPBAdmin>>) => Promise<T>) {
    const pb = await getPBAdmin();
    if (!requireAdmin(pb)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    return fn(pb);
}
