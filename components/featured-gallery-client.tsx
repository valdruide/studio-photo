'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LightboxCarousel } from '@/components/lightbox-carousel';
import type { CategoryView, PhotoItem } from '@/lib/collections/types';
import { registerPhotoView } from '@/lib/stats/registerPhotoView';

const MasonryGrid = dynamic(() => import('./masonryGrid'), { ssr: false });

export function FeaturedGalleryClient({ view }: { view: CategoryView }) {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const active = useMemo(() => view.items.find((item) => item.id === activeId) ?? null, [activeId, view.items]);

    useEffect(() => {
        if (!open || !active || !active.collectionId || !active.categoryId) return;

        registerPhotoView({
            photoId: active.id,
            collectionId: active.collectionId,
            categoryId: active.categoryId,
        });
    }, [open, active]);

    function onOpen(item: PhotoItem) {
        setActiveId(item.id);
        setOpen(true);
    }

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5 border">
                <CardHeader className="gap-0">
                    <CardTitle className="text-3xl capitalize text-primary">{view.title}</CardTitle>
                    <CardDescription className="text-lg">Selected work</CardDescription>
                </CardHeader>
                {!view.items.length && (
                    <CardContent>
                        <p className="text-muted-foreground">No featured photos yet.</p>
                    </CardContent>
                )}
            </Card>

            {view.items.length ? <MasonryGrid items={view.items} onOpen={onOpen} /> : null}

            <LightboxCarousel open={open} onOpenChange={setOpen} items={view.items} activeId={active?.id ?? activeId} onActiveIdChange={setActiveId} />
        </>
    );
}
