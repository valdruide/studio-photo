import type { ComponentConfig } from '@puckeditor/core';

export const Spacing: ComponentConfig = {
    fields: {
        spacing: {
            type: 'number',
            label: 'Spacing (px)',
        },
    },
    defaultProps: {
        spacing: 50,
    },
    render: ({ spacing }) => {
        return <div style={{ height: `${spacing}px` }} />;
    },
};
