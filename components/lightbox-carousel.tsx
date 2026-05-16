'use client';

import type { ReactNode } from 'react';
import { Dialog, DialogContentWide, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LightboxZoomImage } from '@/components/lightbox-zoom-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type LightboxCarouselItem = {
    id: string;
    name: string;
    srcOriginal: string;
    width?: number;
    height?: number;
    description?: string;
};

type LightboxCarouselProps<TItem extends LightboxCarouselItem> = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: TItem[];
    activeId: string | null;
    onActiveIdChange: (id: string) => void;
    renderDetails?: (item: TItem) => ReactNode;
};

export function LightboxCarousel<TItem extends LightboxCarouselItem>({
    open,
    onOpenChange,
    items,
    activeId,
    onActiveIdChange,
    renderDetails,
}: LightboxCarouselProps<TItem>) {
    const activeIndex = activeId ? items.findIndex((item) => item.id === activeId) : 0;
    const normalizedActiveIndex = activeIndex >= 0 ? activeIndex : 0;
    const active = items[normalizedActiveIndex];

    function goTo(index: number) {
        const item = items[index];
        if (item) onActiveIdChange(item.id);
    }

    function goPrev() {
        const prevIndex = normalizedActiveIndex === 0 ? items.length - 1 : normalizedActiveIndex - 1;
        goTo(prevIndex);
    }

    function goNext() {
        const nextIndex = normalizedActiveIndex === items.length - 1 ? 0 : normalizedActiveIndex + 1;
        goTo(nextIndex);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContentWide>
                {open && active ? (
                    <>
                        <div className="relative h-screen bg-black/60 rounded-lg overflow-hidden">
                            <div className="relative h-full w-full">
                                <LightboxZoomImage srcOriginal={active.srcOriginal} alt={active.name} width={active.width} height={active.height} />
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full"
                                onClick={goPrev}
                            >
                                <ChevronLeft />
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full"
                                onClick={goNext}
                            >
                                <ChevronRight />
                            </Button>
                        </div>

                        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center justify-center gap-2 z-20">
                            {items.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-label={`Go to slide ${index + 1}`}
                                    onClick={() => goTo(index)}
                                    className={[
                                        'size-3 rounded-full transition',
                                        index === normalizedActiveIndex
                                            ? 'bg-primary cursor-default ring-1 ring-primary ring-offset-2 ring-offset-background'
                                            : 'bg-secondary hover:bg-primary/70 cursor-pointer border',
                                    ].join(' ')}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-5 left-5 flex justify-between z-20 bg-background/80 backdrop-blur-sm rounded-lg p-4">
                            <DialogHeader className="max-w-[400px]">
                                <DialogTitle className="text-sm truncate">{active.name}</DialogTitle>
                                {active.description ? (
                                    <DialogDescription
                                        className="prose prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: active.description }}
                                    />
                                ) : null}
                                {renderDetails?.(active)}
                            </DialogHeader>
                        </div>
                    </>
                ) : null}
            </DialogContentWide>
        </Dialog>
    );
}
