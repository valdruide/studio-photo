import { NextResponse } from 'next/server';
import { getPB, requireAdmin } from '@/lib/pb/server';
import { optimizeToJpeg } from '@/lib/images/optimize';

export async function POST(req: Request) {
    const pb = await getPB();
    if (!requireAdmin(pb)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const form = await req.formData();

    // Champs attendus
    const collectionId = String(form.get('collection') ?? '');
    const name = String(form.get('name') ?? '');
    const description = String(form.get('description') ?? '');
    const order = Number(form.get('order') ?? 0);
    const isHidden = String(form.get('isHidden') ?? 'false') === 'true';

    const file = form.get('file');
    if (!collectionId || !(file instanceof File)) {
        return NextResponse.json({ error: 'Missing collection or file' }, { status: 400 });
    }

    const { buffer, width, height } = await optimizeToJpeg(await file.arrayBuffer());
    const filename = `${(name || file.name).replace(/\.[^.]+$/, '')}.jpg`;

    const pbForm = new FormData();
    pbForm.append('collection', collectionId);
    pbForm.append('name', name || filename);
    pbForm.append('description', description);
    pbForm.append('order', String(order));
    pbForm.append('isHidden', String(isHidden));
    pbForm.append('width', String(width));
    pbForm.append('height', String(height));
    pbForm.append('image', new Blob([buffer], { type: 'image/jpeg' }), filename);

    const created = await pb.collection('photos').create(pbForm);

    return NextResponse.json({ ok: true, id: created.id, width, height });
}
