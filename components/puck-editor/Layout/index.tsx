import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import type { ComponentConfig, DefaultComponentProps, Fields, ObjectField } from '@puckeditor/core';
import { MarginField, PaddingField } from './padding-field';
import { getLayoutSpacingValue, type BoxSpacingValue } from './spacing';

type LayoutFieldProps = {
    padding?: BoxSpacingValue;
    margin?: BoxSpacingValue;
    spanCol?: number;
    spanRow?: number;
    grow?: boolean;
};

type LayoutFieldValue = {
    padding: BoxSpacingValue;
    margin: BoxSpacingValue;
    spanCol: number;
    spanRow: number;
    grow: boolean;
};

export type WithLayout<Props extends DefaultComponentProps> = Props & {
    layout?: LayoutFieldProps;
};

type LayoutProps = {
    children: ReactNode;
    className?: string;
    layout?: LayoutFieldProps;
    style?: CSSProperties;
};

type WithLayoutOptions = {
    spacingTarget?: 'wrapper' | 'component';
};

export const layoutField: ObjectField<LayoutFieldValue> = {
    type: 'object',
    label: 'Layout',
    objectFields: {
        padding: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => <PaddingField value={value} onChange={onChange} readOnly={readOnly} />,
        },
        margin: {
            type: 'custom',
            render: ({ onChange, value, readOnly }) => <MarginField value={value} onChange={onChange} readOnly={readOnly} />,
        },
        spanCol: {
            label: 'Grid columns',
            type: 'number',
            min: 1,
            max: 12,
        },
        spanRow: {
            label: 'Grid rows',
            type: 'number',
            min: 1,
            max: 12,
        },
        grow: {
            label: 'Flex grow',
            type: 'radio',
            options: [
                { label: 'True', value: true },
                { label: 'False', value: false },
            ],
        },
    },
};

function clampSpan(value?: number) {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;

    return Math.min(Math.max(Math.round(value), 1), 12);
}

function getLayoutPlacementStyle(layout?: LayoutFieldProps): CSSProperties {
    const spanCol = clampSpan(layout?.spanCol);
    const spanRow = clampSpan(layout?.spanRow);

    return {
        gridColumn: spanCol ? `span ${spanCol}` : undefined,
        gridRow: spanRow ? `span ${spanRow}` : undefined,
        flex: layout?.grow ? '1 1 0' : undefined,
    };
}

export function getLayoutSpacingStyle(layout?: LayoutFieldProps): CSSProperties {
    const padding = getLayoutSpacingValue(layout?.padding);
    const margin = getLayoutSpacingValue(layout?.margin);

    return {
        marginTop: `${margin.top}px`,
        marginRight: `${margin.right}px`,
        marginBottom: `${margin.bottom}px`,
        marginLeft: `${margin.left}px`,
        paddingTop: `${padding.top}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
        paddingLeft: `${padding.left}px`,
    };
}

function getLayoutStyle(layout?: LayoutFieldProps, spacingTarget: WithLayoutOptions['spacingTarget'] = 'wrapper'): CSSProperties {
    return {
        ...getLayoutPlacementStyle(layout),
        ...(spacingTarget === 'wrapper' ? getLayoutSpacingStyle(layout) : {}),
    };
}

const Layout = forwardRef<HTMLDivElement, LayoutProps>(({ children, className, style }, ref) => {
    return (
        <div className={className} style={style} ref={ref}>
            {children}
        </div>
    );
});

Layout.displayName = 'Layout';

export { Layout };

export function withLayout(componentConfig: ComponentConfig, options: WithLayoutOptions = {}): ComponentConfig {
    const spacingTarget = options.spacingTarget ?? 'wrapper';

    return {
        ...componentConfig,
        fields: {
            ...componentConfig.fields,
            layout: layoutField,
        },
        defaultProps: {
            ...componentConfig.defaultProps,
            layout: {
                spanCol: 1,
                spanRow: 1,
                padding: {
                    locked: true,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                margin: {
                    locked: true,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                grow: false,
                ...componentConfig.defaultProps?.layout,
            },
        },
        resolveFields: async (data, params) => {
            const componentFields = componentConfig.resolveFields ? await componentConfig.resolveFields(data, params) : componentConfig.fields;

            if (params.parent?.type === 'Grid') {
                return {
                    ...componentFields,
                    layout: {
                        ...layoutField,
                        objectFields: {
                            padding: layoutField.objectFields.padding,
                            margin: layoutField.objectFields.margin,
                            spanCol: layoutField.objectFields.spanCol,
                            spanRow: layoutField.objectFields.spanRow,
                        },
                    },
                } as Fields;
            }

            if (params.parent?.type === 'Flex') {
                return {
                    ...componentFields,
                    layout: {
                        ...layoutField,
                        objectFields: {
                            padding: layoutField.objectFields.padding,
                            margin: layoutField.objectFields.margin,
                            grow: layoutField.objectFields.grow,
                        },
                    },
                } as Fields;
            }

            return {
                ...componentFields,
                layout: {
                    ...layoutField,
                    objectFields: {
                        padding: layoutField.objectFields.padding,
                        margin: layoutField.objectFields.margin,
                    },
                },
            } as Fields;
        },
        inline: true,
        render: (props) => {
            const children = componentConfig.render(props);

            if (props.puck.dragRef) {
                return (
                    <Layout className="puck-layout" layout={props.layout} style={getLayoutStyle(props.layout, spacingTarget)} ref={props.puck.dragRef}>
                        {children}
                    </Layout>
                );
            }

            return (
                <Layout className="puck-layout" layout={props.layout} style={getLayoutStyle(props.layout, spacingTarget)}>
                    {children}
                </Layout>
            );
        },
    };
}
