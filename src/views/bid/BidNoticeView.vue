<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchTender } from '@/composables/useApi'

const tender = ref<Record<string, unknown> | null>(null)
let timer: number | null = null
const countdown = computed(() => (tender.value?.countdown || {}) as Record<string, number | boolean>)

async function load() {
  tender.value = await fetchTender()
}

function tick() {
  if (!tender.value?.bid_deadline) return
  const end = new Date(String(tender.value.bid_deadline).replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  tender.value.countdown = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: diff <= 0,
  }
}

onMounted(async () => {
  await load()
  timer = window.setInterval(tick, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const tech = computed(() => {
  const v = tender.value?.tech_points
  return Array.isArray(v) ? v : [v]
})
const innov = computed(() => {
  const v = tender.value?.innovation
  return Array.isArray(v) ? v : [v]
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold text-slate-100">招标公告 · 合规全览</h1>
        <p class="mt-1 text-sm text-slate-400">结构化 8 大要素 · 预算 35 万元 · 公开招标二次</p>
      </div>
      <div class="panel px-4 py-2 text-center">
        <p class="label-muted">投标截止倒计时</p>
        <p class="font-mono text-lg text-amber-300">
          {{ countdown.days ?? 0 }}天
          {{ String(countdown.hours ?? 0).padStart(2, '0') }}:{{ String(countdown.minutes ?? 0).padStart(2, '0') }}:{{ String(countdown.seconds ?? 0).padStart(2, '0') }}
        </p>
      </div>
    </div>

    <section class="grid gap-3 md:grid-cols-2">
      <article class="panel p-4 md:col-span-2">
        <p class="label-muted">1. 标题</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ tender?.title }}</p>
      </article>
      <article class="panel p-4">
        <p class="label-muted">2. 项目发包方</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ tender?.issuer }}</p>
      </article>
      <article class="panel p-4">
        <p class="label-muted">3. 项目编号</p>
        <p class="mt-2 font-mono text-sm text-cyan-300">{{ tender?.project_no }}</p>
      </article>
      <article class="panel p-4">
        <p class="label-muted">4. 项目发布时间</p>
        <p class="mt-2 text-sm text-slate-200">{{ tender?.publish_time }}</p>
      </article>
      <article class="panel p-4">
        <p class="label-muted">5. 关键词</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ tender?.keywords }}</p>
      </article>
      <article class="panel p-4 md:col-span-2">
        <p class="label-muted">6. 摘要</p>
        <p class="mt-2 text-sm leading-relaxed text-slate-200">{{ tender?.summary }}</p>
      </article>
      <article class="panel p-4">
        <p class="label-muted">7. 技术要点</p>
        <ul class="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-200">
          <li v-for="(t, i) in tech" :key="i">{{ t }}</li>
        </ul>
      </article>
      <article class="panel p-4">
        <p class="label-muted">8. 技术创新性</p>
        <ul class="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-slate-200">
          <li v-for="(t, i) in innov" :key="i">{{ t }}</li>
        </ul>
      </article>
    </section>

    <article class="panel p-6">
      <p class="text-sm font-semibold text-slate-200">采购预算</p>
      <p class="stat-value mt-2">¥{{ Number(tender?.budget || 350000).toLocaleString() }}</p>
      <p class="mt-2 text-xs text-slate-500">合同履行期限：自合同签订之日起 30 日内完成系统上线交付，并包含验收合格后第一年全生命周期运营与运维服务。</p>
    </article>
  </div>
</template>
