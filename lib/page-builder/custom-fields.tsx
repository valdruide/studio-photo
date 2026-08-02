import type { ReactNode } from 'react';

export type TextColorSettings = {
    titleColor?: string;
    subtitleColor?: string;
    textColor?: string;
};

type ColorControlKey = keyof TextColorSettings;

type ColorControl = {
    key: ColorControlKey;
    label: string;
    placeholder: string;
};

type ColorInputProps = {
    id?: string;
    label?: string;
    value?: string;
    fallbackColor: string;
    placeholder: string;
    readOnly?: boolean;
    onChange: (value: string) => void;
};

type ColorFieldProps = {
    id: string;
    label: string;
    value?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
    fallbackColor?: string;
    placeholder?: string;
};

function CustomFieldLabel({
    label,
    readOnly,
    children,
}: {
    label: string;
    readOnly?: boolean;
    children: ReactNode;
}) {
    return (
        <div aria-disabled={readOnly}>
            <div className="pb-3 text-xs font-semibold" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>
                {label}
            </div>
            {children}
        </div>
    );
}

export function getSafeHexColor(value?: string) {
    if (!value) return undefined;

    return /^#[0-9a-fA-F]{6}$/.test(value) ? value : undefined;
}

function fieldSurfaceStyle() {
    return {
        background: 'var(--puck-field-color-surface, var(--puck-color-surface))',
        borderColor: 'var(--puck-field-color-border, var(--puck-color-border))',
        borderRadius: 'var(--puck-field-radius, var(--puck-radius-m))',
    };
}

function pickerStyle() {
    return {
        background: 'var(--puck-field-color-bg, var(--puck-color-surface))',
        borderColor: 'var(--puck-field-color-border, var(--puck-color-border))',
        borderRadius: 'var(--puck-field-radius, var(--puck-radius-m))',
    };
}

function textInputStyle() {
    return {
        background: 'var(--puck-field-color-bg, var(--puck-color-surface))',
        borderColor: 'var(--puck-field-color-border, var(--puck-color-border))',
        borderRadius: 'var(--puck-field-radius, var(--puck-radius-m))',
        color: 'var(--puck-field-color-text, var(--puck-color-text))',
    };
}

function resetButtonStyle() {
    return {
        background: 'var(--puck-button-secondary-color-bg, transparent)',
        borderColor: 'var(--puck-button-secondary-color-border, var(--puck-color-border))',
        borderRadius: 'var(--puck-button-radius, var(--puck-radius-m))',
        color: 'var(--puck-button-secondary-color-text, var(--puck-color-text))',
    };
}

function ColorInput({ id, label, value, fallbackColor, placeholder, readOnly, onChange }: ColorInputProps) {
    const currentValue = getSafeHexColor(value) ?? '';
    const colorPickerValue = currentValue || fallbackColor;

    return (
        <div className="space-y-2">
            {label && <p className="text-xs font-medium" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>{label}</p>}
            <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-2">
                <input
                    aria-label={label ? `${label} color picker` : 'Background color picker'}
                    type="color"
                    value={colorPickerValue}
                    disabled={readOnly}
                    onChange={(event) => onChange(event.currentTarget.value)}
                    className="h-10 w-10 cursor-pointer border bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
                    style={pickerStyle()}
                />
                <input
                    id={id}
                    value={currentValue}
                    placeholder={placeholder}
                    disabled={readOnly}
                    onChange={(event) => onChange(event.currentTarget.value)}
                    className="h-10 min-w-0 border px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
                    style={textInputStyle()}
                />
            </div>
            <button
                type="button"
                disabled={readOnly || !currentValue}
                onClick={() => onChange('')}
                className="h-9 w-full cursor-pointer border px-3 text-sm transition hover:bg-muted! disabled:pointer-events-none disabled:opacity-50"
                style={resetButtonStyle()}
            >
                Reset
            </button>
        </div>
    );
}

export function ColorField({
    id,
    label,
    value,
    onChange,
    readOnly,
    fallbackColor = '#202027',
    placeholder = '#202027',
}: ColorFieldProps) {
    return (
        <CustomFieldLabel label={label} readOnly={readOnly}>
            <div className="space-y-2 border p-3" style={fieldSurfaceStyle()}>
                <ColorInput id={id} value={value} fallbackColor={fallbackColor} placeholder={placeholder} readOnly={readOnly} onChange={onChange} />
            </div>
        </CustomFieldLabel>
    );
}

export function BackgroundColorField({
    id,
    value,
    onChange,
    readOnly,
}: {
    id: string;
    value?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}) {
    return <ColorField id={id} label="Background color" value={value} onChange={onChange} readOnly={readOnly} />;
}

export function TextColorsField({
    value,
    onChange,
    readOnly,
    controls,
}: {
    value?: TextColorSettings;
    onChange: (value: TextColorSettings) => void;
    readOnly?: boolean;
    controls: ColorControl[];
}) {
    const currentValue = value ?? {};

    function updateColor(key: ColorControlKey, color: string) {
        onChange({
            ...currentValue,
            [key]: color,
        });
    }

    return (
        <CustomFieldLabel label="Text colors" readOnly={readOnly}>
            <div className="space-y-4 border p-3" style={fieldSurfaceStyle()}>
                {controls.map((control) => (
                    <ColorInput
                        key={control.key}
                        label={control.label}
                        value={currentValue[control.key]}
                        fallbackColor={control.placeholder}
                        placeholder={control.placeholder}
                        readOnly={readOnly}
                        onChange={(color) => updateColor(control.key, color)}
                    />
                ))}
            </div>
        </CustomFieldLabel>
    );
}
