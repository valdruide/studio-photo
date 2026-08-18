import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

const MAX_FEATURED_PHOTOS = 3;

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));
        const isFeatured = Boolean(body?.isFeatured);

        const photo = await pb.collection('photos').getOne(id);

        if (!isFeatured) {
            const updated = await pb.collection('photos').update(id, {
                isFeatured: false,
                featuredOrder: null,
            });
            return NextResponse.json(updated);
        }

        if (photo.isFeatured) {
            return NextResponse.json(photo);
        }

        const featured = await pb.collection('photos').getFullList({
            filter: 'isFeatured = true',
            sort: 'featuredOrder,created',
        });

        if (featured.length >= MAX_FEATURED_PHOTOS) {
            return new NextResponse('Featured photos limit reached', { status: 409 });
        }

        const nextFeaturedOrder =
            featured.reduce((max, item) => {
                const order = Number(item.featuredOrder);
                return Number.isFinite(order) ? Math.max(max, order) : max;
            }, 0) + 1;

        const updated = await pb.collection('photos').update(id, {
            isFeatured: true,
            featuredOrder: nextFeaturedOrder,
        });

        return NextResponse.json(updated);
    });
}
