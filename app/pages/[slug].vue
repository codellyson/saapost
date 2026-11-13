<script setup lang="ts">
import { PRESETS } from '~~/shared/presets'

const route = useRoute()
const p = PRESETS.find(x => x.slug === route.params.slug)
if (!p) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const site = useRuntimeConfig().public.siteUrl
const url = `${site}/${p.slug}`
useSeoMeta({ title: p.title, description: p.description, ogTitle: p.title, ogDescription: p.description, ogType: 'website', ogUrl: url, twitterCard: 'summary_large_image' })
useHead({ link: [{ rel: 'canonical', href: url }] })

const preset = { style: p.style, size: p.size, font: p.font, text: p.text, colors: [...paletteOf(p.palette).colors] }
</script>

<template>
  <div>
    <section class="pb-3 lg:pb-5 lg:pt-2">
      <h1 class="truncate text-lg font-extrabold tracking-tight sm:text-2xl lg:whitespace-normal lg:text-3xl">{{ p!.h1 }}</h1>
      <p class="mt-1.5 hidden max-w-2xl text-zinc-400 lg:block">{{ p!.intro }}</p>
    </section>
    <Editor :preset="preset" />
    <HowTo />
  </div>
</template>
