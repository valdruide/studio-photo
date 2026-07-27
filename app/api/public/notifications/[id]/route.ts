import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { setNotificationReadState } from '@/lib/notifications/notifications';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    return withAdmin(async () => {
        try {
            const { id } = await params;
            const { isRead } = await req.json();

            if (typeof isRead !== 'boolean') {
                return NextResponse.json({ error: 'Invalid isRead value' }, { status: 400 });
            }

            return NextResponse.json(await setNotificationReadState(id, isRead));
        } catch (error) {
            console.error('Failed to update notification read state:', error);
            return NextResponse.json({ error: 'Failed to update notification read state' }, { status: 500 });
        }
    }, req);
}
