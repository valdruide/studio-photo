import { NextResponse } from 'next/server';
import { normalizeSlug } from '@/lib/collections/pbUtils';
import { getPBPublic } from '@/lib/pb/server';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
    const { slug } = await ctx.params;
    const categorySlug = normalizeSlug(slug);

    if (!categorySlug) {
        return NextResponse.json({ message: 'Missing category slug' }, { status: 400 });
    }

    try {
        const pb = getPBPublic();
        const category = await pb.collection('categories').getFirstListItem(`slug="${categorySlug}" && isHidden=false`, {
            fields: 'id,title,slug,allowAll',
        });

        return NextResponse.json({
            id: category.id,
            title: category.title,
            slug: category.slug,
            allowAll: Boolean(category.allowAll ?? true),
        });
    } catch {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
}
