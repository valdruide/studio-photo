'use client';

import Image from 'next/image';
import { XMasonry, XBlock } from 'react-xmasonry';
import type { PhotoItem } from '@/lib/collections/types';

export default function MasonryGrid({ items, onOpen }: { items: PhotoItem[]; onOpen: (item: PhotoItem) => void }) {
    return (
        <XMasonry>
            {items.map((item) => (
                <XBlock key={item.id}>
                    <button type="button" onClick={() => onOpen(item)} className="rounded-lg overflow-hidden border cursor-pointer m-2">
                        <Image
                            src={item.srcThumb}
                            alt={item.name}
                            width={item.width}
                            height={item.height}
                            unoptimized
                            className="object-cover"
                            sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 320px"
                        />
                    </button>
                </XBlock>
            ))}
        </XMasonry>
    );
}
