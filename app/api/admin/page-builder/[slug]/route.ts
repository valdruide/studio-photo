import { NextResponse } from 'next/server';
import type { Data } from '@puckeditor/core';

import { withAdmin } from '@/lib/pb/adminApi';
import { getFallbackBuilderData } from '@/lib/page-builder/fallback-data';
import { deleteSitePage, getSitePageBySlug, publishSitePage, updateSitePageStatus } from '@/lib/page-builder/site-pages';
import type { BuilderPage } from '@/lib/page-builder/types';

function normalizeSlug(slug: string): BuilderPage | null {
    return slug === 'homepage' || slug === 'about' ? slug : null;
}

function isPuckData(value: unknown): value is Data {
    if (!value || typeof value !== 'object') return false;

    const data = value as Partial<Data>;
    return Array.isArray(data.content) && Boolean(data.root);
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = await params;
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
        return NextResponse.json({ message: 'Unknown builder page' }, { status: 404 });
    }

    return withAdmin(async (pb) => {
        const item = await getSitePageBySlug(pb, slug);
        const data = item?.draftData ?? item?.publishedData ?? getFallbackBuilderData(slug);

        return NextResponse.json({ item, data }, { headers: { 'Cache-Control': 'no-store' } });
    }, req);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = await params;
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
        return NextResponse.json({ message: 'Unknown builder page' }, { status: 404 });
    }

    return withAdmin(async (pb) => {
        const body = (await req.json().catch(() => null)) as { data?: unknown; status?: unknown } | null;

        if (body?.status === 'draft' || body?.status === 'published') {
            try {
                const item = await updateSitePageStatus(pb, slug, body.status);
                return NextResponse.json({ item }, { headers: { 'Cache-Control': 'no-store' } });
            } catch (error) {
                return NextResponse.json({ message: error instanceof Error ? error.message : 'Failed to update page status' }, { status: 400 });
            }
        }

        if (!isPuckData(body?.data)) {
            return NextResponse.json({ message: 'Invalid Puck data' }, { status: 400 });
        }

        const item = await publishSitePage(pb, slug, body.data);

        return NextResponse.json({ item, data: item.publishedData }, { headers: { 'Cache-Control': 'no-store' } });
    }, req);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = await params;
    const slug = normalizeSlug(rawSlug);

    if (!slug) {
        return NextResponse.json({ message: 'Unknown builder page' }, { status: 404 });
    }

    return withAdmin(async (pb) => {
        const deleted = await deleteSitePage(pb, slug);

        return NextResponse.json({ ok: true, deleted }, { headers: { 'Cache-Control': 'no-store' } });
    }, req);
}
