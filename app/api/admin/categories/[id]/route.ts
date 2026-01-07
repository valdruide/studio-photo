import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export const runtime = 'nodejs';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));

        // whitelist des champs autorisés (important)
        const data = {
            title: body?.title,
            slug: body?.slug,
            order: undefined as number | undefined,
            icon: body?.icon,
            color: body?.color,
            isHidden: Boolean(body?.isHidden),
            allowAll: Boolean(body?.allowAll),
        };

        if (body?.order !== undefined && body?.order !== null && body?.order !== '') {
            const n = Number(body.order);
            if (!Number.isFinite(n)) {
                return new NextResponse('Invalid order', { status: 400 });
            }
            data.order = n;
        }

        // Nettoyage optionnel: éviter d'envoyer undefined
        Object.keys(data).forEach((k) => (data as any)[k] === undefined && delete (data as any)[k]);

        const updated = await pb.collection('categories').update(id, data);
        return NextResponse.json(updated);
    });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const cat = await pb.collection('categories').getOne(id);
        return NextResponse.json(cat);
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        if (!id) return new NextResponse('Missing id', { status: 400 });

        try {
            // 1) récupérer les collections de la catégorie
            const cols = await pb.collection('photo_collections').getFullList({
                filter: `category="${id}"`,
                fields: 'id',
            });

            let deletedPhotos = 0;

            // 2) pour chaque collection -> delete photos -> delete collection
            for (const col of cols) {
                const photos = await pb.collection('photos').getFullList({
                    filter: `collection="${col.id}"`,
                    fields: 'id',
                });

                for (const p of photos) {
                    await pb.collection('photos').delete(p.id);
                    deletedPhotos++;
                }

                await pb.collection('photo_collections').delete(col.id);
            }

            // 3) delete catégorie
            await pb.collection('categories').delete(id);

            return NextResponse.json({ ok: true, deletedCollections: cols.length, deletedPhotos });
        } catch (err: any) {
            console.error('DELETE /api/admin/categories/[id] failed:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json({ message: err?.message ?? 'Internal Server Error', pb: err?.response ?? null }, { status: 500 });
        }
    });
}
