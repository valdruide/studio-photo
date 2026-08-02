import type { ComponentConfig } from '@puckeditor/core';
import { BackgroundColorField, ColorField, TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { IconPickerField } from '@/lib/page-builder/icon-picker-field';
import { getSafeAssetUrl, getButtonVariant, getSafeIcon, getSafeHref } from '@/components/puck-editor/shared';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const HeroBlock: ComponentConfig = {
    fields: {
        tags: {
            type: 'array',
            label: 'Tags (optional)',
            arrayFields: {
                label: {
                    type: 'text',
                    label: 'Label',
                },
            },
            defaultItemProps: {
                label: 'New tag',
            },
            getItemSummary: (item) => item.label || 'Tag',
        },
        tagBackgroundColor: {
            type: 'custom',
            render: ({ id, onChange, value, readOnly }) => (
                <ColorField
                    id={id}
                    label="Tag background color"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    fallbackColor="#27272f"
                    placeholder="#27272f"
                />
            ),
        },
        tagTextColor: {
            type: 'custom',
            render: ({ id, onChange, value, readOnly }) => (
                <ColorField
                    id={id}
                    label="Tag text color"
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    fallbackColor="#d8d8e5"
                    placeholder="#d8d8e5"
                />
            ),
        },
        title: {
            type: 'text',
            label: 'Title',
        },
        subtitle: {
            type: 'textarea',
            label: 'Subtitle',
        },
        align: {
            type: 'radio',
            label: 'Alignment',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
            ],
        },
        image: {
            type: 'object',
            label: 'Image (optional)',
            objectFields: {
                url: {
                    type: 'text',
                    label: 'URL',
                },
                mode: {
                    type: 'radio',
                    label: 'Mode',
                    options: [
                        { label: 'Inline', value: 'inline' },
                        { label: 'Background', value: 'bg' },
                    ],
                },
            },
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
            render: ({ id, onChange, value, readOnly }) => (
                <BackgroundColorField id={id} value={value} onChange={onChange} readOnly={readOnly} />
            ),
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
                        { key: 'subtitleColor', label: 'Subtitle', placeholder: '#a3a3b1' },
                    ]}
                />
            ),
        },
    },
    defaultProps: {
        tags: [{ label: 'photography' }, { label: 'story' }, { label: 'studio' }],
        ctas: [],
        image: {
            url: '',
            mode: 'inline',
        },
        title: 'A beautiful photography story',
        subtitle: 'Add a short introduction for this page.',
        align: 'left',
        backgroundColor: '',
        tagBackgroundColor: '',
        tagTextColor: '',
        textColors: {},
    },
    render: ({ title, subtitle, align, tags, ctas, image, backgroundColor, tagBackgroundColor, tagTextColor, textColors }) => {
        const safeTags = Array.isArray(tags) ? tags : [];
        const safeCtas = Array.isArray(ctas) ? ctas : [];
        const safeBackgroundColor = getSafeHexColor(backgroundColor);
        const safeTagBackgroundColor = getSafeHexColor(tagBackgroundColor);
        const safeTagTextColor = getSafeHexColor(tagTextColor);
        const titleColor = getSafeHexColor(textColors?.titleColor);
        const subtitleColor = getSafeHexColor(textColors?.subtitleColor);
        const safeImageUrl = getSafeAssetUrl(image?.url);
        const imageMode = image?.mode ?? 'inline';
        const hasInlineImage = Boolean(safeImageUrl && imageMode === 'inline');
        const hasBackgroundImage = Boolean(safeImageUrl && imageMode === 'bg');
        const inlineImageBlock = hasInlineImage ? (
            <div
                aria-hidden="true"
                className="min-h-[280px] overflow-hidden rounded-lg border bg-muted bg-center bg-cover bg-no-repeat"
                style={{
                    backgroundImage: `url("${safeImageUrl}")`,
                }}
            />
        ) : null;
        const sectionStyle = {
            ...(safeBackgroundColor ? { backgroundColor: safeBackgroundColor } : {}),
            ...(hasBackgroundImage
                ? {
                      backgroundImage: `linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.2)), url("${safeImageUrl}")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                  }
                : {}),
        };

        return (
            <section className="px-8 py-20" style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}>
                <div
                    className={
                        hasInlineImage && align === 'left'
                            ? 'grid items-center gap-30 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)]'
                            : align === 'center'
                              ? 'mx-auto max-w-3xl text-center space-y-4'
                              : 'max-w-3xl'
                    }
                >
                    <div className={align === 'center' ? 'text-center space-y-4' : undefined}>
                        {safeTags.length > 0 && (
                            <div className={align === 'center' ? 'flex flex-wrap justify-center gap-2' : 'mb-4 flex flex-wrap gap-2'}>
                                {safeTags.map((tag, index) => (
                                    <span
                                        key={`${tag.label}-${index}`}
                                        className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground"
                                        style={{
                                            ...(safeTagBackgroundColor ? { backgroundColor: safeTagBackgroundColor } : {}),
                                            ...(safeTagTextColor ? { color: safeTagTextColor } : {}),
                                        }}
                                    >
                                        {tag.label}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl" style={titleColor ? { color: titleColor } : undefined}>
                            {title}
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-muted-foreground" style={subtitleColor ? { color: subtitleColor } : undefined}>
                            {subtitle}
                        </p>
                        {safeCtas.length > 0 && (
                            <div className={align === 'center' ? 'mt-8 flex flex-wrap justify-center gap-3' : 'mt-8 flex flex-wrap gap-3'}>
                                {safeCtas.map((cta, index) => {
                                    const CtaIcon = getSafeIcon(cta.icon);

                                    return (
                                        <Button
                                            key={`${cta.label}-${index}`}
                                            asChild
                                            variant={getButtonVariant(cta.variant)}
                                            size="lg"
                                            className="rounded-full px-6"
                                        >
                                            <Link href={getSafeHref(cta.href)}>
                                                {cta.label}
                                                {CtaIcon && <CtaIcon className="size-5" />}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    {inlineImageBlock}
                </div>
            </section>
        );
    },
};
