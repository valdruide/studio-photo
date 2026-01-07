'use client';

import { useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertOctagonFilled, IconUpload } from '@tabler/icons-react';

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
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Optionnel: “metadata commun” appliqué à toutes les photos
    const [namePrefix, setNamePrefix] = useState(''); // ex: "Shooting-Paris"
    const [description, setDescription] = useState('');

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const totalMb = useMemo(() => {
        if (!files.length) return 0;
        const bytes = files.reduce((acc, f) => acc + f.size, 0);
        return Math.round((bytes / 1024 / 1024) * 10) / 10;
    }, [files]);

    function reset() {
        setFiles([]);
        setNamePrefix('');
        setDescription('');
        setErr(null);
        setUploading(false);
    }

    async function upload() {
        if (!files.length) return;

        setUploading(true);
        setErr(null);

        try {
            const fd = new FormData();
            fd.set('collectionId', collectionId);

            // metadata "commun" (ton backend peut les ignorer / les utiliser)
            fd.set('namePrefix', namePrefix.trim()); // nouveau champ, optionnel
            fd.set('description', description ?? '');

            // multi
            for (const f of files) fd.append('files', f);

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
            setErr(e?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    function addFiles(next: File[]) {
        if (!next.length) return;

        // garde seulement des images
        const images = next.filter((f) => f.type.startsWith('image/'));
        if (!images.length) return;

        setErr(null);

        setFiles((prev) => {
            // merge + anti-doublons basique (nom+taille+lastModified)
            const map = new Map<string, File>();
            for (const f of prev) map.set(`${f.name}-${f.size}-${f.lastModified}`, f);
            for (const f of images) map.set(`${f.name}-${f.size}-${f.lastModified}`, f);
            return Array.from(map.values());
        });

        // auto namePrefix si vide
        if (!namePrefix.trim()) {
            const base = images[0].name.replace(/\.[^/.]+$/, '');
            setNamePrefix(base);
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

                        {/* input réel caché */}
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                addFiles(Array.from(e.target.files ?? []));
                                // permet de re-sélectionner le même fichier juste après
                                e.currentTarget.value = '';
                            }}
                        />

                        {/* dropzone */}
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDragActive(true);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDragActive(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDragActive(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsDragActive(false);

                                const dropped = Array.from(e.dataTransfer.files ?? []);
                                addFiles(dropped);
                            }}
                            className={[
                                'w-full rounded-lg border border-dashed p-6 text-left transition',
                                'hover:bg-muted/50',
                                isDragActive ? 'border-primary bg-muted/60' : 'border-muted-foreground/25',
                                uploading ? 'pointer-events-none opacity-60' : '',
                            ].join(' ')}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                                    <IconUpload />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium">{isDragActive ? 'Drop your photos here' : 'Drag & drop photos here'}</div>
                                    <div className="text-sm text-muted-foreground">or click to browse</div>
                                </div>
                            </div>
                        </button>

                        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                            <div>{!files.length ? 'No files selected.' : `${files.length} file(s) • ${totalMb} MB`}</div>

                            {files.length ? (
                                <Button
                                    variant="link"
                                    className="text-sm underline underline-offset-2"
                                    onClick={() => setFiles([])}
                                    disabled={uploading}
                                >
                                    Clear
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Name prefix (optional)</Label>
                        <Input
                            value={namePrefix}
                            onChange={(e) => setNamePrefix(e.target.value)}
                            placeholder='Applied to all (ex: "Shooting-Paris")'
                        />
                        <div className="text-xs opacity-70">If empty, server can default to each filename (recommended).</div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description (optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Rich text description (applied to all)"
                            className="min-h-[120px]"
                        />
                    </div>

                    {files.length ? (
                        <div className="max-h-40 overflow-auto rounded-md border p-2 text-sm">
                            <ul className="space-y-1">
                                {files.map((f) => (
                                    <li key={`${f.name}-${f.size}-${f.lastModified}`} className="flex items-center justify-between gap-2">
                                        <span className="truncate">{f.name}</span>
                                        <span className="opacity-60">{Math.round((f.size / 1024 / 1024) * 10) / 10} MB</span>
                                    </li>
                                ))}
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
                    <Button onClick={upload} disabled={uploading || files.length === 0}>
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
