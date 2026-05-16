import { getPBAdmin } from '@/lib/pb/adminServer';
import { pbFileUrl } from '@/lib/collections/pbUtils';
import { PB_THUMBS } from '@/lib/pb/thumbs';
import { hashLockPassword } from '@/lib/passwordLock';
import type { RecordModel } from 'pocketbase';

export const PROOFING_GALLERIES_COLLECTION = 'client_galleries';
export const PROOFING_GALLERY_PHOTOS_COLLECTION = 'client_gallery_photos';

export type ProofingGallery = {
    id: string;
    title: string;
    clientName: string;
    clientEmail: string;
    accessKey: string;
    hasPassword: boolean;
    selectionLimit: number;
    expiresAt: string | null;
    status: 'active' | 'expired' | 'draft' | 'validated' | 'archived';
    validatedAt: string | null;
    notes: string;
    created: string;
    updated: string;
    thumbnailImage: string;
    photosCount: number;
};

export type ProofingGalleryPhoto = {
    id: string;
    collectionId: string;
    galleryRelation: string;
    photo: string;
    photoUrl: string;
    photoThumbUrl: string;
    srcOriginal: string;
    order: number;
    isSelected: boolean;
    clientNote: string;
    created: string;
    updated: string;
};

export type CreateProofingGalleryInput = {
    title: string;
    clientName?: string;
    clientEmail?: string;
    accessKey?: string;
    password?: string;
    selectionLimit?: number;
    expiresAt?: string | null;
    status?: ProofingGallery['status'];
    notes?: string;
};

export type UpdateProofingGalleryInput = Partial<CreateProofingGalleryInput> & {
    validatedAt?: string | null;
};

const DEFAULT_THUMBNAIL = 'https://placehold.co/800x800?text=Gallery';
const STATUSES: ProofingGallery['status'][] = ['active', 'expired', 'draft', 'validated', 'archived'];

function randomAccessKey(length = 10) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let out = '';
    for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}

export function escapeProofingFilterValue(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeDate(value: unknown) {
    if (typeof value !== 'string' || !value.trim()) return null;
    return value;
}

function normalizeStatus(value: unknown): ProofingGallery['status'] {
    return STATUSES.includes(value as ProofingGallery['status']) ? (value as ProofingGallery['status']) : 'draft';
}

function recordToGallery(record: RecordModel, thumbnailImage = DEFAULT_THUMBNAIL, photosCount = 0): ProofingGallery {
    return {
        id: record.id,
        title: String(record.title ?? ''),
        clientName: String(record.clientName ?? ''),
        clientEmail: String(record.clientEmail ?? ''),
        accessKey: String(record.accessKey ?? ''),
        hasPassword: Boolean(record.passwordHash),
        selectionLimit: Number(record.selectionLimit ?? 0),
        expiresAt: normalizeDate(record.expiresAt),
        status: normalizeStatus(record.status),
        validatedAt: normalizeDate(record.validatedAt),
        notes: String(record.notes ?? ''),
        created: String(record.created ?? ''),
        updated: String(record.updated ?? ''),
        thumbnailImage,
        photosCount,
    };
}

function recordToGalleryPhoto(pbBaseUrl: string, record: RecordModel): ProofingGalleryPhoto {
    return {
        id: record.id,
        collectionId: record.collectionId,
        galleryRelation: String(record.galleryRelation ?? ''),
        photo: String(record.photo ?? ''),
        photoUrl: pbFileUrl(pbBaseUrl, record, 'photo'),
        photoThumbUrl: pbFileUrl(pbBaseUrl, record, 'photo', PB_THUMBS.grid),
        srcOriginal: pbFileUrl(pbBaseUrl, record, 'photo'),
        order: Number(record.order ?? 0),
        isSelected: Boolean(record.isSelected),
        clientNote: String(record.clientNote ?? ''),
        created: String(record.created ?? ''),
        updated: String(record.updated ?? ''),
    };
}

async function getGalleryPhotoSummary(pb: Awaited<ReturnType<typeof getPBAdmin>>, galleryId: string) {
    const photos = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).getList(1, 1, {
        filter: `galleryRelation="${escapeProofingFilterValue(galleryId)}"`,
        sort: 'order,created',
        requestKey: null,
    });

    const firstPhoto = photos.items[0];

    return {
        count: photos.totalItems,
        thumbnailImage: firstPhoto ? pbFileUrl(pb.baseURL, firstPhoto, 'photo', PB_THUMBS.grid) || DEFAULT_THUMBNAIL : DEFAULT_THUMBNAIL,
    };
}

export async function getProofingGalleries() {
    const pb = await getPBAdmin();
    const records = await pb.collection(PROOFING_GALLERIES_COLLECTION).getFullList({
        sort: '-created',
    });

    return Promise.all(
        records.map(async (record) => {
            const photoSummary = await getGalleryPhotoSummary(pb, record.id);
            return recordToGallery(record, photoSummary.thumbnailImage, photoSummary.count);
        }),
    );
}

export async function getProofingGallery(idOrAccessKey: string) {
    const pb = await getPBAdmin();
    const safeValue = escapeProofingFilterValue(idOrAccessKey);
    const record = await pb
        .collection(PROOFING_GALLERIES_COLLECTION)
        .getFirstListItem(`id="${safeValue}" || accessKey="${safeValue}"`);
    const photoSummary = await getGalleryPhotoSummary(pb, record.id);

    return recordToGallery(record, photoSummary.thumbnailImage, photoSummary.count);
}

