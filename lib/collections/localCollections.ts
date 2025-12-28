import type { PhotoCollection } from './types';

import malade1 from '@/public/series/Sickly/malade (1).png';
import malade2 from '@/public/series/Sickly/malade (2).png';
import malade3 from '@/public/series/Sickly/malade (3).png';
import malade4 from '@/public/series/Sickly/malade (4).png';
import malade5 from '@/public/series/Sickly/malade (5).png';
import malade6 from '@/public/series/Sickly/malade (6).png';
import malade7 from '@/public/series/Sickly/malade (7).png';
import malade8 from '@/public/series/Sickly/malade (8).png';

import fallen1 from '@/public/series/Fallen Angels/fallen (1).png';
import fallen2 from '@/public/series/Fallen Angels/fallen (2).png';
import fallen3 from '@/public/series/Fallen Angels/fallen (3).png';
import fallen4 from '@/public/series/Fallen Angels/fallen (4).png';
import fallen5 from '@/public/series/Fallen Angels/fallen (5).png';
import fallen6 from '@/public/series/Fallen Angels/fallen (6).png';
import fallen7 from '@/public/series/Fallen Angels/fallen (7).png';

import mango1 from '@/public/series/Mango/mango (1).png';
import mango2 from '@/public/series/Mango/mango (2).png';
import mango3 from '@/public/series/Mango/mango (3).png';
import mango4 from '@/public/series/Mango/mango (4).png';
import mango5 from '@/public/series/Mango/mango (5).png';
import mango6 from '@/public/series/Mango/mango (6).png';

import neon1 from '@/public/series/Neon/neon (1).png';
import neon2 from '@/public/series/Neon/neon (2).png';

import clair1 from '@/public/series/Clair Obscur/clairObscur (1).png';
import clair2 from '@/public/series/Clair Obscur/clairObscur (2).png';
import clair4 from '@/public/series/Clair Obscur/clairObscur (4).png';
import clair5 from '@/public/series/Clair Obscur/clairObscur (5).png';
import clair7 from '@/public/series/Clair Obscur/clairObscur (7).png';
import clair8 from '@/public/series/Clair Obscur/clairObscur (8).png';
import clair10 from '@/public/series/Clair Obscur/clairObscur (10).png';
import clair11 from '@/public/series/Clair Obscur/clairObscur (11).png';

import grunge1 from '@/public/series/Grunge/grunge (1).png';
import grunge2 from '@/public/series/Grunge/grunge (2).png';

import r2 from '@/public/series/random-nudes/r (2).png';
import r3 from '@/public/series/random-nudes/r (3).png';
import r4 from '@/public/series/random-nudes/r (4).png';
import r6 from '@/public/series/random-nudes/r (6).png';
import r7 from '@/public/series/random-nudes/r (7).png';
import r8 from '@/public/series/random-nudes/r (8).png';

import pantheon1 from '@/public/series/Pantheon/pantheon1.png';
import pantheon2 from '@/public/series/Pantheon/pantheon2.png';
import pantheon3 from '@/public/series/Pantheon/pantheon3.png';
import pantheon4 from '@/public/series/Pantheon/pantheon4.png';
import pantheon5 from '@/public/series/Pantheon/pantheon5.png';

import h1 from '@/public/series/Hard Light/h (1).png';
import h2 from '@/public/series/Hard Light/h (2).png';
import h3 from '@/public/series/Hard Light/h (3).png';
import h4 from '@/public/series/Hard Light/h (4).png';

import cloak1 from '@/public/series/Cloak/cloak (1).png';
import cloak2 from '@/public/series/Cloak/cloak (2).png';
import cloak3 from '@/public/series/Cloak/cloak (3).png';
import cloak4 from '@/public/series/Cloak/cloak (4).png';
import cloak5 from '@/public/series/Cloak/cloak (5).png';

