import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

export async function GET(req: Request) {
    return withAdmin(async (pb) => {
        const url = new URL(req.url);
        const onlyVisible = url.searchParams.get('onlyVisible') === '1';

        const items = await pb.collection('categories').getFullList({
            sort: 'order',
            ...(onlyVisible ? { filter: 'isHidden = false' } : {}),
        });

        return NextResponse.json({ items });
    });
}
