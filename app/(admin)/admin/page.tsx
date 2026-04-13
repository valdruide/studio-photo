'use client';

import { useEffect, useState } from 'react';
import { CategorieTable, CategoryRow } from '@/components/admin/categorieTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddCategory } from '@/components/admin/addCategory';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { ComponentType } from 'react';
import { toast } from 'sonner';
import { THEMES, DEFAULT_THEME, type ThemeName } from '@/lib/themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    IconBrandInstagram,
    IconBrandTiktok,
    IconBrandFacebook,
    IconBrandX,
    IconBrandYoutube,
    IconBrandPinterest,
    IconBrandDribbble,
    IconBrandBehance,
    IconBrandReddit,
} from '@tabler/icons-react';

type SettingsForm = {
    site_name: string;
    portfolio_name: string;
    title: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    x: string;
    youtube: string;
    pinterest: string;
    dribbble: string;
    behance: string;
    reddit: string;
    site_theme: ThemeName;
};
const EMPTY_SETTINGS: SettingsForm = {
    site_name: '',
    portfolio_name: '',
    title: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    x: '',
    youtube: '',
    pinterest: '',
    dribbble: '',
    behance: '',
    reddit: '',
    site_theme: DEFAULT_THEME,
};

type Category = CategoryRow;

function isValidTheme(value: string | undefined | null): value is ThemeName {
    return !!value && THEMES.some((theme) => theme.name === value);
}

