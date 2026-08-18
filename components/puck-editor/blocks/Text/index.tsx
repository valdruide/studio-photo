import type { ComponentConfig } from '@puckeditor/core';
import { TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { withLayout } from '@/components/puck-editor/Layout';

export const Text: ComponentConfig = withLayout({
    fields: {
        text: {
            type: 'richtext',
            contentEditable: false,
            label: 'Text',
            options: {
                heading: {
                    levels: [2, 3, 4, 5, 6],
                },
            },
        },
        size: {
            type: 'select',
            label: 'Size',
            options: [
                { label: 'Small', value: 'S' },
                { label: 'Medium', value: 'M' },
                { label: 'Large', value: 'L' },
                { label: 'Extra Large', value: 'XL' },
                { label: '2XL', value: 'XXL' },
                { label: '3XL', value: 'XXXL' },
            ],
        },
        textColors: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => (
                <TextColorsField
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    controls={[{ key: 'textColor', label: 'Text', placeholder: '#a3a3b1' }]}
                />
            ),
        },
    },
    defaultProps: {
        text: 'Write a short paragraph for this section.',
        size: 'M',
        textColors: {},
    },
    render: ({ text, size, textColors }) => {
        const textColor = getSafeHexColor(textColors?.textColor);
        const fontSizeClass =
            size === 'S'
                ? 'text-sm'
                : size === 'M'
                  ? 'text-base'
                  : size === 'L'
                    ? 'text-lg'
                    : size === 'XL'
                      ? 'text-xl'
                      : size === 'XXL'
                        ? 'text-2xl'
                        : size === 'XXXL'
                          ? 'text-3xl'
                          : 'text-base';

        return (
            <div className={`${fontSizeClass} leading-7`} style={textColor ? { color: textColor } : undefined}>
                {text}
            </div>
        );
    },
});
