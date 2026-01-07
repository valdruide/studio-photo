'use client';

import { useEffect, useState } from 'react';
import { CategorieTable } from '@/components/admin/categorieTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddCategory } from '@/components/admin/addCategory';

type Category = { id: string; title: string; slug?: string; isHidden?: boolean; icon?: string | null; color?: string | null };

export default function AdminHome() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [AddCategoryOpen, setAddCategoryOpen] = useState(false);

    async function load() {
        setLoading(true);
        const [catsRes] = await Promise.all([fetch('/api/admin/categories', { cache: 'no-store' })]);

        if (!catsRes.ok) {
            setLoading(false);
            return;
        }

        const cats = await catsRes.json();

        setCategories(cats.items ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function onChangeVisibility(catId: string, isVisible: boolean) {
        // Optimistic update
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, isHidden: !isVisible } : c)));

        const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ isHidden: !isVisible }),
        });

        if (!res.ok) {
            // rollback si erreur
            setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, isHidden: isVisible } : c)));
        }
    }

    async function onToggleAllowAll(catId: string, allowAll: boolean) {
        // Optimistic update
        setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, allowAll } : c)));

        const res = await fetch(`/api/admin/categories/${catId}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ allowAll }),
        });

        if (!res.ok) {
            // rollback si erreur
            setCategories((prev) => prev.map((c) => (c.id === catId ? { ...c, allowAll: !allowAll } : c)));
        }
    }

    return (
        <>
            <AddCategory
                open={AddCategoryOpen}
                onOpenChange={setAddCategoryOpen}
                onAdded={() => {
                    load();
                }}
            />

            <h1 className="text-2xl font-semibold">Dashboard</h1>

            {loading ? (
                <div className="mt-5 text-sm opacity-70">Loading…</div>
            ) : (
                <div className="space-y-4 mt-5">
                    <Card>
                        <CardHeader className="flex justify-between">
                            <CardTitle>Categories</CardTitle>
                            <Button onClick={() => setAddCategoryOpen(true)}>Create category</Button>
                        </CardHeader>
                        <CardContent>
                            <CategorieTable
                                categories={categories}
                                onToggleVisible={onChangeVisibility}
                                onToggleAllowAll={onToggleAllowAll}
                                onDeleted={(catId) => setCategories((prev) => prev.filter((c) => c.id !== catId))}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
