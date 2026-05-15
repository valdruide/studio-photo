'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Info } from 'lucide-react';
import { Calendar1, Funnel, RefreshCw, Trash2 } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { toast } from 'sonner';

type StatisticsClientProps = {
    initialPreset?: string;
    initialFrom?: string;
    initialTo?: string;
    onRefresh?: () => void;
};

const DEFAULT_STATS_PRESET = '30d';

export function StatisticsToolbar({ initialPreset, initialFrom, initialTo, onRefresh }: StatisticsClientProps) {
    const normalizedPreset =
        initialPreset === 'all' || initialPreset === '24h' || initialPreset === '7d' || initialPreset === '30d' || initialPreset === 'custom'
            ? initialPreset
            : DEFAULT_STATS_PRESET;
    const defaultTo = new Date();
    const defaultFrom = addDays(defaultTo, -30);

    const [rangePreset, setRangePreset] = useState<'all' | '24h' | '7d' | '30d' | 'custom'>(normalizedPreset);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        normalizedPreset === 'all'
            ? undefined
            : {
                  from: initialFrom ? new Date(initialFrom) : defaultFrom,
                  to: initialTo ? new Date(initialTo) : defaultTo,
              },
    );

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function updateUrl(next: { preset?: string; from?: Date; to?: Date }) {
        const params = new URLSearchParams(searchParams.toString());

        if (next.preset === 'all') {
            params.set('preset', 'all');
            params.delete('from');
            params.delete('to');
        } else if (!next.preset) {
            params.delete('preset');
            params.delete('from');
            params.delete('to');
        } else {
            params.set('preset', next.preset);

            if (next.from) {
                params.set('from', next.preset === 'custom' ? startOfDay(next.from).toISOString() : next.from.toISOString());
            } else {
                params.delete('from');
            }

            if (next.to) {
                params.set('to', next.preset === 'custom' ? endOfDay(next.to).toISOString() : next.to.toISOString());
            } else {
                params.delete('to');
            }
        }

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    function formatDate(date?: Date) {
        if (!date) return 'N/A';
        return date.toLocaleDateString('fr-FR');
    }

    function applyPreset(preset: 'all' | '24h' | '7d' | '30d' | 'custom') {
        setRangePreset(preset);

        const now = new Date();

        if (preset === 'all') {
            setDateRange(undefined);
            updateUrl({ preset: 'all' });
            return;
        }

        if (preset === '24h') {
            const nextRange = {
                from: addDays(now, -1),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === '7d') {
            const nextRange = {
                from: addDays(now, -7),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === '30d') {
            const nextRange = {
                from: addDays(now, -30),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
            return;
        }

        if (preset === 'custom') {
            const nextRange = dateRange ?? {
                from: addDays(now, -7),
                to: now,
            };
            setDateRange(nextRange);
            updateUrl({ preset, ...nextRange });
        }
    }

    async function handleDeleteAllStatistics() {
        try {
            const response = await fetch('/api/admin/stats/deleteAll', {
                method: 'POST',
            });
            const data = await response.json();

            if (response.ok) {
                toast.success('All statistics have been reset successfully.');
                onRefresh?.();
                router.refresh();
            } else {
                console.error('Failed to reset statistics:', data);
                toast.error(`Failed to reset statistics: ${data.message || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to delete all statistics:', err);
            toast.error('Failed to reset statistics. Please try again.');
        }
    }

    return (
        <>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Info className="size-5 text-primary" />
                Your own views are not included in the statistics when you are logged in with administrator account
            </p>
            <div className="flex justify-between items-end">
                <div className="flex gap-2 justify-between w-full">
                    <div className="flex gap-2">
                        <Drawer direction="right">
                            <DrawerTrigger asChild>
                                <Button size="lg" variant="outline">
                                    <Funnel className="size-5" />
                                    Filter options
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <DrawerHeader>
                                    <DrawerTitle className="flex items-center gap-2">
                                        <Calendar1 className="size-6 text-green-500" />
                                        Filter by date
                                    </DrawerTitle>
                                    <DrawerDescription>
                                        {rangePreset === 'all'
                                            ? 'Showing all-time statistics.'
                                            : rangePreset === 'custom'
                                              ? 'Showing statistics for a custom date range.'
                                              : `Showing statistics for the last ${rangePreset}.`}
                                    </DrawerDescription>
                                </DrawerHeader>
                                <div className="no-scrollbar overflow-y-auto space-y-5 mt-4">
                                    <div className="flex flex-wrap items-center justify-center bg-secondary gap-2 py-2 px-4">
                                        <Button
                                            size="sm"
                                            variant={rangePreset === 'all' ? 'default' : 'outline'}
                                            className="border"
                                            onClick={() => applyPreset('all')}
                                        >
                                            All time
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={rangePreset === '24h' ? 'default' : 'outline'}
                                            className="border"
                                            onClick={() => applyPreset('24h')}
                                        >
                                            24h
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={rangePreset === '7d' ? 'default' : 'outline'}
                                            className="border"
                                            onClick={() => applyPreset('7d')}
                                        >
                                            7d
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={rangePreset === '30d' ? 'default' : 'outline'}
                                            className="border"
                                            onClick={() => applyPreset('30d')}
                                        >
                                            30d
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={rangePreset === 'custom' ? 'default' : 'outline'}
                                            className="border"
                                            onClick={() => applyPreset('custom')}
                                        >
                                            Custom
                                        </Button>
                                    </div>
                                    <div className="space-y-5 px-4">
                                        <div className="flex flex-wrap items-center gap-1 justify-center text-sm">
                                            <span className="text-muted-foreground">Current range:</span>

                                            {rangePreset === 'all' ? (
                                                <Badge variant="secondary">All time</Badge>
                                            ) : (
                                                <>
                                                    <Badge variant="secondary">{formatDate(dateRange?.from)}</Badge>
                                                    <span className="text-muted-foreground">→</span>
                                                    <Badge variant="secondary">{formatDate(dateRange?.to)}</Badge>
                                                </>
                                            )}
                                        </div>
                                        {rangePreset !== 'all' && (
                                            <div className="flex justify-center w-full">
                                                <div className="rounded-xl border p-3 w-fit">
                                                    <Calendar
                                                        // onDayClick={() => applyPreset('custom')}
                                                        mode="range"
                                                        showOutsideDays
                                                        selected={dateRange}
                                                        onSelect={(range) => {
                                                            setDateRange(range);
                                                            if (range?.from && range?.to) {
                                                                setRangePreset('custom');
                                                                updateUrl({
                                                                    preset: 'custom',
                                                                    from: range.from,
                                                                    to: range.to,
                                                                });
                                                            }
                                                        }}
                                                        captionLayout="dropdown"
                                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <DrawerFooter>
                                    <Button
                                        variant="destructive"
                                        disabled={rangePreset === 'all'}
                                        onClick={() => {
                                            setRangePreset('all');
                                            setDateRange(undefined);
                                            updateUrl({ preset: 'all' });
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <DrawerClose asChild>
                                        <Button variant="outline">Close</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </DrawerContent>
                        </Drawer>
                        <div className="border font-medium text-sm bg-input/30 border-input flex items-center rounded-md px-4">
                            Current filter :{' '}
                            <span className="text-primary ml-2">
                                {rangePreset === 'all'
                                    ? 'All time'
                                    : rangePreset === 'custom'
                                      ? `${dateRange?.from?.toLocaleDateString()} to ${dateRange?.to?.toLocaleDateString()}`
                                      : rangePreset}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="h-full group"
                            onClick={() => {
                                onRefresh?.();
                                router.refresh();
                            }}
                        >
                            <RefreshCw className="size-5 group-hover:animate-spin" />
                            Refresh
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="h-full">
                                    <Trash2 className="size-5" />
                                    Reset all statistics
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently reset all statistics.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive/70 hover:bg-destructive text-foreground"
                                        onClick={() => handleDeleteAllStatistics()}
                                    >
                                        <Trash2 className="size-5" />
                                        Confirm
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </>
    );
}
