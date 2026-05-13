import 'server-only';
import PocketBase from 'pocketbase';

export async function getPBAdmin() {
    const url = process.env.NEXT_PUBLIC_PB_URL;
    if (!url) throw new Error('NEXT_PUBLIC_PB_URL is missing');

    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email) throw new Error('PB_ADMIN_EMAIL is missing');
    if (!password) throw new Error('PB_ADMIN_PASSWORD is missing');

    const pb = new PocketBase(url);

    await pb.collection('_superusers').authWithPassword(email, password);

    return pb;
}

export function requireAdmin(pb: PocketBase) {
    return pb.authStore.isValid;
}
