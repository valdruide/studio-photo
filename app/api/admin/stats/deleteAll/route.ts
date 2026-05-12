import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function POST() {
    return withAdmin(async (pb) => {
        try {
            // Supprimer tous les enregistrements de la collection "photos_statistics"
            const records = await pb.collection('photos_statistics').getFullList();
            await Promise.all(records.map((record) => pb.collection('photos_statistics').delete(record.id)));
            return NextResponse.json({ ok: true });
        } catch (err: any) {
            console.error('Failed to reset statistics:', err);
            console.error('PB response:', err?.response);
            return NextResponse.json(
                {
                    message: err?.message ?? 'Internal Server Error',
                    pb: err?.response ?? null,
                },
                { status: 500 },
            );
        }
    });
}
