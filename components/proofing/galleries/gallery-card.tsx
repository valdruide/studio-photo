'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Images, MoreVertical, Pen, Share2, Trash2, User } from 'lucide-react';
import Link from 'next/link';

type GalleryCardProps = {
    id: string;
    title: string;
    dateCreated: string;
    thumbnailImage: string;
    accessKey: string;
    clientName?: string;
    photosCount?: number;
    status?: string;
    onDelete?: (id: string) => void;
    onShare?: (accessKey: string) => void;
};

export function GalleryCard({
    id,
    title,
    dateCreated,
    thumbnailImage,
    accessKey,
    clientName,
    photosCount = 0,
    status = 'draft',
    onDelete,
    onShare,
}: GalleryCardProps) {
    return (
        <Card className="border relative py-0 overflow-hidden group">
            <Link href={`/proofing/edit/${id}`}>
                <div className="relative aspect-square">
                    <img
                        src={thumbnailImage}
                        alt={`${title} thumbnail`}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/90 group-hover:via-black/20 transition-colors duration-300"></div>
                    <div className="absolute left-3 top-3">
                        <Badge variant="secondary" className="capitalize bg-background/80 backdrop-blur-md">
                            {status}
                        </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="min-w-0">
                            <p className="truncate font-medium text-white">{title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75 justify-between">
                                <div className="flex gap-3">
                                    {clientName ? (
                                        <span className="inline-flex min-w-0 items-center gap-1">
                                            <User className="size-4 shrink-0" />
                                            <span className="truncate">{clientName}</span>
                                        </span>
                                    ) : null}
                                    <span className="inline-flex items-center gap-1">
                                        <Images className="size-4" />
                                        {photosCount}
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {new Date(dateCreated).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            <div className="absolute right-3 z-10 top-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs rounded-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer bg-background/30 transition-colors hover:bg-background/50 border rounded-full"
                        >
                            <MoreVertical className="size-6" />
                            <span className="sr-only">Open gallery actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onSelect={() => onShare?.(accessKey)}>
                                <Share2 />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/proofing/edit/${id}`}>
                                    <Pen />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem variant="destructive" onSelect={() => onDelete?.(id)}>
                                <Trash2 />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}
