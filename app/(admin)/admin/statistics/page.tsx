import { getStatisticsOverview } from '@/lib/stats/getStatisticsOverview';
import { StatisticsClient } from './statisticsClient';

export default async function StatisticsPage() {
    const stats = await getStatisticsOverview();

    return <StatisticsClient stats={stats} />;
}
