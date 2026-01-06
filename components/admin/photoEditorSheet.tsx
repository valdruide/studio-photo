'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export type PhotoEdit = {
    id: string;
    collection?: string;
    name?: string | null;
    description?: string | null;
    image?: string;
    order?: number;
    isHidden?: boolean;
    collectionId?: string; // utile pour l'URL de fichier PB
};

type PhotoEditorSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    photoId: string | null;
    collectionId: string; // id de la collection courante (fallback lors du save)

    getImageUrl: (p: { collectionId?: string; id: string; image?: string }) => string;

    onRequestDelete: (photoId: string) => void;

    // Pour que la page puisse mettre à jour sa grille sans reload complet si elle veut
    onSaved?: (updated: any) => void;
};

export function PhotoEditorSheet({ open, onOpenChange, photoId, collectionId, getImageUrl, onRequestDelete, onSaved }: PhotoEditorSheetProps) {
    const [photoLoading, setPhotoLoading] = useState(false);
    const [photoSaving, setPhotoSaving] = useState(false);
    const [photoDraft, setPhotoDraft] = useState<PhotoEdit | null>(null);

    // reset quand on ferme
    useEffect(() => {
        if (!open) {
            setPhotoDraft(null);
            setPhotoLoading(false);
            setPhotoSaving(false);
        }
    }, [open]);

    // load photo quand open + photoId
    useEffect(() => {
        if (!open || !photoId) return;

        let cancelled = false;

        async function loadPhoto() {
            setPhotoLoading(true);
            try {
                const res = await fetch(`/api/admin/photos/${photoId}`, { cache: 'no-store' });
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
    }, [open, photoId]);

    async function savePhoto() {
        if (!photoDraft) return;
        setPhotoSaving(true);

        try {
            const res = await fetch(`/api/admin/photos/${photoDraft.id}`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    name: photoDraft.name ?? '',
                    description: photoDraft.description ?? '',
                    order: photoDraft.order ?? 0,
                    isHidden: Boolean(photoDraft.isHidden),
                    collection: photoDraft.collection ?? collectionId,
                }),
            });

            if (!res.ok) return;

            const updated = await res.json();
            setPhotoDraft(updated);
            onSaved?.(updated);
        } finally {
            setPhotoSaving(false);
        }
    }

    const selectedId = photoId ?? null;

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) setPhotoDraft(null);
            }}
        >
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>Edit photo</SheetTitle>
                    <SheetDescription>Photo id: {selectedId ?? '—'}</SheetDescription>
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
                                            setPhotoDraft({
                                                ...photoDraft,
                                                order: e.target.value === '' ? 0 : Number(e.target.value),
                                            })
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
                    <Button variant="destructive" onClick={() => selectedId && onRequestDelete(selectedId)} disabled={!selectedId}>
                        Delete
                    </Button>

                    <Button onClick={savePhoto} disabled={!photoDraft || photoSaving}>
                        Save
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
