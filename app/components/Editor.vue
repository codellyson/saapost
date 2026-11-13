<script setup lang="ts">
import type { PostState } from '~/utils/render'

const props = defineProps<{ preset?: Partial<PostState> }>()

const s = reactive<PostState>({
  text: 'Good things take time.',
  style: 'mesh',
  colors: [...PALETTES[0]!.colors],
  seed: 1,
  font: 'inter',
  size: 'square',
  align: 'center',
  textColor: 'auto',
  grain: true,
  ...props.preset,
})
const lockPalette = ref(false)
const lockStyle = ref(false)
const canvas = ref<HTMLCanvasElement>()
const note = ref('')

const TABS = [
  { id: 'text', label: 'Text' },
  { id: 'style', label: 'Style' },
  { id: 'colour', label: 'Colour' },
  { id: 'font', label: 'Font' },
  { id: 'layout', label: 'Layout' },
] as const
const tab = ref<typeof TABS[number]['id']>('text')

// Share must run straight from the tap (iOS drops the gesture after an await), so keep a ready file.
let file: File | null = null
let frame = 0

async function draw() {
  if (!canvas.value) return
  const f = fontOf(s.font)
  await document.fonts.load(`${f.weight} 100px "${f.family}"`).catch(() => {})
  render(canvas.value, s)
  canvas.value.toBlob(b => { if (b) file = new File([b], 'saapost.png', { type: 'image/png' }) }, 'image/png')
  if (tab.value === 'style') drawThumbs()
  tintUi()
}

// The UI takes its colour from the post: a blurred copy glows behind the glass, the accent comes from the palette.
const ambient = ref('')
function tintUi() {
  const t = accentFrom(s.colors)
  const root = document.documentElement.style
  root.setProperty('--accent', t.accent)
  root.setProperty('--on-accent', t.onAccent)
  const small = document.createElement('canvas')
  small.width = small.height = 48
  small.getContext('2d')!.drawImage(canvas.value!, 0, 0, 48, 48)
  ambient.value = small.toDataURL('image/jpeg', 0.8)
}
watch(s, () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw) }, { deep: true })

// Undo: snapshots of the post, debounced so a burst of typing is one step.
const past = ref<string[]>([])
let last = JSON.stringify(s), timer = 0, restoring = false
function commit() {
  const now = JSON.stringify(s)
  if (now === last) return
  past.value = [...past.value, last].slice(-50)
  last = now
}
watch(s, () => {
  if (restoring) { restoring = false; last = JSON.stringify(s); return }
  clearTimeout(timer); timer = window.setTimeout(commit, 300)
}, { deep: true })
const canUndo = computed(() => past.value.length > 0)
function undo() {
  clearTimeout(timer)
  commit()
  const prev = past.value.at(-1)
  if (!prev) return
  past.value = past.value.slice(0, -1)
  restoring = true
  Object.assign(s, JSON.parse(prev))
}
watch(tab, t => { if (t === 'style') drawThumbs() })
onMounted(() => { draw(); document.fonts.ready.then(draw); favs.value = loadFavs() })

// Style previews: each style drawn with the current colours and seed, no text.
const thumbs = ref<Record<string, string>>({})
let thumbKey = ''
function drawThumbs() {
  const key = `${s.colors.join()}|${s.seed}|${s.grain}`
  if (key === thumbKey) return
  thumbKey = key
  const big = document.createElement('canvas')
  const small = document.createElement('canvas')
  small.width = small.height = 160
  const out: Record<string, string> = {}
  for (const st of STYLES) {
    render(big, { ...s, style: st.id, size: 'square', text: '' })
    small.getContext('2d')!.drawImage(big, 0, 0, 160, 160)
    out[st.id] = small.toDataURL('image/jpeg', 0.8)
  }
  thumbs.value = out
}

const rand = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]!
function shuffle() {
  s.seed = Math.floor(Math.random() * 2 ** 31)
  if (!lockStyle.value) s.style = rand(STYLES).id
  if (!lockPalette.value) s.colors = [...rand(PALETTES).colors]
}
const samePalette = (c: string[]) => c.every((x, i) => x === s.colors[i])

