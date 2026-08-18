'use client';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getLayoutSpacingValue, type BoxSpacingValue } from './spacing';

type PaddingFieldProps = {
    label: string;
    value?: BoxSpacingValue;
    onChange: (value: BoxSpacingValue) => void;
    readOnly?: boolean;
};

export function BoxSpacingField({ label, value, onChange, readOnly }: PaddingFieldProps) {
    const spacing = getLayoutSpacingValue(value);

    function updateSide(side: keyof Omit<BoxSpacingValue, 'locked'>, nextValue: number) {
        if (spacing.locked) {
            onChange({
                locked: true,
                top: nextValue,
                right: nextValue,
                bottom: nextValue,
                left: nextValue,
            });
            return;
        }

        onChange({
            ...spacing,
            [side]: nextValue,
        });
    }

    function updateLocked(locked: boolean) {
        onChange({
            locked,
            top: spacing.top,
            right: locked ? spacing.top : spacing.right,
            bottom: locked ? spacing.top : spacing.bottom,
            left: locked ? spacing.top : spacing.left,
        });
    }

    const controls: Array<{ key: keyof Omit<BoxSpacingValue, 'locked'>; label: string }> = [
        { key: 'top', label: 'Top' },
        { key: 'right', label: 'Right' },
        { key: 'bottom', label: 'Bottom' },
        { key: 'left', label: 'Left' },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>
                    {label}
                </div>
                <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--puck-field-color-text, var(--puck-color-text))' }}>
                    <Switch checked={spacing.locked} disabled={readOnly} onCheckedChange={updateLocked} />
                    Locked
                </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {controls.map((control) => (
                    <label key={control.key} className="space-y-1 text-xs" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>
                        {control.label}
                        <Input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            value={spacing[control.key]}
                            disabled={readOnly}
                            placeholder="0"
                            onChange={(event) => updateSide(control.key, event.currentTarget.valueAsNumber)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
}

export function PaddingField({ value, onChange, readOnly }: Omit<PaddingFieldProps, 'label'>) {
    return <BoxSpacingField label="Padding" value={value} onChange={onChange} readOnly={readOnly} />;
}

export function MarginField({ value, onChange, readOnly }: Omit<PaddingFieldProps, 'label'>) {
    return <BoxSpacingField label="Margin" value={value} onChange={onChange} readOnly={readOnly} />;
}