export default function AdminHome() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [AddCategoryOpen, setAddCategoryOpen] = useState(false);

    const [settings, setSettings] = useState<SettingsForm>(EMPTY_SETTINGS);
    const [savingSettings, setSavingSettings] = useState(false);

    async function load() {
        setLoading(true);

        try {
            const [catsRes, settingsRes] = await Promise.all([
                fetch('/api/admin/categories', { cache: 'no-store' }),
                fetch('/api/admin/settings', { cache: 'no-store' }),
            ]);

            if (catsRes.ok) {
                const cats = await catsRes.json();
                setCategories(cats.items ?? []);
            } else {
                console.error('Failed to load categories:', catsRes.status);
            }

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                const item = settingsData.item;

                const nextSettings: SettingsForm = {
                    site_name: item?.site_name ?? '',
                    portfolio_name: item?.portfolio_name ?? '',
                    title: item?.title ?? '',
                    instagram: item?.instagram ?? '',
                    tiktok: item?.tiktok ?? '',
                    facebook: item?.facebook ?? '',
                    x: item?.x ?? '',
                    youtube: item?.youtube ?? '',
                    pinterest: item?.pinterest ?? '',
                    dribbble: item?.dribbble ?? '',
                    behance: item?.behance ?? '',
                    reddit: item?.reddit ?? '',
                    site_theme: isValidTheme(item?.site_theme) ? item.site_theme : DEFAULT_THEME,
                };

                setSettings(nextSettings);

                // Preview immédiate dans l'admin
                document.documentElement.setAttribute('data-theme', nextSettings.site_theme);
            } else {
                const errorText = await settingsRes.text();
                console.error('Failed to load settings:', settingsRes.status, errorText);
                setSettings(EMPTY_SETTINGS);
            }
        } catch (error) {
            console.error('Admin load failed:', error);
            setSettings(EMPTY_SETTINGS);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    function updateSetting<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function onSelectTheme(themeName: ThemeName) {
        setSettings((prev) => ({
            ...prev,
            site_theme: themeName,
        }));

        // Preview immédiate dans l'admin avant sauvegarde
        document.documentElement.setAttribute('data-theme', themeName);
    }

    async function onSaveSettings() {
        try {
            setSavingSettings(true);

            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to save settings: ${res.status} ${errorText}`);
            }

            const data = await res.json();
            const item = data.item;

            const nextSettings: SettingsForm = {
                site_name: item?.site_name ?? '',
                portfolio_name: item?.portfolio_name ?? '',
                title: item?.title ?? '',
                instagram: item?.instagram ?? '',
                tiktok: item?.tiktok ?? '',
                facebook: item?.facebook ?? '',
                x: item?.x ?? '',
                youtube: item?.youtube ?? '',
                pinterest: item?.pinterest ?? '',
                dribbble: item?.dribbble ?? '',
                behance: item?.behance ?? '',
                reddit: item?.reddit ?? '',
                site_theme: isValidTheme(item?.site_theme) ? item.site_theme : DEFAULT_THEME,
            };

            setSettings(nextSettings);
            document.documentElement.setAttribute('data-theme', nextSettings.site_theme);
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    }

    async function onChangeVisibility(catId: string, isVisible: boolean) {
        // Optimistic update
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, isHidden: !isVisible } : c)));

        const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ isHidden: !isVisible }),
        });

        if (!res.ok) {
            // rollback si erreur
            setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, isHidden: isVisible } : c)));
            toast.error('Failed to update category visibility');
        }
    }

    async function onToggleAllowAll(catId: string, allowAll: boolean) {
        // Optimistic update
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, allowAll } : c)));

        const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ allowAll }),
        });

        if (!res.ok) {
            // rollback si erreur
            setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, allowAll: !allowAll } : c)));
            toast.error('Failed to update category allowAll');
        }
    }

    async function onReorder(next: Category[]) {
        const previous = categories;

        setCategories(next);

        const res = await fetch('/api/admin/categories/reorder', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                items: next.map((cat) => ({
                    id: cat.id,
                    order: cat.order ?? 0,
                })),
            }),
        });

        if (!res.ok) {
            setCategories(previous);
            console.error('Failed to reorder categories');
            toast.error('Failed to reorder categories');
        }
    }

    const possibleSocialMedia: {
        name: string;
        field: keyof SettingsForm;
        placeholder: string;
        Icon: ComponentType<{ className?: string }>;
    }[] = [
        {
            name: 'Instagram',
            field: 'instagram',
            placeholder: 'Instagram URL',
            Icon: IconBrandInstagram,
        },
        {
            name: 'TikTok',
            field: 'tiktok',
            placeholder: 'TikTok URL',
            Icon: IconBrandTiktok,
        },
        {
            name: 'Facebook',
            field: 'facebook',
            placeholder: 'Facebook URL',
            Icon: IconBrandFacebook,
        },
        {
            name: 'X',
            field: 'x',
            placeholder: 'X URL',
            Icon: IconBrandX,
        },
        {
            name: 'YouTube',
            field: 'youtube',
            placeholder: 'YouTube URL',
            Icon: IconBrandYoutube,
        },
        {
            name: 'Pinterest',
            field: 'pinterest',
            placeholder: 'Pinterest URL',
            Icon: IconBrandPinterest,
        },
        {
            name: 'Dribbble',
            field: 'dribbble',
            placeholder: 'Dribbble URL',
            Icon: IconBrandDribbble,
        },
        {
            name: 'Behance',
            field: 'behance',
            placeholder: 'Behance URL',
            Icon: IconBrandBehance,
        },
        {
            name: 'Reddit',
            field: 'reddit',
            placeholder: 'Reddit URL',
            Icon: IconBrandReddit,
        },
    ];

    return (
        <>
            <AddCategory
                open={AddCategoryOpen}
                onOpenChange={setAddCategoryOpen}
                onAdded={() => {
                    load();
                }}
            />

            <p className="text-2xl font-semibold">Dashboard</p>

            {loading ? (
                <div className="mt-5 text-sm opacity-70">Loading…</div>
            ) : (
                <div className="space-y-4 mt-5">
                    <Card>
                        <CardHeader className="flex justify-between">
                            <CardTitle>Categories</CardTitle>
                            <Button onClick={() => setAddCategoryOpen(true)}>Create category</Button>
                        </CardHeader>
                        <CardContent>
                            <CategorieTable
                                categories={categories}
                                onToggleVisible={onChangeVisibility}
                                onToggleAllowAll={onToggleAllowAll}
                                onReorder={onReorder}
                                onDeleted={(catId) => setCategories((prev) => prev.filter((c) => c.id !== catId))}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex justify-between">
                            <div className="space-y-1">
                                <CardTitle>Settings</CardTitle>
                                <CardDescription>Update your site information and social media links</CardDescription>
                            </div>
                            <Button onClick={onSaveSettings} disabled={savingSettings}>
                                <IconDeviceFloppy className="size-6" />
                                {savingSettings ? 'Saving...' : 'Save settings'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm">Site name</Label>
                                    <Input
                                        placeholder="Site name"
                                        value={settings.site_name}
                                        onChange={(e) => updateSetting('site_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Portfolio Name</Label>
                                    <Input
                                        placeholder="Portfolio Name"
                                        value={settings.portfolio_name}
                                        onChange={(e) => updateSetting('portfolio_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Title</Label>
                                    <Input
                                        placeholder="Your name - Photography"
                                        value={settings.title}
                                        onChange={(e) => updateSetting('title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Logo</Label>
                                    <Input placeholder="Coming soon" disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Favicon</Label>
                                    <Input placeholder="Coming soon" disabled />
                                </div>
                            </div>
                            <Separator className="my-10" />
                            <p className="font-semibold">Social Media Links</p>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {possibleSocialMedia.map((media) => (
                                    <div key={media.name} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <media.Icon className="size-5" />
                                            <Label className="text-sm">{media.name}</Label>
                                        </div>
                                        <Input
                                            placeholder={media.placeholder}
                                            value={settings[media.field]}
                                            onChange={(e) => updateSetting(media.field, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-10" />
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold">Theme</p>
                                    <p className="text-sm text-muted-foreground">Choose the global theme applied to the whole site.</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                    {THEMES.map((item) => {
                                        const isActive = item.name === settings.site_theme;

                                        return (
                                            <button key={item.name} type="button" onClick={() => onSelectTheme(item.name)} className="text-left">
                                                <Card
                                                    className={cn(
                                                        'cursor-pointer border transition-all hover:bg-primary/10',
                                                        isActive && 'border-primary bg-primary/10',
                                                    )}
                                                >
                                                    <CardHeader className="flex flex-row items-center justify-between">
                                                        <CardTitle className="text-base">{item.label}</CardTitle>
                                                        {isActive ? <Check className="size-6 text-primary" /> : null}
                                                    </CardHeader>

                                                    <CardContent>
                                                        <div
                                                            className="space-y-3 rounded-xl border p-3"
                                                            style={{
                                                                background: item.preview.background,
                                                                borderColor: item.preview.border,
                                                                color: item.preview.foreground,
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div
                                                                    className="h-3 w-20 rounded-full"
                                                                    style={{
                                                                        background: item.preview.foreground ?? 'white',
                                                                        opacity: 0.9,
                                                                    }}
                                                                />
                                                                <div className="h-3 w-3 rounded-full" style={{ background: item.preview.primary }} />
                                                            </div>

                                                            <div
                                                                className="space-y-2 rounded-lg border p-3"
                                                                style={{
                                                                    background: item.preview.card,
                                                                    borderColor: item.preview.border,
                                                                }}
                                                            >
                                                                <div
                                                                    className="h-3 w-16 rounded-full"
                                                                    style={{
                                                                        background: item.preview.foreground ?? 'white',
                                                                        opacity: 0.9,
                                                                    }}
                                                                />
                                                                <div
                                                                    className="h-2 w-full rounded-full"
                                                                    style={{
                                                                        background: item.preview.foreground ?? 'white',
                                                                        opacity: 0.15,
                                                                    }}
                                                                />
                                                                <div
                                                                    className="h-2 w-3/4 rounded-full"
                                                                    style={{
                                                                        background: item.preview.foreground ?? 'white',
                                                                        opacity: 0.1,
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <div className="h-8 flex-1 rounded-md" style={{ background: item.preview.primary }} />
                                                                <div className="h-8 w-10 rounded-md" style={{ background: item.preview.accent }} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
