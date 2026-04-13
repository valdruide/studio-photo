import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

type SettingsPayload = {
    site_name?: string;
    portfolio_name?: string;
    title?: string;
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    x?: string;
    youtube?: string;
    pinterest?: string;
    dribbble?: string;
    behance?: string;
    reddit?: string;
    site_theme?: string;
};

function sanitizeSettings(input: any): SettingsPayload {
    return {
        site_name: typeof input.site_name === 'string' ? input.site_name.trim() : '',
        portfolio_name: typeof input.portfolio_name === 'string' ? input.portfolio_name.trim() : '',
        title: typeof input.title === 'string' ? input.title.trim() : '',
        instagram: typeof input.instagram === 'string' ? input.instagram.trim() : '',
        tiktok: typeof input.tiktok === 'string' ? input.tiktok.trim() : '',
        facebook: typeof input.facebook === 'string' ? input.facebook.trim() : '',
        x: typeof input.x === 'string' ? input.x.trim() : '',
        youtube: typeof input.youtube === 'string' ? input.youtube.trim() : '',
        pinterest: typeof input.pinterest === 'string' ? input.pinterest.trim() : '',
        dribbble: typeof input.dribbble === 'string' ? input.dribbble.trim() : '',
        behance: typeof input.behance === 'string' ? input.behance.trim() : '',
        reddit: typeof input.reddit === 'string' ? input.reddit.trim() : '',
        site_theme: typeof input.site_theme === 'string' ? input.site_theme.trim() : '',
    };
}

export async function GET() {
    return withAdmin(async (pb) => {
        try {
            const result = await pb.collection('site_settings').getList(1, 1);

            return NextResponse.json({
                item: result.items[0] ?? null,
            });
        } catch (err: any) {
            console.error('GET /api/admin/settings failed:', err);
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

export async function PATCH(req: Request) {
    return withAdmin(async (pb) => {
        try {
            const body = await req.json();
            const data = sanitizeSettings(body);

            const result = await pb.collection('site_settings').getList(1, 1);

            let item;

            if (result.items.length === 0) {
                item = await pb.collection('site_settings').create(data);
            } else {
                item = await pb.collection('site_settings').update(result.items[0].id, data);
            }

            return NextResponse.json({ item });
        } catch (err: any) {
            console.error('PATCH /api/admin/settings failed:', err);
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
