<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Activity } from 'lucide-vue-next'
</script>

<template>
  <div
    class="flex min-h-[calc(100vh-40px)] items-center justify-center bg-gradient-to-br from-sky-900 via-cyan-900 to-slate-950 px-4 py-10"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-200"
        >
          <Activity class="h-7 w-7" />
        </div>
        <h1 class="text-xl font-semibold tracking-wide text-slate-100">泸州市疾病预防控制中心</h1>
        <p class="mt-1 text-sm text-cyan-200/80">2026 人工智能辅助诊断信息系统 · 运营服务原型</p>
      </div>
      <RouterView />
    </div>
  </div>
</template>
