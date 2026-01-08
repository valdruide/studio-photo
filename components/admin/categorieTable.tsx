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

export type CategoryRow = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    color?: string | null;
    icon?: string | null;
    allowAll?: boolean;
};

export function CategorieTable({
    categories,
    onToggleVisible,
    onToggleAllowAll,
    onDeleted,
}: {
    categories: CategoryRow[];
    onToggleVisible: (catId: string, isVisible: boolean) => void;
    onToggleAllowAll: (catId: string, allowAll: boolean) => void;
    onDeleted?: (catId: string) => void;
}) {
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

    return (
        <>
            {deleteDialog.dialog}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Change Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Visible</TableHead>
                            <TableHead>Allow "All" collection</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {categories.map((cat) => {
                            const visible = !cat.isHidden;
                            const Icon = cat.icon && ICONS_MAP[cat.icon] ? ICONS_MAP[cat.icon] : IconFolderFilled;
                            const color = cat.color ?? 'currentColor';

                            return (
                                <TableRow key={cat.id}>
                                    <TableCell>
                                        <IconGripVertical className="text-muted-foreground cursor-grab" />
                                    </TableCell>
                                    <TableCell className="font-medium">{cat.title}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{cat.slug ?? '-'}</TableCell>
                                    <TableCell>
                                        <Icon
                                            className="size-5 text-foreground"
                                            style={{
                                                color: color,
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
                                            ></div>
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

                                    <TableCell className="text-sm text-muted-foreground">{cat['order'] ?? '-'}</TableCell>

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
                                                        deleteDialog.request(cat.id);
                                                    }}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