import fgirl1 from '@/public/series/F-girl/f-girl (1).png';
import fgirl2 from '@/public/series/F-girl/f-girl (2).png';
import fgirl3 from '@/public/series/F-girl/f-girl (3).png';
import fgirl4 from '@/public/series/F-girl/f-girl (4).png';
import fgirl5 from '@/public/series/F-girl/f-girl (5).png';
import fgirl6 from '@/public/series/F-girl/f-girl (6).png';
import fgirl7 from '@/public/series/F-girl/f-girl (7).png';

export const LOCAL_COLLECTIONS: Record<string, PhotoCollection> = {
    'fallen-angels': {
        slug: 'fallen-angels',
        title: '[ Fallen Angels ]',
        description: 'A portrait series delving into themes of divinity, rebellion, and redemption through ethereal and haunting imagery',
        category: 'portraits',
        items: [
            { id: 'fallen-1', name: 'Disciple', src: fallen1 },
            { id: 'fallen-2', name: 'Saint', src: fallen2 },
            { id: 'fallen-3', name: 'Fallen Angel', src: fallen3, description: 'Ange déchu' },
            { id: 'fallen-4', name: 'Emissary', src: fallen4, description: 'Émissaire' },
            { id: 'fallen-5', name: 'Anchorite of the holy night', src: fallen5 },
            { id: 'fallen-6', name: 'Inner conflict', src: fallen6 },
            { id: 'fallen-7', name: 'Prophetess of the Immaculate Veil', src: fallen7 },
        ],
    },
    sickly: {
        slug: 'sickly',
        title: '[ Sickly ]',
        description: 'A portrait series exploring themes of vulnerability, illness, and the human condition through evocative imagery',
        category: 'portraits',
        items: [
            { id: 'sickly-1', name: 'Self portrait 1', src: malade1 },
            { id: 'sickly-2', name: 'Self portrait 2', src: malade2 },
            { id: 'sickly-3', name: 'Self portrait 3', src: malade3 },
            { id: 'sickly-4', name: 'Antagoniste', src: malade4 },
            { id: 'sickly-5', name: 'Of fire 🔥', src: malade5 },
            { id: 'sickly-6', name: 'Noir 🖤', src: malade6 },
            { id: 'sickly-7', name: 'Penitent 1', src: malade7 },
            { id: 'sickly-8', name: 'Penitent 2', src: malade8 },
        ],
    },
    mango: {
        slug: 'mango',
        title: 'Mango',
        description: 'A vibrant collection celebrating the allure and beauty of mango-themed nude art photography',
        category: 'nude-art',
        items: [
            { id: 'mango-1', name: 'Mango 1', src: mango1 },
            { id: 'mango-2', name: 'Mango 2', src: mango2 },
            { id: 'mango-3', name: 'Mango 3', src: mango3 },
            { id: 'mango-4', name: 'Mango 4', src: mango4 },
            { id: 'mango-5', name: 'Mango 5', src: mango5 },
            { id: 'mango-6', name: 'Mango 6', src: mango6 },
        ],
    },
    neon: {
        slug: 'neon',
        title: 'Neon',
        description:
            'A striking collection of nude art photography that explores the interplay of light, color, and the human form through neon aesthetics',
        category: 'nude-art',
        items: [
            { id: 'neon-1', name: 'Neon 1', src: neon1 },
            { id: 'neon-2', name: 'Neon 2', src: neon2 },
        ],
    },
    'F-Girl': {
        slug: 'f-girl',
        title: 'F-Girl',
        description: `A collection of photography of "F-Girl" that captures the essence of modern femininity, confidence, and self-expression`,
        category: 'nude-art',
        items: [
            { id: 'f-1', name: 'F-Girl 1', src: fgirl1 },
            { id: 'f-2', name: 'F-Girl 2', src: fgirl2 },
            { id: 'f-3', name: 'F-Girl 3', src: fgirl3 },
            { id: 'f-4', name: 'F-Girl 4', src: fgirl4 },
            { id: 'f-5', name: 'F-Girl 5', src: fgirl5 },
            { id: 'f-6', name: 'F-Girl 6', src: fgirl6 },
            { id: 'f-7', name: 'F-Girl 7', src: fgirl7 },
        ],
    },
    'clair-obscur': {
        slug: 'clair-obscur',
        title: 'Clair-Obscur',
        description:
            'A collection that plays with light and shadow to create dramatic nude art photography, highlighting the contours and forms of the human body',
        category: 'nude-art',
        items: [
            { id: 'clair-1', name: 'Clair Obscur 1', src: clair1 },
            { id: 'clair-2', name: 'Clair Obscur 2', src: clair2 },
            { id: 'clair-4', name: 'Clair Obscur 4', src: clair4 },
            { id: 'clair-5', name: 'Clair Obscur 5', src: clair5 },
            { id: 'clair-7', name: 'Clair Obscur 7', src: clair7 },
            { id: 'clair-8', name: 'Clair Obscur 8', src: clair8 },
            { id: 'clair-10', name: 'Clair Obscur 10', src: clair10 },
            { id: 'clair-11', name: 'Clair Obscur 11', src: clair11 },
        ],
    },
    grunge: {
        slug: 'grunge',
        title: 'Grunge',
        description:
            'An edgy collection that embraces the raw, unpolished aesthetic of the grunge movement, highlighting imperfection and authenticity',
        category: 'nude-art',
        items: [
            { id: 'grunge-1', name: 'Grunge 1', src: grunge1 },
            { id: 'grunge-2', name: 'Grunge 2', src: grunge2 },
        ],
    },
    pantheon: {
        slug: 'pantheon',
        title: 'Pantheon',
        description: 'An artistic exploration of the human form, drawing inspiration from classical sculptures and mythological themes',
        category: 'nude-art',
        items: [
            { id: 'pantheon-1', name: 'Pantheon 1', src: pantheon1 },
            { id: 'pantheon-2', name: 'Pantheon 2', src: pantheon2 },
            { id: 'pantheon-3', name: 'Pantheon 3', src: pantheon3 },
            { id: 'pantheon-4', name: 'Pantheon 4', src: pantheon4 },
            { id: 'pantheon-5', name: 'Pantheon 5', src: pantheon5 },
        ],
    },
    'hard-light': {
        slug: 'hard-light',
        title: 'Hard Light',
        description:
            'A bold collection of nude art photography that emphasizes sharp contrasts and defined lines to showcase the strength and beauty of the human body',
        category: 'nude-art',
        items: [
            { id: 'hardlight-1', name: 'Hard Light 1', src: h1 },
            { id: 'hardlight-2', name: 'Hard Light 2', src: h2 },
            { id: 'hardlight-3', name: 'Hard Light 3', src: h3 },
            { id: 'hardlight-4', name: 'Hard Light 4', src: h4 },
        ],
    },
    cloak: {
        slug: 'cloak',
        title: 'Cloak',
        description:
            'A mysterious and evocative collection of nude art photography that explores themes of concealment and revelation through the use of cloaks and drapery',
        category: 'nude-art',
        items: [
            { id: 'cloak-1', name: 'Cloak 1', src: cloak1 },
            { id: 'cloak-2', name: 'Cloak 2', src: cloak2 },
            { id: 'cloak-3', name: 'Cloak 3', src: cloak3 },
            { id: 'cloak-4', name: 'Cloak 4', src: cloak4 },
            { id: 'cloak-5', name: 'Cloak 5', src: cloak5 },
        ],
    },
    random: {
        slug: 'random',
        title: 'Random',
        description: 'A random assortment of photos from various collections',
        category: 'nude-art',
        items: [
            { id: 'r-2', name: 'Random 2', src: r2 },
            { id: 'r-3', name: 'Random 3', src: r3 },
            { id: 'r-4', name: 'Random 4', src: r4 },
            { id: 'r-6', name: 'Random 6', src: r6 },
            { id: 'r-7', name: 'Random 7', src: r7 },
            { id: 'r-8', name: 'Random 8', src: r8 },
        ],
    },
};
