import path from 'node:path';
import imageMap from '../data/image-map.json';

export function getLocalImage(sourceUrl) {
    return imageMap[sourceUrl] || sourceUrl;
}

export function getLocalImagePath(sourceUrl) {
    const publicUrl = getLocalImage(sourceUrl);

    return path.join(process.cwd(), 'public', publicUrl.replace(/^\//, ''));
}
