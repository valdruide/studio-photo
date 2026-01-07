'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotosGrid, type Photo } from '@/components/admin/photosGrid';
import { AddPhotos } from '@/components/admin/addPhotos';
import { PhotoEditorSheet } from '@/components/admin/photoEditorSheet';
import { useDeletePhotoDialog } from '@/components/admin/deletePhotoDialog';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

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

    const [photos, setPhotos] = useState<Photo[]>([]);
    const [photosDirty, setPhotosDirty] = useState(false);

    const [openEditorSheet, setOpenEditorSheet] = useState(false);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

    const [addPhotosOpen, setAddPhotosOpen] = useState(false);

    const PB_URL = (process.env.NEXT_PUBLIC_PB_URL ?? '').replace(/\/$/, '');

    function getImageUrl(p: any) {
        // PocketBase: /api/files/{collectionId}/{recordId}/{filename}
        return `${PB_URL}/api/files/${p.collectionId}/${p.id}/${p.image}`;
    }

    async function load() {
        setLoading(true);

        const [colRes, catsRes, photosRes] = await Promise.all([
            fetch(`/api/admin/collections/${id}`, { cache: 'no-store' }),
            fetch(`/api/admin/categories`, { cache: 'no-store' }),
            fetch(`/api/admin/photos?collectionId=${id}`, { cache: 'no-store' }),
        ]);

        if (!colRes.ok) {
            setLoading(false);
            return;
        }

        const colJson = await colRes.json();
        const catsJson = catsRes.ok ? await catsRes.json() : { items: [] };
        const photosJson = photosRes.ok ? await photosRes.json() : { items: [] };
        setPhotos(photosJson.items ?? []);
        setPhotosDirty(false);

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

            if (photosDirty) {
                await fetch('/api/admin/photos', {
                    method: 'PATCH',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        updates: photos.map((p, index) => ({
                            id: p.id,
                            order: index + 1,
                        })),
                    }),
                });
            }

            await load();
        }
    }

    const deleteDialog = useDeletePhotoDialog({
        onDelete: async (photoId: string) => {
            const res = await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
            if (!res.ok) return;

            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            setPhotosDirty(true);

            if (selectedPhotoId === photoId) {
                setOpenEditorSheet(false);
                setSelectedPhotoId(null);
            }
        },
    });

    if (loading) return <div className="text-sm opacity-70">Loading…</div>;
    if (!col) return <div className="text-sm text-red-500">Collection not found.</div>;

    const openPhotoEditor = (photoId: string) => {
        setSelectedPhotoId(photoId);
        setOpenEditorSheet(true);
    };

    return (
        <>
            {deleteDialog.dialog}

            <AddPhotos
                open={addPhotosOpen}
                onOpenChange={setAddPhotosOpen}
                collectionId={id}
                onAdded={() => {
                    // le plus safe : reload complet (ordre/infos cohérents)
                    load();
                }}
            />

            <PhotoEditorSheet
                open={openEditorSheet}
                onOpenChange={(open) => {
                    setOpenEditorSheet(open);
                    if (!open) setSelectedPhotoId(null);
                }}
                photoId={selectedPhotoId}
                collectionId={id}
                getImageUrl={getImageUrl}
                onRequestDelete={(photoId) => deleteDialog.request(photoId)}
                onSaved={(updated) => {
                    setPhotos((prev: any[]) => {
                        const next = prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p));
                        next.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                        return next;
                    });
                }}
            />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Edit collection</h1>
                    </div>

                    <Button onClick={save} disabled={saving}>
                        <IconDeviceFloppy className="size-6" /> Save collection
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

                            <div className="space-y-2">
                                <Label>Order</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={col.order ?? 0}
                                    onChange={(e) => setCol({ ...col, order: e.target.value === '' ? 0 : Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label>Description</Label>
                                <Textarea
                                    value={col.description ?? ''}
                                    onChange={(e) => setCol({ ...col, description: e.target.value })}
                                    placeholder="Rich text (HTML)…"
                                    className="min-h-[160px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch checked={!col.isHidden} onCheckedChange={(v) => setCol({ ...col, isHidden: !v })} />
                                    <Label>Visible</Label>
                                </div>
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
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex justify-between gap-5">
                        <div className="space-y-2">
                            <CardTitle>Photos</CardTitle>
                            <CardDescription>
                                ℹ️ Drag and drop to reorder photos. <br />
                                ⚠️ Don't forget to save the collection after making changes!
                            </CardDescription>
                        </div>
                        <Button onClick={() => setAddPhotosOpen(true)}>
                            <IconPlus className="size-5" />
                            Add photos
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {photos.length === 0 ? (
                            <div className="text-sm opacity-70">No photos.</div>
                        ) : (
                            <PhotosGrid
                                photos={photos}
                                getImageUrl={getImageUrl}
                                onReorder={(next) => {
                                    setPhotos(next);
                                    setPhotosDirty(true);
                                }}
                                onEdit={openPhotoEditor}
                                onDelete={(photoId) => deleteDialog.request(photoId)}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
