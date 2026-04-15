'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { Plus, Settings2, HelpCircle, Import, LogOut } from 'lucide-react';
import { AddCategory } from './addCategory';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

type CategoryRow = {
    id: string;
    title: string;
    slug?: string;
    order?: number;
    isHidden?: boolean;
    color?: string | null;
    icon?: string | null;
    allowAll?: boolean;
    lockedByPassword?: boolean;
};

const nav2 = [
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings2,
    },
    {
        title: 'Mass Import',
        href: '/admin/mass-import',
        icon: Import,
    },
    {
        title: 'Help',
        href: '/admin/help',
        icon: HelpCircle,
    },
];

class SmartPointerSensor extends PointerSensor {
    static activators = [
        {
            eventName: 'onPointerDown' as const,
            handler: ({ nativeEvent }: any) => {
                const target = nativeEvent?.target as HTMLElement | null;
                if (!target) return false;

                // on autorise le drag uniquement depuis un handle explicite
                return Boolean(target.closest('[data-dnd-handle]'));
            },
        },
    ];
}

type SortableCategoryItemProps = {
    category: CategoryRow;
    pathname: string;
};

function SortableCategoryItem({ category, pathname }: SortableCategoryItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <SidebarMenuItem ref={setNodeRef} style={style}>
            <div
                className={cn(
                    'flex items-center rounded-md hover:bg-sidebar-accent',
                    pathname === `/admin/categories/${category.id}` && 'bg-sidebar-accent',
                )}
            >
                <button
                    type="button"
                    data-dnd-handle
                    {...attributes}
                    {...listeners}
                    className="inline-flex items-center justify-center rounded-sm p-1 text-muted-foreground cursor-grab active:cursor-grabbing"
                    aria-label={`Reorder ${category.title}`}
                >
                    <IconGripVertical className="size-5" />
                </button>

                <SidebarMenuButton tooltip={category.title} asChild className="flex-1">
                    <Link href={`/admin/categories/${category.id}`}>
                        <span>{category.title}</span>
                    </Link>
                </SidebarMenuButton>
            </div>
        </SidebarMenuItem>
    );
}

export default function SidebarAdmin() {
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [AddCategoryOpen, setAddCategoryOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const router = useRouter();
    const sensors = useSensors(useSensor(SmartPointerSensor));

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', { cache: 'no-store' });

            if (!res.ok) {
                console.error('Failed to load categories:', res.status);
                toast.error('Failed to load categories');
                return;
            }
            const json = await res.json();
            setCategories(json.items ?? []);
        } catch (error) {
            console.error('Admin load failed:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleLogout() {
        try {
            const res = await fetch('/api/admin/logout', {
                method: 'POST',
            });

            if (!res.ok) {
                toast.error('Logout failed');
                return;
            }

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed');
        }
    }

    async function onReorder(next: CategoryRow[]) {
        const previous = categories;
        setCategories(next);

        const res = await fetch('/api/admin/categories/reorder', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                items: next.map((cat) => ({
                    id: cat.id,
                    order: cat.order ?? 0,
                })),
            }),
        });

        if (!res.ok) {
            setCategories(previous);
            console.error('Failed to reorder categories');
            toast.error('Failed to reorder categories');
        }
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);

        if (oldIndex < 0 || newIndex < 0) return;

        const moved = arrayMove(categories, oldIndex, newIndex);
        const next = moved.map((cat, index) => ({
            ...cat,
            order: index + 1,
        }));

        onReorder(next);
    }

    return (
        <>
            <AddCategory
                open={AddCategoryOpen}
                onOpenChange={setAddCategoryOpen}
                onAdded={() => {
                    load();
                }}
            />
            <Sidebar collapsible="none" className="h-[90vh] rounded-xl p-4 bg-card">
                <SidebarHeader>
                    <Button onClick={() => setAddCategoryOpen(true)}>
                        <Plus />
                        Create category
                    </Button>
                </SidebarHeader>
                <Separator className="my-4" />
                <SidebarContent className="overflow-hidden">
                    <SidebarGroup>
                        <SidebarGroupContent className="flex flex-col gap-2">
                            <SidebarMenu>
                                {loading ? (
                                    <>
                                        <Skeleton className="w-full h-8 rounded-md bg-accent" />
                                        <Skeleton className="w-full h-8 rounded-md bg-accent" />
                                    </>
                                ) : (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                        <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                                            {categories.map((category) => (
                                                <SortableCategoryItem key={category.id} category={category} pathname={pathname} />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <Separator className="my-2" />
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {nav2.map((item) => (
                                    <SidebarMenuItem key={item.href} className={cn({ 'bg-sidebar-accent rounded-md': pathname === item.href })}>
                                        <SidebarMenuButton tooltip={item.title} asChild>
                                            <Link href={item.href}>
                                                <item.icon className="size-5" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <Separator className="my-2" />
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="logout"
                                        onClick={handleLogout}
                                        className="cursor-pointer text-destructive-foreground bg-destructive/60 hover:bg-destructive/90 hover:text-destructive-foreground"
                                    >
                                        <LogOut className="size-5" />
                                        <span>Logout</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    );
}
