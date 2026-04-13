'use client';
import * as React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import { IconFolderFilled, IconDots, IconGripVertical } from '@tabler/icons-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteCategoryDialog } from '@/components/admin/deleteCategoryDialog';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: any) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;

                // on autorise le drag uniquement depuis un handle explicite
                return Boolean(target.closest('[data-dnd-handle]'));
            },
        },
    ];
}

export type CategoryRow = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    color?: string | null;
    icon?: string | null;
    allowAll?: boolean;
    lockedByPassword?: boolean;
};

function SortableCategoryRow({
    cat,
    onToggleVisible,
    onToggleAllowAll,
    onDelete,
}: {
    cat: CategoryRow;
    onToggleVisible: (catId: string, isVisible: boolean) => void;
    onToggleAllowAll: (catId: string, allowAll: boolean) => void;
    onDelete: (catId: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: cat.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const visible = !cat.isHidden;
    const Icon = cat.icon && ICONS_MAP[cat.icon] ? ICONS_MAP[cat.icon] : IconFolderFilled;
    const color = cat.color ?? 'currentColor';

    return (
        <TableRow ref={setNodeRef} style={style} className={cn(isDragging && 'relative z-10 bg-muted/50')}>
            <TableCell>
                <button
                    type="button"
                    data-dnd-handle
                    {...attributes}
                    {...listeners}
                    className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground cursor-grab active:cursor-grabbing"
                    aria-label={`Reorder ${cat.title}`}
                >
                    <IconGripVertical className="size-5" />
                </button>
            </TableCell>

            <TableCell className="font-medium">{cat.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{cat.slug ?? '-'}</TableCell>

            <TableCell>
                <Icon
                    className="size-5 text-foreground"
                    style={{
                        color,
                    }}
                />
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <div
                        className="aspect-square rounded-xs size-4"
                        style={{
                            backgroundColor: color,
                        }}
                    />
                    <p className="text-muted-foreground">{cat.color || 'transparent'}</p>
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <Switch checked={visible} onCheckedChange={(v) => onToggleVisible(cat.id, v)} />
                    <Label className="text-muted-foreground">Visible</Label>
                </div>
            </TableCell>

            <TableCell>
                <div className="flex items-center gap-2">
                    <Switch checked={Boolean(cat.allowAll)} onCheckedChange={(v) => onToggleAllowAll(cat.id, v)} />
                    <Label className="text-muted-foreground">Allow</Label>
                </div>
            </TableCell>

            <TableCell className="text-sm text-muted-foreground">{cat.lockedByPassword ? 'Yes' : 'No'}</TableCell>

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
                            <Link href={`/admin/categories/${cat.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onSelect={(e) => {
                                e.preventDefault();
                                onDelete(cat.id);
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

export function CategorieTable({
    categories,
    onToggleVisible,
    onToggleAllowAll,
    onReorder,
    onDeleted,
}: {
    categories: CategoryRow[];
    onToggleVisible: (catId: string, isVisible: boolean) => void;
    onToggleAllowAll: (catId: string, allowAll: boolean) => void;
    onReorder: (next: CategoryRow[]) => void;
    onDeleted?: (catId: string) => void;
}) {
    const sensors = useSensors(useSensor(SmartPointerSensor));

    const deleteDialog = useDeleteCategoryDialog({
        onDelete: async (catId: string) => {
            const res = await fetch(`/api/admin/categories/${catId}`, { method: 'DELETE' });
            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                console.error(msg || 'Delete failed');
                return;
            }
            onDeleted?.(catId);
        },
    });

    function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const moved = arrayMove(categories, oldIndex, newIndex);
        const next = moved.map((cat, i) => ({
            ...cat,
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
                                <TableHead className="w-[120px]">Change Order</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead>Allow "All" collection</TableHead>
                                <TableHead>Locked by password</TableHead>
                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                {categories.map((cat) => (
                                    <SortableCategoryRow
                                        key={cat.id}
                                        cat={cat}
                                        onToggleVisible={onToggleVisible}
                                        onToggleAllowAll={onToggleAllowAll}
                                        onDelete={deleteDialog.request}
                                    />
                                ))}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
        </>
    );
}
