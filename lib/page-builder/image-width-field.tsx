'use client';

import { Slider } from '@/components/ui/slider';
import { getSafeImageWidth } from './image-width';

type ImageWidthFieldProps = {
    value?: number;
    onChange: (value: number) => void;
    readOnly?: boolean;
};

export function ImageWidthField({ value, onChange, readOnly }: ImageWidthFieldProps) {
    const width = getSafeImageWidth(value);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>
                    Width
                </div>
                <div className="text-xs font-medium" style={{ color: 'var(--puck-field-color-text, var(--puck-color-text))' }}>
                    {width}%
                </div>
            </div>
            <Slider
                value={[width]}
                min={10}
                max={100}
                step={1}
                disabled={readOnly}
                onValueChange={([nextWidth]) => onChange(getSafeImageWidth(nextWidth))}
            />
        </div>
    );
}
