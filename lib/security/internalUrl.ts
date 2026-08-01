export function normalizeInternalUrl(value?: string | null) {
    if (typeof value !== 'string') return undefined;

    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 2048) return undefined;
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return undefined;
    if (trimmed.includes('\\') || /[\u0000-\u001f\u007f]/.test(trimmed)) return undefined;

    try {
        const parsed = new URL(trimmed, 'https://local.invalid');
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return undefined;
    }
}
