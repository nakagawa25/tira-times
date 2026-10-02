// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      // `scope` controls the service worker's control boundary; the plugin's own
      // `base` option (which the Astro integration uses to build the sw.js URL
      // in the register script) must stay at the site's real Vite base ("/"),
      // since that's where the build actually emits sw.js/manifest.webmanifest
      // — Astro's own `base` (the whole-site deploy path) is unset/`/` here,
      // the app merely lives at the route `/app/` within that site.
      scope: '/app/',
      manifest: {
        name: 'Tira times',
        short_name: 'Tira times',
        description: 'Sorteio de times equilibrados para a pelada.',
        start_url: '/app/',
        scope: '/app/',
        display: 'standalone',
        theme_color: '#1b7a3e',
        background_color: '#f4f7f2',
        icons: [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // @vite-pwa/astro rewrites the precached "app/index.html" entry to the
        // directory-style key "app" (matching Astro's own routing format), so
        // the fallback must point at that same key rather than the raw .html path.
        navigateFallback: '/app',
        globPatterns: ['**/*.{html,css,js,svg,woff2}'],
      },
    }),
  ],
});
