import fs from 'node:fs/promises';
import path from 'node:path';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

const CACHE_DIR = './public/wp-images';
const MAP_FILE = './src/data/image-map.json';

async function downloadImage(url) {
    const filename = path.basename(new URL(url).pathname);
    const localPath = path.join(CACHE_DIR, filename);

    try {
        await fs.access(localPath);
        return filename; // déjà téléchargée
    } catch {}

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Échec téléchargement ${url}`);
    await pipeline(res.body, createWriteStream(localPath));
    console.log(`✓ ${filename}`);
    return filename;
}

export async function fetchAllImages(urls) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const map = {};

    for (const url of urls) {
        try {
            const filename = await downloadImage(url);
            map[url] = `/wp-images/${filename}`;
        } catch (e) {
            console.error(`✗ ${url}:`, e.message);
            map[url] = url; // fallback vers l'URL WP originale
        }
    }

    await fs.mkdir(path.dirname(MAP_FILE), { recursive: true });
    await fs.writeFile(MAP_FILE, JSON.stringify(map, null, 2));
    console.log(`\n${Object.keys(map).length} images traitées`);
}
