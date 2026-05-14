import { Card, CardContent } from '@/components/ui/card';

type KpiCardProps = {
    title: string;
    value: string | number;
    icon: React.ReactNode;
};

export function KpiCard({ title, value, icon }: KpiCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
