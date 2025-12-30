'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPhotoForm({ collectionId }: { collectionId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [order, setOrder] = useState<number>(0);
    const [isHidden, setIsHidden] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        if (!file) return setErr('Choisis un fichier');

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('collection', collectionId);
            fd.append('file', file);
            fd.append('name', name);
            fd.append('order', String(order));
            fd.append('isHidden', String(isHidden));
            fd.append('description', '');

            const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
            const json = await res.json();

            if (!res.ok) throw new Error(json?.error ?? 'Upload failed');

            setFile(null);
            setName('');
            setOrder(0);
            setIsHidden(false);

            router.refresh(); // recharge la liste
        } catch (e: any) {
            setErr(e?.message ?? 'Erreur');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="border rounded-lg p-4 space-y-3">
            <div className="font-medium">Ajouter une photo</div>

            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

            <input className="border p-2 w-full" placeholder="Nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} />

            <div className="flex gap-3 items-center">
                <input className="border p-2 w-28" type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />
                    hidden
                </label>
            </div>

            {err && <div className="text-red-500 text-sm">{err}</div>}

            <button className="border px-3 py-2" disabled={loading}>
                {loading ? 'Upload...' : 'Uploader'}
            </button>
        </form>
    );
}
