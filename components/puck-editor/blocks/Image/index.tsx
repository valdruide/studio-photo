import type { ComponentConfig } from '@puckeditor/core';
import { getSafeImageWidth } from '@/lib/page-builder/image-width';
import { ImageWidthField } from '@/lib/page-builder/image-width-field';
import { withLayout } from '@/components/puck-editor/Layout';
import { getSafeAssetUrl } from '@/components/puck-editor/shared';

export const Image: ComponentConfig = withLayout({
    fields: {
        url: {
            type: 'text',
            label: 'Image URL',
        },
        alt: {
            type: 'text',
            label: 'Alt text',
        },
        objectFit: {
            type: 'radio',
            label: 'Object Fit',
            options: [
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: 'Fill', value: 'fill' },
                { label: 'None', value: 'none' },
            ],
        },
        width: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => <ImageWidthField value={value} onChange={onChange} readOnly={readOnly} />,
        },
        borderRadius: {
            type: 'number',
            label: 'Border Radius (px)',
        },
    },
    defaultProps: {
        url: 'https://placehold.co/600x400',
        alt: 'This is an alternative text for the image (useful for SEO and accessibility)',
        width: 100,
        objectFit: 'cover',
        borderRadius: 0,
    },
    render: ({ url, alt, width, objectFit, borderRadius }) => {
        const safeUrl = getSafeAssetUrl(url);
        const safeAlt = alt || '';
        const safeWidth = getSafeImageWidth(width);
        const fitStyle = objectFit ? { objectFit } : {};
        const borderRadiusStyle = borderRadius ? { borderRadius: `${borderRadius}px` } : {};

        return (
            <div style={{ width: `${safeWidth}%`, maxWidth: '100%' }}>
                <img
                    src={safeUrl}
                    alt={safeAlt}
                    style={{
                        width: '100%',
                        height: 'auto',
                        ...fitStyle,
                        ...borderRadiusStyle,
                    }}
                />
            </div>
        );
    },
});
