import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function PATCH() {
    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
        let page = 1;
        const perPage = 100;

        while (true) {
            const result = await pb.collection('notifications').getList(page, perPage, {
                filter: 'isRead = false',
            });

            if (result.items.length === 0) break;

            await Promise.all(
                result.items.map((notification) =>
                    pb.collection('notifications').update(notification.id, {
                        isRead: true,
                    }),
                ),
            );

            if (result.items.length < perPage) break;
            page++;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        return NextResponse.json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
    }
}
