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

type DeleteCollectionDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteCollectionDialog({ open, onOpenChange, deleting = false, onConfirm, onCancel }: DeleteCollectionDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete collection and <span className="text-destructive font-bold underline">all</span> its photos?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this collection and all its photos. This action cannot be undone.
                    </AlertDialogDescription>
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

type UseDeleteCollectionDialogOptions = {
    onDelete: (collectionId: string) => Promise<void> | void;
};

export function useDeleteCollectionDialog({ onDelete }: UseDeleteCollectionDialogOptions) {
    const [open, setOpen] = useState(false);
    const [collectionId, setCollectionId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const request = useCallback((id: string) => {
        setCollectionId(id);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        if (deleting) return;
        setOpen(false);
        setCollectionId(null);
    }, [deleting]);

    const confirm = useCallback(async () => {
        if (!collectionId || deleting) return;
        setDeleting(true);
        try {
            await onDelete(collectionId);
            setOpen(false);
            setCollectionId(null);
        } finally {
            setDeleting(false);
        }
    }, [collectionId, deleting, onDelete]);

    const dialog = useMemo(
        () => (
            <DeleteCollectionDialog
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

    return { request, dialog, deleting, collectionId };
}
