export function getSafeImageWidth(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 100;

    return Math.min(100, Math.max(10, Math.round(value)));
}
