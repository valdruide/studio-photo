import { getStatisticsOverview } from '@/lib/stats/getStatisticsOverview';
import { StatisticsClient } from './statisticsClient';

type PageProps = {
    searchParams: Promise<{
        from?: string;
        to?: string;
        preset?: string;
    }>;
};

export default async function StatisticsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const stats = await getStatisticsOverview({
        from: params.from,
        to: params.to,
    });

    return <StatisticsClient stats={stats} initialPreset={params.preset} initialFrom={params.from} initialTo={params.to} />;
}
