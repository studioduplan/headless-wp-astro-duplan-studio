const cache = new Map<string, { width: number; height: number } | null>();

export async function getSvgDimensions(url: string) {
    if (cache.has(url)) return cache.get(url);

    try {
        const res = await fetch(url);
        const text = await res.text();

        const viewBoxMatch = text.match(/viewBox=["']([\d.\s-]+)["']/);
        const widthMatch = text.match(/width=["'](\d+(\.\d+)?)["']/);
        const heightMatch = text.match(/height=["'](\d+(\.\d+)?)["']/);

        let dimensions = null;

        if (widthMatch && heightMatch) {
            dimensions = {
                width: parseFloat(widthMatch[1]),
                height: parseFloat(heightMatch[1])
            };
        } else if (viewBoxMatch) {
            const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
            if (parts.length === 4) {
                dimensions = { width: parts[2], height: parts[3] };
            }
        }

        cache.set(url, dimensions);
        return dimensions;
    } catch {
        cache.set(url, null);
        return null;
    }
}
