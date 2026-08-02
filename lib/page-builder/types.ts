import type { Data } from '@puckeditor/core';

export type BuilderPage = 'homepage' | 'about';

export type SitePageRecord = {
    id: string;
    slug: BuilderPage;
    title?: string;
    draftData?: Data | null;
    publishedData?: Data | null;
    status?: 'draft' | 'published';
    publishedAt?: string;
    schemaVersion?: string;
    created?: string;
    updated?: string;
};
