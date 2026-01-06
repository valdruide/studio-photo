'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
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

type DeletePhotoDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deleting?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeletePhotoDialog({ open, onOpenChange, deleting = false, onConfirm, onCancel }: DeletePhotoDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete photo?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this photo. This action cannot be undone.</AlertDialogDescription>
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

type UseDeletePhotoDialogOptions = {
    onDelete: (photoId: string) => Promise<void> | void;
};

export function useDeletePhotoDialog({ onDelete }: UseDeletePhotoDialogOptions) {
    const [open, setOpen] = useState(false);
    const [photoId, setPhotoId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const request = useCallback((id: string) => {
        setPhotoId(id);
        setOpen(true);
    }, []);

    const close = useCallback(() => {
        if (deleting) return;
        setOpen(false);
        setPhotoId(null);
    }, [deleting]);

    const confirm = useCallback(async () => {
        if (!photoId || deleting) return;
        setDeleting(true);
        try {
            await onDelete(photoId);
            setOpen(false);
            setPhotoId(null);
        } finally {
            setDeleting(false);
        }
    }, [photoId, deleting, onDelete]);

    const dialog = useMemo(
        () => (
            <DeletePhotoDialog
                open={open}
                onOpenChange={(v) => {
                    // si l’utilisateur clique en dehors
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

    return { request, dialog, deleting, photoId };
}
