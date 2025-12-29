import type { RecordModel } from 'pocketbase';

export function normalizeSlug(v: string) {
    return (v || '').trim().toLowerCase().replace(/\s+/g, '-');
}

export function pbFileUrl(pbBaseUrl: string, record: RecordModel, fileField: string, thumb?: string) {
    const b = pbBaseUrl.replace(/\/+$/, '');
    const filename = (record as any)[fileField] as string | undefined;
    if (!filename) return '';
    // PocketBase files endpoint
    let url = `${b}/api/files/${record.collectionId}/${record.id}/${filename}`;

    return thumb ? `${url}?thumb=${encodeURIComponent(thumb)}` : url;
}
