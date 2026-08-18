'use client';

import { IconPickerDialog } from '@/components/admin/iconPickerDialog';
import { Button } from '@/components/ui/button';
import { ICONS_MAP } from '@/lib/categories/iconsMap';

type IconPickerFieldProps = {
    value?: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
};

export function getSafeIconName(value?: string) {
    return value && ICONS_MAP[value] ? value : undefined;
}

export function IconPickerField({ value, onChange, readOnly }: IconPickerFieldProps) {
    const safeIconName = getSafeIconName(value);

    return (
        <div className="space-y-2">
            <div className="pb-1 text-xs font-semibold" style={{ color: 'var(--puck-field-label-color-text, var(--puck-color-text-secondary))' }}>
                Icon
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <IconPickerDialog
                    value={safeIconName ?? 'IconFolderFilled'}
                    onChange={onChange}
                    triggerLabel={safeIconName ? 'Change' : 'Choose'}
                    disabled={readOnly}
                />
                <Button type="button" variant="destructive" disabled={readOnly || !safeIconName} onClick={() => onChange('')}>
                    Reset
                </Button>
            </div>
        </div>
    );
}
