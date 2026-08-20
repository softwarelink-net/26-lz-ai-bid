<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopFixedBanner from '@/components/TopFixedBanner.vue'
import { useSeo } from '@/composables/useSeo'

useSeo()
</script>

<template>
  <TopFixedBanner />
  <div class="min-h-screen pt-[40px]">
    <RouterView />
  </div>
</template>
