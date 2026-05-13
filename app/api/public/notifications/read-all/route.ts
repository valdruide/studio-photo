import { NextResponse } from 'next/server';
import PocketBase, { type RecordModel } from 'pocketbase';

type CentralNotification = RecordModel & {
    id: string;
};

type LocalNotificationRead = RecordModel & {
    notificationId: string;
};

type CentralNotificationsResponse = {
    items: CentralNotification[];
};

export async function PATCH() {
    try {
        const localPb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

        const centralRes = await fetch(`${process.env.NOTIFICATIONS_API_URL}?page=1&perPage=300`, {
            headers: {
                Authorization: `Bearer ${process.env.NOTIFICATIONS_CLIENT_KEY}`,
            },
            cache: 'no-store',
        });

        if (!centralRes.ok) {
            throw new Error(`Failed to fetch central notifications: ${centralRes.status}`);
        }

        const centralResult = (await centralRes.json()) as CentralNotificationsResponse;

        const reads = await localPb.collection('notification_reads').getFullList<LocalNotificationRead>({
            fields: 'id,notificationId',
        });

        const alreadyReadIds = new Set(reads.map((read) => read.notificationId));

        const unreadNotifications = centralResult.items.filter((notification) => !alreadyReadIds.has(notification.id));

        for (const notification of unreadNotifications) {
            await localPb.collection('notification_reads').create({
                notificationId: notification.id,
                readAt: new Date().toISOString(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to mark all notifications as read:', {
            message: error?.message,
            status: error?.status,
            response: error?.response,
            data: error?.data,
            cause: error?.cause,
        });

        return NextResponse.json(
            {
                error: 'Failed to mark all notifications as read',
                details: error?.message ?? null,
                response: error?.response ?? null,
            },
            { status: 500 },
        );
    }
}
