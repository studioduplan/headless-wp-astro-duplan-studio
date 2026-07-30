import fs from 'node:fs/promises';
import path from 'node:path';

const cache = new Map<string, { width: number; height: number } | null>();

export async function getSvgDimensions(url: string) {
    if (cache.has(url)) {
        return cache.get(url);
    }

    try {
        // Si on reçoit une URL publique (/wp-images/...)
        const filePath = url.startsWith('/') ? path.join(process.cwd(), 'public', url.slice(1)) : url;

        const text = await fs.readFile(filePath, 'utf8');

        const viewBoxMatch = text.match(/viewBox=["']([\d.\s-]+)["']/);
        const widthMatch = text.match(/width=["'](\d+(\.\d+)?)["']/);
        const heightMatch = text.match(/height=["'](\d+(\.\d+)?)["']/);

        let dimensions = null;

        if (widthMatch && heightMatch) {
            dimensions = {
                width: Number(widthMatch[1]),
                height: Number(heightMatch[1])
            };
        } else if (viewBoxMatch) {
            const [, , width, height] = viewBoxMatch[1].trim().split(/\s+/).map(Number);

            dimensions = { width, height };
        }

        cache.set(url, dimensions);
        return dimensions;
    } catch (e) {
        console.warn(`Impossible de lire ${url}`, e);
        cache.set(url, null);
        return null;
    }
}
