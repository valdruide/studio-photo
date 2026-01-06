'use client';

import * as React from 'react';
import Image from 'next/image';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IconDots } from '@tabler/icons-react';

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: any) => {
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
    collectionId?: string;
};

function SortableCard({
    photo,
    src,
    onEdit,
    onDelete,
}: {
    photo: Photo;
    src: string;
    onEdit?: (photoId: string) => void;
    onDelete?: (photoId: string) => void;
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

            <div className="absolute left-2 top-2 rounded bg-background px-2 py-1 text-sm border-2 aspect-square text-foreground">
                {photo.order ?? '-'}
            </div>
            <DropdownMenu data-no-dnd modal={false}>
                <DropdownMenuTrigger
                    asChild
                    className="absolute top-2 right-2"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <IconDots />
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
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                            e.preventDefault();
                            onDelete?.(photo.id);
                        }}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function PhotosGrid({
    photos,
    getImageUrl,
    onReorder,
    onEdit,
    onDelete,
}: {
    photos: Photo[];
    getImageUrl: (p: Photo) => string;
    onReorder: (next: Photo[]) => void;
    onEdit?: (photoId: string) => void;
    onDelete?: (photoId: string) => void;
}) {
    const sensors = useSensors(useSensor(SmartPointerSensor));

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

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToParentElement]}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {photos.map((p) => (
                        <SortableCard key={p.id} photo={p} src={getImageUrl(p)} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
