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

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // enlève accents
        .replace(/[^a-z0-9]+/g, '-') // non-alphanum -> -
        .replace(/^-+|-+$/g, '') // trim -
        .replace(/-{2,}/g, '-'); // multi - -> single
}

function randomSuffix(len = 5) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        try {
            const form = await req.formData();

            const categoryId = String(form.get('categoryId') ?? '').trim();
            if (!categoryId) return new NextResponse('Missing categoryId', { status: 400 });

            const title = String(form.get('title') ?? '').trim();
            if (!title) return new NextResponse('Missing title', { status: 400 });

            let slug = slugify(title);
            if (!slug) slug = randomSuffix();

            const description = String(form.get('description') ?? '');

            const orderRaw = String(form.get('order') ?? '').trim();
            const orderFromClient = orderRaw !== '' ? Number(orderRaw) : null;
            if (orderFromClient !== null && !Number.isFinite(orderFromClient)) {
                return new NextResponse('Invalid order', { status: 400 });
            }

            // last order + 1 (par catégorie)
            const last = await pb.collection('photo_collections').getList(1, 1, {
                sort: '-order',
                filter: `category="${categoryId}"`,
            });

            let nextOrder = (last.items?.[0]?.order ?? 0) + 1;
            const orderToUse = orderFromClient !== null ? orderFromClient : nextOrder;

            // Create
            const data: any = {
                title,
                slug,
                description,
                order: orderToUse,
                isHidden: false,
            };

            // Relation "category" peut être single ou multiple selon config PB
            // On tente single puis fallback multiple
            async function createOnce(slugValue: string) {
                // essaie relation single puis multiple
                try {
                    return await pb.collection('photo_collections').create({ ...data, slug: slugValue, category: categoryId });
                } catch {
                    return await pb.collection('photo_collections').create({ ...data, slug: slugValue, category: [categoryId] });
                }
            }

            try {
                const created = await createOnce(slug);
                return NextResponse.json({ items: [created] });
            } catch (err1: any) {
                // si slug déjà pris, on retente avec suffix
                const slug2 = `${slug}-${randomSuffix(5)}`;
                const created2 = await createOnce(slug2);
                return NextResponse.json({ items: [created2] });
            }
        } catch (err: any) {
            console.error('POST /api/admin/collections failed:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json({ message: err?.message ?? 'Internal Server Error', pb: err?.response ?? null }, { status: 500 });
        }
    });
}
