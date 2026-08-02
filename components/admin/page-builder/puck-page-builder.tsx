'use client';

import dynamic from 'next/dynamic';
import type { Data } from '@puckeditor/core';

import type { BuilderPage } from '@/lib/page-builder/types';

const PuckPageBuilderEditor = dynamic(() => import('./puck-page-builder-editor').then((module) => module.PuckPageBuilderEditor), {
    ssr: false,
    loading: () => <div className="h-screen bg-background" />,
});

type PageBuilderProps = {
    page: BuilderPage;
    initialData?: Data;
};

export function PuckPageBuilder({ page, initialData }: PageBuilderProps) {
    return <PuckPageBuilderEditor page={page} initialData={initialData} />;
}
