import 'server-only';
import PocketBase from 'pocketbase';

export function getPBPublic() {
    const url = process.env.NEXT_PUBLIC_PB_URL;
    if (!url) throw new Error('NEXT_PUBLIC_PB_URL is missing');
    return new PocketBase(url);
}
