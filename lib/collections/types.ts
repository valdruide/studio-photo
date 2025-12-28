import type { StaticImageData } from 'next/image';

export type CategorySlug = 'portraits' | 'nude-art'; // extensible

// Item stocké dans une collection
export type CollectionItem = {
    id: string;
    name: string;
    src: StaticImageData; // plus tard: string (BDD) ou StaticImageData (local)
    description?: string;
};

export type PhotoCollection = {
    slug: string;
    title: string;
    description: string;
    category: CategorySlug;
    items: CollectionItem[];
};

// Item "prêt à afficher" dans une vue (ex: query=all) : on ajoute collectionSlug
export type PhotoItem = CollectionItem & {
    collectionSlug: string;
};

export type CategoryView = {
    category: CategorySlug;
    query: string; // "all" ou slug collection
    title: string;
    description?: string;
    items: PhotoItem[];
};
