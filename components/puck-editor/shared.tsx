import { createElement } from 'react';
import { Button } from '@/components/ui/button';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import Link from 'next/link';

export function getSafeAssetUrl(value?: string) {
    if (!value) return undefined;

    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('/')) return trimmedValue;

    try {
        const url = new URL(trimmedValue);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
    } catch {
        return undefined;
    }
}

export function getSafeHref(value?: string) {
    if (!value) return '#';

    const trimmedValue = value.trim();

    if (trimmedValue.startsWith('/') || trimmedValue.startsWith('#') || trimmedValue.startsWith('mailto:')) {
        return trimmedValue;
    }

    try {
        const url = new URL(trimmedValue);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '#';
    } catch {
        return '#';
    }
}

export function getSafeIcon(value?: string) {
    return value && ICONS_MAP[value] ? ICONS_MAP[value] : undefined;
}

export function getButtonVariant(variant?: string) {
    return variant === 'secondary' ? 'secondary' : variant === 'outline' ? 'outline' : variant === 'link' ? 'link' : 'default';
}

export function PuckButtonLink({
    label,
    href,
    icon,
    variant,
    className,
    size = 'lg',
}: {
    label?: string;
    href?: string;
    icon?: string;
    variant?: string;
    className?: string;
    size?: 'default' | 'sm' | 'lg';
}) {
    const Icon = getSafeIcon(icon);

    return (
        <Button asChild variant={getButtonVariant(variant)} size={size} className={className}>
            <Link href={getSafeHref(href)}>
                {label}
                {Icon && createElement(Icon, { className: 'size-5' })}
            </Link>
        </Button>
    );
}
