import 'server-only';

import type PocketBase from 'pocketbase';
import type { Data } from '@puckeditor/core';

import { getPBPublic } from '@/lib/pb/server';
import { getFallbackBuilderData } from './fallback-data';
import type { BuilderPage, SitePageRecord } from './types';

const SITE_PAGES_COLLECTION = 'site_pages';

function isPuckData(value: unknown): value is Data {
    if (!value || typeof value !== 'object') return false;

    const data = value as Partial<Data>;
    return Array.isArray(data.content) && Boolean(data.root);
}

function normalizePageRecord(record: Record<string, unknown>): SitePageRecord {
    return {
        id: String(record.id),
        slug: record.slug as BuilderPage,
        title: typeof record.title === 'string' ? record.title : undefined,
        draftData: isPuckData(record.draftData) ? record.draftData : null,
        publishedData: isPuckData(record.publishedData) ? record.publishedData : null,
        status: record.status === 'published' ? 'published' : 'draft',
        publishedAt: typeof record.publishedAt === 'string' ? record.publishedAt : undefined,
        schemaVersion: typeof record.schemaVersion === 'string' ? record.schemaVersion : undefined,
        created: typeof record.created === 'string' ? record.created : undefined,
        updated: typeof record.updated === 'string' ? record.updated : undefined,
    };
}

export { getFallbackBuilderData };

export async function getSitePageBySlug(pb: PocketBase, slug: BuilderPage) {
    try {
        const record = await pb.collection(SITE_PAGES_COLLECTION).getFirstListItem(`slug="${slug}"`, {
            requestKey: null,
        });

        return normalizePageRecord(record as unknown as Record<string, unknown>);
    } catch {
        return null;
    }
}

export async function getPublishedSitePageData(slug: BuilderPage) {
    const pb = getPBPublic();
    const page = await getSitePageBySlug(pb, slug);

    if (page?.status === 'published' && page.publishedData) {
        return page.publishedData;
    }

    return null;
}

export async function upsertSitePageDraft(pb: PocketBase, slug: BuilderPage, data: Data) {
    const page = await getSitePageBySlug(pb, slug);
    const payload = {
        slug,
        title: slug === 'homepage' ? 'Homepage' : 'About',
        draftData: data,
        schemaVersion: '1',
    };

    if (!page) {
        const created = await pb.collection(SITE_PAGES_COLLECTION).create({
            ...payload,
            status: 'draft',
        });
        return normalizePageRecord(created as unknown as Record<string, unknown>);
    }

    const updated = await pb.collection(SITE_PAGES_COLLECTION).update(page.id, payload);
    return normalizePageRecord(updated as unknown as Record<string, unknown>);
}

export async function publishSitePage(pb: PocketBase, slug: BuilderPage, data: Data) {
    const page = await getSitePageBySlug(pb, slug);
    const payload = {
        slug,
        title: slug === 'homepage' ? 'Homepage' : 'About',
        draftData: data,
        publishedData: data,
        status: 'published',
        publishedAt: new Date().toISOString(),
        schemaVersion: '1',
    };

    if (!page) {
        const created = await pb.collection(SITE_PAGES_COLLECTION).create(payload);
        return normalizePageRecord(created as unknown as Record<string, unknown>);
    }

    const updated = await pb.collection(SITE_PAGES_COLLECTION).update(page.id, payload);
    return normalizePageRecord(updated as unknown as Record<string, unknown>);
}

export async function updateSitePageStatus(pb: PocketBase, slug: BuilderPage, status: 'draft' | 'published') {
    const page = await getSitePageBySlug(pb, slug);

    if (!page) {
        throw new Error('Page not found');
    }

    if (status === 'published' && !page.publishedData) {
        throw new Error('Publish this page from the builder before setting it as published');
    }

    const updated = await pb.collection(SITE_PAGES_COLLECTION).update(page.id, {
        status,
    });

    return normalizePageRecord(updated as unknown as Record<string, unknown>);
}

export async function deleteSitePage(pb: PocketBase, slug: BuilderPage) {
    const page = await getSitePageBySlug(pb, slug);

    if (!page) {
        return null;
    }

    await pb.collection(SITE_PAGES_COLLECTION).delete(page.id);
    return page;
}
