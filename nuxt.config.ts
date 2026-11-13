import tailwindcss from '@tailwindcss/vite'
import { PRESETS } from './shared/presets'

const fonts = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Inter:wght@800&family=Playfair+Display:wght@700&family=Bebas+Neue&family=Caveat:wght@700&family=Space+Grotesk:wght@700&family=Lora:wght@600&family=Archivo+Black&family=DM+Serif+Display&display=swap'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  runtimeConfig: { public: { siteUrl: 'https://saapost.kreativekorna.com' } },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0b0b10' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: fonts },
      ],
    },
  },
  nitro: {
    prerender: { crawlLinks: true, routes: ['/', '/sitemap.xml', ...PRESETS.map(p => `/${p.slug}`)] },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'SaaPost — text posts with cool backgrounds',
      short_name: 'SaaPost',
      description: 'Type a line, shuffle a background, share it to WhatsApp, Facebook and more.',
      theme_color: '#0b0b10',
      background_color: '#0b0b10',
      display: 'standalone',
      icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,xml}'],
      runtimeCaching: [{
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: { cacheName: 'google-fonts', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } },
      }],
    },
    client: { installPrompt: false },
  },
})
