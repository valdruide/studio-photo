'use client';

import Link from 'next/link';
import * as React from 'react';
import {
    IconUserFilled,
    IconFlameFilled,
    IconBrandInstagram,
    IconFlower,
    IconHomeFilled,
    IconHeartFilled,
    IconBrandTiktok,
} from '@tabler/icons-react';
import AdminLink from '@/components/admin-link';
import { NavSeries } from '@/components/nav-series';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

const data = {
    navMain: [
        {
            title: 'Home',
            url: '/',
            icon: IconHomeFilled,
        },
        {
            title: 'About',
            url: '/about',
            icon: IconHeartFilled,
        },
    ],
    series: [
        {
            name: 'Portraits',
            icon: IconUserFilled,
            isActive: true,
            items: [
                {
                    title: 'All',
                    url: '/portraits',
                },
                { title: '[ sickly ]', url: '/portraits/sickly' },
                {
                    title: '[ fallen angels ]',
                    url: '/portraits/fallen-angels',
                },
            ],
        },
        {
            name: 'Nude Art',
            color: 'text-[#FF8C1F]',
            icon: IconFlameFilled,
            isActive: false,
            items: [
                { title: 'Mango', url: '/nude-art/mango' },
                { title: 'Neon', url: '/nude-art/neon' },
                { title: 'F-Girl', url: '/nude-art/f-girl' },
                { title: 'Clair-Obscur', url: '/nude-art/clair-obscur' },
                { title: 'Grunge', url: '/nude-art/grunge' },
                { title: 'Pantheon', url: '/nude-art/pantheon' },
                { title: 'hard-light', url: '/nude-art/hard-light' },
                { title: 'cloak', url: '/nude-art/cloak' },
                { title: 'Random', url: '/nude-art/random' },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Instagram',
            url: 'https://www.instagram.com/triste__fleur/',
            icon: IconBrandInstagram,
        },
        {
            title: 'TikTok',
            url: 'https://www.tiktok.com/@triste_fleur',
            icon: IconBrandTiktok,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <NavSeries items={data.series} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
                <AdminLink />
            </SidebarContent>
        </Sidebar>
    );
}
