'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import Image from 'next/image';
import { XMasonry, XBlock } from 'react-xmasonry';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { CategoryView, PhotoItem } from '@/lib/collections/types';

const MasonryGrid = dynamic(() => import('./masonryGrid'), { ssr: false });

export default function SectionCardsClient({ view, query }: { view: CategoryView; query: string }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<PhotoItem | null>(null);

    const onOpen = (item: PhotoItem) => {
        setActive(item);
        setOpen(true);
    };

    return (
        <>
            <Card className="w-max mb-5 min-w-1/2">
                <CardHeader>
                    <CardTitle className="text-3xl capitalize text-primary">{view.category}</CardTitle>
                    <CardDescription className="capitalize text-lg">{view.title}</CardDescription>
                </CardHeader>
                <CardContent>
                    {view.description && <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: view.description }} />}
                </CardContent>
            </Card>

            <MasonryGrid items={view.items} onOpen={onOpen} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    {active && (
                        <>
                            <div className="relative">
                                <Image
                                    src={active.srcMedium}
                                    alt={active.name}
                                    width={active.width}
                                    height={active.height}
                                    unoptimized
                                    className="rounded-t-md object-cover"
                                    priority={false}
                                />
                            </div>

                            <DialogHeader className="p-6">
                                <DialogTitle>{active.name}</DialogTitle>
                                {active.description && (
                                    <DialogDescription
                                        className="prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: active.description }}
                                    />
                                )}
                            </DialogHeader>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
