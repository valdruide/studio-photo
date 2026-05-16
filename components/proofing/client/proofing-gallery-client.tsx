'use client';

import { useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LightboxCarousel, type LightboxCarouselItem } from '@/components/lightbox-carousel';
import type { ProofingGallery, ProofingGalleryPhoto } from '@/lib/proofing/getProofingGalleries';
import { Check, FileText, Images, Loader2, LockKeyhole, MessageCircle, Minus, Plus, Search, Send, X } from 'lucide-react';

type ProofingGalleryClientProps = {
    gallery: ProofingGallery;
    photos: ProofingGalleryPhoto[];
};

type FilterKey = 'all' | 'selected' | 'notSelected' | 'withNotes' | 'withoutNotes';
type ProofingLightboxItem = ProofingGalleryPhoto & LightboxCarouselItem;

export function ProofingGalleryClient({ gallery: initialGallery, photos: initialPhotos }: ProofingGalleryClientProps) {
    const router = useRouter();
    const [gallery, setGallery] = useState(initialGallery);
    const [photos, setPhotos] = useState(initialPhotos);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
    const [validating, setValidating] = useState(false);
    const [savingPhotoId, setSavingPhotoId] = useState<string | null>(null);

    const selectedCount = photos.filter((photo) => photo.isSelected).length;
    const selectedPhotos = photos.filter((photo) => photo.isSelected);
    const selectionLimitReached = selectedCount >= gallery.selectionLimit;
    const isValidated = gallery.status === 'validated';

    const counts = useMemo(
        () => ({
            all: photos.length,
            selected: selectedCount,
            notSelected: photos.filter((photo) => !photo.isSelected).length,
            withNotes: photos.filter((photo) => photo.clientNote.trim()).length,
            withoutNotes: photos.filter((photo) => !photo.clientNote.trim()).length,
        }),
        [photos, selectedCount],
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

    const lightboxItems = useMemo<ProofingLightboxItem[]>(
        () =>
            photos.map((photo) => ({
                ...photo,
                name: photo.photo || 'Gallery photo',
            })),
        [photos],
    );

    const activeIndex = useMemo(() => {
        if (!activePhotoId) return 0;
        const index = lightboxItems.findIndex((photo) => photo.id === activePhotoId);
        return index >= 0 ? index : 0;
    }, [activePhotoId, lightboxItems]);

    async function updatePhoto(photo: ProofingGalleryPhoto, update: { isSelected?: boolean; clientNote?: string }) {
        const previous = photos;
        setSavingPhotoId(photo.id);

        setPhotos((current) =>
            current.map((item) =>
                item.id === photo.id
                    ? {
                          ...item,
                          isSelected: update.isSelected ?? item.isSelected,
                          clientNote: update.clientNote ?? item.clientNote,
                      }
                    : item,
            ),
        );

        const response = await fetch(`/api/public/proofing/galleries/${gallery.accessKey}/photos/${photo.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update),
        });

        setSavingPhotoId(null);

        if (!response.ok) {
            setPhotos(previous);
            if (response.status === 409) toast.error('Selection limit reached');
            else toast.error('Photo update failed');
            return;
        }

        const updated: ProofingGalleryPhoto = await response.json();
        setPhotos((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    }

    function toggleSelected(photo: ProofingGalleryPhoto) {
        if (!photo.isSelected && selectionLimitReached) {
            toast.error('Selection limit reached');
            return;
        }

        updatePhoto(photo, { isSelected: !photo.isSelected });
    }

    function openPhoto(photoId: string) {
        setActivePhotoId(photoId);
        setLightboxOpen(true);
    }

    useEffect(() => {
        if (!lightboxOpen || !lightboxItems.length) return;

        const previous = lightboxItems[activeIndex === 0 ? lightboxItems.length - 1 : activeIndex - 1];
        const next = lightboxItems[activeIndex === lightboxItems.length - 1 ? 0 : activeIndex + 1];

        for (const photo of [previous, next]) {
            if (!photo?.srcOriginal) continue;
            const image = new window.Image();
            image.src = photo.srcOriginal;
        }
    }, [activeIndex, lightboxItems, lightboxOpen]);

    async function validateGallery() {
        setValidating(true);

        const response = await fetch(`/api/public/proofing/galleries/${gallery.accessKey}/validate`, {
            method: 'POST',
        });

        setValidating(false);

        if (!response.ok) {
            toast.error('Gallery validation failed');
            return;
        }

        const updated: ProofingGallery = await response.json();
        setGallery(updated);
        setDrawerOpen(false);
        toast.success('Gallery validated');
        router.refresh();
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
                        <h1 className="truncate text-xl font-semibold text-primary">{gallery.title}</h1>
                        <p className="mt-1 truncate text-sm text-muted-foreground">{gallery.clientName || gallery.clientEmail}</p>
                    </div>

                    <div className="space-y-6 overflow-auto p-4">
                        <section>
                            <h2 className="mb-3 text-sm font-semibold text-sidebar-foreground">Status</h2>
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
                            <h2 className="text-sm font-semibold">Selection</h2>
                            <div className="rounded-md bg-sidebar-accent p-3">
                                <p className="text-xs text-muted-foreground">Selected photos</p>
                                <p className="text-lg font-semibold text-sidebar-accent-foreground">
                                    {selectedCount}/{gallery.selectionLimit}
                                </p>
                            </div>
                            {isValidated ? <Badge className="bg-emerald-500 text-black text-md px-3">Validated</Badge> : null}
                        </section>
                    </div>
                </aside>

                <main className="flex min-w-0 flex-1 flex-col">
                    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-sidebar px-4 py-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <div className="relative w-72 max-w-[70vw]">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={`Search ${photos.length} photos`}
                                    className="pl-9"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 lg:hidden">
                                {filterItems.map((item) => (
                                    <Button
                                        key={item.key}
                                        type="button"
                                        variant={filter === item.key ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilter(item.key)}
                                    >
                                        {item.icon}
                                        {item.count}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="button" variant="secondary" onClick={() => setDrawerOpen(true)}>
                                <Images className="size-4" />
                                Selection
                            </Button>
                            <Button type="button" onClick={validateGallery} disabled={validating || isValidated}>
                                {validating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                {isValidated ? 'Validated' : 'Validate'}
                            </Button>
                        </div>
                    </header>

                    <section className="min-h-0 flex-1 overflow-auto p-5">
                        {filteredPhotos.length ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                                {filteredPhotos.map((photo) => (
                                    <ClientPhotoTile
                                        key={photo.id}
                                        photo={photo}
                                        saving={savingPhotoId === photo.id}
                                        selectionLimitReached={selectionLimitReached}
                                        onOpen={openPhoto}
                                        onToggleSelected={toggleSelected}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-96 w-full items-center justify-center rounded-md border border-dashed border-white/15 text-sm text-muted-foreground">
                                No photos match this filter.
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <SelectionDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                selectedPhotos={selectedPhotos}
                selectedCount={selectedCount}
                selectionLimit={gallery.selectionLimit}
                validating={validating}
                isValidated={isValidated}
                savingPhotoId={savingPhotoId}
                onOpenPhoto={(photoId) => {
                    setDrawerOpen(false);
                    openPhoto(photoId);
                }}
                onToggleSelected={toggleSelected}
                onValidate={validateGallery}
            />

            <LightboxCarousel
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
                items={lightboxItems}
                activeId={activePhotoId}
                onActiveIdChange={setActivePhotoId}
                renderDetails={(photo) => {
                    const saving = savingPhotoId === photo.id;
                    const selectDisabled = !photo.isSelected && selectionLimitReached;

                    return (
                        <div className="space-y-4 mt-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant={photo.isSelected ? 'destructive' : 'secondary'}
                                    disabled={saving || selectDisabled}
                                    onClick={() => toggleSelected(photo)}
                                >
                                    {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                                    {photo.isSelected ? <Minus className="size-4" /> : <Check className="size-4" />}
                                    {photo.isSelected ? 'Deselect' : 'Select'}
                                </Button>
                            </div>
                            <Textarea
                                value={photo.clientNote}
                                onChange={(event) => {
                                    const clientNote = event.target.value;
                                    setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, clientNote } : item)));
                                }}
                                onBlur={(event) => updatePhoto(photo, { clientNote: event.target.value })}
                                placeholder="Client note"
                                className="w-[400px] min-h-32"
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
}

function ClientPhotoTile({
    photo,
    saving,
    selectionLimitReached,
    onOpen,
    onToggleSelected,
}: {
    photo: ProofingGalleryPhoto;
    saving: boolean;
    selectionLimitReached: boolean;
    onOpen: (photoId: string) => void;
    onToggleSelected: (photo: ProofingGalleryPhoto) => void;
}) {
    const selectDisabled = !photo.isSelected && selectionLimitReached;

    return (
        <article className="overflow-hidden rounded-md border bg-card relative group">
            <div
                role="button"
                tabIndex={0}
                className="group relative block aspect-square w-full cursor-pointer overflow-hidden bg-[#1d2230]"
                onClick={() => onOpen(photo.id)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onOpen(photo.id);
                    }
                }}
            >
                <img src={photo.photoThumbUrl || photo.photoUrl} alt={photo.photo || 'Gallery photo'} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                    <p className="truncate text-xs text-white">{photo.photo}</p>
                </div>
                <div className="absolute left-2 top-2 flex flex-wrap gap-2">
                    {photo.isSelected ? (
                        <Badge variant="secondary" className="border! border-border">
                            Selected
                        </Badge>
                    ) : null}
                    {photo.clientNote.trim() ? (
                        <Badge variant="secondary" className="bg-amber-400 text-black border! border-border">
                            Note
                        </Badge>
                    ) : null}
                </div>
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
                    <Button
                        type="button"
                        size="icon"
                        variant={photo.isSelected ? 'destructive' : 'secondary'}
                        disabled={saving || selectDisabled}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleSelected(photo);
                        }}
                        className="border"
                    >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                        {photo.isSelected ? <Minus className="size-4" /> : <Check className="size-4" />}
                    </Button>
                </div>
            </div>
        </article>
    );
}

function SelectionDrawer({
    open,
    onOpenChange,
    selectedPhotos,
    selectedCount,
    selectionLimit,
    validating,
    isValidated,
    savingPhotoId,
    onOpenPhoto,
    onToggleSelected,
    onValidate,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedPhotos: ProofingGalleryPhoto[];
    selectedCount: number;
    selectionLimit: number;
    validating: boolean;
    isValidated: boolean;
    savingPhotoId: string | null;
    onOpenPhoto: (photoId: string) => void;
    onToggleSelected: (photo: ProofingGalleryPhoto) => void;
    onValidate: () => void;
}) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
            <DrawerContent className="md:px-20 lg:px-32 xl:px-46 2xl:px-60">
                <DrawerHeader>
                    <DrawerTitle>Selected photos</DrawerTitle>
                    <DrawerDescription>
                        {selectedCount}/{selectionLimit} photos selected
                    </DrawerDescription>
                </DrawerHeader>

                <div className="grid max-h-[46vh] lg:max-w-[80%] mx-auto grid-cols-2 gap-3 overflow-auto sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
                    {selectedPhotos.length ? (
                        selectedPhotos.map((photo) => (
                            <div key={photo.id} className="overflow-hidden rounded-md border bg-card group">
                                <div className="block aspect-square relative w-full overflow-hidden bg-muted cursor-pointer">
                                    <div className="aspect-square" onClick={() => onOpenPhoto(photo.id)}>
                                        <img
                                            src={photo.photoThumbUrl || photo.photoUrl}
                                            alt={photo.photo || 'Selected photo'}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                                        <p className="truncate text-xs text-white">{photo.photo}</p>
                                    </div>
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            disabled={savingPhotoId === photo.id}
                                            onClick={() => onToggleSelected(photo)}
                                        >
                                            {savingPhotoId === photo.id ? <Loader2 className="size-4 animate-spin" /> : <Minus className="size-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                            No selected photos.
                        </div>
                    )}
                    {/* while max selected photos is not reached -> add a blank square to indicate available slots */}
                    {selectedCount < selectionLimit ? (
                        <>
                            {Array.from({ length: selectionLimit - selectedCount }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex aspect-square items-center justify-center rounded-md border border-dashed text-muted-foreground"
                                >
                                    <Plus className="size-5" />
                                </div>
                            ))}
                        </>
                    ) : null}
                </div>

                <DrawerFooter className="max-w-sm mx-auto">
                    <Button type="button" onClick={onValidate} disabled={validating || isValidated} size="lg">
                        {validating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                        {isValidated ? 'Validated' : 'Validate gallery'}
                    </Button>
                    <DrawerClose asChild>
                        <Button type="button" variant="outline" size="lg">
                            Close
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export function ProofingGalleryUnlock({ accessKey, title }: { accessKey: string; title: string }) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    async function unlockGallery() {
        setUnlocking(true);

        const response = await fetch(`/api/public/proofing/galleries/${accessKey}/unlock`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });

        setUnlocking(false);

        if (!response.ok) {
            toast.error('Wrong password');
            return;
        }

        toast.success('Access granted');
        setPassword('');
        router.refresh();
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md rounded-md border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <LockKeyhole className="size-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold text-primary">{title}</h1>
                        <p className="text-sm text-muted-foreground">Protected gallery</p>
                    </div>
                </div>
                <div className="space-y-3">
                    <Input
                        type="password"
                        value={password}
                        placeholder="Password"
                        onChange={(event) => setPassword(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && password.trim() && !unlocking) unlockGallery();
                        }}
                    />
                    <Button type="button" className="w-full" onClick={unlockGallery} disabled={unlocking || !password.trim()}>
                        {unlocking ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
                        Enter
                    </Button>
                </div>
            </div>
        </main>
    );
}
