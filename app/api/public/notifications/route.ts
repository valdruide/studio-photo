import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { getNotificationsPage } from '@/lib/notifications/notifications';

export async function GET(req: NextRequest) {
    return withAdmin(async () => {
        try {
            const { searchParams } = new URL(req.url);

            const unreadOnly = searchParams.get('unread') === 'true';
            const page = Number(searchParams.get('page') ?? 1);
            const perPage = Number(searchParams.get('perPage') ?? 10);

            return NextResponse.json(await getNotificationsPage({ page, perPage, unreadOnly }));
        } catch (error: unknown) {
            const details = error instanceof Error ? error.message : null;

            console.error('Failed to fetch notifications:', {
                message: details,
            });

            return NextResponse.json(
                {
                    error: 'Failed to fetch notifications',
                    details,
                },
                { status: 500 },
            );
        }
    }, req);
}
