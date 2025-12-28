import { LOCAL_COLLECTIONS } from './localCollections';
import type { PhotoCollection } from './types';

/**
 * Aujourd'hui: retourne du local.
 * Demain: tu remplaces l'intérieur par un fetch BDD/API.
 */
export async function getCollectionBySlug(slug: string): Promise<PhotoCollection | null> {
    return LOCAL_COLLECTIONS[slug] ?? null;
}
