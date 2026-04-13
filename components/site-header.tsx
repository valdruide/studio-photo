'use client';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
    const [siteTitle, setSiteTitle] = useState('Your name - Photography');

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

    return (
        <header className="z-10 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
                <h1 className="text-base font-medium">{siteTitle}</h1>
            </div>
        </header>
    );
}
