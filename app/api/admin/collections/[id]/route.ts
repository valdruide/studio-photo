import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const col = await pb.collection('photo_collections').getOne(id);
        return NextResponse.json(col);
    });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));

        // whitelist champs autorisés
        const data: any = {
            title: body?.title,
            slug: body?.slug,
            description: body?.description,
            isHidden: Boolean(body?.isHidden),
            category: body?.category,
        };

        if (body?.order !== undefined && body?.order !== null && body?.order !== '') {
            const n = Number(body.order);
            if (!Number.isFinite(n)) return new NextResponse('Invalid order', { status: 400 });
            data.order = n;
        }

        Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

        const updated = await pb.collection('photo_collections').update(id, data);
        return NextResponse.json(updated);
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        if (!id) return new NextResponse('Missing id', { status: 400 });

        try {
            // 1) Récupère toutes les photos de cette collection
            const photos = await pb.collection('photos').getFullList({
                filter: `collection="${id}"`,
                fields: 'id',
            });

            // 2) Supprime les photos (séquentiel = OK en MVP)
            for (const p of photos) {
                await pb.collection('photos').delete(p.id);
            }

            // 3) Supprime la collection
            await pb.collection('photo_collections').delete(id);

            return NextResponse.json({ ok: true, deletedPhotos: photos.length });
        } catch (err: any) {
            console.error('DELETE /api/admin/collections/[id] failed:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json({ message: err?.message ?? 'Internal Server Error', pb: err?.response ?? null }, { status: 500 });
        }
    });
}
