import type { RecordModel } from 'pocketbase';

export function normalizeSlug(input: string) {
    return String(input ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function pbFileUrl(pbBaseUrl: string, record: RecordModel, fileField: string, thumb?: string) {
    const b = pbBaseUrl.replace(/\/+$/, '');
    const filename = (record as any)[fileField] as string | undefined;
    if (!filename) return '';
    // PocketBase files endpoint
    let url = `${b}/api/files/${record.collectionId}/${record.id}/${filename}`;

    return thumb ? `${url}?thumb=${encodeURIComponent(thumb)}` : url;
}
