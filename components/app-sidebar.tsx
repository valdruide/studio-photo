'use client';

import Link from 'next/link';
import * as React from 'react';
import { IconUserFilled, IconFlameFilled, IconHelp, IconSearch, IconFlower, IconHomeFilled, IconHeartFilled } from '@tabler/icons-react';

import { NavSeries } from '@/components/nav-series';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

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
            color: 'text-[#066FD1]',
            icon: IconUserFilled,
            isActive: true,
            items: [
                {
                    title: 'All',
                    url: '/portraits?query=all',
                },
                { title: '[ sickly ]', url: '/portraits?query=sickly' },
                {
                    title: '[ fallen angels ]',
                    url: '/portraits?query=fallen-angels',
                },
            ],
        },
        {
            name: 'Nude Art',
            color: 'text-[#FF8C1F]',
            icon: IconFlameFilled,
            isActive: false,
            items: [
                { title: 'All', url: '/nude-art?query=all' },
                { title: 'Mango', url: '/nude-art?query=mango' },
            ],
        },
    ],
    navSecondary: [
        {
            title: 'Get Help',
            url: '#',
            icon: IconHelp,
        },
        {
            title: 'Search',
            url: '#',
            icon: IconSearch,
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
            </SidebarContent>
            <SidebarFooter>INSTAGRAM HERE</SidebarFooter>
        </Sidebar>
    );
}
