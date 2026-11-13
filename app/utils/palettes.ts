// [base, accent1, accent2, accent3]. Curated: each set keeps its accents in one family
// (neighbouring hues, stepped lightness) so every style and shuffle stays harmonious.
export const PALETTES: { name: string, colors: string[] }[] = [
  // dark
  { name: 'Dusk', colors: ['#1d1033', '#ff7a8a', '#ffb86b', '#c86bd9'] },
  { name: 'Lagoon', colors: ['#062a35', '#0fa3b1', '#5ad1c4', '#b8f2e6'] },
  { name: 'Wine', colors: ['#2a0e1f', '#8e2c54', '#d0567a', '#f2a7b8'] },
  { name: 'Deep sea', colors: ['#0a1931', '#185adb', '#4fa3ff', '#9fd8ff'] },
  { name: 'Ember', colors: ['#200a04', '#c2361a', '#ef6c2c', '#ffb347'] },
  { name: 'Pine', colors: ['#0e2420', '#2f6f5e', '#6fb59b', '#d7efe1'] },
  { name: 'Aurora', colors: ['#07101f', '#22d3a6', '#38bdf8', '#a78bfa'] },
  { name: 'Velvet', colors: ['#1a1030', '#5b3fa6', '#9f7aea', '#f0abfc'] },
  { name: 'Espresso', colors: ['#1e140f', '#7a4a2c', '#c48a5a', '#ecd2b0'] },
  { name: 'Night gold', colors: ['#0d1324', '#24345c', '#c9a227', '#f2d98d'] },
  // light
  { name: 'Peach', colors: ['#fff1e8', '#ffc4a8', '#ff9a8b', '#f4c27a'] },
  { name: 'Blush', colors: ['#fdf0f3', '#f7b6c8', '#e98aa6', '#c9b6f2'] },
  { name: 'Sage', colors: ['#f1f4ec', '#b9cfae', '#8fb39a', '#e7d9b8'] },
  { name: 'Butter', colors: ['#fffaeb', '#ffe28a', '#ffc861', '#ffa69e'] },
  { name: 'Sky', colors: ['#eef6ff', '#b3d8ff', '#7fb8ff', '#c7b8ff'] },
  { name: 'Lilac', colors: ['#f5f0ff', '#d6c8ff', '#b39ddb', '#f6c1e7'] },
  { name: 'Sand', colors: ['#f6efe4', '#e6c9a0', '#d5a27a', '#a9b89b'] },
  { name: 'Mint', colors: ['#eefbf5', '#a8e6cf', '#7fd1b9', '#d4f0a8'] },
  { name: 'Citrus', colors: ['#fff8e7', '#ffd166', '#f78c6b', '#ffb4a2'] },
  { name: 'Graphite', colors: ['#14161a', '#2c3340', '#5d6b82', '#c9d2e0'] },
]

export const paletteOf = (name: string) => PALETTES.find(p => p.name === name) ?? PALETTES[0]!

export const FONTS = [
  { id: 'inter', label: 'Inter', family: 'Inter', weight: 800 },
  { id: 'playfair', label: 'Playfair', family: 'Playfair Display', weight: 700 },
  { id: 'bebas', label: 'Bebas', family: 'Bebas Neue', weight: 400 },
  { id: 'caveat', label: 'Caveat', family: 'Caveat', weight: 700 },
  { id: 'grotesk', label: 'Grotesk', family: 'Space Grotesk', weight: 700 },
  { id: 'lora', label: 'Lora', family: 'Lora', weight: 600 },
  { id: 'archivo', label: 'Archivo', family: 'Archivo Black', weight: 400 },
  { id: 'dmserif', label: 'DM Serif', family: 'DM Serif Display', weight: 400 },
]

export const fontOf = (id: string) => FONTS.find(f => f.id === id) ?? FONTS[0]!
