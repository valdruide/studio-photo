import { redirect } from 'next/navigation';
import { getPBAdmin, requireAdmin } from '@/lib/pb/adminServer';
import SidebarProofing from '@/components/proofing/sidebar-proofing';

export default async function ProofingLayout({ children }: { children: React.ReactNode }) {
    const pb = await getPBAdmin();
    if (!requireAdmin(pb)) redirect('/login');

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            <SidebarProofing />
            <div className="md:col-span-4">{children}</div>
        </div>
    );
}
