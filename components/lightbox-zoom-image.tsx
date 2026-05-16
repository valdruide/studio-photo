'use client';

import { Kbd } from '@/components/ui/kbd';
import { ZoomLens } from '@/components/zoomLens';

type LightboxZoomImageProps = {
    srcOriginal: string;
    alt: string;
    width?: number;
    height?: number;
};

export function LightboxZoomImage({ srcOriginal, alt, width = 1, height = 1 }: LightboxZoomImageProps) {
    return (
        <>
            <ZoomLens src={srcOriginal} imgWidth={width || 1} imgHeight={height || 1} className="h-full w-full" zoom={1.5} lensSize={200}>
                <img src={srcOriginal} alt={alt} className="h-full w-full object-contain select-none" draggable={false} />
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
