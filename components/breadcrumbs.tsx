'use client';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

const NON_CLICKABLE_HREFS = new Set(['/admin', '/admin/categories', '/admin/collections', '/admin/statistics', '/proofing']);

type BreadcrumbSegment = {
    key: string;
    label: string;
    href?: string;
    current?: boolean;
};

type AdminCollectionBreadcrumb = {
    collectionId: string;
    collectionTitle: string;
    categoryId?: string;
    categoryTitle?: string;
};

type AdminCategoryBreadcrumb = {
    categoryId: string;
    categoryTitle: string;
};

type PublicCategoryBreadcrumb = {
    categorySlug: string;
    categoryTitle: string;
    allowAll: boolean;
};

function formatRouteLabel(route: string) {
    try {
        return decodeURIComponent(route).replace(/-/g, ' ');
    } catch {
        return route.replace(/-/g, ' ');
    }
}

function getAdminCollectionId(pathname: string) {
    const match = pathname.match(/^\/admin\/collections\/([^/]+)$/);
    return match?.[1] ?? null;
}

function getAdminCategoryId(pathname: string) {
    const match = pathname.match(/^\/admin\/categories\/([^/]+)$/);
    return match?.[1] ?? null;
}

function getPublicCollectionPathParts(pathname: string) {
    const routes = pathname.split('/').filter(Boolean);

    if (routes.length !== 2) return null;

    const [categorySlug, collectionSlug] = routes;

    if (!categorySlug || !collectionSlug) return null;
    if (['admin', 'api', 'login', 'proofing'].includes(categorySlug)) return null;

    return {
        categorySlug,
        collectionSlug,
    };
}

