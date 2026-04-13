import PocketBase from 'pocketbase';
import { DEFAULT_THEME, type ThemeName, THEMES } from '@/lib/themes';

export type SiteSettings = {
    id: string;
    site_name?: string;
    portfolio_name?: string;
    title?: string;
    site_theme?: string;
};

function isValidTheme(value: string | undefined | null): value is ThemeName {
    return !!value && THEMES.some((theme) => theme.name === value);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
    try {
        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
        const result = await pb.collection('site_settings').getList(1, 1);

        return (result.items[0] as SiteSettings) ?? null;
    } catch (error) {
        console.error('getSiteSettings failed:', error);
        return null;
    }
}

export async function getGlobalTheme(): Promise<ThemeName> {
    const settings = await getSiteSettings();
    const theme = settings?.site_theme;

    return isValidTheme(theme) ? theme : DEFAULT_THEME;
}
