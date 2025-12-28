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
};
