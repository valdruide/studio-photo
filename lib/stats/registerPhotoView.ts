import { getVisitorId } from './getVisitorId';

type RegisterPhotoViewParams = {
    photoId: string;
    collectionId: string;
    categoryId: string;
};

export async function registerPhotoView(params: RegisterPhotoViewParams) {
    const visitorId = getVisitorId();

    if (!visitorId) return;

    try {
        await fetch('/api/public/stats/photo-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...params,
                visitorId,
            }),
        });
    } catch (error) {
        console.error('registerPhotoView failed:', error);
    }
}
