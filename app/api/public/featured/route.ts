import { NextResponse } from 'next/server';
import { getFeaturedView } from '@/lib/collections/getFeaturedPhotos';

export async function GET() {
    try {
        const view = await getFeaturedView();

        return NextResponse.json({
            hasFeaturedPhotos: view.items.length > 0,
            featuredName: view.title || 'Featured',
        });
    } catch (err: unknown) {
        const error = err as { message?: string };
        console.error('GET /api/public/featured failed:', err);
        return NextResponse.json({ message: error.message ?? 'Internal Server Error' }, { status: 500 });
    }
}
