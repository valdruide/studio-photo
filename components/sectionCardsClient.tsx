'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContentWide, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import type { CategoryView, PhotoItem } from '@/lib/collections/types';
import { Button } from '@/components/ui/button';
import { ZoomLens } from './zoomLens';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

const MasonryGrid = dynamic(() => import('./masonryGrid'), { ssr: false });

export default function SectionCardsClient({ view, query }: { view: CategoryView; query: string }) {
    const [open, setOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [api, setApi] = useState<CarouselApi | null>(null);
    const [selectedSnap, setSelectedSnap] = useState(0);
    const [snapCount, setSnapCount] = useState(0);

    const activeIndex = useMemo(() => {
        if (!activeId) return 0;
        const i = view.items.findIndex((x) => x.id === activeId);
        return i >= 0 ? i : 0;
    }, [activeId, view.items]);

    const active = view.items[activeIndex];

    const onOpen = (item: PhotoItem) => {
        const i = view.items.findIndex((x) => x.id === item.id);
        setStartIndex(i >= 0 ? i : 0);
        setActiveId(item.id);
        setOpen(true);
    };

    useEffect(() => {
        if (!api) return;

        const onInit = () => {
            setSnapCount(api.scrollSnapList().length);
            setSelectedSnap(api.selectedScrollSnap());
        };

        const onSelect = () => {
            const i = api.selectedScrollSnap();
            setSelectedSnap(i);
            const item = view.items[i];
            if (item) setActiveId(item.id);
        };

        api.on('reInit', onInit);
        api.on('select', onSelect);

        onInit();

        return () => {
            api.off('reInit', onInit);
            api.off('select', onSelect);
        };
    }, [api, view.items]);

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5">
                <CardHeader>
                    <CardTitle className="text-3xl capitalize text-primary">{view.category}</CardTitle>
                    <CardDescription className="capitalize text-lg">{view.title}</CardDescription>
                </CardHeader>
                {view.description && (
                    <CardContent>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: view.description }} />
                    </CardContent>
                )}
            </Card>

            <MasonryGrid items={view.items} onOpen={onOpen} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContentWide>
                    {open && (
                        <>
                            {/* zone image = 80vh -> paysage aussi grand que portrait */}
                            <div className="relative w-full h-[80vh] bg-black/60 rounded-t-lg overflow-hidden">
                                <Carousel
                                    setApi={setApi}
                                    opts={{
                                        align: 'center',
                                        loop: true,
                                        startIndex,
                                        duration: 25,
                                    }}
                                    className="h-full"
                                >
                                    <CarouselContent className="h-full">
                                        {view.items.map((item) => (
                                            <CarouselItem key={item.id} className="basis-full h-full">
                                                <div className="relative h-[80vh] w-full">
                                                    <ZoomLens
                                                        src={active.srcOriginal ?? active.srcMedium}
                                                        imgWidth={active.width}
                                                        imgHeight={active.height}
                                                        className="h-full w-full"
                                                        zoom={2}
                                                        lensSize={200}
                                                    >
                                                        <Image
                                                            src={item.srcMedium}
                                                            alt={item.name}
                                                            fill
                                                            sizes="80vw"
                                                            unoptimized
                                                            className="object-contain"
                                                        />
                                                    </ZoomLens>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <div className="hidden lg:block bg-background/70 backdrop-blur-[2px] p-2 rounded-md absolute right-5 space-y-1 bottom-5 text-muted-foreground text-sm">
                                        <p>
                                            <Kbd>Scroll</Kbd> : Increase lens size
                                        </p>
                                        <p>
                                            <Kbd>Shift + Scroll</Kbd> : Increase zoom
                                        </p>
                                    </div>

                                    {/* boutons de nav */}
                                    <CarouselPrevious className="left-4" />
                                    <CarouselNext className="right-4" />
                                </Carousel>
                            </div>
                            <div className="mt-3 flex items-center justify-center gap-2">
                                {Array.from({ length: snapCount }).map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        aria-label={`Go to slide ${i + 1}`}
                                        onClick={() => api?.scrollTo(i)}
                                        className={[
                                            'size-3 rounded-full transition',
                                            i === selectedSnap
                                                ? 'bg-primary cursor-default ring-1 ring-primary ring-offset-2 ring-offset-background'
                                                : 'bg-secondary hover:bg-primary/70 cursor-pointer',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>

                            {/* texte basé sur la slide active */}
                            {active && (
                                <div className="flex justify-between p-6">
                                    <DialogHeader>
                                        <DialogTitle>{active.name}</DialogTitle>
                                        {active.description && (
                                            <DialogDescription
                                                className="prose prose-invert max-w-none"
                                                dangerouslySetInnerHTML={{ __html: active.description }}
                                            />
                                        )}
                                    </DialogHeader>
                                </div>
                            )}
                        </>
                    )}
                </DialogContentWide>
            </Dialog>
        </>
    );
}
