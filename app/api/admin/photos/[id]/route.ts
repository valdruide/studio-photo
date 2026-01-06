import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const photo = await pb.collection('photos').getOne(id);
        return NextResponse.json(photo);
    });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        const body = await req.json().catch(() => ({}));

        const data: any = {
            name: body?.name,
            description: body?.description,
            isHidden: Boolean(body?.isHidden),
            collection: body?.collection, // optionnel
        };

        if (body?.order !== undefined && body?.order !== null && body?.order !== '') {
            const n = Number(body.order);
            if (!Number.isFinite(n)) return new NextResponse('Invalid order', { status: 400 });
            data.order = n;
        }

        Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

        const updated = await pb.collection('photos').update(id, data);
        return NextResponse.json(updated);
    });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    return withAdmin(async (pb) => {
        const { id } = await ctx.params;
        await pb.collection('photos').delete(id);
        return NextResponse.json({ ok: true });
    });
}
