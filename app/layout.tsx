import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Triste Fleur',
    description: 'Studio photo Triste Fleur',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
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
                    </SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
