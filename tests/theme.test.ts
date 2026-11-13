import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accentFrom } from '../app/utils/theme.ts'
import { contrast, luminance } from '../app/utils/text.ts'
import { PALETTES } from '../app/utils/palettes.ts'

const L = (h: string) => { const n = parseInt(h.slice(1), 16); return luminance(n >> 16, (n >> 8) & 255, n & 255) }
const BG = luminance(10, 10, 12)

test('every palette gives a readable accent and readable text on it', () => {
  for (const p of PALETTES) {
    const { accent, onAccent } = accentFrom(p.colors)
    assert.ok(contrast(L(accent), BG) >= 4.5, `${p.name} accent ${accent}`)
    assert.ok(contrast(L(accent), L(onAccent)) >= 4.5, `${p.name} on-accent`)
  }
})

test('picks the vivid colour over greys', () => {
  assert.equal(accentFrom(['#111111', '#888888', '#39ff14', '#dddddd']).accent, '#39ff14')
})

test('every preset names a palette that exists', async () => {
  const { PRESETS } = await import('../shared/presets.ts')
  for (const p of PRESETS) assert.ok(PALETTES.some(x => x.name === p.palette), `${p.slug}: ${p.palette}`)
})
