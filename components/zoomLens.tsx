'use client';

import * as React from 'react';

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

type ZoomLensProps = {
    src: string; // image utilisée pour le zoom (idéalement srcOriginal)
    imgWidth: number; // largeur native (ex: active.width)
    imgHeight: number; // hauteur native (ex: active.height)
    lensSize?: number; // px
    zoom?: number;
    radius?: number;
    disableOnTouch?: boolean;
    className?: string;
    children: React.ReactNode; //  <Image ... />

    // lens controls
    minLensSize?: number;
    maxLensSize?: number;
    lensStep?: number;

    // zoom controls
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
};

export function ZoomLens({
    src,
    imgWidth,
    imgHeight,
    lensSize = 160,
    zoom = 2.5,
    radius = 12,
    disableOnTouch = true,
    className,
    children,
    minLensSize = 90,
    maxLensSize = 320,
    lensStep = 12,
    minZoom = 1.2,
    maxZoom = 6,
    zoomStep = 0.25,
}: ZoomLensProps) {
    const ref = React.useRef<HTMLDivElement | null>(null);
    const raf = React.useRef<number | null>(null);

    const [enabled, setEnabled] = React.useState(false);
    const [container, setContainer] = React.useState({ w: 1, h: 1 });
    const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
    const [lens, setLens] = React.useState(lensSize);
    const [zoomLevel, setZoomLevel] = React.useState(zoom);

    React.useEffect(() => setLens(lensSize), [lensSize]);
    React.useEffect(() => setZoomLevel(zoom), [zoom]);

    const isTouch = typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
    const canUse = !(disableOnTouch && isTouch);

    const measure = React.useCallback(() => {
        const el = ref.current;
        if (!el) return;
        setContainer({ w: el.clientWidth || 1, h: el.clientHeight || 1 });
    }, []);

    React.useEffect(() => {
        if (!canUse) return;
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [canUse, measure]);

    const onWheel = (e: React.WheelEvent) => {
        if (!canUse) return;
        if (!enabled || !overImage) return;

        // Empêche la page de scroller pendant le zoom-lens
        e.preventDefault();

        // deltaY > 0 = scroll down -> on réduit ; deltaY < 0 -> on agrandit
        const dir = e.deltaY > 0 ? -1 : 1;
        if (e.shiftKey) {
            // Shift + molette => change zoom
            setZoomLevel((prev) => clamp(prev + dir * zoomStep, minZoom, maxZoom));
        } else {
            // molette normale => change lens size
            setLens((prev) => clamp(prev + dir * lensStep, minLensSize, maxLensSize));
        }
    };

    // --- compute "drawn rect" for object-contain ---
    const cw = container.w;
    const ch = container.h;
    const iw = Math.max(1, imgWidth || 1);
    const ih = Math.max(1, imgHeight || 1);

    const scale = Math.min(cw / iw, ch / ih);
    const drawnW = iw * scale;
    const drawnH = ih * scale;
    const offsetX = (cw - drawnW) / 2;
    const offsetY = (ch - drawnH) / 2;

    const onMove = (e: React.MouseEvent) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        if (raf.current) cancelAnimationFrame(raf.current);
        raf.current = requestAnimationFrame(() => setMouse({ x, y }));
    };

    // show lens only when cursor is over the actual image area (not margins)
    const overImage = mouse.x >= offsetX && mouse.x <= offsetX + drawnW && mouse.y >= offsetY && mouse.y <= offsetY + drawnH;

    const half = lens / 2;

    // clamp lens inside drawn rect
    const lensLeft = clamp(mouse.x - half, offsetX, offsetX + drawnW - lens);
    const lensTop = clamp(mouse.y - half, offsetY, offsetY + drawnH - lens);

    // coordinates INSIDE the drawn image rect
    const relX = clamp(mouse.x - offsetX, 0, drawnW);
    const relY = clamp(mouse.y - offsetY, 0, drawnH);

    // background size in px -> keeps aspect ratio (no stretching)
    const bgW = drawnW * zoomLevel;
    const bgH = drawnH * zoomLevel;

    // background position in px -> center the zoomed point under cursor
    const bgPosX = -(relX * zoomLevel - half);
    const bgPosY = -(relY * zoomLevel - half);

    return (
        <div
            ref={ref}
            className={`relative ${className ?? ''}`}
            onMouseEnter={() => canUse && setEnabled(true)}
            onMouseLeave={() => setEnabled(false)}
            onMouseMove={onMove}
            onWheelCapture={onWheel}
            onWheel={onWheel}
            style={{ overscrollBehavior: 'contain' }}
        >
            {children}

            {canUse && enabled && overImage && (
                <div
                    className="pointer-events-none absolute border border-white/50 shadow-lg"
                    style={{
                        width: lens,
                        height: lens,
                        left: lensLeft,
                        top: lensTop,
                        borderRadius: radius,
                        backgroundImage: `url(${src})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: `${bgW}px ${bgH}px`,
                        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                    }}
                />
            )}
        </div>
    );
}
