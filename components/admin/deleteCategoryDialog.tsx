'use client';

import { useCallback, useMemo, useState } from 'react';
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

type DeleteCategoryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteCategoryDialog({ open, onOpenChange, deleting = false, onConfirm, onCancel }: DeleteCategoryDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete category and <span className="text-destructive font-bold underline">all</span> its collections and photos?
                    </AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this category. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel} disabled={deleting}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction onClick={onConfirm} disabled={deleting}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

type UseDeleteCategoryDialogOptions = {
    onDelete: (categoryId: string) => Promise<void> | void;
};

export function useDeleteCategoryDialog({ onDelete }: UseDeleteCategoryDialogOptions) {
    const [open, setOpen] = useState(false);
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const request = useCallback((id: string) => {
        setCategoryId(id);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        if (deleting) return;
        setOpen(false);
        setCategoryId(null);
    }, [deleting]);

    const confirm = useCallback(async () => {
        if (!categoryId || deleting) return;
        setDeleting(true);
        try {
            await onDelete(categoryId);
            setOpen(false);
            setCategoryId(null);
        } finally {
            setDeleting(false);
        }
    }, [categoryId, deleting, onDelete]);

    const dialog = useMemo(
        () => (
            <DeleteCategoryDialog
                open={open}
                onOpenChange={(v) => {
                    if (!v) close();
                    else setOpen(true);
                }}
                deleting={deleting}
                onCancel={close}
                onConfirm={confirm}
            />
        ),
        [open, deleting, close, confirm]
    );

    return { request, dialog, deleting, categoryId };
}
