// Pure text layout and contrast helpers. No DOM, so tests run in plain Node.

export type Measure = (s: string) => number // width of s at 100px

function splitWord(measure: Measure, word: string, maxW: number): string[] {
  const parts: string[] = []
  let cur = ''
  for (const ch of word) {
    if (cur && measure(cur + ch) > maxW) { parts.push(cur); cur = ch }
    else cur += ch
  }
  if (cur) parts.push(cur)
  return parts
}

export function wrap(measure: Measure, text: string, maxW: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (!words.length) { lines.push(''); continue }
    let line = ''
    for (const word of words) {
      const parts = measure(word) > maxW ? splitWord(measure, word, maxW) : [word]
      for (const p of parts) {
        const test = line ? `${line} ${p}` : p
        if (!line || measure(test) <= maxW) line = test
        else { lines.push(line); line = p }
      }
    }
    lines.push(line)
  }
  return lines
}

// Largest font size where the wrapped text fits the box. Widths scale linearly with size.
export function fitText(measure100: Measure, text: string, maxW: number, maxH: number, o: { max: number, min: number, lineHeight: number }) {
  const layout = (size: number) => wrap(s => measure100(s) * size / 100, text, maxW)
  let lo = Math.floor(o.min), hi = Math.floor(o.max), best = lo
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (layout(mid).length * mid * o.lineHeight <= maxH) { best = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  return { size: best, lines: layout(best) }
}

export function luminance(r: number, g: number, b: number) {
  const c = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}

export const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)

const DARK = '#111111', DARK_L = luminance(17, 17, 17)

// lums: luminance samples behind the text. Colour follows the mean; shadow when the mean
// reads poorly or over 10% of samples do (a shape edge crossing the text).
export function pickTextColor(lums: number[]) {
  const avg = lums.reduce((a, b) => a + b, 0) / (lums.length || 1)
  const useWhite = contrast(1, avg) >= contrast(DARK_L, avg)
  const l = useWhite ? 1 : DARK_L
  const poor = lums.filter(x => contrast(l, x) < 3).length / (lums.length || 1)
  return { color: useWhite ? '#ffffff' : DARK, shadow: contrast(l, avg) < 4.5 || poor > 0.1 }
}
