'use client';

import * as React from 'react';
import Image from 'next/image';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconDots } from '@tabler/icons-react';
import { EyeOff, MoveRight, Pencil, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: { nativeEvent: PointerEvent }) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;

                // si on clique dans une zone interactive, on bloque le drag
                if (target.closest('[data-no-dnd]')) return false;

                // boutons/inputs aussi (au cas où)
                if (target.closest('button, a, input, textarea, select, [role="menuitem"]')) return false;

                return true;
            },
        },
    ];
}

export type Photo = {
    id: string;
    image: string;
    order?: number;
    isHidden?: boolean;
    isFeatured?: boolean;
    featuredOrder?: number | null;
    collectionId?: string;
};

type MoveCollection = {
    id: string;
    title?: string;
};

type MoveCategory = {
    id: string;
    title?: string;
};

function SortableCard({
    photo,
    src,
    onEdit,
    onDelete,
    onMove,
    onToggleFeatured,
    featuredDisabled,
}: {
    photo: Photo;
    src: string;
    onEdit?: (photoId: string) => void;
    onDelete?: (photoId: string) => void;
    onMove?: (photo: Photo) => void;
    onToggleFeatured?: (photo: Photo) => void;
    featuredDisabled?: boolean;
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
            className={cn('relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-grab z-5', isDragging && 'cursor-grabbing z-10 ')}
            {...attributes}
            {...listeners}
        >
            <Image src={src} alt="photo" fill className="object-cover" sizes="200px" unoptimized />
            {photo.isHidden && (
                <div className="absolute inset-0 bg-black/60 flex justify-center items-center">
                    <EyeOff className="mx-auto text-white/90 size-12" />
                </div>
            )}

            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex justify-between w-full px-2">
                <div className="rounded-md bg-background px-2 py-1 text-sm border aspect-square text-foreground">{photo.order ?? '-'}</div>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        data-no-dnd
                        aria-label={photo.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        title={
                            photo.isFeatured
                                ? 'Remove from featured'
                                : featuredDisabled
                                  ? 'You can feature up to 3 photos'
                                  : 'Featured photos are public even if hidden or password-protected'
                        }
                        className={cn('size-7 bg-background! border', photo.isFeatured && 'border-amber-400 text-amber-500 hover:text-amber-500')}
                        disabled={!photo.isFeatured && featuredDisabled}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFeatured?.(photo);
                        }}
                    >
                        <Star className={cn('size-4', photo.isFeatured && 'fill-current')} />
                    </Button>
                    <DropdownMenu data-no-dnd modal={false}>
                        <DropdownMenuTrigger asChild onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="icon" className="size-7 bg-background! border">
                                <IconDots className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onEdit?.(photo.id);
                                }}
                            >
                                <Pencil className="size-4" />
                                Edit
                            </DropdownMenuItem>
                            {onMove && (
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        onMove(photo);
                                    }}
                                >
                                    <MoveRight className="size-4" />
                                    Move to
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    onDelete?.(photo.id);
                                }}
                            >
                                <Trash2 className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}

