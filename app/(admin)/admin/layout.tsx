import { redirect } from 'next/navigation';
import { getPBAdmin, requireAdmin } from '@/lib/pb/adminServer';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const pb = await getPBAdmin();
    if (!requireAdmin(pb)) redirect('/login');
    return <div>{children}</div>;
}
