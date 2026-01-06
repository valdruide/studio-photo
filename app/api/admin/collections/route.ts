import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function GET(req: Request) {
    return withAdmin(async (pb) => {
        const url = new URL(req.url);
        const onlyVisible = url.searchParams.get('onlyVisible') === '1';
        const categoryId = url.searchParams.get('categoryId');

        const filters: string[] = [];

        // Filtre catégorie (pour /admin/categories/[id])
        if (categoryId) {
            filters.push(`category="${categoryId}"`);
        }

        // Filtre "public/visible only"
        if (onlyVisible) {
            filters.push('isHidden = false');
            filters.push('category.isHidden = false');
        }

        const filter = filters.length ? filters.join(' && ') : undefined;

        const items = await pb.collection('photo_collections').getFullList({
            sort: 'order',
            ...(filter ? { filter } : {}),
        });

        return NextResponse.json({ items });
    });
}
