import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET() {
    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

        const result = await pb.collection('site_settings').getList(1, 1);

        return NextResponse.json({
            item: result.items[0] ?? null,
        });
    } catch (err: any) {
        console.error('GET /api/public/settings failed:', err);
        return NextResponse.json(
            {
                message: err?.message ?? 'Internal Server Error',
                pb: err?.response ?? null,
            },
            { status: 500 },
        );
    }
}
