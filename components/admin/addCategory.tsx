'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertOctagonFilled } from '@tabler/icons-react';
import { IconPickerDialog } from '@/components/admin/iconPickerDialog';
import { ColorPickerDialog } from '@/components/admin/colorPickerDialog';

type Category = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    icon?: string | null;
    color?: string | null;
    allowAll?: boolean;
};

type AddCategoryProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdded?: (added: Category[]) => void;
};

export function AddCategory({ open, onOpenChange, onAdded }: AddCategoryProps) {
    const [creating, setCreating] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [order, setOrder] = useState<string>('');

    const [icon, setIcon] = useState<string>('IconFolderFilled');
    const [color, setColor] = useState<string>('#FFFFFF');

    const [isHidden, setIsHidden] = useState(false);
    const [allowAll, setAllowAll] = useState(true);

    function reset() {
        setTitle('');
        setSlug('');
        setOrder('');
        setIcon('IconFolderFilled');
        setColor('#FFFFFF');
        setIsHidden(false);
        setAllowAll(true);
        setErr(null);
        setCreating(false);
    }

    async function create() {
        if (!title.trim()) {
            setErr('Title is required.');
            return;
        }

        setCreating(true);
        setErr(null);

        try {
            const fd = new FormData();
            fd.set('title', title.trim());

            // optionnel : si vide, API slugify(title)
            if (slug.trim()) fd.set('slug', slug.trim());

            // optionnel : si vide, API last+1
            if (order.trim() !== '') fd.set('order', String(Number(order)));

            fd.set('icon', icon || 'IconFolderFilled');
            fd.set('color', color || '#FFFFFF');
            fd.set('isHidden', isHidden ? '1' : '0');
            fd.set('allowAll', allowAll ? '1' : '0');

            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                console.error(msg || 'Create failed');
                setErr(msg || 'Create failed');
                return;
            }

            const json = await res.json();
            const added: Category[] = Array.isArray(json) ? json : json.items ?? [];
            onAdded?.(added);

            onOpenChange(false);
            reset();
        } finally {
            setCreating(false);
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
            <DialogContent className="sm:max-w-[560px] p-6">
                <DialogHeader>
                    <DialogTitle>Create category</DialogTitle>
                    <DialogDescription>Create a new category (slug/order can be auto-generated).</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Title (required)</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Category title" />
                        </div>

                        <div className="space-y-2">
                            <Label>Slug (optional)</Label>
                            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto from title if empty" />
                        </div>

                        <div className="space-y-2">
                            <Label>Order (optional)</Label>
                            <Input type="number" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Auto" />
                        </div>

                        <div className="space-y-2">
                            <Label>Visibility</Label>
                            <div className="flex items-center gap-3 pt-2">
                                <Switch checked={!isHidden} onCheckedChange={(v) => setIsHidden(!v)} />
                                <Label>Visible</Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Icon</Label>
                            <div className="flex items-center gap-3">
                                <IconPickerDialog value={icon} onChange={setIcon} triggerLabel="Change" currentColor={color} />
                                <Button variant="destructive" onClick={() => setIcon('IconFolderFilled')} disabled={creating}>
                                    Reset
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-3">
                                <ColorPickerDialog value={color} onChange={setColor} triggerLabel="Change" currentIcon={icon} />
                                <Button variant="destructive" onClick={() => setColor('#FFFFFF')} disabled={creating}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Allow “All” collection</Label>
                        <div className="flex items-center gap-3 pt-2">
                            <Switch checked={allowAll} onCheckedChange={setAllowAll} />
                            <Label>Enabled</Label>
                        </div>
                    </div>

                    {err ? (
                        <Alert variant="destructive">
                            <IconAlertOctagonFilled />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="break-words">{err}</AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <DialogFooter className="mt-5">
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={creating}>
                        Cancel
                    </Button>
                    <Button onClick={create} disabled={creating || !title.trim()}>
                        {creating ? 'Creating…' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
