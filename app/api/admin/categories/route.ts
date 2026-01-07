import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export const runtime = 'nodejs';

export async function GET(req: Request) {
    return withAdmin(async (pb) => {
        const url = new URL(req.url);
        const onlyVisible = url.searchParams.get('onlyVisible') === '1';

        const items = await pb.collection('categories').getFullList({
            sort: 'order',
            ...(onlyVisible ? { filter: 'isHidden = false' } : {}),
        });

        return NextResponse.json({ items });
    });
}

function slugify(input: string) {
    return input
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function randomSuffix(len = 5) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

function toBool01(v: FormDataEntryValue | null) {
    const s = String(v ?? '').trim();
    return s === '1' || s.toLowerCase() === 'true' || s.toLowerCase() === 'on';
}

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        try {
            const form = await req.formData();

            const title = String(form.get('title') ?? '').trim();
            if (!title) return new NextResponse('Missing title', { status: 400 });

            // requis dans PB, donc on force une valeur même si le front n’envoie rien
            const color = String(form.get('color') ?? '#FFFFFF').trim() || '#FFFFFF';
            const icon = String(form.get('icon') ?? 'IconFolderFilled').trim() || 'IconFolderFilled';

            // slug unique requis
            const slugFromClient = String(form.get('slug') ?? '').trim();
            let slug = slugFromClient ? slugify(slugFromClient) : slugify(title);
            if (!slug) slug = randomSuffix();

            const orderRaw = String(form.get('order') ?? '').trim();
            const orderFromClient = orderRaw !== '' ? Number(orderRaw) : null;
            if (orderFromClient !== null && !Number.isFinite(orderFromClient)) {
                return new NextResponse('Invalid order', { status: 400 });
            }

            // order auto last+1 si pas fourni
            let orderToUse = orderFromClient;
            if (orderToUse === null) {
                const last = await pb.collection('categories').getList(1, 1, { sort: '-order' });
                orderToUse = (last.items?.[0]?.order ?? 0) + 1;
            }

            const isHidden = toBool01(form.get('isHidden'));
            const allowAll = toBool01(form.get('allowAll'));

            const baseData: any = {
                title,
                color,
                icon,
                order: orderToUse,
                isHidden,
                allowAll,
            };

            // create avec slug, retry si collision (slug unique)
            async function createOnce(slugValue: string) {
                return pb.collection('categories').create({ ...baseData, slug: slugValue });
            }

            try {
                const created = await createOnce(slug);
                return NextResponse.json({ items: [created] });
            } catch (err: any) {
                // collision slug (ou autre). On retente 1 fois avec suffix.
                const slug2 = `${slug}-${randomSuffix(5)}`;
                const created2 = await createOnce(slug2);
                return NextResponse.json({ items: [created2] });
            }
        } catch (err: any) {
            console.error('POST /api/admin/categories failed:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json({ message: err?.message ?? 'Internal Server Error', pb: err?.response ?? null }, { status: 500 });
        }
    });
}
