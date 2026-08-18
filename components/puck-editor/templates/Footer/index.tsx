import type { ComponentConfig } from '@puckeditor/core';
import { TextColorsField, getSafeHexColor } from '@/lib/page-builder/custom-fields';
import { getSafeHref } from '@/components/puck-editor/shared';
import Link from 'next/link';

type FooterLink = {
    label?: string;
    href?: string;
};

export const Footer: ComponentConfig = {
    fields: {
        brand: {
            type: 'text',
            label: 'Brand',
        },
        description: {
            type: 'textarea',
            label: 'Description',
        },
        columns: {
            type: 'array',
            label: 'Link columns',
            arrayFields: {
                title: {
                    type: 'text',
                    label: 'Title',
                },
                links: {
                    type: 'array',
                    label: 'Links',
                    arrayFields: {
                        label: {
                            type: 'text',
                            label: 'Label',
                        },
                        href: {
                            type: 'text',
                            label: 'URL',
                        },
                    },
                    defaultItemProps: {
                        label: 'New link',
                        href: '#',
                    },
                    getItemSummary: (item) => item.label || 'Link',
                },
            },
            defaultItemProps: {
                title: 'Column',
                links: [
                    {
                        label: 'Home',
                        href: '/',
                    },
                ],
            },
            getItemSummary: (item) => item.title || 'Column',
        },
        legalText: {
            type: 'text',
            label: 'Legal text',
        },
        textColors: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => (
                <TextColorsField
                    value={value}
                    onChange={onChange}
                    readOnly={readOnly}
                    controls={[
                        { key: 'titleColor', label: 'Titles', placeholder: '#f5f5f7' },
                        { key: 'textColor', label: 'Text', placeholder: '#a3a3b1' },
                    ]}
                />
            ),
        },
    },
    defaultProps: {
        brand: 'Studio Photo',
        description: 'A refined photography studio creating timeless visual stories for people, brands, and meaningful moments.',
        columns: [
            {
                title: 'Pages',
                links: [
                    { label: 'Home', href: '/' },
                    { label: 'About', href: '/about' },
                    { label: 'Contact', href: 'mailto:contact@example.com' },
                ],
            },
            {
                title: 'Work',
                links: [
                    { label: 'Portfolio', href: '/' },
                    { label: 'Galleries', href: '/proofing/galleries' },
                ],
            },
        ],
        legalText: `© ${new Date().getFullYear()} Studio Photo. All rights reserved.`,
        textColors: {},
    },
    render: ({ brand, description, columns, legalText, textColors }) => {
        const safeColumns = Array.isArray(columns) ? columns : [];
        const titleColor = getSafeHexColor(textColors?.titleColor);
        const textColor = getSafeHexColor(textColors?.textColor);

        return (
            <footer className="border-t -ml-5 -mr-5 bg-muted/20">
                <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)] md:px-8">
                    <div className="max-w-md space-y-4">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground" style={titleColor ? { color: titleColor } : undefined}>
                            {brand}
                        </h2>
                        {description && (
                            <p className="text-sm leading-6 text-muted-foreground" style={textColor ? { color: textColor } : undefined}>
                                {description}
                            </p>
                        )}
                    </div>

                    {safeColumns.length > 0 && (
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {safeColumns.map((column, columnIndex) => {
                                const safeLinks: FooterLink[] = Array.isArray(column.links) ? column.links : [];

                                return (
                                    <div key={`${column.title}-${columnIndex}`} className="space-y-3">
                                        <h3 className="text-sm font-semibold text-foreground" style={titleColor ? { color: titleColor } : undefined}>
                                            {column.title}
                                        </h3>
                                        {safeLinks.length > 0 && (
                                            <nav className="flex flex-col gap-2">
                                                {safeLinks.map((link, linkIndex) => (
                                                    <Link
                                                        key={`${link.label}-${linkIndex}`}
                                                        href={getSafeHref(link.href)}
                                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                                        style={textColor ? { color: textColor } : undefined}
                                                    >
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </nav>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {legalText && (
                    <div className="border-t px-6 py-6 md:px-8">
                        <p
                            className="mx-auto max-w-7xl text-xs text-muted-foreground text-center"
                            style={textColor ? { color: textColor } : undefined}
                        >
                            {legalText}
                        </p>
                    </div>
                )}
            </footer>
        );
    },
};