function flash(msg: string) { note.value = msg; setTimeout(() => { if (note.value === msg) note.value = '' }, 3000) }
function download() {
  if (!file) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(file)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
async function share() {
  if (!file) return
  if (!navigator.canShare?.({ files: [file] })) { download(); flash('Sharing isn’t supported in this browser, so it downloaded instead.'); return }
  try { await navigator.share({ files: [file] }) }
  catch (e) { if ((e as Error).name !== 'AbortError') flash('Couldn’t open the share sheet. Try Download.') }
}

// Favourites live on this device only. Accounts (sync) can come later.
interface Fav { id: number, state: PostState, thumb: string }
const KEY = 'saapost:favs'
const favs = ref<Fav[]>([])
function loadFavs(): Fav[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function storeFavs() {
  try { localStorage.setItem(KEY, JSON.stringify(favs.value)) }
  catch { flash('Couldn’t save. Storage is full or blocked.') }
}
function save() {
  if (!canvas.value) return
  const t = document.createElement('canvas')
  t.width = 160; t.height = Math.round(160 * canvas.value.height / canvas.value.width)
  t.getContext('2d')!.drawImage(canvas.value, 0, 0, t.width, t.height)
  favs.value.unshift({ id: Date.now(), state: JSON.parse(JSON.stringify(s)), thumb: t.toDataURL('image/jpeg', 0.7) })
  favs.value = favs.value.slice(0, 40)
  storeFavs()
  flash('Saved to favourites')
}
function useFav(f: Fav) { Object.assign(s, JSON.parse(JSON.stringify(f.state)), { textColor: 'auto' }); lockPalette.value = true; lockStyle.value = true }
function removeFav(id: number) { favs.value = favs.value.filter(f => f.id !== id); storeFavs() }

const seg = (on: boolean) => on ? 'bg-white text-zinc-950' : 'text-zinc-400 hover:text-white'
const tile = (on: boolean) => on ? 'ring-2 ring-lime-300 ring-offset-2 ring-offset-[var(--bg)]' : 'ring-1 ring-white/10 hover:ring-white/30'
</script>

<template>
  <div class="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_auto_1fr] lg:items-start lg:gap-x-6 lg:gap-y-4">
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img v-if="ambient" :src="ambient" alt="" class="size-full scale-125 object-cover opacity-70 blur-[100px] saturate-150 transition-opacity duration-700">
      <div class="absolute inset-0 bg-[color-mix(in_srgb,var(--bg)_55%,transparent)]" />
    </div>
    <!-- On phones stage, tools and actions fill one screen (svh: never hidden behind browser bars); favourites sit below -->
    <div class="flex h-[calc(100svh-6.5rem)] min-h-[500px] flex-col gap-3 lg:contents">
    <div class="stage relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-[24px] border border-white/[0.06] p-2.5 sm:p-6 lg:rounded-[28px] lg:sticky lg:top-4 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:h-[calc(100dvh-12.5rem)] lg:min-h-[480px] lg:flex-none lg:p-10">
      <div class="relative min-h-0 flex-1">
        <canvas ref="canvas" width="1080" height="1080" aria-label="Post preview" class="absolute inset-0 m-auto block h-auto max-h-full w-auto max-w-full rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]" />
      </div>

      <div class="flex shrink-0 items-center justify-center gap-2">
        <button class="glass flex h-9 items-center gap-1 rounded-full px-3 text-xs lg:h-11 lg:gap-1.5 lg:px-3.5 lg:text-sm" :class="lockStyle ? 'text-lime-300' : 'text-zinc-300'" :aria-pressed="lockStyle" @click="lockStyle = !lockStyle">
          <Icon :name="lockStyle ? 'lock' : 'unlock'" class="!size-4" /> Style
        </button>
        <button class="flex h-11 items-center gap-2 rounded-full bg-lime-300 px-5 text-sm font-semibold lg:h-14 lg:px-6 lg:text-base text-zinc-950 accent-glow transition active:scale-95" @click="shuffle">
          <Icon name="shuffle" /> Shuffle
        </button>
        <button class="glass flex h-9 items-center gap-1 rounded-full px-3 text-xs lg:h-11 lg:gap-1.5 lg:px-3.5 lg:text-sm" :class="lockPalette ? 'text-lime-300' : 'text-zinc-300'" :aria-pressed="lockPalette" @click="lockPalette = !lockPalette">
          <Icon :name="lockPalette ? 'lock' : 'unlock'" class="!size-4" /> Colours
        </button>
      </div>
      <p class="glass absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-4 py-2 text-sm text-white transition" :class="note ? 'opacity-100' : 'pointer-events-none opacity-0'" role="status">{{ note }}</p>
    </div>

    <!-- Tools -->
      <div class="shrink-0 rounded-[28px] glass-panel p-1.5 lg:col-start-2 lg:p-2">
        <div role="tablist" class="grid grid-cols-5 gap-1">
          <button v-for="t in TABS" :key="t.id" role="tab" :aria-selected="tab === t.id" class="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-medium transition lg:gap-1 lg:py-2.5" :class="tab === t.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-200'" @click="tab = t.id">
            <Icon :name="t.id" />{{ t.label }}
          </button>
        </div>

        <div class="h-36 overflow-y-auto overscroll-contain p-2.5 pt-3 lg:h-auto lg:min-h-56 lg:overflow-visible lg:p-3 lg:pt-4">
          <div v-if="tab === 'text'" class="relative">
            <textarea v-model="s.text" rows="3" maxlength="400" aria-label="Your text" class="block w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3.5 pb-7 text-[17px] lg:h-40 lg:p-4 leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-lime-300/60" placeholder="Type your post…" />
            <p class="pointer-events-none absolute bottom-3 right-3.5 text-xs text-zinc-500">{{ s.text.length }}/400</p>
          </div>

          <div v-else-if="tab === 'style'" class="grid grid-cols-3 gap-3">
            <button v-for="st in STYLES" :key="st.id" class="group text-left" @click="s.style = st.id">
              <span class="block aspect-square overflow-hidden rounded-2xl bg-zinc-800 transition" :class="tile(s.style === st.id)">
                <img v-if="thumbs[st.id]" :src="thumbs[st.id]" alt="" class="size-full object-cover">
              </span>
              <span class="mt-1.5 block text-center text-xs" :class="s.style === st.id ? 'text-white' : 'text-zinc-400'">{{ st.label }}</span>
            </button>
            <button class="text-left" :aria-pressed="s.grain" @click="s.grain = !s.grain">
              <span class="grain-tile grid aspect-square place-items-center rounded-2xl text-xs font-semibold transition" :class="[tile(s.grain), s.grain ? 'text-lime-300' : 'text-zinc-400']">{{ s.grain ? 'On' : 'Off' }}</span>
              <span class="mt-1.5 block text-center text-xs" :class="s.grain ? 'text-white' : 'text-zinc-400'">Grain</span>
            </button>
          </div>

          <div v-else-if="tab === 'colour'" class="grid grid-cols-2 gap-2">
            <button v-for="p in PALETTES" :key="p.name" class="flex items-center gap-2.5 rounded-2xl bg-white/[0.04] p-2 text-left transition" :class="tile(samePalette(p.colors))" :aria-pressed="samePalette(p.colors)" @click="s.colors = [...p.colors]; lockPalette = true">
              <span class="flex h-9 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/20" aria-hidden="true">
                <span v-for="c in p.colors" :key="c" class="flex-1" :style="{ background: c }" />
              </span>
              <span class="truncate text-sm text-zinc-200">{{ p.name }}</span>
            </button>
          </div>

          <div v-else-if="tab === 'font'" class="grid grid-cols-4 gap-2">
            <button v-for="f in FONTS" :key="f.id" class="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white/[0.04] transition" :class="tile(s.font === f.id)" @click="s.font = f.id">
              <span class="text-3xl leading-none text-white" :style="{ fontFamily: `'${f.family}'`, fontWeight: f.weight }">Aa</span>
              <span class="mt-1.5 text-[11px] text-zinc-400">{{ f.label }}</span>
            </button>
          </div>

          <div v-else class="space-y-5">
            <div>
              <p class="label">Size</p>
              <div class="mt-2 grid grid-cols-2 gap-2">
                <button v-for="z in ([['square', 'Post', '1:1'], ['story', 'Story', '9:16']] as const)" :key="z[0]" class="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 transition" :class="tile(s.size === z[0])" @click="s.size = z[0]">
                  <span class="rounded-[4px] border-2 border-current text-zinc-400" :class="z[0] === 'square' ? 'size-6' : 'h-7 w-4'" />
                  <span class="text-left text-sm text-white">{{ z[1] }}<span class="block text-xs text-zinc-500">{{ z[2] }}</span></span>
                </button>
              </div>
            </div>
            <div>
              <p class="label">Align</p>
              <div class="mt-2 grid grid-cols-3 gap-1 rounded-full bg-white/[0.04] p-1">
                <button v-for="a in (['left', 'center', 'right'] as const)" :key="a" class="rounded-full py-2 text-sm capitalize transition" :class="seg(s.align === a)" @click="s.align = a">{{ a }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex shrink-0 gap-2 pb-[env(safe-area-inset-bottom)] lg:col-start-2">
        <button class="glass grid size-11 shrink-0 place-items-center rounded-full text-white transition disabled:opacity-35 lg:size-14" aria-label="Undo" title="Undo" :disabled="!canUndo" @click="undo"><Icon name="undo" /></button>
        <button class="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-lime-300 font-semibold lg:h-14 text-zinc-950 transition active:scale-[.98]" @click="share">
          <Icon name="share" /> Share
        </button>
        <button class="glass grid size-11 shrink-0 place-items-center rounded-full text-white lg:size-14" aria-label="Download PNG" title="Download" @click="download"><Icon name="download" /></button>
        <button class="glass grid size-11 shrink-0 place-items-center rounded-full text-white lg:size-14" aria-label="Save to favourites" title="Save" @click="save"><Icon name="heart" /></button>
      </div>

    </div>

      <div v-if="favs.length" class="mt-4 rounded-[28px] glass-panel p-4 lg:col-start-2 lg:mt-0">
        <p class="label">Favourites</p>
        <div class="mt-3 flex flex-wrap gap-2.5">
          <div v-for="f in favs" :key="f.id" class="relative">
            <button class="block overflow-hidden rounded-xl ring-1 ring-white/10 hover:ring-white/40" @click="useFav(f)">
              <img :src="f.thumb" alt="Saved post" class="h-16 w-auto">
            </button>
            <button class="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-zinc-700 text-white hover:bg-zinc-600" aria-label="Remove favourite" @click="removeFav(f.id)"><Icon name="x" class="!size-3" /></button>
          </div>
        </div>
      </div>
  </div>
</template>
