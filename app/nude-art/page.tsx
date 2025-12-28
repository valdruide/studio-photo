import { MasonryProvider } from '@/components/masonry-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
    return (
        <div>
            <MasonryProvider category="nude-art" />
        </div>
    );
}
