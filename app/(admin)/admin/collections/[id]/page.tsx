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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

type PhotoEdit = {
    id: string;
    collection?: string;
    name?: string | null;
    description?: string | null;
    image?: string;
    order?: number;
    isHidden?: boolean;
    collectionId?: string;
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

    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoSaving, setPhotoSaving] = useState(false);
    const [photoDeleting, setPhotoDeleting] = useState(false);
    const [photoDraft, setPhotoDraft] = useState<PhotoEdit | null>(null);

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [pendingDeletePhotoId, setPendingDeletePhotoId] = useState<string | null>(null);

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

    useEffect(() => {
        if (!openEditorSheet || !selectedPhotoId) return;

        let cancelled = false;
        async function loadPhoto() {
            setPhotoLoading(true);
            try {
                const res = await fetch(`/api/admin/photos/${selectedPhotoId}`, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to load photo');
                const json = await res.json();
                if (!cancelled) setPhotoDraft(json);
            } catch {
                if (!cancelled) setPhotoDraft(null);
            } finally {
                if (!cancelled) setPhotoLoading(false);
            }
        }

        loadPhoto();
        return () => {
            cancelled = true;
        };
    }, [openEditorSheet, selectedPhotoId]);

    function requestDeletePhoto(photoId: string) {
        setPendingDeletePhotoId(photoId);
        setConfirmDeleteOpen(true);
    }

    async function performDeletePhoto(photoId: string) {
        setPhotoDeleting(true);
        const res = await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
        setPhotoDeleting(false);

        if (res.ok) {
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            setPhotosDirty(true);

            if (selectedPhotoId === photoId) {
                setOpenEditorSheet(false);
                setSelectedPhotoId(null);
                setPhotoDraft(null);
            }
        }
    }

    async function savePhoto() {
        if (!photoDraft) return;
        setPhotoSaving(true);

        const res = await fetch(`/api/admin/photos/${photoDraft.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                name: photoDraft.name ?? '',
                description: photoDraft.description ?? '',
                order: photoDraft.order ?? 0,
                isHidden: Boolean(photoDraft.isHidden),
                collection: photoDraft.collection ?? id, // si tu veux forcer la collection courante
            }),
        });

        setPhotoSaving(false);

        if (res.ok) {
            const updated = await res.json();
            setPhotoDraft(updated);

            // mets à jour la grille localement (name/order/isHidden si tu les affiches)
            setPhotos((prev) => {
                const next = prev.map((p: any) => (p.id === updated.id ? { ...p, ...updated } : p));
                // si order changé, on resorte pour refléter l’affichage
                next.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                return next;
            });
        }
    }

    if (loading) return <div className="text-sm opacity-70">Loading…</div>;
    if (!col) return <div className="text-sm text-red-500">Collection not found.</div>;

    const openPhotoEditor = (photoId: string) => {
        setSelectedPhotoId(photoId);
        setOpenEditorSheet(true);
    };

    return (
        <>
            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete this photo. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setPendingDeletePhotoId(null);
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                if (pendingDeletePhotoId) performDeletePhoto(pendingDeletePhotoId);
                                setPendingDeletePhotoId(null);
                            }}
                            disabled={!pendingDeletePhotoId || photoDeleting}
                        >
                            {photoDeleting ? 'Deleting…' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Sheet
                open={openEditorSheet}
                onOpenChange={(open) => {
                    setOpenEditorSheet(open);
                    if (!open) {
                        setSelectedPhotoId(null);
                        setPhotoDraft(null);
                    }
                }}
            >
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>Edit photo</SheetTitle>
                        <SheetDescription>Photo id: {selectedPhotoId ?? '—'}</SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-auto space-y-5 px-4">
                        {photoLoading ? (
                            <div className="text-sm opacity-70">Loading…</div>
                        ) : !photoDraft ? (
                            <div className="text-sm text-red-500">Photo not found.</div>
                        ) : (
                            <>
                                {/* preview */}
                                <div className="rounded-lg overflow-hidden border bg-muted aspect-square relative">
                                    <img src={getImageUrl(photoDraft)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                </div>

                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input value={photoDraft.name ?? ''} onChange={(e) => setPhotoDraft({ ...photoDraft, name: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description (HTML)</Label>
                                    <Textarea
                                        value={photoDraft.description ?? ''}
                                        onChange={(e) => setPhotoDraft({ ...photoDraft, description: e.target.value })}
                                        className="min-h-[140px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Order</Label>
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            value={photoDraft.order ?? 0}
                                            onChange={(e) =>
                                                setPhotoDraft({ ...photoDraft, order: e.target.value === '' ? 0 : Number(e.target.value) })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Visibility</Label>
                                        <div className="flex items-center gap-3 pt-2">
                                            <Switch
                                                checked={!photoDraft.isHidden}
                                                onCheckedChange={(v) => setPhotoDraft({ ...photoDraft, isHidden: !v })}
                                            />
                                            <Label>Visible</Label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* footer actions */}
                    <div className="p-4 flex items-center justify-between gap-3 border-t">
                        <Button
                            variant="destructive"
                            onClick={() => selectedPhotoId && requestDeletePhoto(selectedPhotoId)}
                            disabled={!selectedPhotoId || photoDeleting}
                        >
                            Delete
                        </Button>

                        <Button onClick={savePhoto} disabled={!photoDraft || photoSaving}>
                            Save
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">Edit collection</h1>
                    </div>

                    <Button onClick={save} disabled={saving}>
                        Save
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
                    <CardHeader>
                        <CardTitle>Photos</CardTitle>
                        <CardDescription>Drag and drop to reorder photos.</CardDescription>
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
                                onDelete={requestDeletePhoto}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
