'use client';

import { useState } from 'react';
import { Kbd } from '@/components/ui/kbd';
import { ZoomLens } from '@/components/zoomLens';

type LightboxZoomImageProps = {
    srcOriginal: string;
    alt: string;
    width?: number;
    height?: number;
};

export function LightboxZoomImage({ srcOriginal, alt, width = 1, height = 1 }: LightboxZoomImageProps) {
    const [naturalSize, setNaturalSize] = useState<{ src: string; width: number; height: number } | null>(null);
    const naturalSizeForImage = naturalSize?.src === srcOriginal ? naturalSize : null;

    const resolvedWidth = width > 1 ? width : naturalSizeForImage?.width || 1;
    const resolvedHeight = height > 1 ? height : naturalSizeForImage?.height || 1;

    return (
        <>
            <ZoomLens src={srcOriginal} imgWidth={resolvedWidth} imgHeight={resolvedHeight} className="h-full w-full" zoom={1.5} lensSize={200}>
                <img
                    src={srcOriginal}
                    alt={alt}
                    className="h-full w-full object-contain select-none"
                    draggable={false}
                    onLoad={(event) => {
                        const image = event.currentTarget;
                        if (image.naturalWidth > 0 && image.naturalHeight > 0) {
                            setNaturalSize({ src: srcOriginal, width: image.naturalWidth, height: image.naturalHeight });
                        }
                    }}
                />
            </ZoomLens>
            <div className="hidden lg:block bg-background/70 backdrop-blur-[2px] p-2 rounded-md border absolute right-5 space-y-1 bottom-5 text-muted-foreground text-sm z-20">
                <p>
                    <Kbd>Scroll</Kbd> : Increase lens size
                </p>
                <p>
                    <Kbd>Shift + Scroll</Kbd> : Increase zoom
                </p>
            </div>
        </>
    );
}
