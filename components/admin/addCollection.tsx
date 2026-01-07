'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertOctagonFilled } from '@tabler/icons-react';

type Collection = {
    id: string;
    title: string;
    description?: string | null;
    order?: number;
    isHidden?: boolean;
    category?: string; // relation PB
};

type AddCollectionProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categoryId: string;
    onAdded?: (added: Collection[]) => void;
};

export function AddCollection({ open, onOpenChange, categoryId, onAdded }: AddCollectionProps) {
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState<string>('');

    function reset() {
        setTitle('');
        setDescription('');
        setOrder('');
        setErr(null);
        setUploading(false);
    }

    async function upload() {
        if (!title.trim()) {
            setErr('Title is required.');
            return;
        }

        setUploading(true);
        setErr(null);

        try {
            const fd = new FormData();
            fd.set('categoryId', categoryId);

            fd.set('title', title.trim());
            fd.set('description', description ?? '');

            // order optionnel : si vide, le backend mettra last+1
            if (order.trim() !== '') fd.set('order', String(Number(order)));

            const res = await fetch('/api/admin/collections', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || 'Upload failed');
            }

            const json = await res.json();
            const added: Collection[] = Array.isArray(json) ? json : json.items ?? [];
            onAdded?.(added);

            onOpenChange(false);
            reset();
        } catch (e: any) {
            // ton backend renvoie parfois du JSON {message,pb}, donc on essaie de l’afficher proprement
            const raw = e?.message || 'Upload failed';
            setErr(raw);
        } finally {
            setUploading(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v);
                if (!v) reset();
            }}
        >
            <DialogContent className="sm:max-w-[520px] p-6">
                <DialogHeader>
                    <DialogTitle>Create Collection</DialogTitle>
                    <DialogDescription>Create a new collection to the category.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-5">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Collection title" />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Rich text description"
                            className="min-h-[120px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Order (optional)</Label>
                        <Input type="number" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Auto" />
                        <div className="text-xs opacity-70">If empty, the server will append it at the end.</div>
                    </div>

                    {err ? (
                        <Alert variant="destructive">
                            <IconAlertOctagonFilled />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="wrap-break-words">{err}</AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <DialogFooter className="mt-5">
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={upload} disabled={uploading || !title.trim()}>
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
