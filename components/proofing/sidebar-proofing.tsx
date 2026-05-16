'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroupContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid } from 'lucide-react';
import { Separator } from '../ui/separator';

export default function SidebarProofing() {
    const pathname = usePathname();

    return (
        <>
            <Sidebar collapsible="none" className="max-h-[90vh] rounded-xl p-4 bg-card w-full sticky top-16">
                <SidebarHeader>
                    <p className="text-xl font-bold text-primary">Client Proofing</p>
                </SidebarHeader>
                <Separator className="my-2" />
                <SidebarContent className="overflow-hidden">
                    <SidebarGroup>
                        <SidebarGroupContent className="space-y-1">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton tooltip="Galleries" asChild isActive={pathname.startsWith('/proofing/galleries')}>
                                        <Link href="/proofing/galleries">
                                            <LayoutGrid className="size-5" />
                                            <span>Galleries</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    );
}
