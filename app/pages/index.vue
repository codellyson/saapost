<script setup lang="ts">
const site = useRuntimeConfig().public.siteUrl
const title = 'SaaPost — Text Posts with Cool Backgrounds'
const description = 'Type your words, shuffle a beautiful background, and share to WhatsApp, Facebook or Instagram. Free, no sign-up, works offline.'
useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'website', ogUrl: site, twitterCard: 'summary_large_image' })
useHead({
  link: [{ rel: 'canonical', href: site }],
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'SaaPost', url: site, applicationCategory: 'DesignApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0' }, description }) }],
})
</script>

<template>
  <div>
    <section class="pb-3 lg:pb-5 lg:pt-2">
      <h1 class="truncate text-lg font-extrabold tracking-tight sm:text-2xl lg:whitespace-normal lg:text-3xl">Text posts with <span class="text-lime-300">cool backgrounds</span></h1>
      <p class="mt-1.5 hidden max-w-2xl text-zinc-400 lg:block">Type your words, shuffle until it looks right, then share to WhatsApp, Facebook or Instagram.</p>
    </section>
    <Editor />
    <HowTo />
  </div>
</template>
