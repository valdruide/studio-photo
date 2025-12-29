import sharp from 'sharp';

export async function optimizeToJpeg(input: ArrayBuffer) {
    const img = sharp(Buffer.from(input), { failOn: 'none' }).rotate();

    const resized = img.resize({
        width: 3000,
        height: 3000,
        fit: 'inside',
        withoutEnlargement: true,
    });

    const out = await resized.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    const meta = await sharp(out).metadata();

    return {
        buffer: out,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        filenameExt: 'jpg',
    };
}
