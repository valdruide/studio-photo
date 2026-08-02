import type { ComponentConfig } from '@puckeditor/core';

export const Flex: ComponentConfig = {
    fields: {
        content: {
            type: 'slot',
            disallow: ['HeroBlock', 'TextBlock', 'Card'],
        },
        direction: {
            type: 'radio',
            label: 'Direction',
            options: [
                { label: 'Row', value: 'row' },
                { label: 'Column', value: 'column' },
            ],
        },
        justify: {
            type: 'select',
            label: 'Justify',
            options: [
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
                { label: 'Between', value: 'between' },
                { label: 'Around', value: 'around' },
            ],
        },
        align: {
            type: 'select',
            label: 'Align',
            options: [
                { label: 'Start', value: 'start' },
                { label: 'Center', value: 'center' },
                { label: 'End', value: 'end' },
                { label: 'Stretch', value: 'stretch' },
            ],
        },
        wrap: {
            type: 'radio',
            label: 'Wrap',
            options: [
                { label: 'No Wrap', value: 'nowrap' },
                { label: 'Wrap', value: 'wrap' },
                { label: 'Wrap Reverse', value: 'wrap-reverse' },
            ],
        },
        gap: {
            type: 'number',
            label: 'Gap (px)',
        },
    },
    defaultProps: {
        content: [],
        direction: 'row',
        justify: 'start',
        align: 'start',
        wrap: 'nowrap',
        gap: 5,
    },
    render: ({ content: Content, direction, justify, align, wrap, gap }) => {
        const justifyContent =
            justify === 'start'
                ? 'flex-start'
                : justify === 'center'
                  ? 'center'
                  : justify === 'end'
                    ? 'flex-end'
                    : justify === 'between'
                      ? 'space-between'
                      : justify === 'around'
                        ? 'space-around'
                        : 'flex-start';
        const alignItems =
            align === 'start'
                ? 'flex-start'
                : align === 'center'
                  ? 'center'
                  : align === 'end'
                    ? 'flex-end'
                    : align === 'stretch'
                      ? 'stretch'
                      : 'flex-start';

        return (
            <Content
                className="mx-auto max-w-7xl px-6 md:px-8"
                style={{
                    display: 'flex',
                    flexDirection: direction,
                    justifyContent,
                    alignItems,
                    flexWrap: wrap,
                    gap: `${gap}px`,
                }}
            />
        );
    },
};
