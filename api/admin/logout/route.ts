import { NextResponse } from 'next/server';

export async function POST() {
    const res = NextResponse.json({ ok: true });
    res.headers.append('Set-Cookie', `pb_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    return res;
}
