import { PRESETS } from '../../shared/presets'

export default defineEventHandler((event) => {
  const site = useRuntimeConfig(event).public.siteUrl
  const urls = ['', ...PRESETS.map(p => `/${p.slug}`)]
    .map(u => `<url><loc>${site}${u}</loc></url>`).join('')
  setHeader(event, 'content-type', 'application/xml')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
})
