'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertOctagonFilled } from '@tabler/icons-react';

type Photo = {
    id: string;
    collectionId?: string;
    image?: string;
    order?: number;
    isHidden?: boolean;
};

type AddPhotosProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    onAdded?: (added: Photo[]) => void;
};

export function AddPhotos({ open, onOpenChange, collectionId, onAdded }: AddPhotosProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [order, setOrder] = useState<string>('');

    const sizeMb = useMemo(() => {
        if (!file) return 0;
        return Math.round((file.size / 1024 / 1024) * 10) / 10;
    }, [file]);

    function reset() {
        setFile(null);
        setName('');
        setDescription('');
        setOrder('');
        setErr(null);
        setUploading(false);
    }

    async function upload() {
        if (!file) return;
        if (!name.trim()) {
            setErr('Name is required.');
            return;
        }

        setUploading(true);
        setErr(null);

        try {
            const fd = new FormData();
            fd.set('collectionId', collectionId);

            fd.set('name', name.trim());
            fd.set('description', description ?? '');

            // order optionnel : si vide, le backend mettra last+1
            if (order.trim() !== '') fd.set('order', String(Number(order)));

            // on garde la clé "files" pour matcher ton POST
            fd.append('files', file);

            const res = await fetch('/api/admin/photos', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                throw new Error(msg || 'Upload failed');
            }

            const json = await res.json();
            const added: Photo[] = Array.isArray(json) ? json : json.items ?? [];
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
                    <DialogTitle>Add photos</DialogTitle>
                    <DialogDescription>Upload new images and attach them to this collection.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-5">
                    <div className="space-y-2">
                        <Label>Files</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setFile(f);
                                setErr(null);

                                // petit confort : auto-name à partir du fichier si champ vide
                                if (f && !name.trim()) {
                                    const base = f.name.replace(/\.[^/.]+$/, '');
                                    setName(base);
                                }
                            }}
                        />
                        <div className="text-sm text-muted-foreground">{!file ? 'No file selected.' : `${file.name} • ${sizeMb} MB`}</div>
                    </div>

                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Photo name" />
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

                    {file ? (
                        <div className="max-h-40 overflow-auto rounded-md border p-2 text-sm">
                            <ul className="space-y-1">
                                <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-2">
                                    <span className="truncate">{file.name}</span>
                                    <span className="opacity-60">{Math.round((file.size / 1024 / 1024) * 10) / 10} MB</span>
                                </li>
                            </ul>
                        </div>
                    ) : null}

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
                    <Button onClick={upload} disabled={uploading || !file || !name.trim()}>
                        {uploading ? 'Uploading…' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
