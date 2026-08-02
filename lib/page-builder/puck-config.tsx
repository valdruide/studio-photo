import type { Config } from '@puckeditor/core';

import { ButtonBlock } from '@/components/puck-editor/blocks/Button';
import { Div } from '@/components/puck-editor/blocks/Div';
import { Flex } from '@/components/puck-editor/blocks/Flex';
import { Grid } from '@/components/puck-editor/blocks/Grid';
import { Image } from '@/components/puck-editor/blocks/Image';
import { Spacing } from '@/components/puck-editor/blocks/Spacing';
import { Text } from '@/components/puck-editor/blocks/Text';
import { TitleBlock } from '@/components/puck-editor/blocks/Title';
import { Card } from '@/components/puck-editor/templates/Card';
import { Footer } from '@/components/puck-editor/templates/Footer';
import { HeroBlock } from '@/components/puck-editor/templates/HeroBlock';
import { TextBlock } from '@/components/puck-editor/templates/TextBlock';

import { getFallbackBuilderData } from './fallback-data';

export const studioPageBuilderConfig: Config = {
    categories: {
        template: {
            components: ['HeroBlock', 'TextBlock', 'Card', 'Footer'],
        },
        layout: {
            components: ['Spacing', 'Grid', 'Flex', 'Div'],
        },
        element: {
            components: ['Button', 'Title', 'Text', 'Image'],
        },
    },
    components: {
        HeroBlock,
        TextBlock,
        Spacing,
        Card,
        Footer,
        Grid,
        Flex,
        Div,
        Button: ButtonBlock,
        Title: TitleBlock,
        Text,
        Image,
    },
};

export const homepageBuilderData = getFallbackBuilderData('homepage');

export const aboutBuilderData = getFallbackBuilderData('about');
