'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '@radix-ui/react-label';
import { ICONS_MAP } from '@/lib/categories/iconsMap';
import { IconFolderFilled } from '@tabler/icons-react';

type Props = {
    value?: string | null;
    onChange: (color: string) => void;
    triggerLabel?: string;
    currentIcon?: string;
};

const PRESETS = ['#FFFFFF', '#0B0B0B', '#FF8C1F', '#FF3D7F', '#8B5CF6', '#22C55E', '#06B6D4', '#3B82F6', '#F59E0B', '#EF4444', '#A3A3A3', '#D946EF'];

function normalizeHex(input: string) {
    if (!input) return '';
    if (input.startsWith('#')) return input;
    return `#${input}`;
}

function isValidHex(hex: string) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function ColorPickerDialog({ value, onChange, triggerLabel = 'Choose color', currentIcon }: Props) {
    const current = normalizeHex(value ?? '#FFFFFF');
    const SelectedIcon = currentIcon && ICONS_MAP[currentIcon] ? (ICONS_MAP[currentIcon] as any) : IconFolderFilled;

    const [hexInput, setHexInput] = React.useState(current);

    // si value change depuis l’extérieur, on sync l’input
    React.useEffect(() => {
        setHexInput(current);
    }, [current]);

    function commitHex(raw: string) {
        const normalized = normalizeHex(raw.trim());
        if (!isValidHex(normalized)) return;
        const full = normalized.toUpperCase();
        onChange(full);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <span className="size-5 rounded-sm" style={{ backgroundColor: current }} />
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px] p-6 space-y-5">
                <DialogHeader>
                    <DialogTitle>Pick a color</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Presets */}
                    <div className="grid grid-cols-6 gap-2">
                        {PRESETS.map((c) => {
                            const selected = current.toLowerCase() === c.toLowerCase();
                            return (
                                <Button
                                    key={c}
                                    variant="ghost"
                                    className={cn('aspect-square size-10', selected && 'ring-2 ring-primary')}
                                    title={c}
                                    onClick={() => {
                                        onChange(c);
                                    }}
                                >
                                    <span className="size-9 border-2 rounded-sm aspect-square" style={{ backgroundColor: c }} />
                                </Button>
                            );
                        })}
                    </div>

                    {/* Native picker */}
                    <Card className="">
                        <CardHeader className="text-sm">
                            <CardTitle>Custom color</CardTitle>
                            <CardDescription>Pick a custom color or enter custom hex</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-4 items-center">
                                <Label>Color picker:</Label>
                                <input
                                    aria-label="Pick a custom color"
                                    type="color"
                                    value={current}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="h-10 w-14 cursor-pointer"
                                />
                            </div>
                            <div className="flex gap-4 items-center">
                                <Label htmlFor="customHex">Custom Hex:</Label>
                                <div>
                                    <Input
                                        id="customHex"
                                        value={hexInput}
                                        placeholder="Enter custom hex color"
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setHexInput(v);
                                            // commit “live” si valide (optionnel)
                                            const n = normalizeHex(v);
                                            if (isValidHex(n)) commitHex(n);
                                        }}
                                        onBlur={() => commitHex(hexInput)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                commitHex(hexInput);
                                            }
                                        }}
                                    />
                                    {hexInput && !isValidHex(normalizeHex(hexInput)) && (
                                        <p className="text-xs text-destructive">Invalid hex format. Use #RRGGBB.</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* PREVIEW WITH ICON */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>Icon with color</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            <div className="border size-24 rounded-full flex items-center justify-center bg-accent">
                                <SelectedIcon className="size-12" style={{ color: current || 'currentColor' }} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}
