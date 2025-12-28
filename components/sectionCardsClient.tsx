'use client';

import Image from 'next/image';
import { XMasonry, XBlock } from 'react-xmasonry';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { CategoryView } from '@/lib/collections/types';

export default function SectionCardsClient({ view, query }: { view: CategoryView; query: string }) {
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

            <XMasonry>
                {view.items.map((item) => (
                    <XBlock key={item.id}>
                        <Dialog>
                            <DialogTrigger className="rounded-lg overflow-hidden m-2 border cursor-pointer">
                                <div className="relative w-[320px] aspect-[3/4]">
                                    <Image src={item.src} alt={item.name} fill className="object-cover" unoptimized sizes="320px" />
                                </div>
                            </DialogTrigger>

                            <DialogContent>
                                <div className="relative w-full aspect-[3/4]">
                                    <Image
                                        src={item.src}
                                        alt={item.name}
                                        fill
                                        className="rounded-t-md object-contain"
                                        unoptimized
                                        sizes="(max-width: 768px) 90vw, 800px"
                                    />
                                </div>

                                <DialogHeader className="p-6">
                                    <DialogTitle>{item.name}</DialogTitle>
                                    {item.description && <DialogDescription>{item.description}</DialogDescription>}
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </XBlock>
                ))}
            </XMasonry>
        </>
    );
}
