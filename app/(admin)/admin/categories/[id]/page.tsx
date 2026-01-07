'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CollectionsTable, type CollectionRow } from '@/components/admin/collectionsTable';
import { IconPickerDialog } from '@/components/admin/iconPickerDialog';
import { ColorPickerDialog } from '@/components/admin/colorPickerDialog';
import { AddCollection } from '@/components/admin/addCollection';
import { IconDeviceFloppy } from '@tabler/icons-react';

type Category = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    icon?: string | null;
    color?: string | null;
    allowAll?: boolean;
};

export default function AdminCategoryEditPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [cat, setCat] = useState<Category | null>(null);
    const [collections, setCollections] = useState<CollectionRow[]>([]);

    const [addCollectionOpen, setAddCollectionOpen] = useState(false);

    async function load() {
        setLoading(true);

        const [catRes, colsRes] = await Promise.all([
            fetch(`/api/admin/categories/${id}`, { cache: 'no-store' }),
            fetch(`/api/admin/collections?categoryId=${id}`, { cache: 'no-store' }),
        ]);

        if (!catRes.ok) {
            setLoading(false);
            return;
        }

        const catJson = await catRes.json();
        const colsJson = colsRes.ok ? await colsRes.json() : { items: [] };

        setCat({
            ...catJson,
            allowAll: catJson.allowAll ?? true,
            color: catJson.color ?? '#FFFFFF',
            icon: catJson.icon ?? 'IconFolderFilled',
        });
        setCollections(colsJson.items ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [id]);

    async function save() {
        if (!cat) return;
        setSaving(true);

        const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                title: cat.title,
                slug: cat.slug,
                order: cat.order,
                icon: cat.icon,
                color: cat.color,
                isHidden: Boolean(cat.isHidden),
                allowAll: Boolean(cat.allowAll),
            }),
        });

        setSaving(false);
        if (res.ok) {
            await load(); // recharge collections etc si besoin
        }
    }

    if (loading) return <div className="text-sm opacity-70">Loading…</div>;
    if (!cat) return <div className="text-sm text-red-500">Category not found.</div>;

    return (
        <>
            <AddCollection
                open={addCollectionOpen}
                onOpenChange={setAddCollectionOpen}
                categoryId={id}
                onAdded={() => {
                    // le plus safe : reload complet (ordre/infos cohérents)
                    load();
                }}
            />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit category</h1>
                    <Button onClick={save} disabled={saving} className="text-md">
                        <IconDeviceFloppy className="size-6" /> Save category
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Category</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={cat.title ?? ''} onChange={(e) => setCat({ ...cat, title: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={cat.slug ?? ''} onChange={(e) => setCat({ ...cat, slug: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Order</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={cat.order ?? 0}
                                    onChange={(e) =>
                                        setCat({
                                            ...cat,
                                            order: e.target.value === '' ? 0 : Number(e.target.value),
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <div className="flex items-center gap-3">
                                    <IconPickerDialog
                                        value={cat.icon ?? 'IconFolderFilled'}
                                        onChange={(iconName) => setCat({ ...cat, icon: iconName })}
                                        triggerLabel="Change"
                                        currentColor={cat.color ?? undefined}
                                    />

                                    <Button variant="destructive" onClick={() => setCat({ ...cat, icon: 'IconFolderFilled' })}>
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex items-center gap-3">
                                    <ColorPickerDialog
                                        value={cat.color}
                                        onChange={(color) => setCat({ ...cat, color })}
                                        triggerLabel="Change"
                                        currentIcon={cat.icon ?? 'IconFolderFilled'}
                                    />
                                    <Button variant="destructive" onClick={() => setCat({ ...cat, color: '#FFFFFF' })}>
                                        Reset
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch checked={!cat.isHidden} onCheckedChange={(v) => setCat({ ...cat, isHidden: !v })} />
                                    <Label>Visible</Label>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Collections in this category</CardTitle>
                            <div className="flex items-center gap-3">
                                <Label className="text-base">Allow &quot;All&quot; collection</Label>
                                <Switch checked={Boolean(cat.allowAll)} onCheckedChange={(v) => setCat({ ...cat, allowAll: v })} />
                                <Button onClick={() => setAddCollectionOpen(true)}>Create collection</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {collections.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No collection.</div>
                        ) : (
                            <CollectionsTable
                                collections={collections}
                                onDeleted={(collectionId) => {
                                    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
