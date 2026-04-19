// app\(admin)\admin\notifications\page.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CircleCheckBig, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { PaginationEllipsisJump } from '@/components/pagination-ellipsis-jump';
import { getPaginationItems } from '@/lib/pagination/pagination';

type Notification = {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    created: string;
};

type NotificationsResponse = {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: Notification[];
};

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const res = await fetch(`/api/public/notifications?page=${page}&perPage=${perPage}`, {
                method: 'GET',
                cache: 'no-store',
            });

            if (!res.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data: NotificationsResponse = await res.json();

            setNotifications(data.items ?? []);
            setTotalPages(data.totalPages ?? 1);
            setTotalItems(data.totalItems ?? 0);
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les notifications.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page, perPage]);

    const goToPage = (value: number) => {
        const safePage = Math.max(1, Math.min(totalPages, value));
        setPage(safePage);
    };

    const unreadNotifications = useMemo(() => notifications.filter((n) => !n.isRead), [notifications]);
    const readNotifications = useMemo(() => notifications.filter((n) => n.isRead), [notifications]);
    const paginationItems = useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/public/notifications/read-all', {
                method: 'PATCH',
            });

            if (!res.ok) {
                throw new Error('Failed to mark all as read');
            }

            await fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const updateNotificationReadState = async (id: string, isRead: boolean) => {
        try {
            const res = await fetch(`/api/public/notifications/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRead }),
            });

            if (!res.ok) {
                throw new Error('Failed to update notification');
            }

            await fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id: string) => {
        await updateNotificationReadState(id, true);
    };

    const markAsUnread = async (id: string) => {
        await updateNotificationReadState(id, false);
    };

    if (isLoading) {
        return (
            <Card className="h-[90vh]">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Notifications received from various sources will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground pt-4">Loading notifications...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="h-[90vh]">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Notifications received from various sources will appear here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-destructive pt-4">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[90vh] pb-0 overflow-hidden">
            <CardHeader>
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Notifications received from various sources will appear here.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={markAllAsRead} disabled={unreadNotifications.length === 0}>
                        <CircleCheckBig className="size-4" />
                        Mark all as read
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="h-full overflow-hidden">
                <div className="overflow-auto h-full pt-4 pr-4">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No notifications yet.</p>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {unreadNotifications.map((notification) => (
                                    <NotificationsCard
                                        key={notification.id}
                                        notification={notification}
                                        markAsRead={markAsRead}
                                        markAsUnread={markAsUnread}
                                    />
                                ))}

                                {unreadNotifications.length === 0 && readNotifications.length > 0 && (
                                    <div className="flex items-center gap-5">
                                        <Separator className="my-4 flex-1 bg-muted" />
                                        <p className="text-sm text-muted-foreground">Old notifications</p>
                                        <Separator className="my-4 flex-1 bg-muted" />
                                    </div>
                                )}

                                {unreadNotifications.length > 0 && readNotifications.length > 0 && (
                                    <div className="flex items-center gap-5">
                                        <Separator className="my-4 flex-1 bg-muted" />
                                        <p className="text-sm text-muted-foreground">Already read</p>
                                        <Separator className="my-4 flex-1 bg-muted" />
                                    </div>
                                )}

                                {readNotifications.map((notification) => (
                                    <NotificationsCard
                                        key={notification.id}
                                        notification={notification}
                                        markAsRead={markAsRead}
                                        markAsUnread={markAsUnread}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter className="bg-secondary/40 flex justify-between py-4 border-t">
                <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({totalItems} notifications)
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => goToPage(page - 1)} disabled={page === 1 || isLoading}>
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>

                    {paginationItems.map((item, index) => {
                        if (item === 'left-ellipsis' || item === 'right-ellipsis') {
                            return <PaginationEllipsisJump key={`${item}-${index}`} totalPages={totalPages} onGoToPage={goToPage} />;
                        }

                        return (
                            <Button key={item} variant={item === page ? 'default' : 'outline'} onClick={() => goToPage(item)} disabled={isLoading}>
                                {item}
                            </Button>
                        );
                    })}

                    <Button variant="outline" onClick={() => goToPage(page + 1)} disabled={page === totalPages || isLoading}>
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

const NotificationsCard = ({
    notification,
    markAsRead,
    markAsUnread,
}: {
    notification: Notification;
    markAsRead: (id: string) => void;
    markAsUnread: (id: string) => void;
}) => {
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Card
                    className={cn(
                        `relative mt-2 gap-0 border py-4 ${!notification.isRead ? 'bg-primary/10' : 'bg-sidebar-accent'}`,
                        !notification.isRead ? 'cursor-pointer transition-colors hover:bg-primary/6' : '',
                    )}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                    {!notification.isRead && <div className="absolute -top-2 -right-2 size-4 rounded-full bg-destructive" />}

                    <CardHeader>
                        <div className="flex w-full items-center gap-2">
                            <CardTitle>{notification.title}</CardTitle>-
                            <CardDescription>Received at {new Date(notification.created).toLocaleString()}</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {notification.message ? <div dangerouslySetInnerHTML={{ __html: notification.message }} /> : 'No message available.'}
                    </CardContent>
                </Card>
            </ContextMenuTrigger>

            <ContextMenuContent>
                <ContextMenuGroup>
                    <ContextMenuItem disabled={notification.isRead} onSelect={() => markAsRead(notification.id)}>
                        <CircleCheckBig />
                        Mark as read
                    </ContextMenuItem>

                    <ContextMenuItem disabled={!notification.isRead} onSelect={() => markAsUnread(notification.id)}>
                        <EyeOff />
                        Mark as unread
                    </ContextMenuItem>
                </ContextMenuGroup>
            </ContextMenuContent>
        </ContextMenu>
    );
};
