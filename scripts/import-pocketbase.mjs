import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import PocketBase from 'pocketbase';
import sharp from 'sharp';
import { imageSize } from 'image-size';

const PB_URL = process.env.NEXT_PUBLIC_PB_URL;
const EMAIL = process.env.PB_ADMIN_EMAIL;
const PASS = process.env.PB_ADMIN_PASSWORD;

if (!PB_URL || !EMAIL || !PASS) {
    throw new Error('Missing PB_URL / PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD in env');
}

const pb = new PocketBase(PB_URL);

// ====== TUNING ======
const CONVERT_IF_PNG = true;
const CONVERT_IF_BIGGER_THAN_BYTES = 3 * 1024 * 1024; // 3MB
const JPEG_QUALITY = 85;
const MAX_SIDE = 3000; // set null to disable resize (max side in px ex: 3000px)
// ====================

function asHtml(v) {
    if (!v) return '';
    const s = String(v).trim();
    // Si ça ressemble déjà à du HTML, on garde
    if (s.startsWith('<')) return s;
    // Sinon wrap simple
    return `<p>${s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</p>`;
}

async function getBySlugOrNull(collectionName, slug) {
    try {
        return await pb.collection(collectionName).getFirstListItem(`slug="${slug}"`);
    } catch {
        return null;
    }
}

async function upsertBySlug(collectionName, slug, data) {
    const existing = await getBySlugOrNull(collectionName, slug);
    if (existing) {
        return await pb.collection(collectionName).update(existing.id, data);
    }
    return await pb.collection(collectionName).create(data);
}

// Anti-doublon simple: skip si une photo existe déjà avec (collection + order)
// => S'assurer que "order" est unique dans chaque collection
async function photoExists(collectionId, order) {
    try {
        await pb.collection('photos').getFirstListItem(`collection="${collectionId}" && order=${Number(order)}`);
        return true;
    } catch {
        return false;
    }
}

/**
 * Convertit/compresse si besoin, et retourne:
 * - buffer final à uploader
 * - filename final (peut devenir .jpg)
 * - width/height du fichier final
 */
async function prepareImage(filePath) {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext);

    const shouldConvert = (CONVERT_IF_PNG && ext === '.png') || stat.size > CONVERT_IF_BIGGER_THAN_BYTES;

    let outBuffer;

    if (!shouldConvert) {
        outBuffer = fs.readFileSync(filePath);
    } else {
        // sharp pipeline
        let img = sharp(filePath, { failOn: 'none' }).rotate(); // rotate auto via EXIF

        if (MAX_SIDE) {
            img = img.resize({
                width: MAX_SIDE,
                height: MAX_SIDE,
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        outBuffer = await img.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
    }

    const dim = imageSize(outBuffer);
    const width = Number(dim.width ?? 0);
    const height = Number(dim.height ?? 0);

    const outName = shouldConvert ? `${baseName}.jpg` : `${baseName}${ext}`;

    return { outBuffer, outName, width, height, originalSize: stat.size, finalSize: outBuffer.byteLength, converted: shouldConvert };
}

async function main() {
    await pb.admins.authWithPassword(EMAIL, PASS);

    const jsonPath = path.resolve('scripts/import-data.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    for (const cat of data.categories ?? []) {
        const catRecord = await upsertBySlug('categories', cat.slug, {
            slug: cat.slug,
            title: cat.title ?? cat.slug,
            order: Number(cat.order ?? 0),
            isHidden: Boolean(cat.isHidden ?? false),
        });

        for (const col of cat.collections ?? []) {
            const colRecord = await upsertBySlug('photo_collections', col.slug, {
                slug: col.slug,
                title: col.title ?? col.slug,
                description: asHtml(col.descriptionHtml),
                category: catRecord.id,
                order: Number(col.order ?? 0),
                isHidden: Boolean(col.isHidden ?? false),
            });

            for (const p of col.photos ?? []) {
                const filePath = path.resolve(p.file);

                if (!fs.existsSync(filePath)) {
                    console.warn('⚠️ Missing file:', filePath);
                    continue;
                }

                const ord = Number(p.order ?? 0);

                // skip si déjà importé (anti-doublon)
                const exists = await photoExists(colRecord.id, ord);
                if (exists) {
                    console.log('↩️ Skip (already exists):', col.slug, 'order=', ord);
                    continue;
                }

                // 1) prepare (convert/resize) + compute dims
                const prep = await prepareImage(filePath);

                console.log(
                    `Uploading: ${filePath} -> ${prep.outName} | ` +
                        `orig=${prep.originalSize}B final=${prep.finalSize}B` +
                        (prep.converted ? ' (converted)' : '')
                );

                // 2) create record with FormData
                const form = new FormData();
                form.append('collection', colRecord.id);
                form.append('name', p.name ?? prep.outName);
                form.append('description', asHtml(p.descriptionHtml));
                form.append('order', String(ord));
                form.append('isHidden', String(Boolean(p.isHidden ?? false)));

                form.append('width', String(prep.width));
                form.append('height', String(prep.height));

                const fileBlob = new Blob([prep.outBuffer], { type: prep.converted ? 'image/jpeg' : undefined });
                form.append('image', fileBlob, prep.outName);

                await pb.collection('photos').create(form);

                console.log('✅ Imported:', cat.slug, '/', col.slug, '->', p.file);
            }
        }
    }

    console.log('🎉 Import finished');
}

main().catch((e) => {
    console.error('IMPORT ERROR:', e?.message ?? e);
    if (e?.response?.data) {
        console.error('PB response.data:', JSON.stringify(e.response.data, null, 2));
    }

    process.exit(1);
});
