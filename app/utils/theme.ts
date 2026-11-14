import { contrast, luminance } from './text.ts'

type RGB = [number, number, number]
const hex = (h: string): RGB => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] }
const toHex = (c: RGB) => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
const lum = (c: RGB) => luminance(c[0], c[1], c[2])

// sRGB <-> OKLCH, so the accent can change lightness without losing its hue or going grey.
const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
const gam = (v: number) => 255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)
function toLch([r, g, b]: RGB): [number, number, number] {
  const [R, G, B] = [lin(r), lin(g), lin(b)]
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [L, Math.hypot(a, bb), Math.atan2(bb, a)]
}
function fromLch(L: number, C: number, h: number): RGB | null {
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return rgb.every(v => v >= -1e-4 && v <= 1.0001) ? rgb.map(v => gam(Math.min(1, Math.max(0, v)))) as RGB : null
}
// Largest chroma up to C that fits sRGB at this lightness and hue.
function fit(L: number, C: number, h: number): RGB {
  for (let c = C; c > 0; c -= 0.005) { const rgb = fromLch(L, c, h); if (rgb) return rgb }
  return fromLch(L, 0, h)!
}

// lightest the page gets: the blurred glow of a white post under the veil (see main.css)
const BG_L = luminance(44, 44, 46)
const INK = luminance(17, 17, 17)

// UI accent from the post's palette: its most colourful hue, kept vivid (chroma floor) and raised
// in perceived lightness only as far as needed for 4.5:1 on the dark UI and for its button text.
export function accentFrom(colors: string[]) {
  const lchs = colors.map(c => toLch(hex(c)))
  const [L0, C0, h] = lchs.reduce((a, b) => (b[1] > a[1] ? b : a))
  const C = Math.max(C0, 0.12)
  const ok = (c: RGB) => contrast(lum(c), BG_L) >= 4.5 && Math.max(contrast(lum(c), INK), contrast(lum(c), 1)) >= 4.5
  let best = fit(L0, C, h)
  for (let L = L0; L <= 0.97 && !ok(best); L += 0.02) best = fit(L, C, h)
  const Lr = lum(best)
  return { accent: toHex(best), onAccent: contrast(Lr, INK) >= contrast(Lr, 1) ? '#111111' : '#ffffff' }
}
