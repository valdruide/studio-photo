'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type CollectionRow = {
    id: string;
    title: string;
    slug?: string;
    isHidden?: boolean;
};

export function CollectionsTable({ collections }: { collections: CollectionRow[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-[120px]">Hidden</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {collections.map((col) => (
                    <TableRow key={col.id}>
                        <TableCell className="font-medium">{col.title}</TableCell>
                        <TableCell className="text-sm opacity-70">{col.slug ?? '-'}</TableCell>
                        <TableCell className="text-sm opacity-70">{col.isHidden ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={`/admin/collections/${col.id}`}>Edit</Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
