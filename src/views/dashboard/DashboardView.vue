<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { EChartsCoreOption } from 'echarts/core'
import { Activity, Timer, Cpu, AlertTriangle, Radio } from 'lucide-vue-next'
import { fetchDashboard, fetchTender } from '@/composables/useApi'

const BaseChart = defineAsyncComponent(() => import('@/components/BaseChart.vue'))
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const dash = ref<Record<string, unknown> | null>(null)
const tender = ref<Record<string, unknown> | null>(null)
let timer: number | null = null

const kpis = computed(() => (dash.value?.kpis || {}) as Record<string, number>)
const districts = computed(() => (dash.value?.districts || []) as Array<Record<string, unknown>>)
const institutions = computed(() => (dash.value?.institutions || []) as Array<Record<string, string>>)
const queue = computed(() => (dash.value?.queue || []) as Array<Record<string, unknown>>)
const tickets = computed(() => (dash.value?.tickets || []) as Array<Record<string, string>>)
const audits = computed(() => (dash.value?.audits || []) as Array<Record<string, string>>)
const series = computed(() => (dash.value?.series || { daily: [], latency: [] }) as { daily: Array<{ d: string; n: number; p: number }>; latency: Array<{ t: string; p95: number; p99: number }> })
const countdown = computed(() => (tender.value?.countdown || { days: 0, hours: 0, minutes: 0, seconds: 0 }) as Record<string, number>)

const volumeOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: { data: ['筛查量', '阳性预警'], textStyle: { color: '#94a3b8' }, top: 0 },
  grid: { left: 40, right: 18, top: 36, bottom: 28 },
  xAxis: { type: 'category', data: series.value.daily.map((d) => d.d), axisLabel: { color: '#64748b' } },
  yAxis: [
    { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b' } } },
    { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { show: false } },
  ],
  series: [
    { name: '筛查量', type: 'bar', data: series.value.daily.map((d) => d.n), itemStyle: { color: '#0891b2' } },
    { name: '阳性预警', type: 'line', yAxisIndex: 1, data: series.value.daily.map((d) => d.p), itemStyle: { color: '#f59e0b' }, smooth: true },
  ],
}))

const latencyOption = computed<EChartsCoreOption>(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: { data: ['P95', 'P99'], textStyle: { color: '#94a3b8' }, top: 0 },
  grid: { left: 40, right: 18, top: 36, bottom: 28 },
  xAxis: { type: 'category', data: series.value.latency.map((d) => d.t), axisLabel: { color: '#64748b' } },
  yAxis: { type: 'value', name: 'ms', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#1e293b' } } },
  series: [
    { name: 'P95', type: 'line', data: series.value.latency.map((d) => d.p95), itemStyle: { color: '#22d3ee' }, smooth: true },
    { name: 'P99', type: 'line', data: series.value.latency.map((d) => d.p99), itemStyle: { color: '#fb7185' }, smooth: true },
  ],
}))

const layout: Record<string, { left: string; top: string }> = {
  江阳区: { left: '42%', top: '38%' },
  龙马潭区: { left: '48%', top: '28%' },
  纳溪区: { left: '38%', top: '52%' },
  泸县: { left: '58%', top: '34%' },
  合江县: { left: '68%', top: '48%' },
  叙永县: { left: '46%', top: '70%' },
  古蔺县: { left: '62%', top: '72%' },
}

function statusClass(s: string) {
  if (s === 'ONLINE') return 'bg-emerald-400'
  if (s === 'DEGRADED') return 'bg-amber-400'
  return 'bg-rose-400'
}

async function load() {
  dash.value = await fetchDashboard()
  tender.value = await fetchTender()
}

function tick() {
  const deadline = (tender.value?.bid_deadline as string) || '2026-09-04 09:30:00'
  const end = new Date(deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  if (tender.value) {
    tender.value.countdown = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: diff <= 0,
    }
  }
}