export async function getProofingGalleryPasswordAccess(idOrAccessKey: string) {
    const pb = await getPBAdmin();
    const safeValue = escapeProofingFilterValue(idOrAccessKey);
    const record = await pb
        .collection(PROOFING_GALLERIES_COLLECTION)
        .getFirstListItem(`id="${safeValue}" || accessKey="${safeValue}"`);

    return {
        id: record.id,
        title: String(record.title ?? ''),
        accessKey: String(record.accessKey ?? ''),
        hasPassword: Boolean(record.passwordHash),
        passwordHash: String(record.passwordHash ?? ''),
    };
}

export async function createProofingGallery(input: CreateProofingGalleryInput) {
    const pb = await getPBAdmin();
    const title = input.title.trim();
    if (!title) throw new Error('Title is required');

    const selectionLimit = Number(input.selectionLimit ?? 1);
    if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
        throw new Error('Selection limit must be greater than 0');
    }

    const status = normalizeStatus(input.status);
    const data: Record<string, unknown> = {
        title,
        clientName: input.clientName?.trim() ?? '',
        clientEmail: input.clientEmail?.trim() ?? '',
        accessKey: input.accessKey?.trim() || randomAccessKey(),
        selectionLimit,
        expiresAt: input.expiresAt || null,
        status,
        notes: input.notes?.trim() ?? '',
    };

    const password = input.password?.trim();
    if (password) data.passwordHash = await hashLockPassword(password);
    if (status === 'validated') data.validatedAt = new Date().toISOString();

    const created = await pb.collection(PROOFING_GALLERIES_COLLECTION).create(data);
    return recordToGallery(created);
}

export async function updateProofingGallery(id: string, input: UpdateProofingGalleryInput) {
    const pb = await getPBAdmin();
    const data: Record<string, unknown> = {};

    if (input.title !== undefined) {
        const title = input.title.trim();
        if (!title) throw new Error('Title is required');
        data.title = title;
    }

    if (input.clientName !== undefined) data.clientName = input.clientName.trim();
    if (input.clientEmail !== undefined) data.clientEmail = input.clientEmail.trim();
    if (input.accessKey !== undefined) data.accessKey = input.accessKey.trim();
    if (input.expiresAt !== undefined) data.expiresAt = input.expiresAt || null;
    if (input.notes !== undefined) data.notes = input.notes.trim();
    if (input.validatedAt !== undefined) data.validatedAt = input.validatedAt || null;

    if (input.selectionLimit !== undefined) {
        const selectionLimit = Number(input.selectionLimit);
        if (!Number.isFinite(selectionLimit) || selectionLimit <= 0) {
            throw new Error('Selection limit must be greater than 0');
        }
        data.selectionLimit = selectionLimit;
    }

    if (input.status !== undefined) {
        data.status = normalizeStatus(input.status);
    }

    const password = input.password?.trim();
    if (password) data.passwordHash = await hashLockPassword(password);

    const updated = await pb.collection(PROOFING_GALLERIES_COLLECTION).update(id, data);
    const photoSummary = await getGalleryPhotoSummary(pb, updated.id);
    return recordToGallery(updated, photoSummary.thumbnailImage, photoSummary.count);
}

export async function getProofingGalleryPhotos(galleryId: string) {
    const pb = await getPBAdmin();
    const records = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).getFullList({
        sort: 'order,created',
        filter: `galleryRelation="${escapeProofingFilterValue(galleryId)}"`,
    });

    return records.map((record) => recordToGalleryPhoto(pb.baseURL, record));
}

export async function createProofingGalleryPhotos(galleryId: string, files: File[]) {
    const pb = await getPBAdmin();
    const last = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).getList(1, 1, {
        sort: '-order',
        filter: `galleryRelation="${escapeProofingFilterValue(galleryId)}"`,
    });

    let nextOrder = Number(last.items?.[0]?.order ?? 0) + 1;
    const created: ProofingGalleryPhoto[] = [];

    for (const file of files) {
        const fd = new FormData();
        fd.set('galleryRelation', galleryId);
        fd.set('order', String(nextOrder));
        fd.set('isSelected', 'false');
        fd.set('clientNote', '');
        fd.set('photo', file);

        const record = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).create(fd);
        created.push(recordToGalleryPhoto(pb.baseURL, record));
        nextOrder++;
    }

    return created;
}

export async function updateProofingGalleryPhoto(id: string, data: { order?: number; isSelected?: boolean; clientNote?: string }) {
    const pb = await getPBAdmin();
    const payload: Record<string, unknown> = {};

    if (data.order !== undefined) {
        const order = Number(data.order);
        if (!Number.isFinite(order)) throw new Error('Invalid order');
        payload.order = order;
    }

    if (data.isSelected !== undefined) payload.isSelected = Boolean(data.isSelected);
    if (data.clientNote !== undefined) payload.clientNote = data.clientNote;

    const updated = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).update(id, payload);
    return recordToGalleryPhoto(pb.baseURL, updated);
}

export async function reorderProofingGalleryPhotos(updates: { id: string; order: number }[]) {
    const pb = await getPBAdmin();

    for (const update of updates) {
        const order = Number(update.order);
        if (!update.id || !Number.isFinite(order)) throw new Error('Invalid photo order update');
        await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).update(update.id, { order });
    }

    return { ok: true, count: updates.length };
}

export async function deleteProofingGalleryPhoto(id: string) {
    const pb = await getPBAdmin();
    await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).delete(id);
    return { ok: true };
}

export async function deleteProofingGallery(id: string) {
    const pb = await getPBAdmin();
    const photos = await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).getFullList({
        filter: `galleryRelation="${escapeProofingFilterValue(id)}"`,
        fields: 'id',
    });

    for (const photo of photos) {
        await pb.collection(PROOFING_GALLERY_PHOTOS_COLLECTION).delete(photo.id);
    }

    await pb.collection(PROOFING_GALLERIES_COLLECTION).delete(id);

    return { ok: true, deletedPhotos: photos.length };
}
