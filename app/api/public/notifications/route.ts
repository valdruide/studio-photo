import { NextRequest, NextResponse } from 'next/server';
import PocketBase, { type RecordModel } from 'pocketbase';

type CentralNotification = RecordModel & {
    title: string;
    message?: string;
    created: string;
};

type CentralNotificationsResponse = {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: CentralNotification[];
};

type LocalNotificationRead = RecordModel & {
    notificationId: string;
};

type NotificationWithReadState = CentralNotification & {
    isRead: boolean;
};

export async function GET(req: NextRequest) {
    try {
        const localPb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

        const { searchParams } = new URL(req.url);

        const unreadOnly = searchParams.get('unread') === 'true';
        const page = Number(searchParams.get('page') ?? 1);
        const perPage = Number(searchParams.get('perPage') ?? 10);

        const centralRes = await fetch(`${process.env.NOTIFICATIONS_API_URL}?page=${page}&perPage=${perPage}`, {
            headers: {
                Authorization: `Bearer ${process.env.NOTIFICATIONS_CLIENT_KEY}`,
            },
            cache: 'no-store',
        });

        if (!centralRes.ok) {
            throw new Error(`Failed to fetch central notifications: ${centralRes.status}`);
        }

        const centralResult = (await centralRes.json()) as CentralNotificationsResponse;

        const readsResult = await localPb.collection('notification_reads').getFullList<LocalNotificationRead>({
            fields: 'id,notificationId',
        });

        const readIds = new Set(readsResult.map((read) => read.notificationId));

        let items: NotificationWithReadState[] = centralResult.items.map((notification) => ({
            ...notification,
            isRead: readIds.has(notification.id),
        }));

        if (unreadOnly) {
            items = items.filter((notification) => !notification.isRead);
        }

        items.sort((a, b) => {
            if (a.isRead === b.isRead) {
                return new Date(b.created).getTime() - new Date(a.created).getTime();
            }

            return a.isRead ? 1 : -1;
        });

        return NextResponse.json({
            ...centralResult,
            totalItems: unreadOnly ? items.length : centralResult.totalItems,
            totalPages: unreadOnly ? Math.max(1, Math.ceil(items.length / perPage)) : centralResult.totalPages,
            items,
        });
    } catch (error: any) {
        console.error('Failed to fetch notifications:', {
            message: error?.message,
            status: error?.status,
            response: error?.response,
            cause: error?.cause,
        });

        return NextResponse.json(
            {
                error: 'Failed to fetch notifications',
                details: error?.message ?? null,
            },
            { status: 500 },
        );
    }
}
