import { fitText, luminance, pickTextColor } from './text'
import { fontOf } from './palettes'

export type StyleId = 'mesh' | 'grain' | 'pattern' | 'glass' | 'accent'
export const STYLES: { id: StyleId, label: string }[] = [
  { id: 'mesh', label: 'Mesh' },
  { id: 'grain', label: 'Grain' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'glass', label: 'Glass' },
  { id: 'accent', label: 'Shape' },
]

export const SIZES = { square: [1080, 1080], story: [1080, 1920] } as const

export interface PostState {
  text: string
  style: StyleId
  colors: string[]
  seed: number
  font: string
  size: keyof typeof SIZES
  align: CanvasTextAlign
  textColor: string // 'auto' or #hex
  grain: boolean
}

type Ctx = CanvasRenderingContext2D
type Rand = () => number

// mulberry32: same seed always gives the same background, so favourites redraw exactly.
function rng(seed: number): Rand {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = <T>(r: Rand, xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

function mesh(ctx: Ctx, w: number, h: number, c: string[], r: Rand) {
  ctx.fillStyle = c[0]!
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 7; i++) {
    const x = r() * w, y = r() * h, rad = (0.5 + r() * 0.6) * Math.max(w, h)
    const col = c[1 + (i % 3)]!
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
    g.addColorStop(0, rgba(col, 0.8))
    g.addColorStop(0.5, rgba(col, 0.35))
    g.addColorStop(1, rgba(col, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  // milky highlight: gives the soft, creamy look of studio mesh gradients
  const x = r() * w, y = r() * h * 0.6, rad = Math.max(w, h) * 0.55
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad)
  g.addColorStop(0, 'rgba(255,255,255,0.22)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function linear(ctx: Ctx, w: number, h: number, c: string[], r: Rand) {
  const a = r() * Math.PI * 2, d = Math.hypot(w, h) / 2
  const dx = Math.cos(a) * d, dy = Math.sin(a) * d
  const g = ctx.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy)
  g.addColorStop(0, c[1]!)
  g.addColorStop(0.55, c[2]!)
  g.addColorStop(1, c[3]!)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function grain(ctx: Ctx, w: number, h: number, amount: number, r: Rand) {
  const tile = document.createElement('canvas')
  tile.width = tile.height = 256
  const t = tile.getContext('2d')!
  const img = t.createImageData(256, 256)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  t.putImageData(img, 0, 0)
  ctx.save()
  ctx.globalAlpha = amount
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillStyle = ctx.createPattern(tile, 'repeat')!
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function pattern(ctx: Ctx, w: number, h: number, c: string[], r: Rand) {
  ctx.fillStyle = c[0]!
  ctx.fillRect(0, 0, w, h)
  const kind = pick(r, ['dots', 'grid', 'waves', 'stripes', 'confetti'] as const)
  const s = w / (9 + Math.floor(r() * 10))
  ctx.save()
  if (kind === 'dots') {
    for (let row = 0, y = s / 2; y < h + s; row++, y += s)
      for (let x = (row % 2) * s / 2; x < w + s; x += s) {
        ctx.fillStyle = c[1 + ((row + Math.round(x / s)) % 3)]!
        ctx.beginPath(); ctx.arc(x, y, s * 0.16, 0, Math.PI * 2); ctx.fill()
      }
  }
  else if (kind === 'grid') {
    ctx.strokeStyle = rgba(c[1]!, 0.5); ctx.lineWidth = Math.max(2, s * 0.04)
    for (let x = 0; x <= w; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
    for (let y = 0; y <= h; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
  }
  else if (kind === 'waves') {
    ctx.lineWidth = s * 0.14; ctx.lineCap = 'round'
    for (let i = 0, y = 0; y < h + s; i++, y += s) {
      ctx.strokeStyle = c[1 + (i % 3)]!
      ctx.beginPath()
      for (let x = -10; x <= w + 10; x += 8) ctx.lineTo(x, y + Math.sin(x / s * 2) * s * 0.25)
      ctx.stroke()
    }
  }
  else if (kind === 'stripes') {
    ctx.translate(w / 2, h / 2); ctx.rotate(Math.PI / 4)
    const d = Math.hypot(w, h)
    for (let i = 0, x = -d; x < d; i++, x += s) { ctx.fillStyle = rgba(c[1 + (i % 3)]!, 0.8); ctx.fillRect(x, -d, s / 2, d * 2) }
  }
  else {
    for (let i = 0; i < 140; i++) {
      ctx.save()
      ctx.translate(r() * w, r() * h); ctx.rotate(r() * Math.PI)
      ctx.fillStyle = c[1 + (i % 3)]!
      ctx.fillRect(-s * 0.25, -s * 0.08, s * 0.5, s * 0.16)
      ctx.restore()
    }
  }
  ctx.restore()
}

function accent(ctx: Ctx, w: number, h: number, c: string[], r: Rand) {
  ctx.fillStyle = c[0]!
  ctx.fillRect(0, 0, w, h)
  const m = Math.min(w, h)
  const shape = pick(r, ['circle', 'ring', 'band', 'half', 'pair'] as const)
  ctx.save()
  if (shape === 'circle') {
    ctx.fillStyle = c[1]!
    ctx.beginPath(); ctx.arc(w * (0.75 + r() * 0.2), h * (0.1 + r() * 0.2), m * 0.45, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = c[2]!
    ctx.beginPath(); ctx.arc(w * 0.1, h * 0.92, m * 0.22, 0, Math.PI * 2); ctx.fill()
  }
  else if (shape === 'ring') {
    ctx.strokeStyle = c[1]!; ctx.lineWidth = m * 0.07
    ctx.beginPath(); ctx.arc(w / 2, h / 2, m * 0.42, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = rgba(c[2]!, 0.6); ctx.lineWidth = m * 0.02
    ctx.beginPath(); ctx.arc(w / 2, h / 2, m * 0.49, 0, Math.PI * 2); ctx.stroke()
  }
  else if (shape === 'band') {
    ctx.translate(w / 2, h / 2); ctx.rotate(-0.35 + r() * 0.2)
    ctx.fillStyle = c[1]!; ctx.fillRect(-w, -m * 0.2, w * 2, m * 0.4)
    ctx.fillStyle = c[2]!; ctx.fillRect(-w, m * 0.24, w * 2, m * 0.05)
  }
  else if (shape === 'half') {
    ctx.fillStyle = c[1]!
    ctx.beginPath(); ctx.arc(w / 2, h, w * 0.32, Math.PI, 0); ctx.fill()
    ctx.fillStyle = c[2]!
    ctx.beginPath(); ctx.arc(w / 2, 0, w * 0.2, 0, Math.PI); ctx.fill()
  }
  else {
    ctx.globalAlpha = 0.9
    ctx.fillStyle = c[1]!; ctx.beginPath(); ctx.arc(w * 0.3, h * 0.35, m * 0.32, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = c[3]!; ctx.beginPath(); ctx.arc(w * 0.7, h * 0.65, m * 0.32, 0, Math.PI * 2); ctx.fill()
  }
  ctx.restore()
}

// Frosted card without ctx.filter (Safari lacks it): shrink the background, stretch it back = blur.
function glassPanel(ctx: Ctx, x: number, y: number, pw: number, ph: number, radius: number) {
  const { width: w, height: h } = ctx.canvas
  const small = document.createElement('canvas')
  small.width = Math.ceil(w / 28); small.height = Math.ceil(h / 28)
  const s = small.getContext('2d')!
  s.imageSmoothingQuality = 'high'
  s.drawImage(ctx.canvas, 0, 0, small.width, small.height)
  ctx.save()
  ctx.beginPath(); ctx.roundRect(x, y, pw, ph, radius); ctx.clip()
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(small, 0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,0.16)'
  ctx.fillRect(x, y, pw, ph)
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3
  ctx.beginPath(); ctx.roundRect(x, y, pw, ph, radius); ctx.stroke()
}

function sampleLuminance(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const d = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.max(1, w), Math.max(1, h)).data
  const out: number[] = []
  for (let i = 0; i < d.length; i += 4 * 16) out.push(luminance(d[i]!, d[i + 1]!, d[i + 2]!))
  return out
}

export function render(canvas: HTMLCanvasElement, s: PostState) {
  const [w, h] = SIZES[s.size]
  if (canvas.width !== w) canvas.width = w
  if (canvas.height !== h) canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const r = rng(s.seed)
  const glass = s.style === 'glass'
  const f = fontOf(s.font)
  const family = `"${f.family}", system-ui, sans-serif`
  const lineHeight = 1.2

  // layout first: the glass card wraps the text block
  const pad = w * (glass ? 0.16 : 0.1)
  const maxW = w - pad * 2
  ctx.font = `${f.weight} 100px ${family}`
  const fit = fitText(t => ctx.measureText(t).width, s.text.trim() || ' ', maxW, h * (s.size === 'story' ? 0.5 : 0.62), { max: w * 0.13, min: w * 0.03, lineHeight })
  const blockH = fit.lines.length * fit.size * lineHeight
  const top = (h - blockH) / 2

  if (s.style === 'mesh' || glass) mesh(ctx, w, h, s.colors, r)
  else if (s.style === 'grain') linear(ctx, w, h, s.colors, r)
  else if (s.style === 'pattern') pattern(ctx, w, h, s.colors, r)
  else accent(ctx, w, h, s.colors, r)

  if (s.style === 'grain') grain(ctx, w, h, 0.22, r)
  else if (s.grain) grain(ctx, w, h, 0.12, r)

  if (glass) glassPanel(ctx, w * 0.09, top - w * 0.08, w * 0.82, blockH + w * 0.16, w * 0.05)

  let color = s.textColor, shadow = false
  if (color === 'auto') ({ color, shadow } = pickTextColor(sampleLuminance(ctx, pad, top, maxW, blockH)))

  ctx.save()
  ctx.font = `${f.weight} ${fit.size}px ${family}`
  ctx.fillStyle = color
  ctx.textAlign = s.align
  ctx.textBaseline = 'middle'
  if (shadow) {
    ctx.shadowColor = color === '#ffffff' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.6)'
    ctx.shadowBlur = fit.size * 0.35
  }
  const x = s.align === 'left' ? pad : s.align === 'right' ? w - pad : w / 2
  fit.lines.forEach((line, i) => ctx.fillText(line, x, top + (i + 0.5) * fit.size * lineHeight))
  ctx.restore()
}
