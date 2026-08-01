import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { ProofingGalleryClient, ProofingGalleryUnlock } from '@/components/proofing/client/proofing-gallery-client';
import { getProofingGallery, getProofingGalleryPhotos } from '@/lib/proofing/getProofingGalleries';
import {
    isPocketBaseNotFoundError,
    type PublicProofingAccessBlockReason,
    resolvePublicProofingAccess,
} from '@/lib/proofing/publicProofingAccess';

function formatExpirationDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return null;

    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function getUnavailableCopy(reason: PublicProofingAccessBlockReason, expiresAt: string | null) {
    if (reason === 'draft') {
        return {
            title: 'This gallery is not yet available',
            description: 'The photographer has not yet published this gallery. The link will be accessible once the gallery is activated.',
        };
    }

    if (reason === 'archived') {
        return {
            title: 'This gallery has been archived',
            description: 'This gallery is no longer accessible from this link. Contact the photographer if you need access again.',
        };
    }

    if (reason === 'expired') {
        return {
            title: 'This gallery has expired',
            description: 'The access period for this gallery has ended. Contact the photographer if you need a new access.',
        };
    }

    if (reason === 'expiresAt') {
        const formattedDate = formatExpirationDate(expiresAt);

        return {
            title: 'This gallery link has expired',
            description: formattedDate
                ? `Access to this gallery ended on ${formattedDate}. Contact the photographer if you need a new access.`
                : 'The access period for this gallery has ended. Contact the photographer if you need a new access.',
        };
    }

    return {
        title: 'This gallery is unavailable',
        description: 'The link cannot be opened at the moment. Contact the photographer if the problem persists.',
    };
}

function ProofingGalleryUnavailable({
    expiresAt,
    reason,
    title,
}: {
    expiresAt: string | null;
    reason: PublicProofingAccessBlockReason;
    title: string;
}) {
    const copy = getUnavailableCopy(reason, expiresAt);

    return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md rounded-md border bg-card p-6 text-center shadow-sm">
                <p className="mb-2 truncate text-sm font-medium text-muted-foreground">{title}</p>
                <h1 className="text-2xl font-semibold text-primary">{copy.title}</h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>
            </div>
        </main>
    );
}

export default async function PublicProofingGalleryPage({ params }: { params: Promise<{ accessKey: string }> }) {
    const { accessKey } = await params;

    const cookieStore = await cookies();
    const initialAccess = await resolvePublicProofingAccess(accessKey).catch((err) => {
        if (!isPocketBaseNotFoundError(err)) {
            console.error('Public proofing gallery access lookup failed:', err);
        }
        return null;
    });

    if (!initialAccess) notFound();
    if (!initialAccess.isAccessible && initialAccess.blockReason) {
        return (
            <ProofingGalleryUnavailable
                expiresAt={initialAccess.galleryAccess.expiresAt}
                reason={initialAccess.blockReason}
                title={initialAccess.galleryAccess.title}
            />
        );
    }

    const token = cookieStore.get(`proof_access_${initialAccess.galleryAccess.id}`)?.value;
    const resolvedAccess = await resolvePublicProofingAccess(accessKey, token).catch((err) => {
        if (!isPocketBaseNotFoundError(err)) {
            console.error('Public proofing gallery token lookup failed:', err);
        }
        return null;
    });

    if (!resolvedAccess) notFound();
    if (!resolvedAccess.isAccessible && resolvedAccess.blockReason) {
        return (
            <ProofingGalleryUnavailable
                expiresAt={resolvedAccess.galleryAccess.expiresAt}
                reason={resolvedAccess.blockReason}
                title={resolvedAccess.galleryAccess.title}
            />
        );
    }

    const { galleryAccess, hasAccess } = resolvedAccess;

    if (!hasAccess) {
        return <ProofingGalleryUnlock accessKey={galleryAccess.accessKey} title={galleryAccess.title} />;
    }

    const galleryData = await Promise.all([getProofingGallery(accessKey), getProofingGalleryPhotos(galleryAccess.id)]).catch((err) => {
        if (!isPocketBaseNotFoundError(err)) {
            console.error('Public proofing gallery page failed:', err);
        }
        return null;
    });

    if (!galleryData) notFound();

    const [gallery, photos] = galleryData;

    return <ProofingGalleryClient gallery={gallery} photos={photos} />;
}
