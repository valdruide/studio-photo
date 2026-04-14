'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContentWide, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CategoryView, PhotoItem } from '@/lib/collections/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZoomLens } from './zoomLens';
import { Kbd } from '@/components/ui/kbd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5">
                <CardHeader>
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

function UnlockedCategoryView({ view }: { view: CategoryView }) {
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const activeIndex = useMemo(() => {
        if (!activeId) return 0;
        const i = view.items.findIndex((x) => x.id === activeId);
        return i >= 0 ? i : 0;
    }, [activeId, view.items]);

    const active = view.items[activeIndex];

    const onOpen = (item: PhotoItem) => {
        setActiveId(item.id);
        setOpen(true);
    };

    const goTo = (index: number) => {
        const item = view.items[index];
        if (item) setActiveId(item.id);
    };

    const goPrev = () => {
        const prevIndex = activeIndex === 0 ? view.items.length - 1 : activeIndex - 1;
        goTo(prevIndex);
    };

    const goNext = () => {
        const nextIndex = activeIndex === view.items.length - 1 ? 0 : activeIndex + 1;
        goTo(nextIndex);
    };

    return (
        <>
            <Card className="lg:max-w-2/3 2xl:max-w-1/2 mb-5">
                <CardHeader>
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContentWide>
                    {open && active && (
                        <>
                            <div className="relative w-full h-[95vh] bg-black/60 rounded-lg overflow-hidden">
                                <div className="relative h-full w-full">
                                    <ZoomLens
                                        src={active.srcOriginal}
                                        imgWidth={active.width}
                                        imgHeight={active.height}
                                        className="h-full w-full"
                                        zoom={1.5}
                                        lensSize={200}
                                    >
                                        <img
                                            src={active.srcOriginal}
                                            alt={active.name}
                                            className="h-full w-full object-contain select-none"
                                            draggable={false}
                                        />
                                    </ZoomLens>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full"
                                    onClick={goPrev}
                                >
                                    <ChevronLeft />
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full"
                                    onClick={goNext}
                                >
                                    <ChevronRight />
                                </Button>

                                <div className="hidden lg:block bg-background/70 backdrop-blur-[2px] p-2 rounded-md border absolute right-5 space-y-1 bottom-5 text-muted-foreground text-sm z-20">
                                    <p>
                                        <Kbd>Scroll</Kbd> : Increase lens size
                                    </p>
                                    <p>
                                        <Kbd>Shift + Scroll</Kbd> : Increase zoom
                                    </p>
                                </div>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center justify-center gap-2 z-20">
                                {view.items.map((item, i) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-label={`Go to slide ${i + 1}`}
                                        onClick={() => goTo(i)}
                                        className={[
                                            'size-3 rounded-full transition',
                                            i === activeIndex
                                                ? 'bg-primary cursor-default ring-1 ring-primary ring-offset-2 ring-offset-background'
                                                : 'bg-secondary hover:bg-primary/70 cursor-pointer border',
                                        ].join(' ')}
                                    />
                                ))}
                            </div>

                            <div className="absolute bottom-5 left-5 flex justify-between z-20">
                                <DialogHeader>
                                    <DialogTitle>{active.name}</DialogTitle>
                                    {active.description && (
                                        <DialogDescription
                                            className="prose prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{ __html: active.description }}
                                        />
                                    )}
                                </DialogHeader>
                            </div>
                        </>
                    )}
                </DialogContentWide>
            </Dialog>
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
                <CardHeader>
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
