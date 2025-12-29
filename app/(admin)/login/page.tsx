'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            setErr('Invalid credentials');
            return;
        }

        router.push('/admin');
        router.refresh();
    }

    return (
        <div className="max-w-sm mx-auto p-6">
            <h1 className="text-2xl mb-4">Admin login</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                {err && <div className="text-destructive">{err}</div>}
                <Button type="submit" className="w-full">
                    Login
                </Button>
            </form>
        </div>
    );
}
