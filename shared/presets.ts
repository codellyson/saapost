// Landing pages for search. Each one opens the editor with its own starting look.
export interface Preset {
  slug: string
  title: string
  description: string
  h1: string
  intro: string
  style: 'mesh' | 'grain' | 'pattern' | 'glass' | 'accent'
  size: 'square' | 'story'
  palette: string
  font: string
  text: string
}

export const PRESETS: Preset[] = [
  {
    slug: 'whatsapp-status-background-maker',
    title: 'WhatsApp Status Background Maker — Free, No Sign-up',
    description: 'Make a text status for WhatsApp on a cool background. Type your words, shuffle a background, and share straight to WhatsApp.',
    h1: 'WhatsApp status background maker',
    intro: 'Plain text statuses get skipped. Put your words on a soft gradient sized for stories, then share to WhatsApp in one tap.',
    style: 'mesh', size: 'story', palette: 'Aurora', font: 'inter',
    text: 'Grateful for small wins today.',
  },
  {
    slug: 'aesthetic-quote-background',
    title: 'Aesthetic Quote Background Maker — Grainy Gradients',
    description: 'Turn any quote into an aesthetic post with grainy gradient backgrounds and classy fonts. Free, works on your phone.',
    h1: 'Aesthetic quote backgrounds',
    intro: 'Film-grain gradients and serif type make a quote look considered. Pick a palette or shuffle until one feels right.',
    style: 'grain', size: 'square', palette: 'Peach', font: 'playfair',
    text: '“Slow progress is still progress.”',
  },
  {
    slug: 'gradient-text-post-maker',
    title: 'Gradient Text Post Maker — Mesh Gradient Backgrounds',
    description: 'Create text posts on smooth mesh gradient backgrounds. Shuffle colours, pick a font and download or share.',
    h1: 'Gradient text post maker',
    intro: 'Soft blended colour blobs, the look you see on modern apps, generated fresh every time you shuffle.',
    style: 'mesh', size: 'square', palette: 'Dusk', font: 'grotesk',
    text: 'New week. New energy.',
  },
  {
    slug: 'facebook-post-background',
    title: 'Facebook Post Background Maker — Bold Text Posts',
    description: 'Make bold text posts for Facebook with clean coloured backgrounds and shapes. Share directly from your phone.',
    h1: 'Facebook post backgrounds',
    intro: 'A strong flat colour with one bold shape stands out in a busy feed. Type your announcement and share it.',
    style: 'accent', size: 'square', palette: 'Ember', font: 'archivo',
    text: 'We are open this Saturday!',
  },
  {
    slug: 'instagram-quote-post-maker',
    title: 'Instagram Quote Post Maker — Frosted Glass Style',
    description: 'Design Instagram quote posts with a frosted glass card over colourful backgrounds. Square or story size.',
    h1: 'Instagram quote post maker',
    intro: 'Your words on a frosted glass card, floating over a colourful background. Square for the feed, tall for stories.',
    style: 'glass', size: 'square', palette: 'Velvet', font: 'dmserif',
    text: 'Be the energy you want to attract.',
  },
  {
    slug: 'pattern-background-maker',
    title: 'Pattern Background Maker — Dots, Grids, Waves',
    description: 'Put text on patterned backgrounds: dots, grids, waves, stripes and confetti. Shuffle for endless combinations.',
    h1: 'Pattern backgrounds for text posts',
    intro: 'Dots, grids, waves, stripes and confetti in curated colours. Every shuffle makes a new combination.',
    style: 'pattern', size: 'square', palette: 'Butter', font: 'bebas',
    text: 'SALE ENDS SUNDAY',
  },
  {
    slug: 'birthday-wish-post-maker',
    title: 'Birthday Wish Post Maker — Share to WhatsApp & Facebook',
    description: 'Write a birthday wish on a fun background and share it to WhatsApp, Facebook or Instagram. Free and instant.',
    h1: 'Birthday wish post maker',
    intro: 'Write the wish, shuffle until it feels like them, and send it. No app install needed.',
    style: 'accent', size: 'square', palette: 'Blush', font: 'caveat',
    text: 'Happy birthday, Tolu! Many more sweet years 🎉',
  },
]
