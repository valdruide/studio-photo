import 'server-only';
import PocketBase from 'pocketbase';

export function getPB() {
    const url = process.env.NEXT_PUBLIC_PB_URL;
    if (!url) throw new Error('NEXT_PUBLIC_PB_URL is missing');

    // pas besoin d’auth si tes règles list/view sont publiques
    return new PocketBase(url);
}
