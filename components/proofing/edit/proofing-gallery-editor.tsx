'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ProofingGallery, ProofingGalleryPhoto } from '@/lib/proofing/getProofingGalleries';
import { cn } from '@/lib/utils';
import { ArrowLeft, Check, FileText, ImagePlus, Images, Loader2, MessageCircle, Save, Search, Trash2, X } from 'lucide-react';

type ProofingGalleryEditorProps = {
    gallery: ProofingGallery;
    photos: ProofingGalleryPhoto[];
};

type FilterKey = 'all' | 'selected' | 'notSelected' | 'withNotes' | 'withoutNotes';

const STATUSES: ProofingGallery['status'][] = ['draft', 'active', 'validated', 'expired', 'archived'];

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: { nativeEvent?: Event }) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;
                if (target.closest('[data-no-dnd]')) return false;
                if (target.closest('button, a, input, textarea, select, [role="menuitem"]')) return false;
                return true;
            },
        },
    ];
}

export function ProofingGalleryEditor({ gallery, photos: initialPhotos }: ProofingGalleryEditorProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const sensors = useSensors(useSensor(SmartPointerSensor));
    const [dndReady, setDndReady] = useState(false);
    const [draft, setDraft] = useState({ ...gallery, password: '' });
    const [photos, setPhotos] = useState(initialPhotos);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notePhoto, setNotePhoto] = useState<ProofingGalleryPhoto | null>(null);

    const counts = useMemo(
        () => ({
            all: photos.length,
            selected: photos.filter((photo) => photo.isSelected).length,
            notSelected: photos.filter((photo) => !photo.isSelected).length,
            withNotes: photos.filter((photo) => photo.clientNote.trim()).length,
            withoutNotes: photos.filter((photo) => !photo.clientNote.trim()).length,
        }),
        [photos],
    );

    const filteredPhotos = useMemo(() => {
        return photos.filter((photo) => {
            const filenameMatch = photo.photo.toLowerCase().includes(search.trim().toLowerCase());
            if (search.trim() && !filenameMatch) return false;
            if (filter === 'selected') return photo.isSelected;
            if (filter === 'notSelected') return !photo.isSelected;
            if (filter === 'withNotes') return Boolean(photo.clientNote.trim());
            if (filter === 'withoutNotes') return !photo.clientNote.trim();
            return true;
        });
    }, [filter, photos, search]);

    useEffect(() => {
        setDndReady(true);
    }, []);

    async function saveGallery() {
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/proofing/galleries/${gallery.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: draft.title,
                    clientName: draft.clientName,
                    clientEmail: draft.clientEmail,
                    accessKey: draft.accessKey,
                    password: draft.password || undefined,
                    selectionLimit: draft.selectionLimit,
                    expiresAt: draft.expiresAt,
                    status: draft.status,
                    notes: draft.notes,
                }),
            });

            if (!response.ok) {
                const message = await response.text().catch(() => '');
                toast.error(message || 'Failed to save gallery');
                return;
            }

            const updated = await response.json();
            setDraft({ ...updated, password: '' });
            toast.success('Gallery saved');
            router.refresh();
        } finally {
            setSaving(false);
        }
    }

    async function uploadFiles(files: File[]) {
        const imageFiles = files.filter((file) => file.type.startsWith('image/'));
        if (!imageFiles.length) return;

        setUploading(true);
        try {
            const form = new FormData();
            for (const file of imageFiles) form.append('files', file);

            const response = await fetch(`/api/admin/proofing/galleries/${gallery.id}/photos`, {
                method: 'POST',
                body: form,
            });

            if (!response.ok) {
                const message = await response.text().catch(() => '');
                toast.error(message || 'Upload failed');
                return;
            }

            const json = await response.json();
            const added: ProofingGalleryPhoto[] = json.items ?? [];
            setPhotos((current) => [...current, ...added].sort((a, b) => a.order - b.order));
            toast.success(`${added.length} photo${added.length > 1 ? 's' : ''} added`);
            router.refresh();
        } finally {
            setUploading(false);
        }
    }

    async function deletePhoto(photoId: string) {
        const previous = photos;
        setPhotos((current) => current.filter((photo) => photo.id !== photoId));

        const response = await fetch(`/api/admin/proofing/gallery-photos/${photoId}`, { method: 'DELETE' });
        if (!response.ok) {
            setPhotos(previous);
            toast.error('Failed to delete photo');
            return;
        }

        toast.success('Photo deleted');
        router.refresh();
    }

    async function reorderPhotos(next: ProofingGalleryPhoto[]) {
        const previous = photos;
        setPhotos(next);

        const response = await fetch(`/api/admin/proofing/galleries/${gallery.id}/photos`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                updates: next.map((photo) => ({
                    id: photo.id,
                    order: photo.order,
                })),
            }),
        });

        if (!response.ok) {
            setPhotos(previous);
            toast.error('Failed to reorder photos');
            return;
        }

        router.refresh();
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = filteredPhotos.findIndex((photo) => photo.id === active.id);
        const newIndex = filteredPhotos.findIndex((photo) => photo.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const movedVisible = arrayMove(filteredPhotos, oldIndex, newIndex);
        const visibleIds = new Set(filteredPhotos.map((photo) => photo.id));
        let visibleIndex = 0;
        const moved = photos.map((photo) => {
            if (!visibleIds.has(photo.id)) return photo;
            const nextPhoto = movedVisible[visibleIndex] ?? photo;
            visibleIndex++;
            return nextPhoto;
        });
        const next = moved.map((photo, index) => ({ ...photo, order: index + 1 }));
        reorderPhotos(next);
    }

    const filterItems: { key: FilterKey; label: string; icon: React.ReactNode; count: number }[] = [
        { key: 'all', label: 'All photos', icon: <Images className="size-4" />, count: counts.all },
        { key: 'selected', label: 'Selected', icon: <Check className="size-4" />, count: counts.selected },
        { key: 'notSelected', label: 'Not selected', icon: <X className="size-4" />, count: counts.notSelected },
        { key: 'withNotes', label: 'With notes', icon: <MessageCircle className="size-4" />, count: counts.withNotes },
        { key: 'withoutNotes', label: 'Without notes', icon: <FileText className="size-4" />, count: counts.withoutNotes },
    ];

    return (
        <div className="min-h-screen">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r bg-sidebar lg:flex lg:flex-col">
                    <div className="border-b p-4">
                        <Button asChild variant="outline">
                            <Link href="/proofing/galleries" className="mb-4 inline-flex items-center gap-2 text-sm">
                                <ArrowLeft className="size-4" />
                                Galleries
                            </Link>
                        </Button>
                        <h1 className="truncate text-xl text-primary font-semibold">{draft.title}</h1>
                    </div>

                    <div className="space-y-6 overflow-auto p-4">
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-white">Status</h2>
                            <div className="space-y-2">
                                {filterItems.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setFilter(item.key)}
                                        className={[
                                            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition',
                                            filter === item.key
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:bg-sidebar-accent',
                                        ].join(' ')}
                                    >
                                        <span className="flex items-center gap-2">
                                            {item.icon}
                                            {item.label}
                                        </span>
                                        <span className="text-xs">{item.count}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold">Gallery Info</h2>
                            <InfoLine label="Client" value={draft.clientName || 'No client'} />
                            <InfoLine label="Email" value={draft.clientEmail || 'No email'} />
                            <InfoLine label="Selection limit" value={String(draft.selectionLimit)} />
                        </section>
                    </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-sidebar px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="relative w-72 max-w-[60vw]">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={`Search ${photos.length} assets`}
                                    className="pl-9"
                                />
                            </div>
                            <Badge>{filteredPhotos.length} shown</Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                    uploadFiles(Array.from(event.target.files ?? []));
                                    event.currentTarget.value = '';
                                }}
                            />
                            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                                Add photos
                            </Button>
                            <Button type="button" onClick={saveGallery} disabled={saving}>
                                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Save
                            </Button>
                        </div>
                    </header>

                    <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[1fr_360px]">
                        <section
                            className="min-h-0 overflow-auto p-5"
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                uploadFiles(Array.from(event.dataTransfer.files ?? []));
                            }}
                        >
                            {filteredPhotos.length ? (
                                dndReady ? (
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={onDragEnd}
                                        modifiers={[restrictToParentElement]}
                                    >
                                        <SortableContext items={filteredPhotos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
                                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                                {filteredPhotos.map((photo) => (
                                                    <PhotoTile key={photo.id} photo={photo} onDelete={deletePhoto} onOpenNote={setNotePhoto} />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                        {filteredPhotos.map((photo) => (
                                            <StaticPhotoTile key={photo.id} photo={photo} onDelete={deletePhoto} onOpenNote={setNotePhoto} />
                                        ))}
                                    </div>
                                )
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex min-h-96 w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-white/15 bg-white/[0.02] text-slate-400 hover:bg-white/[0.04]"
                                >
                                    <ImagePlus className="size-8" />
                                    <span className="text-sm">
                                        {photos.length ? 'No photos match this filter.' : 'Drop photos here or click to upload.'}
                                    </span>
                                </button>
                            )}
                        </section>

                        <aside className="border-t bg-sidebar p-4 xl:border-l xl:border-t-0">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Title</Label>
                                    <Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Client name</Label>
                                    <Input value={draft.clientName} onChange={(event) => setDraft({ ...draft, clientName: event.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Client email</Label>
                                    <Input value={draft.clientEmail} onChange={(event) => setDraft({ ...draft, clientEmail: event.target.value })} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Access key</Label>
                                    <Input value={draft.accessKey} onChange={(event) => setDraft({ ...draft, accessKey: event.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label>Limit</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={draft.selectionLimit}
                                            onChange={(event) => setDraft({ ...draft, selectionLimit: Number(event.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={draft.status}
                                            onValueChange={(value) => setDraft({ ...draft, status: value as ProofingGallery['status'] })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map((status) => (
                                                    <SelectItem key={status} value={status} className="capitalize">
                                                        {status}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Expires at</Label>
                                    <Input
                                        type="date"
                                        value={draft.expiresAt?.slice(0, 10) ?? ''}
                                        onChange={(event) => setDraft({ ...draft, expiresAt: event.target.value || null })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>New password</Label>
                                    <Input
                                        type="password"
                                        value={draft.password}
                                        placeholder={draft.hasPassword ? 'Leave empty to keep current password' : 'Optional'}
                                        onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Notes</Label>
                                    <Textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={5} />
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
            <ClientNoteDialog photo={notePhoto} onOpenChange={(open) => !open && setNotePhoto(null)} />
        </div>
    );
}

function InfoLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md bg-sidebar-accent p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="truncate text-sm text-sidebar-accent-foreground">{value}</p>
        </div>
    );
}

function ClientNoteDialog({ photo, onOpenChange }: { photo: ProofingGalleryPhoto | null; onOpenChange: (open: boolean) => void }) {
    return (
        <AlertDialog open={Boolean(photo)} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Client note</AlertDialogTitle>
                    <AlertDialogDescription>{photo?.photo || 'Gallery photo'}</AlertDialogDescription>
                </AlertDialogHeader>
                <div className="px-4 mb-4">
                    <div className="rounded-md border bg-muted/40 p-4 text-sm whitespace-pre-wrap">{photo?.clientNote.trim() || 'No note.'}</div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction>Close</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function PhotoTileContent({
    photo,
    onDelete,
    onOpenNote,
}: {
    photo: ProofingGalleryPhoto;
    onDelete: (photoId: string) => void;
    onOpenNote: (photo: ProofingGalleryPhoto) => void;
}) {
    return (
        <div className="relative aspect-square overflow-hidden rounded-md bg-[#1d2230]">
            <img src={photo.photoThumbUrl || photo.photoUrl} alt={photo.photo || 'Gallery photo'} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-xs text-white">{photo.photo}</p>
            </div>
            <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                {photo.isSelected ? <Badge className="bg-emerald-500 text-white">Selected</Badge> : null}
                {photo.clientNote.trim() ? (
                    <button type="button" data-no-dnd onClick={() => onOpenNote(photo)} className="cursor-pointer">
                        <Badge className="bg-amber-400 text-black transition hover:bg-amber-300">Note</Badge>
                    </button>
                ) : null}
            </div>
            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <Button type="button" size="icon" variant="destructive" className="size-8" data-no-dnd onClick={() => onDelete(photo.id)}>
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    );
}

function StaticPhotoTile({
    photo,
    onDelete,
    onOpenNote,
}: {
    photo: ProofingGalleryPhoto;
    onDelete: (photoId: string) => void;
    onOpenNote: (photo: ProofingGalleryPhoto) => void;
}) {
    return (
        <div className="group relative">
            <PhotoTileContent photo={photo} onDelete={onDelete} onOpenNote={onOpenNote} />
        </div>
    );
}

function PhotoTile({
    photo,
    onDelete,
    onOpenNote,
}: {
    photo: ProofingGalleryPhoto;
    onDelete: (photoId: string) => void;
    onOpenNote: (photo: ProofingGalleryPhoto) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('group relative cursor-grab', isDragging && 'z-10 cursor-grabbing')}
            {...attributes}
            {...listeners}
        >
            <PhotoTileContent photo={photo} onDelete={onDelete} onOpenNote={onOpenNote} />
        </div>
    );
}
