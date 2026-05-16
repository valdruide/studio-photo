import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getGlobalTheme, getSiteSettings } from '@/lib/pb/site-settings';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();

    const faviconUrl = settings?.favicon
        ? `${process.env.NEXT_PUBLIC_PB_URL}/api/files/site_settings/${settings.id}/${settings.favicon}`
        : '/favicon.ico';

    return {
        title: settings?.title || 'My Website',
        description: `Portfolio of ${settings?.site_name || '[SITE NAME]'}`,
        icons: {
            icon: faviconUrl,
        },
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const theme = await getGlobalTheme();

    return (
        <html lang="en" data-theme={theme}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <div>{children}</div>
                <Toaster position="top-right" />
            </body>
        </html>
    );
}
