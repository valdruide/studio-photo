import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const items = Array.isArray(body?.items) ? body.items : [];

        for (const item of items) {
            if (!item?.id) continue;

            await withAdmin(async (pbAdmin) => {
                await pbAdmin.collection('categories').update(item.id, {
                    order: Number(item.order) || 0,
                });
            });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('PATCH /api/admin/categories/reorder failed', error);
        return new NextResponse('Failed to reorder categories', { status: 500 });
    }
}
