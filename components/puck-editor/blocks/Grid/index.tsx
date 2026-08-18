import type { ComponentConfig } from '@puckeditor/core';

export const Grid: ComponentConfig = {
    fields: {
        content: {
            type: 'slot',
            disallow: ['HeroBlock', 'TextBlock', 'Card'],
        },
        columns: {
            type: 'number',
            label: 'Columns',
        },
        rows: {
            type: 'number',
            label: 'Rows',
        },
        gap: {
            type: 'number',
            label: 'Gap (px)',
        },
    },
    defaultProps: {
        content: [],
        columns: 3,
        rows: 2,
        gap: 3,
    },
    render: ({ content: Content, columns, rows, gap }) => (
        <div className="mx-auto max-w-7xl px-6 md:px-8">
            <Content
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gap: `${gap}px`,
                }}
            />
        </div>
    ),
};
