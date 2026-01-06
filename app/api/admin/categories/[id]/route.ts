import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

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
