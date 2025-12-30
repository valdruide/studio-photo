import 'server-only';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function getPBAdmin() {
    const url = process.env.NEXT_PUBLIC_PB_URL;
    if (!url) throw new Error('NEXT_PUBLIC_PB_URL is missing');

    const pb = new PocketBase(url);

    const cookieStore = await cookies(); // ✅ pas async
    const pbCookie = cookieStore.get('pb_auth')?.value;

    if (pbCookie) {
        pb.authStore.loadFromCookie(`pb_auth=${pbCookie}`);
    }

    return pb;
}

export function requireAdmin(pb: PocketBase) {
    return pb.authStore.isValid;
}
