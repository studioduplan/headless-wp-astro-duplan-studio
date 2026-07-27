import { defineConfig } from 'astro/config';
import compressor from 'astro-compressor';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    site: process.env.VERCEL_ENV === 'production' ? 'https://duplan.studio' : 'http://localhost:4321',

    vite: {
        plugins: [tailwindcss()]
    },

    integrations: [
        sitemap(),
        compressor({
            gzip: true,
            brotli: true
        })
    ],

    output: 'server',

    adapter: node({
        mode: 'standalone'
    }),

    devToolbar: {
        enabled: false
    }
});
