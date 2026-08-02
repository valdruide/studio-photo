import type { ComponentConfig } from '@puckeditor/core';
import { TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { withLayout } from '@/components/puck-editor/Layout';

export const TitleBlock: ComponentConfig = withLayout({
    fields: {
        text: {
            type: 'text',
            label: 'Text',
        },
        heading: {
            type: 'select',
            label: 'Heading level',
            options: [
                { label: 'H1', value: 'h1' },
                { label: 'H2', value: 'h2' },
                { label: 'H3', value: 'h3' },
                { label: 'H4', value: 'h4' },
                { label: 'H5', value: 'h5' },
                { label: 'H6', value: 'h6' },
            ],
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
        align: {
            type: 'radio',
            label: 'Alignment',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
            ],
        },
        textColors: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => (
                <TextColorsField
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    controls={[{ key: 'textColor', label: 'Text', placeholder: '#f5f5f7' }]}
                />
            ),
        },
    },
    defaultProps: {
        text: 'Section title',
        size: 'M',
        heading: 'h2',
        align: 'left',
        textColors: {},
    },
    render: ({ text, heading, size, align, textColors }) => {
        const textColor = getSafeHexColor(textColors?.textColor);
        const Heading = heading ?? 'h2';
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
        const textAlignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

        return (
            <Heading
                className={`${fontSizeClass} font-semibold tracking-tight text-foreground ${textAlignClass}`}
                style={textColor ? { color: textColor } : undefined}
            >
                {text}
            </Heading>
        );
    },
});
