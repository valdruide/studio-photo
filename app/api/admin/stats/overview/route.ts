import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';
import { getStatisticsOverview } from '@/lib/stats/getStatisticsOverview';

function getErrorPayload(err: unknown) {
    if (err instanceof Error) {
        return { message: err.message, pb: null };
    }

    if (typeof err === 'object' && err !== null && 'message' in err) {
        const errorWithResponse = err as { message?: unknown; response?: unknown };

        return {
            message: typeof errorWithResponse.message === 'string' ? errorWithResponse.message : 'Internal Server Error',
            pb: errorWithResponse.response ?? null,
        };
    }

    return { message: 'Internal Server Error', pb: null };
}

export async function GET(request: Request) {
    return withAdmin(async () => {
        try {
            const { searchParams } = new URL(request.url);
            const stats = await getStatisticsOverview({
                from: searchParams.get('from') ?? undefined,
                to: searchParams.get('to') ?? undefined,
            });

            return NextResponse.json(stats, { headers: { 'Cache-Control': 'no-store' } });
        } catch (err: unknown) {
            console.error('Failed to load statistics overview:', err);
            const payload = getErrorPayload(err);

            return NextResponse.json(
                payload,
                { status: 500 },
            );
        }
    });
}
