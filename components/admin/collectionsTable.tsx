'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconDots, IconGripVertical } from '@tabler/icons-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteCollectionDialog } from '@/components/admin/deleteCollectionDialog';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: any) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;

                return Boolean(target.closest('[data-dnd-handle]'));
            },
        },
    ];
}

export type CollectionRow = {
    id: string;
    title: string;
    description?: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    lockedByPassword?: boolean;
};

function SortableCollectionRow({ col, onDelete }: { col: CollectionRow; onDelete: (collectionId: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: col.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'relative z-10 bg-muted/50')}>
            <TableCell>
                <button
                    type="button"
                    data-dnd-handle
                    {...attributes}
                    {...listeners}
                    className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground cursor-grab active:cursor-grabbing"
                    aria-label={`Reorder ${col.title}`}
                >
                    <IconGripVertical className="size-5" />
                </button>
            </TableCell>

            <TableCell className="font-medium">{col.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{col.slug ?? '-'}</TableCell>
            <TableCell className={cn('text-sm text-muted-foreground', col.isHidden && 'text-destructive')}>
                {col.isHidden ? 'Hidden' : 'Yes'}
            </TableCell>
            <TableCell className={cn('text-sm text-muted-foreground', col.lockedByPassword && 'text-destructive')}>
                {col.lockedByPassword ? 'Locked' : 'No'}
            </TableCell>

            <TableCell className="text-right">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <IconDots />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/collections/${col.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={(e) => {
                                e.preventDefault();
                                onDelete(col.id);
                            }}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export function CollectionsTable({
    collections,
    onReorder,
    onDeleted,
}: {
    collections: CollectionRow[];
    onReorder: (next: CollectionRow[]) => void;
    onDeleted?: (collectionId: string) => void;
}) {
    const sensors = useSensors(useSensor(SmartPointerSensor));

    const deleteDialog = useDeleteCollectionDialog({
        onDelete: async (collectionId: string) => {
            const res = await fetch(`/api/admin/collections/${collectionId}`, { method: 'DELETE' });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                console.error(msg || 'Delete failed');
                return;
            }

            onDeleted?.(collectionId);
        },
    });

    function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = collections.findIndex((c) => c.id === active.id);
        const newIndex = collections.findIndex((c) => c.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const moved = arrayMove(collections, oldIndex, newIndex);
        const next = moved.map((col, i) => ({
            ...col,
            order: i + 1,
        }));

        onReorder(next);
    }

    return (
        <>
            {deleteDialog.dialog}

            <div className="rounded-md border">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <Table className="overflow-hidden">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Change order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead>Locked by password</TableHead>
                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <SortableContext items={collections.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                {collections.map((col) => (
                                    <SortableCollectionRow key={col.id} col={col} onDelete={deleteDialog.request} />
                                ))}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
        </>
    );
}
