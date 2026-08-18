import type { ComponentConfig } from '@puckeditor/core';
import { IconPickerField } from '@/lib/page-builder/icon-picker-field';
import { withLayout } from '@/components/puck-editor/Layout';
import { PuckButtonLink } from '@/components/puck-editor/shared';

export const ButtonBlock: ComponentConfig = withLayout({
    fields: {
        label: {
            type: 'text',
            label: 'Label',
        },
        href: {
            type: 'text',
            label: 'URL',
        },
        icon: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => <IconPickerField value={value} onChange={onChange} readOnly={readOnly} />,
        },
        variant: {
            type: 'radio',
            label: 'Variant',
            options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
                { label: 'Link', value: 'link' },
            ],
        },
        position: {
            type: 'radio',
            label: 'Position',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
            ],
        },
        width: {
            type: 'radio',
            label: 'Width',
            options: [
                { label: 'Auto', value: 'auto' },
                { label: 'Full', value: 'full' },
            ],
        },
    },
    defaultProps: {
        label: 'New button',
        href: '#',
        icon: '',
        variant: 'primary',
        position: 'left',
        width: 'auto',
    },
    render: ({ label, href, icon, variant, position, width }) => {
        const buttonPosition = position === 'center' ? 'center' : position === 'right' ? 'right' : 'left';
        const buttonWidth = width === 'full' ? 'w-full' : 'w-auto';

        return (
            <div style={{ textAlign: buttonPosition }}>
                <PuckButtonLink
                    label={label}
                    href={href}
                    icon={icon}
                    variant={variant}
                    className={`rounded-full px-6 ${buttonPosition} ${buttonWidth}`}
                />
            </div>
        );
    },
});
