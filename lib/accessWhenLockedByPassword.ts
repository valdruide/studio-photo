import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.CATEGORY_UNLOCK_SECRET || 'dev-secret-change-me';

function sign(value: string) {
    return createHmac('sha256', SECRET).update(value).digest('base64url');
}

export function makeCategoryAccessToken(categoryId: string) {
    const payload = Buffer.from(JSON.stringify({ categoryId })).toString('base64url');
    const signature = sign(payload);
    return `${payload}.${signature}`;
}

export function verifyCategoryAccessToken(token: string, expectedCategoryId: string) {
    try {
        const [payload, signature] = token.split('.');
        if (!payload || !signature) return false;

        const expectedSignature = sign(payload);

        const a = Buffer.from(signature);
        const b = Buffer.from(expectedSignature);

        if (a.length !== b.length) return false;
        if (!timingSafeEqual(a, b)) return false;

        const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return parsed?.categoryId === expectedCategoryId;
    } catch {
        return false;
    }
}

export function makeCollectionAccessToken(collectionId: string) {
    const payload = Buffer.from(JSON.stringify({ collectionId })).toString('base64url');
    const signature = sign(payload);
    return `${payload}.${signature}`;
}

export function verifyCollectionAccessToken(token: string, expectedCollectionId: string) {
    try {
        const [payload, signature] = token.split('.');
        if (!payload || !signature) return false;

        const expectedSignature = sign(payload);

        const a = Buffer.from(signature);
        const b = Buffer.from(expectedSignature);

        if (a.length !== b.length) return false;
        if (!timingSafeEqual(a, b)) return false;

        const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return parsed?.collectionId === expectedCollectionId;
    } catch {
        return false;
    }
}
