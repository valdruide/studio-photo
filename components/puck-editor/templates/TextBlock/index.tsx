import type { ComponentConfig } from '@puckeditor/core';
import { BackgroundColorField, TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';

export const TextBlock: ComponentConfig = {
    fields: {
        title: {
            type: 'text',
            label: 'Title',
        },
        text: {
            type: 'textarea',
            label: 'Text',
        },
        backgroundColor: {
            type: 'custom',
            render: ({ id, onChange, value, readOnly }) => <BackgroundColorField id={id} value={value} onChange={onChange} readOnly={readOnly} />,
        },
        textColors: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => (
                <TextColorsField
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    controls={[
                        { key: 'titleColor', label: 'Title', placeholder: '#f5f5f7' },
                        { key: 'textColor', label: 'Text', placeholder: '#a3a3b1' },
                    ]}
                />
            ),
        },
    },
    defaultProps: {
        title: 'Section title',
        text: 'Write a short paragraph for this section.',
        backgroundColor: '',
        textColors: {},
    },
    render: ({ title, text, backgroundColor, textColors }) => {
        const safeBackgroundColor = getSafeHexColor(backgroundColor);
        const titleColor = getSafeHexColor(textColors?.titleColor);
        const textColor = getSafeHexColor(textColors?.textColor);

        return (
            <section className="border-y -ml-5 -mr-5 bg-muted/20" style={safeBackgroundColor ? { backgroundColor: safeBackgroundColor } : undefined}>
                <div className="mx-auto max-w-7xl space-y-2 px-6 py-16 md:px-8 md:py-20">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={titleColor ? { color: titleColor } : undefined}>
                        {title}
                    </h2>
                    <p className="leading-7 text-muted-foreground" style={textColor ? { color: textColor } : undefined}>
                        {text}
                    </p>
                </div>
            </section>
        );
    },
};
