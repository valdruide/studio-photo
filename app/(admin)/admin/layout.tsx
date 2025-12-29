import { redirect } from 'next/navigation';
import { getPB, requireAdmin } from '@/lib/pb/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const pb = await getPB();
    if (!requireAdmin(pb)) redirect('/admin/login');
    return <div>{children}</div>;
}
