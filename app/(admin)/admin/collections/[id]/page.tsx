'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Category = {
    id: string;
    title: string;
    slug?: string;
};

type PhotoCollection = {
    id: string;
    title: string;
    slug?: string;
    description?: string | null;
    order?: number;
    isHidden?: boolean;
    category?: string;
};

export default function AdminCollectionEditPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [col, setCol] = useState<PhotoCollection | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    async function load() {
        setLoading(true);

        const [colRes, catsRes] = await Promise.all([
            fetch(`/api/admin/collections/${id}`, { cache: 'no-store' }),
            fetch(`/api/admin/categories`, { cache: 'no-store' }),
        ]);

        if (!colRes.ok) {
            setLoading(false);
            return;
        }

        const colJson = await colRes.json();
        const catsJson = catsRes.ok ? await catsRes.json() : { items: [] };

        setCol(colJson);
        setCategories(catsJson.items ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [id]);

    async function save() {
        if (!col) return;
        setSaving(true);

        const res = await fetch(`/api/admin/collections/${id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                title: col.title,
                slug: col.slug,
                description: col.description ?? '',
                order: col.order,
                isHidden: Boolean(col.isHidden),
                category: col.category,
            }),
        });

        setSaving(false);
        if (res.ok) {
            const updated = await res.json();
            setCol(updated);
            await load();
        }
    }

    if (loading) return <div className="text-sm opacity-70">Loading…</div>;
    if (!col) return <div className="text-sm text-red-500">Collection not found.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">Edit collection</h1>
                </div>

                <Button onClick={save} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Collection</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={col.title ?? ''} onChange={(e) => setCol({ ...col, title: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={col.slug ?? ''} onChange={(e) => setCol({ ...col, slug: e.target.value })} />
                        </div>

                        <div className="space-y-2 md:col-span-3">
                            <Label>Description</Label>
                            <Textarea
                                value={col.description ?? ''}
                                onChange={(e) => setCol({ ...col, description: e.target.value })}
                                placeholder="Rich text (HTML)…"
                                className="min-h-[160px]"
                            />
                            <div className="text-xs text-muted-foreground">Stored as HTML in PocketBase.</div>
                        </div>

                        <div className="space-y-2">
                            <Label>Order</Label>
                            <Input
                                type="number"
                                inputMode="numeric"
                                value={col.order ?? 0}
                                onChange={(e) => setCol({ ...col, order: e.target.value === '' ? 0 : Number(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Category</Label>
                            <Select value={col.category ?? ''} onValueChange={(value) => setCol({ ...col, category: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Visibility</Label>
                            <div className="flex items-center gap-3 mt-2">
                                <Switch checked={!col.isHidden} onCheckedChange={(v) => setCol({ ...col, isHidden: !v })} />
                                <Label>Visible</Label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* NEXT: Photos table for this collection */}
            {/* On le fait juste après : /api/admin/photos?collectionId=... + table */}
        </div>
    );
}
