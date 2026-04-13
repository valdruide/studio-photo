export type ThemeName =
    | 'default'
    | 'deep-ocean'
    | 'midnight-ember'
    | 'forest-veil'
    | 'ivory-light'
    | 'midnight-tokyo'
    | 'marmalade'
    | 'uranium'
    | 'coffee'
    | 'teal-orange'
    | 'pink-pastel';

export type ThemeDefinition = {
    name: ThemeName;
    label: string;
    preview: {
        background: string;
        card: string;
        primary: string;
        accent: string;
        foreground?: string;
        border?: string;
    };
};

export const DEFAULT_THEME: ThemeName = 'default';

export const THEMES: ThemeDefinition[] = [
    {
        name: 'default',
        label: 'Default',
        preview: {
            background: 'oklch(0.141 0.005 285.823)',
            card: 'oklch(0.21 0.006 285.885)',
            primary: 'oklch(0.606 0.25 292.717)',
            accent: 'oklch(0.274 0.006 286.033)',
            foreground: 'oklch(0.985 0 0)',
            border: 'oklch(1 0 0 / 10%)',
        },
    },
    {
        name: 'deep-ocean',
        label: 'Deep Ocean',
        preview: {
            background: 'oklch(0.18 0.03 240)',
            card: 'oklch(0.24 0.03 240)',
            primary: 'oklch(0.68 0.16 220)',
            accent: 'oklch(0.32 0.04 220)',
            foreground: 'oklch(0.95 0.01 240)',
            border: 'oklch(1 0 0 / 10%)',
        },
    },
    {
        name: 'forest-veil',
        label: 'Forest Veil',
        preview: {
            background: 'oklch(0.15 0.02 160)',
            card: 'oklch(0.22 0.02 160)',
            primary: 'oklch(75.039% 0.20633 149.345)',
            accent: 'oklch(0.32 0.04 150)',
            foreground: 'oklch(0.95 0.01 160)',
            border: 'oklch(1 0 0 / 10%)',
        },
    },
    {
        name: 'uranium',
        label: 'Uranium',
        preview: {
            background: 'oklch(0.1288 0.0406 264.6952)',
            card: 'oklch(0.2077 0.0398 265.7549)',
            primary: 'oklch(0.8871 0.2122 128.5041)',
            accent: 'oklch(0.3925 0.0896 152.5353)',
            foreground: 'oklch(0.9842 0.0034 247.8575)',
            border: 'oklch(0.2795 0.0368 260.031)',
        },
    },
    {
        name: 'midnight-tokyo',
        label: 'Midnight Tokyo',
        preview: {
            background: 'oklch(0.203 0.014 285.102)',
            card: 'oklch(0.226 0.019 280.253)',
            primary: 'oklch(0.867 0 180)',
            accent: 'oklch(0.197 0.016 280.374)',
            foreground: 'oklch(0.766 0.049 276.035)',
            border: 'oklch(0.396 0.036 278.297)',
        },
    },
    {
        name: 'marmalade',
        label: 'Marmalade',
        preview: {
            background: 'oklch(0.289 0.028 278.614)',
            card: 'oklch(0.27 0.026 278.667)',
            primary: 'oklch(0.894 0.134 89.51)',
            accent: 'oklch(0.42 0.046 278.38)',
            foreground: 'oklch(0.953 0.009 188.68)',
            border: 'oklch(0.349 0.015 279.62)',
        },
    },
    {
        name: 'coffee',
        label: 'Coffee',
        preview: {
            background: 'oklch(0.15 0.02 40)',
            card: 'oklch(0.22 0.02 40)',
            primary: 'oklch(0.65 0.2 30)',
            accent: 'oklch(0.3 0.03 25)',
            foreground: 'oklch(0.95 0.01 40)',
            border: 'oklch(1 0 0 / 10%)',
        },
    },
    {
        name: 'teal-orange',
        label: 'Teal Orange',
        preview: {
            background: 'oklch(0.1797 0.0043 308.1928)',
            card: 'oklch(0.1822 0 0)',
            primary: 'oklch(0.7214 0.1337 49.9802)',
            accent: 'oklch(0.3211 0 0)',
            foreground: 'oklch(0.8109 0 0)',
            border: 'oklch(0.252 0 0)',
        },
    },
    {
        name: 'pink-pastel',
        label: 'Pink Pastel',
        preview: {
            background: 'oklch(0.1221 0 0)',
            card: 'oklch(0.2132 0.0042 264.4789)',
            primary: 'oklch(0.5608 0.1952 2.7932)',
            accent: 'oklch(0.2795 0.0368 260.031)',
            foreground: 'oklch(0.9551 0 0)',
            border: 'oklch(0.3289 0.0092 268.3843)',
        },
    },
    {
        name: 'ivory-light',
        label: 'Ivory Light',
        preview: {
            background: 'oklch(1 0 180)',
            card: 'oklch(0.97 0.004 270)',
            primary: 'oklch(0.567 0.237 267.896)',
            accent: 'oklch(0.866 0.024 275.781)',
            foreground: 'oklch(0.126 0.026 268.939)',
            border: 'oklch(0.928 0.006 264.531)',
        },
    },
];

export function isValidTheme(value: string | undefined | null): value is ThemeName {
    return !!value && THEMES.some((theme) => theme.name === value);
}
