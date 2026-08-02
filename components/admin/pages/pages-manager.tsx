'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { IconDots } from '@tabler/icons-react';
import { ExternalLink } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { BuilderPage } from '@/lib/page-builder/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export type AdminBuilderPageRow = {
    id: string;
    slug: BuilderPage;
    title: string;
    status: 'draft' | 'published';
    draftBlocksCount: number;
    publishedBlocksCount: number;
    publishedAt: string | null;
    updated: string | null;
    schemaVersion: string;
    hasRecord: boolean;
    hasPublishedData: boolean;
};

type PagesManagerProps = {
    initialPages: AdminBuilderPageRow[];
};

function formatDate(value: string | null) {
    if (!value) return '-';

    return new Date(value).toLocaleString();
}

function publicHref(slug: BuilderPage) {
    return slug === 'homepage' ? '/' : '/about';
}

function editHref(slug: BuilderPage) {
    return `/page-builder/${slug}`;
}

export function PagesManager({ initialPages }: PagesManagerProps) {
    const router = useRouter();
    const [pages, setPages] = useState(initialPages);
    const [pageToDelete, setPageToDelete] = useState<AdminBuilderPageRow | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [savingStatusSlug, setSavingStatusSlug] = useState<BuilderPage | null>(null);

    async function updateStatus(page: AdminBuilderPageRow, status: 'draft' | 'published') {
        if (page.status === status) return;

        const previous = pages;
        setSavingStatusSlug(page.slug);
        setPages((items) => items.map((item) => (item.slug === page.slug ? { ...item, status } : item)));

        try {
            const res = await fetch(`/api/admin/page-builder/${page.slug}`, {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const body = (await res.json().catch(() => null)) as { message?: string } | null;
                throw new Error(body?.message ?? 'Failed to update status');
            }

            toast.success('Page status updated');
            router.refresh();
        } catch (error) {
            setPages(previous);
            toast.error(error instanceof Error ? error.message : 'Failed to update status');
        } finally {
            setSavingStatusSlug(null);
        }
    }

    async function deletePage() {
        if (!pageToDelete) return;

        setDeleting(true);
        try {
            const res = await fetch(`/api/admin/page-builder/${pageToDelete.slug}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const message = await res.text().catch(() => '');
                throw new Error(message || 'Failed to delete page');
            }

            setPages((items) =>
                items.map((item) =>
                    item.slug === pageToDelete.slug
                        ? {
                              ...item,
                              status: 'draft',
                              draftBlocksCount: item.slug === 'homepage' ? 3 : 2,
                              publishedBlocksCount: 0,
                              publishedAt: null,
                              updated: null,
                              hasRecord: false,
                              hasPublishedData: false,
                          }
                        : item,
                ),
            );
            setPageToDelete(null);
            toast.success('Page deleted');
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete page');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Pages</CardTitle>
                    <CardDescription>Manage the editable homepage and about page.</CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <div className="rounded-md border">
                    <Table className="overflow-hidden">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Page</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Published at</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.map((page) => (
                                <TableRow key={page.slug}>
                                    <TableCell className="font-medium">{page.title}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={page.status}
                                            disabled={savingStatusSlug === page.slug}
                                            onValueChange={(value) => updateStatus(page, value as 'draft' | 'published')}
                                        >
                                            <SelectTrigger size="sm" className="w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>{page.status === 'published' ? <Badge variant="outline">Live</Badge> : '-'}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(page.publishedAt)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{formatDate(page.updated)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <IconDots />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={editHref(page.slug)}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={publicHref(page.slug)}>
                                                        <ExternalLink className="size-4" />
                                                        View public page
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    disabled={!page.hasRecord}
                                                    onSelect={(event) => {
                                                        event.preventDefault();
                                                        setPageToDelete(page);
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
            </CardContent>

            <AlertDialog open={Boolean(pageToDelete)} onOpenChange={(open) => !open && !deleting && setPageToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete page data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This deletes the saved builder data for {pageToDelete?.title}. The public page will fall back to the coded version until
                            it is published again.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={deleting} onClick={deletePage}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
