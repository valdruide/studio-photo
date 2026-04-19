// lib\pagination\pagination.ts

type PaginationItem = number | 'left-ellipsis' | 'right-ellipsis';

export function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: PaginationItem[] = [];
    const pagesToShow = new Set<number>();

    pagesToShow.add(1);
    pagesToShow.add(totalPages);

    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i >= 1 && i <= totalPages) {
            pagesToShow.add(i);
        }
    }

    if (currentPage <= 3) {
        pagesToShow.add(2);
        pagesToShow.add(3);
        pagesToShow.add(4);
    }

    if (currentPage >= totalPages - 2) {
        pagesToShow.add(totalPages - 1);
        pagesToShow.add(totalPages - 2);
        pagesToShow.add(totalPages - 3);
    }

    const sortedPages = Array.from(pagesToShow)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    for (let i = 0; i < sortedPages.length; i++) {
        const current = sortedPages[i];
        const previous = sortedPages[i - 1];

        if (i > 0) {
            const gap = current - previous;

            if (gap === 2) {
                items.push(previous + 1);
            } else if (gap > 2) {
                items.push(i === 1 ? 'left-ellipsis' : 'right-ellipsis');
            }
        }

        items.push(current);
    }

    return items;
}
