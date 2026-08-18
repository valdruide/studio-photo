'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, StarOff, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

type FeaturedPhoto = {
    id: string;
    name: string;
    isHidden: boolean;
    isFeatured: boolean;
    featuredOrder: number | null;
    collectionTitle: string;
    collectionHidden: boolean;
    categoryTitle: string;
    categoryHidden: boolean;
    lockedByPassword: boolean;
    srcThumb: string;
};

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: { nativeEvent: PointerEvent }) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;
                if (target.closest('[data-no-dnd]')) return false;
                if (target.closest('button, a, input, textarea, select, [role="menuitem"]')) return false;

                return true;
            },
        },
    ];
}

function FeaturedPhotoCard({
    photo,
    showLockedPhotos,
    updatingId,
    onRemove,
}: {
    photo: FeaturedPhoto;
    showLockedPhotos: boolean;
    updatingId: string | null;
    onRemove: (photo: FeaturedPhoto) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
    const hasVisibilityOverride = photo.isHidden || photo.collectionHidden || photo.categoryHidden || photo.lockedByPassword;

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className={cn('overflow-hidden rounded-lg border bg-muted/30 cursor-grab', isDragging && 'cursor-grabbing opacity-80 z-10')}
            {...attributes}
            {...listeners}
        >
            <div className="relative aspect-square bg-muted">
                {photo.srcThumb ? (
                    <Image src={photo.srcThumb} alt={photo.name} fill sizes="320px" className="object-cover" unoptimized />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                )}
                {photo.lockedByPassword && !showLockedPhotos && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-lg">
                        <Lock className="size-8 text-white" />
                    </div>
                )}
                <div className="absolute left-2 top-2 z-30 rounded-md border bg-background px-2 py-1 text-xs font-medium">
                    #{photo.featuredOrder ?? '-'}
                </div>
                {hasVisibilityOverride && (
                    <div className="absolute right-2 top-2 z-30 flex gap-1">
                        {(photo.isHidden || photo.collectionHidden || photo.categoryHidden) && (
                            <Badge variant="secondary" className="bg-background/90">
                                <EyeOff className="size-3" />
                                Hidden
                            </Badge>
                        )}
                        {photo.lockedByPassword && (
                            <Badge variant="secondary" className="bg-background/90">
                                <Lock className="size-3" />
                                Locked
                            </Badge>
                        )}
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 z-30 bg-linear-to-t from-black/80 to-transparent p-3">
                    <p className="truncate text-sm font-medium text-white">{photo.name}</p>
                    <p className="truncate text-xs text-white/75">
                        {photo.categoryTitle} / {photo.collectionTitle}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between gap-3 p-3">
                <p className="text-xs text-muted-foreground">
                    Public on Featured
                    {hasVisibilityOverride ? ', overriding visibility rules' : ''}
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-no-dnd
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => onRemove(photo)}
                    disabled={updatingId === photo.id}
                >
                    <StarOff className="size-4" />
                    Remove
                </Button>
            </div>
        </article>
    );
}

export default function AdminFeaturedPage() {
    const [photos, setPhotos] = useState<FeaturedPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showLockedPhotos, setShowLockedPhotos] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);
    const sensors = useSensors(useSensor(SmartPointerSensor));

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/photos/featured', { cache: 'no-store' });

            if (!res.ok) {
                const errorText = await res.text().catch(() => '');
                throw new Error(`Failed to load featured photos: ${res.status} ${errorText}`);
            }

            const json = await res.json();
            setPhotos(Array.isArray(json.items) ? json.items : []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load featured photos');
            setPhotos([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function removeFeatured(photo: FeaturedPhoto) {
        setUpdatingId(photo.id);
        try {
            const res = await fetch(`/api/admin/photos/${photo.id}/featured`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ isFeatured: false }),
            });

            if (!res.ok) {
                const errorText = await res.text().catch(() => '');
                throw new Error(`Failed to update featured photo: ${res.status} ${errorText}`);
            }

            setPhotos((current) => current.filter((item) => item.id !== photo.id));
            toast.success('Photo removed from featured');
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove featured photo');
        } finally {
            setUpdatingId(null);
        }
    }

    async function saveFeaturedOrder(nextPhotos: FeaturedPhoto[]) {
        setSavingOrder(true);
        try {
            const res = await fetch('/api/admin/photos/featured', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    updates: nextPhotos.map((photo, index) => ({
                        id: photo.id,
                        featuredOrder: index + 1,
                    })),
                }),
            });

            if (!res.ok) {
                const errorText = await res.text().catch(() => '');
                throw new Error(`Failed to save featured order: ${res.status} ${errorText}`);
            }

            toast.success('Featured order saved');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save featured order');
            await load();
        } finally {
            setSavingOrder(false);
        }
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id || savingOrder) return;

        const oldIndex = photos.findIndex((photo) => photo.id === active.id);
        const newIndex = photos.findIndex((photo) => photo.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const next = arrayMove(photos, oldIndex, newIndex).map((photo, index) => ({
            ...photo,
            featuredOrder: index + 1,
        }));

        setPhotos(next);
        void saveFeaturedOrder(next);
    }

    return (
        <Card>
            <CardHeader className="flex justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Star className="size-6 text-primary fill-primary" />
                        Featured photos
                    </CardTitle>
                    <CardDescription>Review the public featured selection and remove photos from it quickly.</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                    <Switch checked={showLockedPhotos} onCheckedChange={setShowLockedPhotos} />
                    <Label>Show locked photos</Label>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} className="aspect-square rounded-lg" />
                        ))}
                    </div>
                ) : photos.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <StarOff className="mx-auto size-10 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">No featured photos.</p>
                        <p className="mt-1 text-sm text-muted-foreground">Use the star on a photo inside a collection to feature it.</p>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={photos.map((photo) => photo.id)} strategy={rectSortingStrategy}>
                            <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3', savingOrder && 'pointer-events-none opacity-80')}>
                                {photos.map((photo) => (
                                    <FeaturedPhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        showLockedPhotos={showLockedPhotos}
                                        updatingId={updatingId}
                                        onRemove={removeFeatured}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </CardContent>
        </Card>
    );
}
