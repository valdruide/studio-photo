import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { markAllNotificationsAsRead } from '@/lib/notifications/notifications';

export async function PATCH(req: Request) {
    return withAdmin(async () => {
        try {
            return NextResponse.json(await markAllNotificationsAsRead());
        } catch (error: unknown) {
            const details = error instanceof Error ? error.message : null;

            console.error('Failed to mark all notifications as read:', {
                message: details,
            });

            return NextResponse.json(
                {
                    error: 'Failed to mark all notifications as read',
                    details,
                },
                { status: 500 },
            );
        }
    }, req);
}
