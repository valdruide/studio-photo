import { Suspense, type ReactNode } from 'react';
import { StatisticsProvider } from '@/components/admin/statistics/statistics-provider';

export default function StatisticsLayout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={<div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">Loading statistics...</div>}>
            <StatisticsProvider>{children}</StatisticsProvider>
        </Suspense>
    );
}
