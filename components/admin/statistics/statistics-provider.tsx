'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { StatisticsToolbar } from '@/components/admin/statistics/statistics-toolbar';
import type { StatisticsOverview } from '@/lib/stats/getStatisticsOverview';

type StatisticsContextValue = {
    stats: StatisticsOverview | null;
    isLoading: boolean;
    error: string | null;
    refreshStats: () => void;
};

const StatisticsContext = createContext<StatisticsContextValue | null>(null);

export function useStatistics() {
    const context = useContext(StatisticsContext);

    if (!context) {
        throw new Error('useStatistics must be used inside StatisticsProvider');
    }

    return context;
}

export function StatisticsProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const previousPathnameRef = useRef(pathname);
    const [stats, setStats] = useState<StatisticsOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const isNewStatisticsPage = previousPathnameRef.current !== pathname;
    const statsQueryString = useMemo(() => {
        const params = new URLSearchParams(queryString);

        if (isNewStatisticsPage) {
            params.delete('preset');
            params.delete('from');
            params.delete('to');
        }

        return params.toString();
    }, [isNewStatisticsPage, queryString]);

    const refreshStats = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadStats() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/admin/stats/overview${statsQueryString ? `?${statsQueryString}` : ''}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Failed to load statistics.');
                }

                const nextStats = (await response.json()) as StatisticsOverview;
                setStats(nextStats);
            } catch (err) {
                if (controller.signal.aborted) return;

                console.error('Failed to load statistics:', err);
                setError(err instanceof Error ? err.message : 'Failed to load statistics.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadStats();

        return () => controller.abort();
    }, [refreshKey, statsQueryString]);

    useEffect(() => {
        if (!isNewStatisticsPage) return;

        previousPathnameRef.current = pathname;

        if (queryString === statsQueryString) return;

        router.replace(statsQueryString ? `${pathname}?${statsQueryString}` : pathname, { scroll: false });
    }, [isNewStatisticsPage, pathname, queryString, router, statsQueryString]);

    const value = useMemo(
        () => ({
            stats,
            isLoading,
            error,
            refreshStats,
        }),
        [error, isLoading, refreshStats, stats],
    );

    return (
        <StatisticsContext.Provider value={value}>
            <div className="space-y-4">
                <StatisticsToolbar
                    key={pathname}
                    initialPreset={searchParams.get('preset') ?? undefined}
                    initialFrom={searchParams.get('from') ?? undefined}
                    initialTo={searchParams.get('to') ?? undefined}
                    onRefresh={refreshStats}
                />
                {children}
            </div>
        </StatisticsContext.Provider>
    );
}
