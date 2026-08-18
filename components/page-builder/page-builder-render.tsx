import { Render } from '@puckeditor/core/rsc';
import type { Config, Data } from '@puckeditor/core';

import { studioPageBuilderConfig } from '@/lib/page-builder/puck-config';

export function PageBuilderRender({ data }: { data: Data }) {
    return <Render config={studioPageBuilderConfig as Config} data={data} />;
}
