import type { ComponentConfig } from '@puckeditor/core';
import { BackgroundColorField, TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { IconPickerField } from '@/lib/page-builder/icon-picker-field';
import { PuckButtonLink } from '@/components/puck-editor/shared';

export const Card: ComponentConfig = {
    fields: {
        upperTitle: {
            type: 'text',
            label: 'Upper title',
        },
        title: {
            type: 'text',
            label: 'Title',
        },
        text: {
            type: 'textarea',
            label: 'Text',
        },
        ctas: {
            type: 'array',
            label: 'CTA buttons (optional)',
            arrayFields: {
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
            },
            defaultItemProps: {
                label: 'New button',
                href: '#',
                icon: '',
                variant: 'primary',
            },
            getItemSummary: (item) => item.label || 'CTA',
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
        upperTitle: 'Contact',
        title: 'A collaboration, a commission, or simply a desire to connect ?',
        text: 'Feel free to contact me with any questions or projects, or simply to discuss photography and visual creation. I am always open to new collaborations and exchanging ideas.',
        ctas: [
            {
                label: 'Contact me',
                href: 'mailto:',
                icon: 'IconArrowNarrowRight',
                variant: 'primary',
            },
        ],
        backgroundColor: '',
        textColors: {},
    },
    render: ({ upperTitle, title, text, backgroundColor, textColors, ctas }) => {
        const safeBackgroundColor = getSafeHexColor(backgroundColor);
        const titleColor = getSafeHexColor(textColors?.titleColor);
        const textColor = getSafeHexColor(textColors?.textColor);
        const safeCtas = Array.isArray(ctas) ? ctas : [];

        return (
            <section className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24 ">
                <div
                    className="rounded-2xl border border-border bg-card px-6 py-10 sm:px-8 sm:py-12"
                    style={safeBackgroundColor ? { backgroundColor: safeBackgroundColor } : undefined}
                >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="z-10 max-w-2xl space-y-3">
                            {upperTitle && (
                                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground" style={titleColor ? { color: titleColor } : undefined}>
                                    {upperTitle}
                                </p>
                            )}
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" style={titleColor ? { color: titleColor } : undefined}>
                                {title}
                            </h2>
                            <p className="text-muted-foreground" style={textColor ? { color: textColor } : undefined}>
                                {text}
                            </p>
                        </div>
                        {safeCtas.length > 0 && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                {safeCtas.map((cta, index) => (
                                    <PuckButtonLink
                                        key={`${cta.label}-${index}`}
                                        label={cta.label}
                                        href={cta.href}
                                        icon={cta.icon}
                                        variant={cta.variant}
                                        className="z-10 rounded-full px-6"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        );
    },
};
