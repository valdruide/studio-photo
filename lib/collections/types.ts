export type CategorySlug = string;

/**
 * Photo individuelle prête à être affichée.
 * Mapping d’un record de la collection `photos` (PocketBase).
 * `src` est une URL construite depuis le champ `image`.
 */
export type CollectionItem = {
    id: string;
    name: string;
    src: string; // URL PocketBase (au lieu de StaticImageData)
    description?: string;
};

/**
 * Collection de photos (série / album).
 * Vue enrichie basée sur la collection `photo_collections` (PocketBase),
 * avec les photos (`items`) assemblées depuis la collection `photos`.
 */
export type PhotoCollection = {
    slug: string;
    title: string;
    description: string;
    category: CategorySlug;
    items: CollectionItem[];
};

/**
 * Photo utilisée dans une vue de catégorie (ex: query=all).
 * Extension de `CollectionItem` avec des infos de routing.
 * N’existe pas en BDD (objet purement front).
 */
export type PhotoItem = CollectionItem & {
    collectionSlug: string;
};

/**
 * Vue complète d’une catégorie (page).
 * Objet prêt à consommer par les pages Next.js.
 * Peut représenter :
 * - toutes les photos d’une catégorie (`query = "all"`)
 * - ou une collection précise (`query = collection slug`)
 */
export type CategoryView = {
    category: CategorySlug;
    query: string; // "all" ou slug collection
    title: string;
    description?: string;
    items: PhotoItem[];
};
