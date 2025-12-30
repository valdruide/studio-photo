import Link from 'next/link';
import { getPBAdmin } from '@/lib/pb/adminServer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminHome() {
    const pb = await getPBAdmin();

    const categories = await pb.collection('categories').getFullList({
        sort: 'order',
    });

    // On récupère toutes les collections et on groupe par catégorie
    const collections = await pb.collection('photo_collections').getFullList({
        sort: 'order',
    });

    const byCat = new Map<string, any[]>();
    for (const col of collections) {
        const catId = (col as any).category;
        if (!byCat.has(catId)) byCat.set(catId, []);
        byCat.get(catId)!.push(col);
    }

    return (
        <>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="space-y-4 mt-5">
                {categories.map((cat: any) => (
                    <Card key={cat.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-3xl capitalize text-primary">{cat.title}</CardTitle>
                                    <CardDescription>slug: {cat.slug}</CardDescription>
                                </div>
                                <div className="text-sm opacity-70">{cat.isHidden ? 'hidden' : 'visible'}</div>
                            </div>
                        </CardHeader>
                        <CardContent className=" divide-y">
                            {(byCat.get(cat.id) ?? []).map((col: any) => (
                                <div key={col.id} className="flex items-center justify-between py-2">
                                    <div>
                                        <div className="font-medium">{col.title}</div>
                                        <div className="text-sm opacity-70">slug: {col.slug}</div>
                                    </div>
                                    <Button asChild>
                                        <Link className="" href={`/admin/collections/${col.id}`}>
                                            Gérer →
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                            {(byCat.get(cat.id) ?? []).length === 0 && <div className="text-sm opacity-60">Aucune collection</div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
