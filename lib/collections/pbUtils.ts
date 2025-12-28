import type { RecordModel } from 'pocketbase';

export function normalizeSlug(v: string) {
    return (v || '').trim().toLowerCase().replace(/\s+/g, '-');
}

export function pbFileUrl(pbBaseUrl: string, record: RecordModel, fileField: string) {
    const filename = (record as any)[fileField] as string | undefined;
    if (!filename) return '';
    // PocketBase files endpoint
    return `${pbBaseUrl}/api/files/${record.collectionId}/${record.id}/${filename}`;
}
