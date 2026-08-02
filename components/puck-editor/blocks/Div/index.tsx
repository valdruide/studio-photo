import type { ComponentConfig } from '@puckeditor/core';
import { BackgroundColorField, ColorField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { getLayoutSpacingStyle, withLayout } from '@/components/puck-editor/Layout';
import { cn } from '@/lib/utils';

export const Div: ComponentConfig = withLayout({
    fields: {
        content: {
            type: 'slot',
            disallow: ['HeroBlock', 'TextBlock', 'Card'],
        },
        spacing: {
            type: 'number',
            label: 'Spacing (px)',
        },
        backgroundColor: {
            type: 'custom',
            render: ({ id, onChange, value, readOnly }) => (
                <BackgroundColorField id={id} value={value} onChange={onChange} readOnly={readOnly} />
            ),
        },
        border: {
            type: 'number',
            label: 'Border width (px)',
        },
        borderColor: {
            type: 'custom',
            render: ({ id, onChange, value, readOnly }) => (
                <ColorField
                    id={id}
                    label="Border color"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    fallbackColor="#27272f"
                    placeholder="#27272f"
                />
            ),
        },
        borderRadius: {
            type: 'number',
            label: 'Border radius (px)',
        },
        width: {
            type: 'text',
            label: 'Width (px)',
        },
        height: {
            type: 'text',
            label: 'Height (px)',
        },
    },
    defaultProps: {
        content: [],
        spacing: 5,
        backgroundColor: '',
        border: 0,
        borderColor: '',
        borderRadius: 0,
        width: '100%',
        height: 'auto',
    },
    render: ({ content: Content, backgroundColor, border, borderColor, borderRadius, width, height, spacing, layout }) => {
        const safeBackgroundColor = getSafeHexColor(backgroundColor);
        const safeBorderColor = getSafeHexColor(borderColor);
        const safeSpacing = typeof spacing === 'number' && Number.isFinite(spacing) && spacing > 0 ? spacing : 0;

        return (
            <div
                className={cn('mx-auto max-w-7xl px-6 md:px-8')}
                style={{
                    ...getLayoutSpacingStyle(layout),
                    backgroundColor: safeBackgroundColor,
                    border: `${border}px solid ${safeBorderColor}`,
                    borderRadius: `${borderRadius}px`,
                    width: typeof width === 'number' ? `${width}px` : width,
                    height: typeof height === 'number' ? `${height}px` : height,
                }}
            >
                <Content
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${safeSpacing}px`,
                    }}
                />
            </div>
        );
    },
}, { spacingTarget: 'component' });
