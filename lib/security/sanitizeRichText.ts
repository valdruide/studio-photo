import sanitizeHtml from 'sanitize-html';

export function sanitizeRichText(html?: string) {
    if (!html) return undefined;

    return sanitizeHtml(html, {
        allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'code', 'pre', 'span'],
        allowedAttributes: {
            a: ['href', 'title', 'target', 'rel'],
            span: ['style'], // optionnel (voir remarque plus bas)
        },
        // Empêche les href du type javascript:
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,

        // Force la sécurité des liens sortants
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
        },

        // Facultatif: si tu veux autoriser un peu de style inline
        allowedStyles: {
            span: {
                color: [/^#(0-9a-fA-F){3,6}$/],
                'font-weight': [/^\d{3}$/],
                'text-decoration': [/^underline$/],
            },
        },
    });
}
