import 'dotenv/config';
import { fetchAllImages } from './fetch-images.mjs';

const query = `
  query AllImages {
    mediaItems(first: 1000) {
      nodes { sourceUrl }
    }
  }
`;

const res = await fetch(process.env.WPGRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
});

const { data } = await res.json();
const urls = [...new Set(data.mediaItems.nodes.map((n) => n.sourceUrl))];

console.log(`${urls.length} images trouvées, téléchargement...`);
await fetchAllImages(urls);
