import { test } from 'node:test'
import assert from 'node:assert/strict'
import { wrap, fitText, pickTextColor, luminance } from '../app/utils/text.ts'

const mono: (s: string) => number = s => s.length * 50 // every char 50px wide at 100px

test('wrap breaks on spaces and keeps newlines', () => {
  assert.deepEqual(wrap(mono, 'aa bb cc', 260), ['aa bb', 'cc'])
  assert.deepEqual(wrap(mono, 'aa\n\nbb', 1000), ['aa', '', 'bb'])
})

test('wrap splits a word longer than the line', () => {
  assert.deepEqual(wrap(mono, 'abcdefgh', 200), ['abcd', 'efgh'])
})

test('fitText shrinks as text grows and always fits', () => {
  const o = { max: 140, min: 20, lineHeight: 1.2 }
  const short = fitText(mono, 'Hi', 800, 600, o)
  const long = fitText(mono, 'This is a much longer line of text that must wrap a few times', 800, 600, o)
  assert.ok(short.size > long.size)
  for (const r of [short, long]) {
    assert.ok(r.lines.length * r.size * 1.2 <= 600)
    for (const l of r.lines) assert.ok(mono(l) * r.size / 100 <= 800)
  }
})

test('text colour flips with background brightness', () => {
  const L = (v: number) => luminance(v, v, v)
  assert.equal(pickTextColor([L(255)]).color, '#111111')
  assert.equal(pickTextColor([L(15)]).color, '#ffffff')
  assert.equal(pickTextColor([L(15)]).shadow, false)
  assert.equal(pickTextColor([L(120)]).shadow, true)
})

test('shadow when a shape edge crosses the text', () => {
  const half = [...Array(70).fill(luminance(255, 230, 120)), ...Array(30).fill(luminance(20, 10, 40))]
  const r = pickTextColor(half)
  assert.equal(r.color, '#111111')
  assert.equal(r.shadow, true)
})
