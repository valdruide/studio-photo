import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.LOCK_ACCESS_SECRET || 'dev-secret-change-me';

// prod normale = 30 minutes
const DEFAULT_ACCESS_TTL_SECONDS = 60 * 30;
// pour test, cookie valide 30 secondes
export const LOCK_ACCESS_TTL_SECONDS = Number(process.env.LOCK_ACCESS_TTL_SECONDS || DEFAULT_ACCESS_TTL_SECONDS);

// const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string) {
    return createHmac('sha256', SECRET).update(value).digest('base64url');
}

function encode(payload: Record<string, unknown>) {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decode<T = any>(payload: string): T | null {
    try {
        return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
}

function safeCompare(a: string, b: string) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);

    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
}

function makeSignedToken(payload: Record<string, unknown>) {
    const encodedPayload = encode(payload);
    const signature = sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
}

function verifySignedToken(token: string) {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);
    if (!safeCompare(signature, expectedSignature)) return null;

    return decode<Record<string, unknown>>(payload);
}

export function makeCategoryAccessToken(categoryId: string) {
    return makeSignedToken({
        type: 'category',
        categoryId,
        exp: Math.floor(Date.now() / 1000) + LOCK_ACCESS_TTL_SECONDS,
    });
}

export function verifyCategoryAccessToken(token: string, expectedCategoryId: string) {
    const parsed = verifySignedToken(token);
    if (!parsed) return false;

    if (parsed.type !== 'category') return false;
    if (parsed.categoryId !== expectedCategoryId) return false;
    if (typeof parsed.exp !== 'number') return false;
    if (Date.now() / 1000 > parsed.exp) return false;

    return true;
}

export function makeCollectionAccessToken(collectionId: string) {
    return makeSignedToken({
        type: 'collection',
        collectionId,
        exp: Math.floor(Date.now() / 1000) + LOCK_ACCESS_TTL_SECONDS,
    });
}

export function verifyCollectionAccessToken(token: string, expectedCollectionId: string) {
    const parsed = verifySignedToken(token);
    if (!parsed) return false;

    if (parsed.type !== 'collection') return false;
    if (parsed.collectionId !== expectedCollectionId) return false;
    if (typeof parsed.exp !== 'number') return false;
    if (Date.now() / 1000 > parsed.exp) return false;

    return true;
}
