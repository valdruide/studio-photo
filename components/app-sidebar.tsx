'use client';

import Link from 'next/link';
import * as React from 'react';
import PocketBase from 'pocketbase';
import {
    IconUserFilled,
    IconFlameFilled,
    IconFolderFilled,
    IconBrandInstagram,
    IconFlower,
    IconHomeFilled,
    IconHeartFilled,
    IconBrandTiktok,
} from '@tabler/icons-react';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import AdminLink from '@/components/admin-link';
import { NavSeries } from '@/components/nav-series';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

type Category = {
    id: string;
    title: string;
    slug: string;
    isHidden?: boolean;
    icon?: string | null;
    color?: string | null;
    allowAll?: boolean;
};
type PhotoCollection = { id: string; title: string; slug: string; category: string; isHidden?: boolean };

const data = {
    navMain: [
        { title: 'Home', url: '/', icon: IconHomeFilled },
        { title: 'About', url: '/about', icon: IconHeartFilled },
    ],
    navSecondary: [
        { title: 'Instagram', url: 'https://www.instagram.com/triste__fleur/', icon: IconBrandInstagram },
        { title: 'TikTok', url: 'https://www.tiktok.com/@triste_fleur', icon: IconBrandTiktok },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [series, setSeries] = React.useState<
        {
            name: string;
            icon: any;
            color?: string;
            isActive?: boolean;
            items?: { title: string; url: string }[];
        }[]
    >([]);

    React.useEffect(() => {
        let cancelled = false;

        async function load() {
            const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL!);

            const [categories, collections] = await Promise.all([
                pb.collection('categories').getFullList<Category>({
                    sort: 'order',
                    filter: 'isHidden = false',
                }),
                pb.collection('photo_collections').getFullList<PhotoCollection>({
                    sort: 'order',
                    filter: 'isHidden = false && category.isHidden = false',
                }),
            ]);

            // Map collections by category
            const byCat = new Map<string, PhotoCollection[]>();
            for (const col of collections) {
                if (!byCat.has(col.category)) byCat.set(col.category, []);
                byCat.get(col.category)!.push(col);
            }

            const built = categories.map((cat) => {
                const allowAll = cat.allowAll ?? true;
                return {
                    name: cat.title,
                    icon: cat.icon && ICONS_MAP[cat.icon] ? ICONS_MAP[cat.icon] : IconFolderFilled,
                    color: cat.color ?? undefined,
                    isActive: false,
                    items: [
                        ...(allowAll ? [{ title: 'All', url: `/${cat.slug}` }] : []),
                        ...(byCat.get(cat.id) ?? []).map((col) => ({
                            title: col.title,
                            url: `/${cat.slug}/${col.slug}`,
                        })),
                    ],
                };
            });

            if (!cancelled) setSeries(built);
        }

        load().catch(() => {
            if (!cancelled) setSeries([]);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/">
                                <IconFlower className="!size-5" />
                                <span className="text-base font-semibold">Triste Fleur</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSeries items={series} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
                <AdminLink />
            </SidebarContent>
        </Sidebar>
    );
}
