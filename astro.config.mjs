import { defineConfig } from 'astro/config';
import compressor from 'astro-compressor';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
    site: 'https://duplan.studio',

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

    output: 'static',

    adapter: node({
        mode: 'standalone'
    }),

    devToolbar: {
        enabled: false
    }
});
