import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function GET() {
    return withAdmin(async (pb) => {
        const page = 1;
        const perPage = 50;

        const res = await pb.collection('photos').getList(page, perPage);

        return NextResponse.json({
            items: res.items,
            page: res.page,
            perPage: res.perPage,
            totalItems: res.totalItems,
            totalPages: res.totalPages,
        });
    });
}

export async function POST(req: Request) {
    return withAdmin(async (pb) => {
        const form = await req.formData();

        // Exemple: "file" pour l'image
        const file = form.get('file');
        if (!(file instanceof File)) {
            return new NextResponse('Missing file', { status: 400 });
        }

        // Ajoute tes champs PocketBase ici (categoryId, collectionId, order, etc.)
        // const category = form.get('category')?.toString()

        const created = await pb.collection('photos').create(form);
        return NextResponse.json(created, { status: 201 });
    });
}
