import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { isRead } = await req.json();

        if (typeof isRead !== 'boolean') {
            return NextResponse.json({ error: 'Invalid isRead value' }, { status: 400 });
        }

        const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

        const result = await pb.collection('notifications').update(id, {
            isRead,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to update notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
