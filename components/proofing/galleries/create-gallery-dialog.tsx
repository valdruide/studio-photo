'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { ProofingGallery } from '@/lib/proofing/getProofingGalleries';

type CreateGalleryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: (items: ProofingGallery[]) => void;
};

type GalleryStatus = ProofingGallery['status'];

const STATUSES: GalleryStatus[] = ['draft', 'active', 'validated', 'expired', 'archived'];

export function CreateGalleryDialog({ open, onOpenChange, onCreated }: CreateGalleryDialogProps) {
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [accessKey, setAccessKey] = useState('');
    const [password, setPassword] = useState('');
    const [selectionLimit, setSelectionLimit] = useState('1');
    const [expiresAt, setExpiresAt] = useState('');
    const [status, setStatus] = useState<GalleryStatus>('draft');
    const [notes, setNotes] = useState('');

    function reset() {
        setCreating(false);
        setError(null);
        setTitle('');
        setClientName('');
        setClientEmail('');
        setAccessKey('');
        setPassword('');
        setSelectionLimit('1');
        setExpiresAt('');
        setStatus('draft');
        setNotes('');
    }

    async function create() {
        if (!title.trim()) {
            setError('Title is required.');
            return;
        }

        const parsedLimit = Number(selectionLimit);
        if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
            setError('Selection limit must be greater than 0.');
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/proofing/galleries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    clientName: clientName.trim(),
                    clientEmail: clientEmail.trim(),
                    accessKey: accessKey.trim(),
                    password: password.trim(),
                    selectionLimit: parsedLimit,
                    expiresAt: expiresAt || null,
                    status,
                    notes: notes.trim(),
                }),
            });

            if (!response.ok) {
                const message = await response.text().catch(() => '');
                setError(message || 'Create failed.');
                return;
            }

            const json = await response.json();
            const items: ProofingGallery[] = Array.isArray(json) ? json : json.items ?? [];
            onCreated?.(items);
            onOpenChange(false);
            reset();
        } finally {
            setCreating(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                onOpenChange(value);
                if (!value) reset();
            }}
        >
            <DialogContent className="sm:max-w-[640px] p-6">
                <DialogHeader>
                    <DialogTitle>Create Client Gallery</DialogTitle>
                    <DialogDescription>Add a proofing gallery for a client.</DialogDescription>
                </DialogHeader>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="gallery-title">Title</Label>
                        <Input id="gallery-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Wedding selection" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-client-name">Client name</Label>
                        <Input id="gallery-client-name" value={clientName} onChange={(event) => setClientName(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-client-email">Client email</Label>
                        <Input id="gallery-client-email" type="email" value={clientEmail} onChange={(event) => setClientEmail(event.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-access-key">Access key</Label>
                        <Input id="gallery-access-key" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} placeholder="Generated if empty" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-password">Password</Label>
                        <Input id="gallery-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Optional" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-selection-limit">Selection limit</Label>
                        <Input
                            id="gallery-selection-limit"
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={selectionLimit}
                            onChange={(event) => setSelectionLimit(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gallery-expires-at">Expires at</Label>
                        <Input id="gallery-expires-at" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(value) => setStatus(value as GalleryStatus)}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map((item) => (
                                    <SelectItem key={item} value={item} className="capitalize">
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="gallery-notes">Notes</Label>
                        <Textarea id="gallery-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} />
                    </div>
                </div>

                {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

                <DialogFooter className="mt-5">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={creating}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={create} disabled={creating || !title.trim()}>
                        {creating ? 'Creating...' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