export function BreadcrumbsHeader({ pathname = '/' }: { pathname?: string | null }) {
    const safePathname = pathname ?? '/';
    const [adminCollectionBreadcrumb, setAdminCollectionBreadcrumb] = useState<AdminCollectionBreadcrumb | null>(null);
    const [adminCategoryBreadcrumb, setAdminCategoryBreadcrumb] = useState<AdminCategoryBreadcrumb | null>(null);
    const [publicCategoryBreadcrumb, setPublicCategoryBreadcrumb] = useState<PublicCategoryBreadcrumb | null>(null);

    useEffect(() => {
        const collectionId = getAdminCollectionId(safePathname);

        if (!collectionId) {
            return;
        }

        const currentCollectionId = collectionId;
        const controller = new AbortController();

        async function loadAdminCollectionBreadcrumb() {
            try {
                const collectionRes = await fetch(`/api/admin/collections/${currentCollectionId}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!collectionRes.ok) return;

                const collection = await collectionRes.json();
                const categoryId = typeof collection.category === 'string' ? collection.category : undefined;
                let categoryTitle: string | undefined;

                if (categoryId) {
                    const categoryRes = await fetch(`/api/admin/categories/${categoryId}`, {
                        cache: 'no-store',
                        signal: controller.signal,
                    });

                    if (categoryRes.ok) {
                        const category = await categoryRes.json();
                        categoryTitle = typeof category.title === 'string' ? category.title : undefined;
                    }
                }

                setAdminCollectionBreadcrumb({
                    collectionId: currentCollectionId,
                    collectionTitle: typeof collection.title === 'string' ? collection.title : currentCollectionId,
                    categoryId,
                    categoryTitle,
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Failed to load admin collection breadcrumb:', error);
                }
            }
        }

        void loadAdminCollectionBreadcrumb();

        return () => {
            controller.abort();
        };
    }, [safePathname]);

    useEffect(() => {
        const categoryId = getAdminCategoryId(safePathname);

        if (!categoryId) {
            return;
        }

        const currentCategoryId = categoryId;
        const controller = new AbortController();

        async function loadAdminCategoryBreadcrumb() {
            try {
                const categoryRes = await fetch(`/api/admin/categories/${currentCategoryId}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!categoryRes.ok) return;

                const category = await categoryRes.json();

                setAdminCategoryBreadcrumb({
                    categoryId: currentCategoryId,
                    categoryTitle: typeof category.title === 'string' ? category.title : currentCategoryId,
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Failed to load admin category breadcrumb:', error);
                }
            }
        }

        void loadAdminCategoryBreadcrumb();

        return () => {
            controller.abort();
        };
    }, [safePathname]);

    useEffect(() => {
        const publicCollectionParts = getPublicCollectionPathParts(safePathname);

        if (!publicCollectionParts) {
            return;
        }

        const currentCategorySlug = publicCollectionParts.categorySlug;
        const controller = new AbortController();

        async function loadPublicCategoryBreadcrumb() {
            try {
                const categoryRes = await fetch(`/api/public/categories/${currentCategorySlug}`, {
                    cache: 'no-store',
                    signal: controller.signal,
                });

                if (!categoryRes.ok) return;

                const category = await categoryRes.json();

                setPublicCategoryBreadcrumb({
                    categorySlug: currentCategorySlug,
                    categoryTitle: typeof category.title === 'string' ? category.title : currentCategorySlug,
                    allowAll: Boolean(category.allowAll),
                });
            } catch (error) {
                if (!controller.signal.aborted) {
                    console.error('Failed to load public category breadcrumb:', error);
                }
            }
        }

        void loadPublicCategoryBreadcrumb();

        return () => {
            controller.abort();
        };
    }, [safePathname]);

    const segments = useMemo<BreadcrumbSegment[]>(() => {
        const adminCollectionId = getAdminCollectionId(safePathname);
        const adminCategoryId = getAdminCategoryId(safePathname);
        const publicCollectionParts = getPublicCollectionPathParts(safePathname);

        if (adminCollectionId && adminCollectionBreadcrumb?.collectionId === adminCollectionId) {
            return [
                {
                    key: '/admin',
                    label: 'admin',
                },
                {
                    key: adminCollectionBreadcrumb.categoryId ? `/admin/categories/${adminCollectionBreadcrumb.categoryId}` : '/admin/categories',
                    label: adminCollectionBreadcrumb.categoryTitle ?? 'category',
                    href: adminCollectionBreadcrumb.categoryId ? `/admin/categories/${adminCollectionBreadcrumb.categoryId}` : undefined,
                },
                {
                    key: safePathname,
                    label: adminCollectionBreadcrumb.collectionTitle,
                    current: true,
                },
            ];
        }

        if (adminCategoryId && adminCategoryBreadcrumb?.categoryId === adminCategoryId) {
            return [
                {
                    key: '/admin',
                    label: 'admin',
                },
                {
                    key: '/admin/categories',
                    label: 'categories',
                },
                {
                    key: safePathname,
                    label: adminCategoryBreadcrumb.categoryTitle,
                    current: true,
                },
            ];
        }

        if (publicCollectionParts) {
            const categoryBreadcrumb =
                publicCategoryBreadcrumb?.categorySlug === publicCollectionParts.categorySlug ? publicCategoryBreadcrumb : null;

            return [
                {
                    key: `/${publicCollectionParts.categorySlug}`,
                    label: categoryBreadcrumb?.categoryTitle ?? formatRouteLabel(publicCollectionParts.categorySlug),
                    href: categoryBreadcrumb?.allowAll ? `/${publicCollectionParts.categorySlug}` : undefined,
                },
                {
                    key: safePathname,
                    label: formatRouteLabel(publicCollectionParts.collectionSlug),
                    current: true,
                },
            ];
        }

        const routes = safePathname.split('/').filter(Boolean);
        let fullHref = '';

        return routes.map((route, index) => {
            const href = `${fullHref}/${route}`;
            fullHref = href;

            return {
                key: href,
                label: formatRouteLabel(route),
                href: index === routes.length - 1 || NON_CLICKABLE_HREFS.has(href) ? undefined : href,
                current: index === routes.length - 1,
            };
        });
    }, [adminCategoryBreadcrumb, adminCollectionBreadcrumb, publicCategoryBreadcrumb, safePathname]);

    const breadcrumbItems: ReactElement[] = [];

    for (const segment of segments) {
        breadcrumbItems.push(
            <React.Fragment key={segment.key}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    {segment.current ? (
                        <BreadcrumbPage className="capitalize">{segment.label}</BreadcrumbPage>
                    ) : segment.href ? (
                        <BreadcrumbLink asChild>
                            <Link href={segment.href} className="capitalize">
                                {segment.label}
                            </Link>
                        </BreadcrumbLink>
                    ) : (
                        <span className="capitalize text-muted-foreground" aria-disabled="true">
                            {segment.label}
                        </span>
                    )}
                </BreadcrumbItem>
            </React.Fragment>,
        );
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    {segments.length === 0 ? (
                        <BreadcrumbPage>Home</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {breadcrumbItems}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
