import 'server-only';

import type { RecordModel } from 'pocketbase';
import { getPBAdmin } from '@/lib/pb/adminServer';

const LOCAL_NOTIFICATIONS_COLLECTION = 'local_notifications';
const NOTIFICATION_READS_COLLECTION = 'notification_reads';
const GLOBAL_NOTIFICATION_PREFIX = 'global:';
const LOCAL_NOTIFICATION_PREFIX = 'local:';
const GLOBAL_FETCH_LIMIT = 300;

type CentralNotification = RecordModel & {
    title: string;
    message?: string;
    targetUrl?: string;
    created: string;
};

type CentralNotificationsResponse = {
    items: CentralNotification[];
};

type LocalNotification = RecordModel & {
    title: string;
    message?: string;
    type?: string;
    targetUrl?: string;
    metadata?: unknown;
    created: string;
};

type LocalNotificationRead = RecordModel & {
    notificationId: string;
};

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    targetUrl?: string;
    created: string;
    isRead: boolean;
};

export type CreateLocalNotificationInput = {
    title: string;
    message?: string;
    type?: string;
    targetUrl?: string;
    metadata?: unknown;
};

function escapeFilterValue(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function withGlobalPrefix(id: string) {
    return `${GLOBAL_NOTIFICATION_PREFIX}${id}`;
}

function withLocalPrefix(id: string) {
    return `${LOCAL_NOTIFICATION_PREFIX}${id}`;
}

async function getGlobalNotifications(): Promise<NotificationItem[]> {
    const apiUrl = process.env.NOTIFICATIONS_API_URL;
    const clientKey = process.env.NOTIFICATIONS_CLIENT_KEY;

    if (!apiUrl || !clientKey) return [];

    const response = await fetch(`${apiUrl}?page=1&perPage=${GLOBAL_FETCH_LIMIT}`, {
        headers: {
            Authorization: `Bearer ${clientKey}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch central notifications: ${response.status}`);
    }

    const result = (await response.json()) as CentralNotificationsResponse;

    return (result.items ?? []).map((notification) => ({
        id: withGlobalPrefix(notification.id),
        title: notification.title,
        message: notification.message ?? '',
        targetUrl: notification.targetUrl,
        created: notification.created,
        isRead: false,
    }));
}

async function getLocalNotifications(pb: Awaited<ReturnType<typeof getPBAdmin>>): Promise<NotificationItem[]> {
    const records = await pb.collection(LOCAL_NOTIFICATIONS_COLLECTION).getFullList<LocalNotification>({
        sort: '-created',
    });

    return records.map((notification) => ({
        id: withLocalPrefix(notification.id),
        title: notification.title,
        message: notification.message ?? '',
        targetUrl: notification.targetUrl,
        created: notification.created,
        isRead: false,
    }));
}

async function getReadNotificationIds(pb: Awaited<ReturnType<typeof getPBAdmin>>) {
    const reads = await pb.collection(NOTIFICATION_READS_COLLECTION).getFullList<LocalNotificationRead>({
        fields: 'id,notificationId',
    });

    const ids = new Set<string>();

    for (const read of reads) {
        ids.add(read.notificationId);

        if (!read.notificationId.startsWith(GLOBAL_NOTIFICATION_PREFIX) && !read.notificationId.startsWith(LOCAL_NOTIFICATION_PREFIX)) {
            ids.add(withGlobalPrefix(read.notificationId));
        }
    }

    return ids;
}

export async function getAllNotificationsWithReadState() {
    const pb = await getPBAdmin();
    const [globalNotifications, localNotifications, readIds] = await Promise.all([
        getGlobalNotifications(),
        getLocalNotifications(pb),
        getReadNotificationIds(pb),
    ]);

    return [...globalNotifications, ...localNotifications]
        .map((notification) => ({
            ...notification,
            isRead: readIds.has(notification.id),
        }))
        .sort((a, b) => {
            if (a.isRead === b.isRead) {
                return new Date(b.created).getTime() - new Date(a.created).getTime();
            }

            return a.isRead ? 1 : -1;
        });
}

export async function getNotificationsPage({ page, perPage, unreadOnly }: { page: number; perPage: number; unreadOnly: boolean }) {
    const safePage = Math.max(1, page);
    const safePerPage = Math.max(1, perPage);
    const allNotifications = await getAllNotificationsWithReadState();
    const filtered = unreadOnly ? allNotifications.filter((notification) => !notification.isRead) : allNotifications;
    const start = (safePage - 1) * safePerPage;
    const items = filtered.slice(start, start + safePerPage);

    return {
        page: safePage,
        perPage: safePerPage,
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / safePerPage)),
        items,
    };
}

export async function setNotificationReadState(notificationId: string, isRead: boolean) {
    const pb = await getPBAdmin();
    const existingReads = await pb.collection(NOTIFICATION_READS_COLLECTION).getFullList<LocalNotificationRead>({
        filter: `notificationId = "${escapeFilterValue(notificationId)}"`,
    });

    const existingRead = existingReads[0];

    if (isRead && !existingRead) {
        return pb.collection(NOTIFICATION_READS_COLLECTION).create({
            notificationId,
            readAt: new Date().toISOString(),
        });
    }

    if (!isRead && existingRead) {
        await pb.collection(NOTIFICATION_READS_COLLECTION).delete(existingRead.id);
    }

    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const notifications = await getAllNotificationsWithReadState();
    const unreadNotifications = notifications.filter((notification) => !notification.isRead);

    for (const notification of unreadNotifications) {
        await setNotificationReadState(notification.id, true);
    }

    return { success: true };
}

export async function createLocalNotification(input: CreateLocalNotificationInput) {
    const pb = await getPBAdmin();

    return pb.collection(LOCAL_NOTIFICATIONS_COLLECTION).create({
        title: input.title,
        message: input.message ?? '',
        type: input.type ?? '',
        targetUrl: input.targetUrl ?? '',
        metadata: input.metadata ?? null,
    });
}
