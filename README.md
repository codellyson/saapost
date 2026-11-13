# SaaPost

Text posts with cool backgrounds. Type your words, shuffle a background, and share the picture to WhatsApp, Facebook or Instagram.

Live at https://saapost.kreativekorna.com

- Backgrounds are drawn on a canvas in the browser: mesh gradients, grain, patterns, frosted glass and shapes, from 20 curated palettes.
- Text sizes itself to fit and picks a readable colour, with a shadow where the background gets busy.
- Square posts and 9:16 stories, shared through the phone's share sheet or downloaded as PNG.
- Favourites are saved on the device. No account, nothing uploaded.
- Installs as a PWA.

## Run it

```bash
pnpm install
pnpm dev
```

Tests: `pnpm test`

## Deploy

A static Cloudflare Worker serving `.output/public`:

```bash
pnpm run deploy
```

(`pnpm deploy` on its own is a built-in pnpm command and won't run this script.)

Built with Nuxt, Vue and Tailwind CSS.
