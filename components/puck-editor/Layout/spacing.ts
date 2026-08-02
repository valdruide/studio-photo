export type BoxSpacingValue = {
    locked?: boolean;
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
};

function getSafeSpacingNumber(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;

    return Math.max(0, Math.round(value));
}

export function getLayoutSpacingValue(value?: BoxSpacingValue): Required<BoxSpacingValue> {
    const top = getSafeSpacingNumber(value?.top);
    const right = value?.right ?? top;
    const bottom = value?.bottom ?? top;
    const left = value?.left ?? right;

    return {
        locked: value?.locked ?? true,
        top,
        right: getSafeSpacingNumber(right),
        bottom: getSafeSpacingNumber(bottom),
        left: getSafeSpacingNumber(left),
    };
}
