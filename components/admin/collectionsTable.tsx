'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IconDots } from '@tabler/icons-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeleteCollectionDialog } from '@/components/admin/deleteCollectionDialog';

export type CollectionRow = {
    id: string;
    title: string;
    description?: string;
    slug?: string;
    isHidden?: boolean;
};

export function CollectionsTable({ collections, onDeleted }: { collections: CollectionRow[]; onDeleted?: (collectionId: string) => void }) {
    const deleteDialog = useDeleteCollectionDialog({
        onDelete: async (collectionId: string) => {
            const res = await fetch(`/api/admin/collections/${collectionId}`, { method: 'DELETE' });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                console.error(msg || 'Delete failed');
                return; // <-- pas de throw
            }

            onDeleted?.(collectionId);
        },
    });

    return (
        <>
            {deleteDialog.dialog}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Hidden</TableHead>
                            <TableHead className="text-right w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {collections.map((col) => (
                            <TableRow key={col.id}>
                                <TableCell className="font-medium">{col.title}</TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{col.description ?? '-'}</TableCell>
                                <TableCell className="text-sm opacity-70">{col.slug ?? '-'}</TableCell>
                                <TableCell className="text-sm opacity-70">{col.isHidden ? 'Yes' : 'No'}</TableCell>
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
                                                    deleteDialog.request(col.id);
                                                }}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
