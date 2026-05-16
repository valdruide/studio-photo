'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import { registerPhotoView } from '@/lib/stats/registerPhotoView';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategoryView, PhotoItem } from '@/lib/collections/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LightboxCarousel } from '@/components/lightbox-carousel';
import { toast } from 'sonner';

const MasonryGrid = dynamic(() => import('./masonryGrid'), { ssr: false });

type Props =
    | {
          view: CategoryView;
          query: string;
          locked?: false;
          lockedCollection?: false;
          categorySlug?: never;
          categoryTitle?: never;
          collectionSlug?: never;
          collectionTitle?: never;
      }
    | {
          locked: true;
          categorySlug: string;
          categoryTitle: string;
          view?: never;
          query?: never;
          lockedCollection?: never;
          collectionSlug?: never;
          collectionTitle?: never;
      }
    | {
          lockedCollection: true;
          collectionSlug: string;
          collectionTitle: string;
          view?: never;
          query?: never;
          locked?: never;
          categorySlug?: never;
          categoryTitle?: never;
      };

export default function SectionCardsClient(props: Props) {
    if (props.locked) {
        return <LockedCategoryView categorySlug={props.categorySlug} categoryTitle={props.categoryTitle} />;
    }

    if (props.lockedCollection) {
        return <LockedCollectionView collectionSlug={props.collectionSlug} collectionTitle={props.collectionTitle} />;
    }

    return <UnlockedCategoryView view={props.view} />;
}

function LockedCategoryView({ categorySlug, categoryTitle }: { categorySlug: string; categoryTitle: string }) {
    const router = useRouter();
    const [unlockOpen, setUnlockOpen] = useState(true);
    const [password, setPassword] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    const submitPassword = async () => {
        setUnlocking(true);

        const res = await fetch('/api/public/categories/unlock', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                slug: categorySlug,
                password,
            }),
        });

        setUnlocking(false);

        if (!res.ok) {
            toast.error('Wrong password');
            return;
        }

        toast.success('Access granted');
        setUnlockOpen(false);
        setPassword('');
        router.refresh();
    };

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5 border">
                <CardHeader className="gap-0">
                    <CardTitle className="text-3xl capitalize text-primary">{categorySlug}</CardTitle>
                    <CardDescription className="capitalize text-lg">{categoryTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This category is protected by a password.</p>
                    <Button className="mt-4" onClick={() => setUnlockOpen(true)}>
                        Unlock category
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={unlockOpen} onOpenChange={setUnlockOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Protected category</AlertDialogTitle>
                        <AlertDialogDescription>Enter the password to access this category.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 px-3 pb-3">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !unlocking) {
                                    submitPassword();
                                }
                            }}
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setUnlockOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={submitPassword} disabled={unlocking || !password.trim()}>
                                {unlocking ? 'Checking...' : 'Enter'}
                            </Button>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function UnlockedCategoryView({ view }: { view: CategoryView }) {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const active = useMemo(() => view.items.find((item) => item.id === activeId) ?? null, [activeId, view.items]);

    useEffect(() => {
        if (!open || !active) return;

        registerPhotoView({
            photoId: active.id,
            collectionId: active.collectionId,
            categoryId: active.categoryId,
        });
    }, [open, active]);

    const onOpen = (item: PhotoItem) => {
        setActiveId(item.id);
        setOpen(true);
    };

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5 border">
                <CardHeader className="gap-0">
                    <CardTitle className="text-3xl capitalize text-primary">{view.category}</CardTitle>
                    <CardDescription className="capitalize text-lg">{view.title}</CardDescription>
                </CardHeader>
                {view.description && (
                    <CardContent>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: view.description }} />
                    </CardContent>
                )}
            </Card>

            <MasonryGrid items={view.items} onOpen={onOpen} />

            <LightboxCarousel open={open} onOpenChange={setOpen} items={view.items} activeId={activeId} onActiveIdChange={setActiveId} />
        </>
    );
}

function LockedCollectionView({ collectionSlug, collectionTitle }: { collectionSlug: string; collectionTitle: string }) {
    const router = useRouter();
    const [unlockOpen, setUnlockOpen] = useState(true);
    const [password, setPassword] = useState('');
    const [unlocking, setUnlocking] = useState(false);

    const submitPassword = async () => {
        setUnlocking(true);

        const res = await fetch('/api/public/collections/unlock', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                slug: collectionSlug,
                password,
            }),
        });

        setUnlocking(false);

        if (!res.ok) {
            toast.error('Wrong password');
            return;
        }

        toast.success('Access granted');
        setUnlockOpen(false);
        setPassword('');
        router.refresh();
    };

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5">
                <CardHeader className="gap-0">
                    <CardTitle className="text-3xl capitalize text-primary">{collectionSlug}</CardTitle>
                    <CardDescription className="capitalize text-lg">{collectionTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">This collection is protected by a password.</p>
                    <Button className="mt-4" onClick={() => setUnlockOpen(true)}>
                        Unlock collection
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={unlockOpen} onOpenChange={setUnlockOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Protected collection</AlertDialogTitle>
                        <AlertDialogDescription>Enter the password to access this collection.</AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !unlocking) {
                                    submitPassword();
                                }
                            }}
                        />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setUnlockOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={submitPassword} disabled={unlocking || !password.trim()}>
                                {unlocking ? 'Checking...' : 'Enter'}
                            </Button>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
