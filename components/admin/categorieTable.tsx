import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import { IconFolderFilled } from '@tabler/icons-react';

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
}: {
    categories: CategoryRow[];
    onToggleVisible: (catId: string, isVisible: boolean) => void;
    onToggleAllowAll: (catId: string, allowAll: boolean) => void;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
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
                                    <Label className="opacity-80">Visible</Label>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch checked={Boolean(cat.allowAll)} onCheckedChange={(v) => onToggleAllowAll(cat.id, v)} />
                                    <Label className="opacity-80">Allow</Label>
                                </div>
                            </TableCell>

                            <TableCell className="text-sm text-muted-foreground">{cat['order'] ?? '-'}</TableCell>

                            <TableCell className="text-right">
                                <Button asChild variant="secondary">
                                    <Link href={`/admin/categories/${cat.id}`}>Edit</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
