'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CategoryRow } from '@/components/admin/categorieTable';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';

type Category = CategoryRow;

export default function SidebarAdmin() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);

        try {
            const [catsRes] = await Promise.all([fetch('/api/admin/categories', { cache: 'no-store' })]);

            if (catsRes.ok) {
                const cats = await catsRes.json();
                setCategories(cats.items ?? []);
            } else {
                console.error('Failed to load categories:', catsRes.status);
            }
        } catch (error) {
            console.error('Admin load failed:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <Sidebar collapsible="none" className="h-[90vh] rounded-xl p-4">
            <SidebarHeader className="bg-accent rounded-md">
                <p className="font-semibold text-center text-card-foreground">Admin Panel</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent className="flex flex-col gap-2">
                        <SidebarMenu>
                            {categories.map((category) => (
                                <SidebarMenuItem key={category.id}>
                                    <SidebarMenuButton tooltip={category.title} asChild>
                                        <Link href={`/admin/categories/${category.id}`}>
                                            <span>{category.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Settings" asChild>
                                    <Link href={`/admin/settings`}>
                                        <span>Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
