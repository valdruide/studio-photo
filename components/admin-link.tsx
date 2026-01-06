'use client';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLinkClient() {
    const [isAdmin, setIsAdmin] = useState(false);
    const pathname = usePathname();

    const check = useCallback(() => {
        fetch('/api/admin/me', { cache: 'no-store' })
            .then((r) => r.json())
            .then((d) => setIsAdmin(Boolean(d.isAdmin)))
            .catch(() => setIsAdmin(false));
    }, []);

    useEffect(() => {
        check();
    }, [check, pathname]); // ✅ re-check à chaque navigation

    if (!isAdmin) {
        return (
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
        );
    }

    return (
        <Button variant="destructive" asChild>
            <Link href="/admin">Admin</Link>
        </Button>
    );
}
