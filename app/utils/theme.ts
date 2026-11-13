import { contrast, luminance } from './text.ts'

type RGB = [number, number, number]
const hex = (h: string): RGB => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] }
const toHex = (c: RGB) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
const lum = (c: RGB) => luminance(c[0], c[1], c[2])
const sat = (c: RGB) => { const mx = Math.max(...c), mn = Math.min(...c); return mx === 0 ? 0 : (mx - mn) / mx }

const BG_L = luminance(10, 10, 12)

// UI accent from the post's palette: the most vivid colour that reads on the dark UI,
// lightened step by step until it reaches 4.5:1 so accent text stays readable.
export function accentFrom(colors: string[]) {
  let best = hex(colors[1] ?? '#ffffff'), score = -1
  for (const c of colors) {
    const rgb = hex(c)
    const s = sat(rgb) * Math.min(1, contrast(lum(rgb), BG_L) / 4.5)
    if (s > score) { score = s; best = rgb }
  }
  const INK = luminance(17, 17, 17)
  // lighten until it reads on the dark UI and button text (dark or white) reads on it
  const ok = (c: RGB) => contrast(lum(c), BG_L) >= 4.5 && Math.max(contrast(lum(c), INK), contrast(lum(c), 1)) >= 4.5
  for (let i = 0; i < 12 && !ok(best); i++) best = best.map(v => v + (255 - v) * 0.15) as RGB
  const L = lum(best)
  return { accent: toHex(best), onAccent: contrast(L, INK) >= contrast(L, 1) ? '#111111' : '#ffffff' }
}