export function PhotosGrid({
    photos,
    getImageUrl,
    onReorder,
    onEdit,
    onDelete,
    onMove,
    currentCollectionId,
    onToggleFeatured,
}: {
    photos: Photo[];
    getImageUrl: (p: Photo) => string;
    onReorder: (next: Photo[]) => void;
    onEdit?: (photoId: string) => void;
    onDelete?: (photoId: string) => void;
    onMove?: (photoId: string, targetCollectionId: string) => Promise<void> | void;
    currentCollectionId?: string;
    onToggleFeatured?: (photo: Photo) => Promise<void> | void;
}) {
    const sensors = useSensors(useSensor(SmartPointerSensor));
    const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
    const [movePhoto, setMovePhoto] = React.useState<Photo | null>(null);
    const [categories, setCategories] = React.useState<MoveCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = React.useState(false);
    const [collections, setCollections] = React.useState<MoveCollection[]>([]);
    const [collectionsLoading, setCollectionsLoading] = React.useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = React.useState('');
    const [selectedCollectionId, setSelectedCollectionId] = React.useState('');
    const [moving, setMoving] = React.useState(false);

    React.useEffect(() => {
        if (!moveDialogOpen) return;

        const controller = new AbortController();

        async function loadCategories() {
            setCategoriesLoading(true);
            try {
                const res = await fetch('/api/admin/categories', { cache: 'no-store', signal: controller.signal });
                if (!res.ok) throw new Error('Failed to load categories');
                const json = await res.json();
                setCategories(Array.isArray(json.items) ? json.items : []);
            } catch {
                if (controller.signal.aborted) return;
                setCategories([]);
                toast.error('Failed to load categories');
            } finally {
                if (!controller.signal.aborted) setCategoriesLoading(false);
            }
        }

        loadCategories();
        return () => controller.abort();
    }, [moveDialogOpen]);

    React.useEffect(() => {
        if (!moveDialogOpen || !selectedCategoryId) {
            setCollections([]);
            setCollectionsLoading(false);
            return;
        }

        const controller = new AbortController();

        async function loadCollections() {
            setCollectionsLoading(true);
            try {
                const params = new URLSearchParams({ categoryId: selectedCategoryId });
                const res = await fetch(`/api/admin/collections?${params.toString()}`, { cache: 'no-store', signal: controller.signal });
                if (!res.ok) throw new Error('Failed to load collections');
                const json = await res.json();
                setCollections(Array.isArray(json.items) ? json.items : []);
            } catch {
                if (controller.signal.aborted) return;
                setCollections([]);
                toast.error('Failed to load collections');
            } finally {
                if (!controller.signal.aborted) setCollectionsLoading(false);
            }
        }

        loadCollections();
        return () => controller.abort();
    }, [moveDialogOpen, selectedCategoryId]);

    function requestMove(photo: Photo) {
        setMovePhoto(photo);
        setSelectedCategoryId('');
        setSelectedCollectionId('');
        setMoveDialogOpen(true);
    }

    async function confirmMove() {
        if (!movePhoto || !selectedCollectionId || moving) return;

        setMoving(true);
        try {
            await onMove?.(movePhoto.id, selectedCollectionId);
            setMoveDialogOpen(false);
            setMovePhoto(null);
            setSelectedCategoryId('');
            setSelectedCollectionId('');
        } catch {
            // The parent owns the user-facing error toast.
        } finally {
            setMoving(false);
        }
    }

    function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = photos.findIndex((p) => p.id === active.id);
        const newIndex = photos.findIndex((p) => p.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const moved = arrayMove(photos, oldIndex, newIndex);
        const next = moved.map((p, i) => ({ ...p, order: i + 1 }));
        onReorder(next);
    }

    const hasAvailableCollection = collections.some((collection) => collection.id !== currentCollectionId);
    const featuredCount = photos.filter((photo) => photo.isFeatured).length;

    return (
        <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToParentElement]}>
                <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {photos.map((p) => (
                            <SortableCard
                                key={p.id}
                                photo={p}
                                src={getImageUrl(p)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMove={requestMove}
                                onToggleFeatured={onToggleFeatured}
                                featuredDisabled={featuredCount >= 3}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <Dialog
                open={moveDialogOpen}
                onOpenChange={(open) => {
                    if (moving) return;
                    setMoveDialogOpen(open);
                    if (!open) {
                        setMovePhoto(null);
                        setSelectedCategoryId('');
                        setSelectedCollectionId('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader className="p-4">
                        <DialogTitle>Move photo</DialogTitle>
                        <DialogDescription>
                            Choose a category, then choose the destination collection. The photo will be placed at the end.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={selectedCategoryId}
                                onValueChange={(value) => {
                                    setSelectedCategoryId(value);
                                    setSelectedCollectionId('');
                                }}
                                disabled={categoriesLoading || moving || !onMove}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={categoriesLoading ? 'Loading categories...' : 'Select a category'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.title || category.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Collection</Label>
                            <Select
                                value={selectedCollectionId}
                                onValueChange={setSelectedCollectionId}
                                disabled={!selectedCategoryId || collectionsLoading || moving || !onMove}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            !selectedCategoryId
                                                ? 'Select a category first'
                                                : collectionsLoading
                                                  ? 'Loading collections...'
                                                  : 'Select a destination collection'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {collections.map((collection) => (
                                        <SelectItem key={collection.id} value={collection.id} disabled={collection.id === currentCollectionId}>
                                            {collection.title || collection.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedCategoryId && !collectionsLoading && !hasAvailableCollection && (
                                <p className="text-sm text-muted-foreground">No other collections available in this category.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="bg-secondary/40 mt-5 border-t py-2 px-4">
                        <Button variant="outline" onClick={() => setMoveDialogOpen(false)} disabled={moving}>
                            Cancel
                        </Button>
                        <Button onClick={confirmMove} disabled={!selectedCollectionId || selectedCollectionId === currentCollectionId || moving}>
                            <MoveRight className="size-4" />
                            Move
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
