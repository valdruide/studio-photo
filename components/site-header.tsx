'use client';
import { useEffect, useState, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, User, Settings2, HelpCircle, LogOut, LogIn, CircleCheckBig } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

function htmlToPlainText(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

export function SiteHeader() {
    const [siteTitle, setSiteTitle] = useState('Your name - Photography');
    const [isAdmin, setIsAdmin] = useState(false);
    const [dropdownIsOpen, setDropdownIsOpen] = useState(false);
    const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
    const [latestNotifications, setLatestNotifications] = useState<Notification[]>([]);
    const [notificationsPopoverOpen, setNotificationsPopoverOpen] = useState(false);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const check = useCallback(() => {
        fetch('/api/admin/me', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => setIsAdmin(Boolean(d.isAdmin)))
            .catch(() => setIsAdmin(false));
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadSettings() {
            try {
                const res = await fetch('/api/public/settings', {
                    cache: 'no-store',
                });

                if (!res.ok) return;

                const data = await res.json();

                if (!cancelled) {
                    const item = data.item;

                    setSiteTitle(`${item?.title || 'Your name - Photography'}`);
                }
            } catch (error) {
                console.error('Failed to load site settings:', error);
            }
        }

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadUnreadNotificationsCount = useCallback(async () => {
        try {
            const res = await fetch('/api/public/notifications?unread=true&page=1&perPage=1', {
                cache: 'no-store',
            });

            if (!res.ok) {
                console.error('Failed to load unread notifications count:', res.status);
                return;
            }

            const data: NotificationsResponse = await res.json();
            setUnreadNotificationsCount(data.totalItems ?? 0);
        } catch (error) {
            console.error('Failed to load unread notifications count:', error);
        }
    }, []);

    const loadLatestNotifications = useCallback(async () => {
        try {
            setNotificationsLoading(true);

            const res = await fetch('/api/public/notifications?unread=true&page=1&perPage=3', {
                cache: 'no-store',
            });

            if (!res.ok) {
                console.error('Failed to load latest notifications:', res.status);
                return;
            }

            const data: NotificationsResponse = await res.json();
            setLatestNotifications(data.items ?? []);
        } catch (error) {
            console.error('Failed to load latest notifications:', error);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        check();
    }, [check, pathname]); // ✅ re-check à chaque navigation

    useEffect(() => {
        loadUnreadNotificationsCount();
    }, [pathname, loadUnreadNotificationsCount]);

    async function handleNotificationsOpenChange(open: boolean) {
        setNotificationsPopoverOpen(open);

        if (open) {
            await Promise.all([loadUnreadNotificationsCount(), loadLatestNotifications()]);
        }
    }

    async function handleLogout() {
        try {
            const res = await fetch('/api/admin/logout', {
                method: 'POST',
            });

            if (!res.ok) {
                toast.error('Logout failed');
                return;
            }

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    }

    function handleCloseAuto() {
        setDropdownIsOpen(false);
    }

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/public/notifications/read-all', {
                method: 'PATCH',
            });

            if (!res.ok) {
                throw new Error('Failed to mark all as read');
            }

            await Promise.all([loadUnreadNotificationsCount(), loadLatestNotifications()]);
        } catch (err) {
            console.error(err);
            toast.error('Failed to mark all as read');
        }
    };

    return (
        <header className="z-10 justify-between flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <h1 className="text-base font-medium">{siteTitle}</h1>
            </div>
            <div className="px-4 flex">
                <Popover open={notificationsPopoverOpen} onOpenChange={handleNotificationsOpenChange}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="size-5" />
                            {unreadNotificationsCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute top-0 left-1 flex h-5 min-w-5 items-center justify-center px-1 text-destructive-foreground"
                                >
                                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="end" className="w-96 p-0 overflow-hidden bg-sidebar">
                        <div className="border-b p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-0">
                                    <PopoverTitle className="text-sm">Notifications</PopoverTitle>
                                    <PopoverDescription className="text-sm">
                                        {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread` : 'No unread notifications'}
                                    </PopoverDescription>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    disabled={unreadNotificationsCount === 0 || notificationsLoading}
                                >
                                    <CircleCheckBig className="size-4" />
                                    Mark all as read
                                </Button>
                            </div>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto">
                            {notificationsLoading ? (
                                <div className="space-y-2">
                                    <div className="h-12 rounded-md animate-pulse" />
                                    <div className="h-12 rounded-md animate-pulse" />
                                    <div className="h-12 rounded-md animate-pulse" />
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {latestNotifications.map((notification) => (
                                        <div key={notification.id}>
                                            <div className="py-2 px-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium leading-none line-clamp-1">{notification.title}</p>-
                                                            <p className="text-xs text-muted-foreground shrink-0">
                                                                {new Date(notification.created).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {notification.message ? htmlToPlainText(notification.message) : 'No message available.'}
                                                        </p>
                                                    </div>

                                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-destructive" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="border-t px-4 py-2">
                            <Button
                                variant="default"
                                className="w-full justify-center"
                                onClick={() => {
                                    setNotificationsPopoverOpen(false);
                                    router.push('/admin/notifications');
                                }}
                            >
                                Voir tout
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <DropdownMenu open={dropdownIsOpen} onOpenChange={setDropdownIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <User className="size-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 " align="start" onClick={handleCloseAuto}>
                        {isAdmin ? (
                            <>
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs text-muted-foreground">My Account</DropdownMenuLabel>
                                    <Link href="/admin/settings">
                                        <DropdownMenuItem>
                                            <Settings2 />
                                            Settings
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <Link href="/admin/help">
                                        <DropdownMenuItem>
                                            <HelpCircle />
                                            Support
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                                        <LogOut className="text-destructive" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </>
                        ) : (
                            <>
                                <DropdownMenuGroup>
                                    <Link href="/login">
                                        <DropdownMenuItem>
                                            <LogIn />
                                            Login
                                        </DropdownMenuItem>
                                    </Link>
                                </DropdownMenuGroup>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
