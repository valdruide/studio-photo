'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { Button } from '@/components/ui/button';
import { CreateGalleryDialog } from '@/components/proofing/galleries/create-gallery-dialog';
import { GalleryCard } from '@/components/proofing/galleries/gallery-card';
import type { ProofingGallery } from '@/lib/proofing/getProofingGalleries';
import { Plus } from 'lucide-react';

type GalleriesManagerProps = {
    initialGalleries: ProofingGallery[];
};

export function GalleriesManager({ initialGalleries }: GalleriesManagerProps) {
    const router = useRouter();
    const [galleries, setGalleries] = useState(initialGalleries);
    const [createOpen, setCreateOpen] = useState(false);
    const [galleryToDelete, setGalleryToDelete] = useState<ProofingGallery | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function deleteGallery() {
        if (!galleryToDelete) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/proofing/galleries/${galleryToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text().catch(() => '');
                toast.error(message || 'Failed to delete gallery');
                return;
            }

            setGalleries((items) => items.filter((item) => item.id !== galleryToDelete.id));
            setGalleryToDelete(null);
            toast.success('Gallery deleted');
            router.refresh();
        } finally {
            setDeleting(false);
        }
    }

    async function shareGallery(accessKey: string) {
        const url = `${window.location.origin}/proofing/galleries/${accessKey}`;

        try {
            await navigator.clipboard.writeText(url);
            toast.success('Gallery link copied');
        } catch {
            toast.info(url);
        }
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Galleries</h1>
                <Button type="button" onClick={() => setCreateOpen(true)}>
                    <Plus className="size-5" />
                    Create Gallery
                </Button>
            </div>

            {galleries.length ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                    {galleries.map((gallery) => (
                        <GalleryCard
                            key={gallery.id}
                            id={gallery.id}
                            title={gallery.title}
                            dateCreated={gallery.created}
                            thumbnailImage={gallery.thumbnailImage}
                            accessKey={gallery.accessKey}
                            clientName={gallery.clientName}
                            photosCount={gallery.photosCount}
                            status={gallery.status}
                            onDelete={() => setGalleryToDelete(gallery)}
                            onShare={shareGallery}
                        />
                    ))}
                </div>
            ) : (
                <div className="mt-4 flex min-h-64 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">No client galleries yet.</p>
                </div>
            )}

            <CreateGalleryDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={(items) => {
                    setGalleries((current) => [...items, ...current]);
                    toast.success('Gallery created');
                    router.refresh();
                }}
            />

            <AlertDialog open={Boolean(galleryToDelete)} onOpenChange={(open) => !open && !deleting && setGalleryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the gallery and its proofing photos. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={deleting} onClick={deleteGallery}>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
