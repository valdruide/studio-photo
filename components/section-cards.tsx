'use client';
import Image from 'next/image';
import { XMasonry, XBlock } from 'react-xmasonry';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import type { PhotoCollection, PhotoItem } from '@/lib/collections/types';
import type { CategorySlug, CategoryView } from '@/lib/collections/types';
import { getCategoryView } from '@/lib/collections/getCategoryView';

export default function SectionCards({ category }: { category: CategorySlug }) {
    const searchParams = useSearchParams();
    // Exemple: /portraits?query=sickly
    const query = useMemo(() => searchParams.get('query') ?? 'all', [searchParams]);

    const [view, setView] = useState<CategoryView | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);
            const data = await getCategoryView(category, query);
            console.log(data);
            if (!cancelled) {
                setView(data);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [category, query]);

    if (loading) {
        return <div className="p-6 text-xl">Loading...</div>;
    }

    if (!view) {
        return (
            <div className="p-6 text-xl">
                ⚠️ Can't find project : <span className="font-bold text-destructive">“{query}”</span>
            </div>
        );
    }

    return (
        <>
            <Card className="w-max mb-5 min-w-1/2">
                <CardHeader>
                    <CardTitle className="text-3xl capitalize text-primary">{view.category}</CardTitle>
                    <CardDescription className="capitalize text-lg">{view.title}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{view.description}</p>
                </CardContent>
            </Card>
            <XMasonry>
                {view.items.map((item) => (
                    <XBlock key={item.id}>
                        <Dialog>
                            <DialogTrigger className="rounded-lg overflow-hidden m-2 border cursor-pointer">
                                <Image src={item.src} alt={item.name} />
                            </DialogTrigger>

                            <DialogContent>
                                <Image src={item.src} alt={item.name} className="rounded-t-md" />
                                <DialogHeader className="p-6">
                                    <DialogTitle>{item.name}</DialogTitle>
                                    {item.description && <DialogDescription>{item.description}</DialogDescription>}
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </XBlock>
                ))}
            </XMasonry>
        </>
    );
}
