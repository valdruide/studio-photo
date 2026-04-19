'use client';

import Link from 'next/link';
import * as React from 'react';
import PocketBase from 'pocketbase';
import {
    IconBrandInstagram,
    IconFlower,
    IconHomeFilled,
    IconHeartFilled,
    IconBrandTiktok,
    IconBrandFacebook,
    IconBrandX,
    IconBrandYoutube,
    IconBrandPinterest,
    IconBrandDribbble,
    IconBrandBehance,
    IconBrandReddit,
    IconFolderFilled,
} from '@tabler/icons-react';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
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
    const [siteName, setSiteName] = React.useState('My site');
    const [portfolioName, setPortfolioName] = React.useState('Series');
    const [navSecondaryItems, setNavSecondaryItems] = React.useState<
        {
            title: string;
            url: string;
            icon: any;
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

    React.useEffect(() => {
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

                    setSiteName(item?.site_name || 'My site');
                    setPortfolioName(item?.portfolio_name || 'Series');

                    const socials = [
                        item?.instagram ? { title: 'Instagram', url: item.instagram, icon: IconBrandInstagram } : null,
                        item?.tiktok ? { title: 'TikTok', url: item.tiktok, icon: IconBrandTiktok } : null,
                        item?.facebook ? { title: 'Facebook', url: item.facebook, icon: IconBrandFacebook } : null,
                        item?.x ? { title: 'X', url: item.x, icon: IconBrandX } : null,
                        item?.youtube ? { title: 'YouTube', url: item.youtube, icon: IconBrandYoutube } : null,
                        item?.pinterest ? { title: 'Pinterest', url: item.pinterest, icon: IconBrandPinterest } : null,
                        item?.dribbble ? { title: 'Dribbble', url: item.dribbble, icon: IconBrandDribbble } : null,
                        item?.behance ? { title: 'Behance', url: item.behance, icon: IconBrandBehance } : null,
                        item?.reddit ? { title: 'Reddit', url: item.reddit, icon: IconBrandReddit } : null,
                    ].filter(Boolean) as {
                        title: string;
                        url: string;
                        icon: any;
                    }[];

                    setNavSecondaryItems(socials);
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

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <Link href="/">
                                <IconFlower className="!size-5" />
                                <span className="text-base font-semibold">{siteName}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSeries items={series} label={portfolioName} />
                <NavSecondary items={navSecondaryItems} className="mt-auto" />
            </SidebarContent>
        </Sidebar>
    );
}
