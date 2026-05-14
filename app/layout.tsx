import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
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
                <SidebarProvider
                    style={
                        {
                            '--sidebar-width': 'calc(var(--spacing) * 72)',
                            '--header-height': 'calc(var(--spacing) * 12)',
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                        <SiteHeader />
                        <div className="p-5">{children}</div>
                        <Toaster position="top-right" />
                    </SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
