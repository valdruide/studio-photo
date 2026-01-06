'use client';

import * as React from 'react';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { IconFolderFilled } from '@tabler/icons-react';

type Props = {
    value?: string | null;
    onChange: (iconName: string) => void;
    triggerLabel?: string;
    currentColor?: string;
};

export function IconPickerDialog({ value, onChange, triggerLabel = 'Choose icon', currentColor }: Props) {
    const [q, setQ] = React.useState('');

    const entries = React.useMemo(() => {
        const all = Object.entries(ICONS_MAP); // [name, Component][]
        const query = q.trim().toLowerCase();
        if (!query) return all;
        return all.filter(([name]) => name.toLowerCase().includes(query));
    }, [q]);

    const SelectedIcon = value && ICONS_MAP[value] ? (ICONS_MAP[value] as any) : IconFolderFilled;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="secondary">
                    <SelectedIcon className="size-5" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[720px] p-6 space-y-5">
                <DialogHeader>
                    <DialogTitle>Pick an icon</DialogTitle>
                </DialogHeader>

                <div className="space-y-3">
                    <Input placeholder="Search… (ex: Flame, User, Heart)" value={q} onChange={(e) => setQ(e.target.value)} />

                    <div className="flex gap-3 items-start">
                        <div className="w-3/4 grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-2 max-h-[420px] overflow-auto">
                            {entries.map(([name, Icon]) => {
                                const isSelected = value === name;
                                const Comp = Icon as any;

                                return (
                                    <Button
                                        variant="outline"
                                        key={name}
                                        className={cn('size-12', isSelected && 'border-primary! bg-primary/15!')}
                                        title={name}
                                        onClick={() => {
                                            onChange(name);
                                        }}
                                    >
                                        <Comp className="size-7" />
                                    </Button>
                                );
                            })}
                        </div>
                        <Card className="w-1/4">
                            <CardHeader>
                                <CardTitle>Preview</CardTitle>
                                <CardDescription>Icon with color</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                <div className="border size-24 rounded-full flex items-center justify-center bg-accent">
                                    <SelectedIcon className="size-12" style={{ color: currentColor || 'currentColor' }} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
