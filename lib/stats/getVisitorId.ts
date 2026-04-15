const STORAGE_KEY = 'portfolio_visitor_id';

function generateVisitorId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `visitor_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function getVisitorId() {
    if (typeof window === 'undefined') return null;

    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (!visitorId) {
        visitorId = generateVisitorId();
        localStorage.setItem(STORAGE_KEY, visitorId);
    }

    return visitorId;
}
