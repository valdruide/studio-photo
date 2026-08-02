'use client';

import { Puck, type Config, type Data } from '@puckeditor/core';
import { toast } from 'sonner';

import { aboutBuilderData, homepageBuilderData, studioPageBuilderConfig } from '@/lib/page-builder/puck-config';
import type { BuilderPage } from '@/lib/page-builder/types';

type PageBuilderEditorProps = {
    page: BuilderPage;
    initialData?: Data;
};

const pageData: Record<BuilderPage, Data> = {
    homepage: homepageBuilderData,
    about: aboutBuilderData,
};

export function PuckPageBuilderEditor({ page, initialData }: PageBuilderEditorProps) {
    const data = initialData ?? pageData[page];

    async function publish(dataToPublish: Data) {
        const res = await fetch(`/api/admin/page-builder/${page}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ data: dataToPublish }),
        });

        if (!res.ok) {
            throw new Error(`Failed to publish page: ${res.status}`);
        }

        return res.json();
    }

    return (
        <div className="puck-dark-theme h-screen overflow-hidden bg-background">
            <Puck
                config={studioPageBuilderConfig as Config}
                data={data}
                onPublish={async (dataToPublish) => {
                    try {
                        await publish(dataToPublish);
                        toast.success('Page published');
                    } catch (error) {
                        console.error(error);
                        toast.error('Failed to publish page');
                    }
                }}
            />
        </div>
    );
}
