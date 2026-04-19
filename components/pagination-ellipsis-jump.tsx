'use client';

import { useId, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const PaginationEllipsisJump = ({ totalPages, onGoToPage }: { totalPages: number; onGoToPage: (page: number) => void }) => {
    const [inputValue, setInputValue] = useState('');
    const inputId = useId();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    ...
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-56 space-y-3">
                <div className="space-y-1">
                    <Label htmlFor={inputId}>Go to page</Label>
                    <Input
                        id={inputId}
                        type="number"
                        min={1}
                        max={totalPages}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const parsed = Number(inputValue);

                                if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
                                    onGoToPage(parsed);
                                    setInputValue('');
                                }
                            }
                        }}
                        placeholder={`1 - ${totalPages}`}
                    />
                </div>

                <Button
                    className="w-full"
                    onClick={() => {
                        const parsed = Number(inputValue);

                        if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
                            onGoToPage(parsed);
                            setInputValue('');
                        }
                    }}
                >
                    Go
                </Button>
            </PopoverContent>
        </Popover>
    );
};
