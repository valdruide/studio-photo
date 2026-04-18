'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CollectionsTable, type CollectionRow } from '@/components/admin/collectionsTable';
import { IconPickerDialog } from '@/components/admin/iconPickerDialog';
import { ColorPickerDialog } from '@/components/admin/colorPickerDialog';
import { AddCollection } from '@/components/admin/addCollection';
import { toast } from 'sonner';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Plus, Trash2, RefreshCcw, Save, EyeIcon, EyeOff } from 'lucide-react';
import { useDeleteCategoryDialog } from '@/components/admin/deleteCategoryDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Category = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    icon?: string | null;
    color?: string | null;
    allowAll?: boolean;
    lockedByPassword?: boolean;
};

export default function AdminCategoryEditPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [cat, setCat] = useState<Category | null>(null);
    const [collections, setCollections] = useState<CollectionRow[]>([]);

    const [addCollectionOpen, setAddCollectionOpen] = useState(false);

    const [generatePasswordOpen, setGeneratePasswordOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newGeneratedPassword, setNewGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

    async function load() {
        setLoading(true);

        const [catRes, colsRes] = await Promise.all([
            fetch(`/api/admin/categories/${id}`, { cache: 'no-store' }),
            fetch(`/api/admin/collections?categoryId=${id}`, { cache: 'no-store' }),
        ]);

        if (!catRes.ok) {
            setLoading(false);
            return;
        }

        const catJson = await catRes.json();
        const colsJson = colsRes.ok ? await colsRes.json() : { items: [] };

        setCat({
            ...catJson,
            allowAll: catJson.allowAll ?? true,
            color: catJson.color ?? '#FFFFFF',
            icon: catJson.icon ?? 'IconFolderFilled',
        });
        setCollections(colsJson.items ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [id]);

    async function onReorderCollections(next: CollectionRow[]) {
        const previous = collections;

        setCollections(next);

        const res = await fetch('/api/admin/collections/reorder', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                items: next.map((col) => ({
                    id: col.id,
                    order: col.order ?? 0,
                })),
            }),
        });

        if (!res.ok) {
            setCollections(previous);
            console.error('Failed to reorder collections');
        }
    }

    async function save() {
        if (!cat) return;
        setSaving(true);

        const res = await fetch(`/api/admin/categories/${id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                title: cat.title,
                slug: cat.slug,
                order: cat.order,
                icon: cat.icon,
                color: cat.color,
                isHidden: Boolean(cat.isHidden),
                allowAll: Boolean(cat.allowAll),
                lockedByPassword: Boolean(cat.lockedByPassword),
                password: newPassword || undefined,
            }),
        });

        setSaving(false);
        if (res.ok) {
            setNewPassword('');
            await load(); // recharge collections etc si besoin
            toast.success('Category saved successfully');
        } else {
            const errorText = await res.text();
            toast.error(`Failed to save category: ${res.status} ${errorText}`);
        }
    }

    const deleteDialog = useDeleteCategoryDialog({
        onDelete: async (catId: string) => {
            const res = await fetch(`/api/admin/categories/${catId}`, { method: 'DELETE' });

            if (!res.ok) {
                const msg = await res.text().catch(() => '');
                toast.error(msg || 'Delete failed');
                throw new Error(msg || 'Delete failed');
            }

            toast.success('Category deleted successfully');
            router.push('/admin/settings');
        },
    });

    const handleGeneratePassword = () => {
        const generatedPassword = Array.from({ length: 5 }, () => Math.random().toString(36).substring(2, 8)).join('-');
        setNewGeneratedPassword(generatedPassword);
        toast.info('New password generated. Click "Apply and copy to clipboard" to use it.');
    };
    const handleSaveGeneratedPassword = () => {
        setNewPassword(newGeneratedPassword);
        navigator.clipboard.writeText(newGeneratedPassword);
        toast.success('New password generated and copied to clipboard');
    };

    if (loading)
        return (
            <div className="space-y-5">
                <Skeleton className="w-full h-68 bg-card" />
                <Skeleton className="w-full h-64 bg-card" />
            </div>
        );
    if (!cat) return <div className="text-sm text-red-500">Category not found.</div>;

    return (
        <>
            <AddCollection
                open={addCollectionOpen}
                onOpenChange={setAddCollectionOpen}
                categoryId={id}
                onAdded={() => {
                    // le plus safe : reload complet (ordre/infos cohérents)
                    load();
                }}
            />
            {deleteDialog.dialog}
            <div className="space-y-5">
                <Card>
                    <CardHeader className="flex justify-between w-full">
                        <div className="space-y-2">
                            <CardTitle>Category</CardTitle>
                            <CardDescription>Edit the category details and visual settings</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={save} disabled={saving}>
                                <IconDeviceFloppy className="size-5" /> Save category
                            </Button>
                            <Button variant="destructive" onClick={() => deleteDialog.request(cat.id)}>
                                <Trash2 className="size-5" />
                                Delete category
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-10 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={cat.title ?? ''} onChange={(e) => setCat({ ...cat, title: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Slug</Label>
                                <Input value={cat.slug ?? ''} onChange={(e) => setCat({ ...cat, slug: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Icon</Label>
                                <div className="flex items-center gap-2">
                                    <IconPickerDialog
                                        value={cat.icon ?? 'IconFolderFilled'}
                                        onChange={(iconName) => setCat({ ...cat, icon: iconName })}
                                        triggerLabel="Change"
                                        currentColor={cat.color ?? undefined}
                                    />

                                    <Button variant="destructive" onClick={() => setCat({ ...cat, icon: 'IconFolderFilled' })}>
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex items-center gap-2">
                                    <ColorPickerDialog
                                        value={cat.color}
                                        onChange={(color) => setCat({ ...cat, color })}
                                        triggerLabel="Change"
                                        currentIcon={cat.icon ?? 'IconFolderFilled'}
                                    />
                                    <Button variant="destructive" onClick={() => setCat({ ...cat, color: '#FFFFFF' })}>
                                        Reset
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Visibility</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch checked={!cat.isHidden} onCheckedChange={(v) => setCat({ ...cat, isHidden: !v })} />
                                    <Label>Visible</Label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Locked by password</Label>
                                <div className="flex items-center gap-3 mt-4">
                                    <Switch
                                        checked={Boolean(cat.lockedByPassword)}
                                        onCheckedChange={(v) => setCat({ ...cat, lockedByPassword: v })}
                                    />
                                    <Label>Yes</Label>
                                </div>
                            </div>
                            {cat.lockedByPassword && (
                                <div className="flex gap-2">
                                    <div className="space-y-2">
                                        <Label>New password</Label>
                                        <div className="flex gap-1">
                                            <Input className='w-42' type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                            <Button variant="outline" size="icon" onClick={() => setShowPassword((v) => !v)}>
                                                {showPassword ? <EyeOff className="size-4" /> : <EyeIcon className="size-4" />}
                                            </Button>
                                            <Dialog open={generatePasswordOpen} onOpenChange={setGeneratePasswordOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" className='text-xs'>
                                                        <RefreshCcw className="size-5" />
                                                        Generate
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader className="p-4">
                                                        <DialogTitle>Generate new password</DialogTitle>
                                                        <DialogDescription>Generate a new random password for this category</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex items-center gap-2 mt-5 px-4">
                                                        <Input
                                                            type={showGeneratedPassword ? 'text' : 'password'}
                                                            value={newGeneratedPassword}
                                                            readOnly
                                                            className="font-mono tracking-wide"
                                                        />
                                                        <Button variant="outline" size="icon" onClick={() => setShowGeneratedPassword((v) => !v)}>
                                                            {showGeneratedPassword ? <EyeOff className="size-4" /> : <EyeIcon className="size-4" />}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                handleGeneratePassword();
                                                            }}
                                                        >
                                                            <RefreshCcw className="size-4" />
                                                            Generate
                                                        </Button>
                                                    </div>
                                                    <DialogFooter className="bg-secondary/40 mt-5 border-t py-2 px-4">
                                                        <DialogClose asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                        </DialogClose>
                                                        <Button
                                                            onClick={() => {
                                                                handleSaveGeneratedPassword();
                                                                setGeneratePasswordOpen(false);
                                                            }}
                                                        >
                                                            <Save className="size-4" />
                                                            Apply and copy to clipboard
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Collections in this category</CardTitle>
                            <div className="flex items-center gap-3">
                                <Label className="text-base">Allow &quot;All&quot; collection</Label>
                                <Switch checked={Boolean(cat.allowAll)} onCheckedChange={(v) => setCat({ ...cat, allowAll: v })} />
                                <Button onClick={() => setAddCollectionOpen(true)}>
                                    <Plus />
                                    Create collection
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {collections.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No collection.</div>
                        ) : (
                            <CollectionsTable
                                collections={collections}
                                onReorder={onReorderCollections}
                                onDeleted={(collectionId) => {
                                    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
