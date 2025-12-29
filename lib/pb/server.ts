import 'server-only';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function getPB() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    const cookieStore = await cookies();
    const pbCookie = cookieStore.get('pb_auth')?.value;

    if (pbCookie) {
        // pbCookie est déjà une string de cookie exportée par PB
        pb.authStore.loadFromCookie(`pb_auth=${pbCookie}`);
    }

    return pb;
}

// Helper: vérifie que l’utilisateur est connecté (admin_users)
export function requireAdmin(pb: PocketBase) {
    if (!pb.authStore.isValid) return false;
    // Pour PB, le modèle auth courant est pb.authStore.model
    // Tu peux aussi vérifier collectionName si tu veux.
    return true;
}
