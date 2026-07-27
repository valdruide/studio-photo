import 'server-only';
import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

const SUPERUSER_COLLECTION = '_superusers';
const AUTH_COOKIE_NAME = 'pb_auth';
const LOGOUT_COOKIE_NAME = 'pb_auth_logout';

function getPocketBaseUrl() {
    const url = process.env.NEXT_PUBLIC_PB_URL;
    if (!url) throw new Error('NEXT_PUBLIC_PB_URL is missing');

    return url;
}

function isHttpsApp() {
    return process.env.NODE_ENV === 'production' && (process.env.APP_URL?.startsWith('https://') || process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://'));
}

function createPocketBase() {
    return new PocketBase(getPocketBaseUrl());
}

export function getAuthCookieOptions() {
    return {
        httpOnly: true,
        secure: isHttpsApp(),
        sameSite: 'lax' as const,
        path: '/',
    };
}

export function exportAdminAuthCookie(pb: PocketBase) {
    return pb.authStore.exportToCookie(getAuthCookieOptions());
}

export function exportClearAdminAuthCookie() {
    const pb = createPocketBase();
    pb.authStore.clear();

    return pb.authStore.exportToCookie({
        ...getAuthCookieOptions(),
        maxAge: 0,
    });
}

export function exportLogoutMarkerCookie() {
    return `${LOGOUT_COOKIE_NAME}=1; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax${isHttpsApp() ? '; Secure' : ''}`;
}

export function exportClearLogoutMarkerCookie() {
    return `${LOGOUT_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${isHttpsApp() ? '; Secure' : ''}`;
}

function hasLogoutMarker(cookieHeader?: string | null) {
    return new RegExp(`(?:^|;\\s*)${LOGOUT_COOKIE_NAME}=1(?:;|$)`).test(cookieHeader ?? '');
}

export async function getPBAdmin() {
    const email = process.env.PB_ADMIN_EMAIL;
    const password = process.env.PB_ADMIN_PASSWORD;

    if (!email) throw new Error('PB_ADMIN_EMAIL is missing');
    if (!password) throw new Error('PB_ADMIN_PASSWORD is missing');

    const pb = createPocketBase();

    await pb.collection(SUPERUSER_COLLECTION).authWithPassword(email, password);

    return pb;
}

export function requireAdmin(pb: PocketBase) {
    return pb.authStore.isValid && pb.authStore.record?.collectionName === SUPERUSER_COLLECTION;
}

export async function getPBAdminFromCookie(cookieHeader?: string | null) {
    if (hasLogoutMarker(cookieHeader)) return null;

    const pb = createPocketBase();

    if (cookieHeader) {
        pb.authStore.loadFromCookie(cookieHeader, AUTH_COOKIE_NAME);
    }

    if (!requireAdmin(pb)) return null;

    try {
        await pb.collection(SUPERUSER_COLLECTION).authRefresh();
    } catch {
        pb.authStore.clear();
        return null;
    }

    return requireAdmin(pb) ? pb : null;
}

export async function getPBAdminFromCurrentCookies() {
    const cookieStore = await cookies();
    return getPBAdminFromCookie(cookieStore.toString());
}
