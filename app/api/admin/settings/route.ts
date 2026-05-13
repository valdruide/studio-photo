import { NextResponse } from 'next/server';
import { withAdmin } from '@/lib/pb/adminApi';

type SettingsPayload = {
    site_name?: string;
    portfolio_name?: string;
    title?: string;
    logo?: File;
    favicon?: File;
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

        logo: input.logo instanceof File && input.logo.size > 0 ? input.logo : undefined,
        favicon: input.favicon instanceof File && input.favicon.size > 0 ? input.favicon : undefined,

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
            const formData = await req.formData();

            const data = sanitizeSettings({
                site_name: formData.get('site_name'),
                portfolio_name: formData.get('portfolio_name'),
                title: formData.get('title'),
                logo: formData.get('logo'),
                favicon: formData.get('favicon'),
                instagram: formData.get('instagram'),
                tiktok: formData.get('tiktok'),
                facebook: formData.get('facebook'),
                x: formData.get('x'),
                youtube: formData.get('youtube'),
                pinterest: formData.get('pinterest'),
                dribbble: formData.get('dribbble'),
                behance: formData.get('behance'),
                reddit: formData.get('reddit'),
                site_theme: formData.get('site_theme'),
            });

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
