<template>
  <NuxtPwaManifest />
  <div class="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 pb-10 pt-[env(safe-area-inset-top)] sm:px-6">
    <header class="flex items-center justify-between py-2.5 lg:py-4">
      <NuxtLink to="/" class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <img src="/icon.svg" alt="" class="size-8 lg:size-10">
        SaaPost
      </NuxtLink>
    </header>
    <main class="flex-1"><NuxtPage /></main>
    <footer class="mt-20 rounded-[28px] glass-panel p-6 sm:p-8">
      <div class="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <NuxtLink to="/" class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <img src="/icon.svg" alt="" class="size-9">
            SaaPost
          </NuxtLink>
          <p class="mt-3 max-w-xs text-sm text-zinc-400">Text posts with cool backgrounds. Free, no sign-up, and made on your device.</p>
        </div>
        <nav aria-labelledby="makers">
          <p id="makers" class="label">Post makers</p>
          <ul class="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            <li v-for="p in PRESETS" :key="p.slug">
              <NuxtLink :to="`/${p.slug}`" class="text-sm text-zinc-400 transition hover:text-lime-300">{{ p.h1 }}</NuxtLink>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="more">
          <p id="more" class="label">More from KreativeKorna</p>
          <ul class="mt-3 grid gap-y-2.5">
            <li v-for="a in APPS" :key="a.url">
              <a :href="a.url" class="text-sm text-zinc-400 transition hover:text-lime-300">{{ a.name }}<span class="block text-xs text-zinc-600">{{ a.what }}</span></a>
            </li>
          </ul>
        </nav>
      </div>
      <p class="mt-8 border-t border-white/[0.06] pt-5 text-xs text-zinc-500">© {{ new Date().getFullYear() }} SaaPost · A <a href="https://kreativekorna.com" class="text-zinc-400 hover:text-lime-300">KreativeKorna</a> app</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { PRESETS } from '~~/shared/presets'

const APPS = [
  { name: 'SaaQuiz', what: 'Quick quizzes against the clock', url: 'https://saaquiz.kreativekorna.com' },
  { name: 'Fillie', what: 'Fill forms from one profile', url: 'https://fillie.kreativekorna.com' },
  { name: 'Passalong', what: 'Team work, sorted and closed', url: 'https://passalong.kreativekorna.com' },
]
</script>
