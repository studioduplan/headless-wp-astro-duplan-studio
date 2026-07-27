export async function GET() {
    const perPage = 100;
    let page = 1;
    let allPages = [];
    let totalPages = 1;

    do {
        const res = await fetch(`http://localhost:8086/wp-json/wp/v2/pages?per_page=${perPage}&page=${page}&_fields=slug,modified,status`);
        if (!res.ok) break;
        totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1', 10);
        const data = await res.json();
        allPages = allPages.concat(data);
        page++;
    } while (page <= totalPages);

    const urls = allPages.filter((p) => p.status === 'publish').map((p) => ({ loc: `/${p.slug}`, lastmod: p.modified }));

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) => `  <url>
    <loc>http://localhost:8086${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`
    )
    .join('\n')}
</urlset>`;

    return new Response(body, {
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
}
