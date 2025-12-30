import { NextResponse } from 'next/server';
import { getPBAdmin, requireAdmin } from '@/lib/pb/adminServer';

export async function GET() {
    const pb = await getPBAdmin();
    const isAdmin = requireAdmin(pb);

    return NextResponse.json({ isAdmin }, { headers: { 'Cache-Control': 'no-store' } });
}
