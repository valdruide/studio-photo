import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function GET(req: NextRequest) {
    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
        const { searchParams } = new URL(req.url);

        const unreadOnly = searchParams.get('unread') === 'true';
        const page = Number(searchParams.get('page') ?? 1);
        const perPage = Number(searchParams.get('perPage') ?? 10);

        const result = await pb.collection('notifications').getList(page, perPage, {
            sort: 'isRead,-created',
            ...(unreadOnly ? { filter: 'isRead = false' } : {}),
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
