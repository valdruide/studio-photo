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
import { RefreshCcw, Save, EyeIcon, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

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
    lockedByPassword?: boolean;
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

    const [generatePasswordOpen, setGeneratePasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newGeneratedPassword, setNewGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

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
                lockedByPassword: Boolean(col.lockedByPassword),
                password: newPassword || undefined,
                category: col.category,
            }),
        });

        setSaving(false);
        if (res.ok) {
            const updated = await res.json();
            setCol(updated);
            setNewPassword('');

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

            toast.success('Collection saved successfully');
            await load();
        } else {
            const errorText = await res.text();
            toast.error(`Failed to save collection: ${res.status} ${errorText}`);
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

    const handleGeneratePassword = () => {
        const generatedPassword = Array.from({ length: 5 }, () => Math.random().toString(36).substring(2, 8)).join('-');
        setNewGeneratedPassword(generatedPassword);
        toast.info('New password generated. Click "Apply and copy to clipboard" to use it.');
    };
    const handleSaveGeneratedPassword = () => {
        setNewPassword(newGeneratedPassword);
        navigator.clipboard.writeText(newGeneratedPassword);
        toast.success('New password generated and copied to clipboard');
    };

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
            <div className="space-y-5">
                <Card>
                    <CardHeader className="flex justify-between">
                        <div className="space-y-2">
                            <CardTitle>Collection</CardTitle>
                            <CardDescription>Edit the collection details, manage photos and visual settings</CardDescription>
                        </div>
                        <Button onClick={save} disabled={saving}>
                            <IconDeviceFloppy className="size-5" /> Save collection
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={col.title ?? ''} onChange={(e) => setCol({ ...col, title: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={col.slug ?? ''} onChange={(e) => setCol({ ...col, slug: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={col.category ?? ''} onValueChange={(value) => setCol({ ...col, category: value })}>
                                    <SelectTrigger className="w-full">
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
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch checked={!col.isHidden} onCheckedChange={(v) => setCol({ ...col, isHidden: !v })} />
                                    <Label>Visible</Label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Locked by password</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch
                                        checked={Boolean(col.lockedByPassword)}
                                        onCheckedChange={(v) => setCol({ ...col, lockedByPassword: v })}
                                    />
                                    <Label>Yes</Label>
                                </div>
                            </div>

                            {col.lockedByPassword && (
                                <div className="space-y-2">
                                    <Label>New password</Label>
                                    <div className="flex gap-1">
                                        <Input
                                            className="w-52!"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <Button variant="outline" size="icon" onClick={() => setShowPassword((v) => !v)}>
                                            {showPassword ? <EyeOff className="size-4" /> : <EyeIcon className="size-4" />}
                                        </Button>
                                        <Dialog open={generatePasswordOpen} onOpenChange={setGeneratePasswordOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="text-xs">
                                                    <RefreshCcw className="size-5" />
                                                    Generate
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader className="p-4">
                                                    <DialogTitle>Generate new password</DialogTitle>
                                                    <DialogDescription>Generate a new random password for this category</DialogDescription>
                                                </DialogHeader>
                                                <div className="flex items-center gap-2 mt-5 px-4">
                                                    <Input
                                                        type={showGeneratedPassword ? 'text' : 'password'}
                                                        value={newGeneratedPassword}
                                                        readOnly
                                                        className="font-mono tracking-wide"
                                                    />
                                                    <Button variant="outline" size="icon" onClick={() => setShowGeneratedPassword((v) => !v)}>
                                                        {showGeneratedPassword ? <EyeOff className="size-4" /> : <EyeIcon className="size-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            handleGeneratePassword();
                                                        }}
                                                    >
                                                        <RefreshCcw className="size-4" />
                                                        Generate
                                                    </Button>
                                                </div>
                                                <DialogFooter className="bg-secondary/40 mt-5 border-t py-2 px-4">
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                    </DialogClose>
                                                    <Button
                                                        onClick={() => {
                                                            handleSaveGeneratedPassword();
                                                            setGeneratePasswordOpen(false);
                                                        }}
                                                    >
                                                        <Save className="size-4" />
                                                        Apply and copy to clipboard
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 md:col-span-3 lg:col-span-6">
                            <Label>Description</Label>
                            <Textarea
                                value={col.description ?? ''}
                                onChange={(e) => setCol({ ...col, description: e.target.value })}
                                placeholder="Rich text (HTML)…"
                                className="min-h-[160px]"
                            />
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