onMounted(async () => {
  await load()
  timer = window.setInterval(tick, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-clinic-900 to-slate-950 p-6 md:p-8">
      <div class="pointer-events-none absolute inset-0 opacity-30">
        <div class="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div class="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-sky-400/10 blur-2xl" />
      </div>
      <div class="relative">
        <p class="label-muted">泸州市疾病预防控制中心 · 肺结核 AI 筛查运营大屏</p>
        <h1 class="mt-2 max-w-3xl text-2xl font-semibold tracking-wide text-white md:text-3xl">
          全市胸部 DR/CT 人工智能辅助诊断态势
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
          项目编号 N5105012026000255 · 欢迎 {{ auth.displayName }}（{{ auth.roleLabel }}）· 边缘推理 P95/P99 与区县节点拓扑实时刷新。
        </p>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div v-for="(unit, key) in { days: '天', hours: '时', minutes: '分', seconds: '秒' }" :key="key" class="panel px-3 py-3 text-center">
            <p class="stat-value !text-xl">{{ String(countdown[key] ?? 0).padStart(2, '0') }}</p>
            <p class="label-muted mt-1">{{ unit }}</p>
          </div>
        </div>
        <p class="mt-3 flex items-center gap-2 text-xs text-amber-300/90">
          <Timer class="h-3.5 w-3.5" />
          投标截止：{{ (tender?.bid_deadline as string) || '2026-09-04 09:30:00' }}（北京时间）
        </p>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="panel p-4">
        <p class="label-muted">全市筛查总量</p>
        <p class="stat-value mt-2">{{ Number(kpis.screening_total || 0).toLocaleString() }}</p>
        <p class="mt-1 flex items-center gap-1 text-xs text-slate-500"><Activity class="h-3 w-3" /> DR + CT 累计</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">AI 推理耗时</p>
        <p class="stat-value mt-2">{{ kpis.p95_ms || 0 }}<span class="text-sm text-slate-500">ms</span></p>
        <p class="mt-1 text-xs text-slate-500">P95 / P99 {{ kpis.p99_ms || 0 }}ms</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">阳性预警检出率</p>
        <p class="stat-value mt-2 text-amber-300">{{ kpis.positive_rate || 0 }}%</p>
        <p class="mt-1 text-xs text-slate-500">置信度 ≥ 0.70 计入预警</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">接入节点 / 未闭环工单</p>
        <p class="stat-value mt-2">{{ kpis.online_nodes || 0 }}/{{ kpis.total_nodes || 0 }}</p>
        <p class="mt-1 flex items-center gap-1 text-xs text-rose-300"><AlertTriangle class="h-3 w-3" /> SLA {{ kpis.open_tickets || 0 }} 张</p>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-5">
      <div class="panel lg:col-span-3">
        <div class="panel-header flex items-center justify-between">
          <span>区县接入拓扑</span>
          <span class="text-[10px] font-normal text-slate-500">江阳 / 龙马潭 / 纳溪 / 合江 / 叙永 / 古蔺 / 泸县</span>
        </div>
        <div class="relative h-[320px] overflow-hidden p-4">
          <div class="absolute inset-6 rounded-[40%] border border-cyan-500/20 bg-cyan-500/5" />
          <div
            v-for="d in districts"
            :key="String(d.district)"
            class="absolute -translate-x-1/2 -translate-y-1/2 text-center"
            :style="layout[String(d.district)] || { left: '50%', top: '50%' }"
          >
            <span class="inline-block h-3 w-3 rounded-full ring-4 ring-slate-900" :class="statusClass(String(d.status))" />
            <p class="mt-1 text-xs font-medium text-slate-200">{{ d.district }}</p>
            <p class="text-[10px] text-slate-500">筛查 {{ d.screening }} · 预警 {{ d.positive }}</p>
          </div>
        </div>
        <ul class="grid grid-cols-2 gap-2 border-t border-slate-800 p-3 text-[11px] text-slate-400 md:grid-cols-4">
          <li v-for="inst in institutions" :key="inst.id" class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full" :class="statusClass(inst.sync_status)" />
            <span class="truncate">{{ inst.name }}</span>
          </li>
        </ul>
      </div>
      <div class="panel lg:col-span-2">
        <div class="panel-header">实时任务队列</div>
        <ul class="divide-y divide-slate-800 text-sm">
          <li v-for="q in queue" :key="String(q.id)" class="flex items-center justify-between px-4 py-3">
            <div>
              <p class="font-mono text-xs text-cyan-300">{{ q.id }}</p>
              <p class="text-xs text-slate-500">{{ q.modality }} · {{ q.ai_status }}</p>
            </div>
            <span
              class="rounded px-2 py-0.5 text-[10px]"
              :class="q.ai_status === 'FAILED' ? 'bg-rose-500/15 text-rose-300' : q.ai_status === 'PROCESSING' ? 'bg-amber-500/15 text-amber-300' : 'bg-slate-700 text-slate-300'"
            >{{ q.ai_status }}</span>
          </li>
          <li v-if="!queue.length" class="px-4 py-8 text-center text-xs text-slate-500">队列空闲</li>
        </ul>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="panel p-3">
        <p class="px-2 pt-1 text-sm font-semibold text-slate-200">日筛查流水</p>
        <BaseChart :option="volumeOption" height="260px" />
      </div>
      <div class="panel p-3">
        <p class="px-2 pt-1 text-sm font-semibold text-slate-200">推理延迟 P95 / P99</p>
        <BaseChart :option="latencyOption" height="260px" />
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="panel">
        <div class="panel-header flex items-center gap-2"><Radio class="h-4 w-4 text-amber-300" /> SLA 告警</div>
        <ul class="divide-y divide-slate-800 text-sm">
          <li v-for="t in tickets" :key="t.id" class="px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <p class="font-medium text-slate-200">{{ t.title }}</p>
              <span class="text-[10px] text-slate-500">{{ t.severity }}</span>
            </div>
            <p class="mt-1 text-xs text-slate-500">{{ t.ticket_no }} · {{ t.status }}</p>
          </li>
        </ul>
        <div class="border-t border-slate-800 px-4 py-3">
          <RouterLink to="/ops" class="text-xs text-cyan-400 hover:text-cyan-300">进入 4 小时调度 →</RouterLink>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header flex items-center gap-2"><Cpu class="h-4 w-4 text-cyan-300" /> 审计流水</div>
        <ul class="divide-y divide-slate-800 font-mono text-xs">
          <li v-for="a in audits" :key="a.id" class="px-4 py-3 text-slate-400">
            <span class="text-cyan-300">{{ a.operator_name || a.operator_id }}</span>
            · {{ a.action_type }} · {{ a.target_resource }}
            <span class="block text-[10px] text-slate-600">{{ a.created_at }} · {{ a.signature_hash }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
