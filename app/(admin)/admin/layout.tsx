import { redirect } from 'next/navigation';
import { getPBAdmin, requireAdmin } from '@/lib/pb/adminServer';
import SidebarAdmin from '@/components/admin/sidebar-admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const pb = await getPBAdmin();
    if (!requireAdmin(pb)) redirect('/login');

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <SidebarAdmin />
            <div className="md:col-span-4">{children}</div>
        </div>
    );
}
