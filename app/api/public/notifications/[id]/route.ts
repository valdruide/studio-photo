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

        const existingReads = await pb.collection('notification_reads').getFullList({
            filter: `notificationId = "${id}"`,
        });

        const existingRead = existingReads[0];

        if (isRead && !existingRead) {
            const result = await pb.collection('notification_reads').create({
                notificationId: id,
                readAt: new Date().toISOString(),
            });

            return NextResponse.json(result);
        }

        if (!isRead && existingRead) {
            await pb.collection('notification_reads').delete(existingRead.id);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update notification read state:', error);
        return NextResponse.json({ error: 'Failed to update notification read state' }, { status: 500 });
    }
}
