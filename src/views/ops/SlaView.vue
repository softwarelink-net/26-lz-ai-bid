<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Clock, Siren } from 'lucide-vue-next'
import { fetchSla, mutateSla, MOCK_INSTITUTIONS } from '@/composables/useApi'
import type { SlaTicket } from '@/types'

const tickets = ref<SlaTicket[]>([])
const form = reactive({ institution_id: 'inst_02', severity: 'HIGH', title: '', content: '' })
const now = ref(Date.now())
let timer: number | null = null

const models = [
  { ver: 'TB-Net v2.4.1', status: 'PROD', p95: 86, notes: '全市灰度 100%' },
  { ver: 'TB-Net v2.5.0-rc', status: 'CANARY', p95: 79, notes: '江阳/纳溪 8% 流量' },
  { ver: 'TB-Net v2.3.8', status: 'ROLLBACK', p95: 94, notes: '热备回滚镜像' },
]

const probes = [
  { name: 'Worker allworld', ok: true, detail: 'edge healthy' },
  { name: 'D1 Allworld', ok: true, detail: 'lz_ai_* 可读' },
  { name: 'R2 26-lz-ai-bid-assets', ok: true, detail: '对象存储' },
  { name: '远程医疗网关', ok: false, detail: '泸县 C-ECHO 失败' },
]

async function load() {
  const data = await fetchSla()
  tickets.value = data.tickets || []
}

function remain(deadline: string) {
  const t = new Date(deadline.replace(' ', 'T') + '+08:00').getTime()
  const diff = t - now.value
  if (diff <= 0) return { text: '已超时', overdue: true, ms: diff }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { text: `${h}h ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`, overdue: false, ms: diff }
}

const openCritical = computed(() => tickets.value.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'))

onMounted(async () => {
  await load()
  timer = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function act(id: string, action: string) {
  await mutateSla({ id, action, assignee_id: 'u_ops' })
  await load()
}

async function createTicket() {
  if (!form.title) return
  await mutateSla({ action: 'create', ...form })
  form.title = ''
  form.content = ''
  await load()
}

function sevClass(s: string) {
  if (s === 'CRITICAL') return 'bg-rose-500/20 text-rose-300'
  if (s === 'HIGH') return 'bg-amber-500/20 text-amber-300'
  if (s === 'MEDIUM') return 'bg-sky-500/20 text-sky-300'
  return 'bg-slate-700 text-slate-300'
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-slate-100">运营保障与 4 小时 SLA 调度</h1>
      <p class="mt-1 text-sm text-slate-400">合同约定重大事件 4 小时本地/远程响应 · 工单闭环 · 模型版本与健康探针</p>
    </div>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="panel p-4">
        <p class="label-muted">未闭环工单</p>
        <p class="stat-value mt-2">{{ openCritical.length }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">SLA 时限</p>
        <p class="stat-value mt-2">4<span class="text-sm text-slate-500">h</span></p>
      </div>
      <div class="panel flex items-center gap-3 p-4">
        <Siren class="h-8 w-8 text-amber-400" />
        <div>
          <p class="text-sm text-slate-200">7×24 驻场值班</p>
          <p class="text-xs text-slate-500">陈工 · 泸州本地应急响应</p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-2">
        <div class="panel-header">工单流转</div>
        <ul class="divide-y divide-slate-800">
          <li v-for="t in tickets" :key="t.id" class="px-4 py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-slate-100">{{ t.title }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ t.ticket_no }} · {{ t.institution_name }} · {{ t.assignee_name || '未派单' }}</p>
                <p class="mt-2 max-w-xl text-xs text-slate-400">{{ t.content }}</p>
              </div>
              <div class="text-right">
                <span class="rounded px-2 py-0.5 text-[10px]" :class="sevClass(t.severity)">{{ t.severity }}</span>
                <p class="mt-2 flex items-center justify-end gap-1 font-mono text-xs" :class="remain(t.response_deadline).overdue ? 'text-rose-300' : 'text-cyan-300'">
                  <Clock class="h-3 w-3" /> {{ remain(t.response_deadline).text }}
                </p>
                <p class="mt-1 text-[10px] text-slate-500">{{ t.status }}</p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="btn-ghost !py-1 text-xs" @click="act(t.id, 'assign')">派单 / 现场打卡</button>
              <button class="btn-ghost !py-1 text-xs" @click="act(t.id, 'resolve')">标记已解决</button>
              <button class="btn-ghost !py-1 text-xs" @click="act(t.id, 'close')">回访闭环</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <div class="panel p-4">
          <h2 class="text-sm font-semibold">新建工单</h2>
          <div class="mt-3 space-y-2 text-xs">
            <select v-model="form.institution_id" class="input-dark">
              <option v-for="i in MOCK_INSTITUTIONS" :key="i.id" :value="i.id">{{ i.name }}</option>
            </select>
            <select v-model="form.severity" class="input-dark">
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>CRITICAL</option>
            </select>
            <input v-model="form.title" class="input-dark" placeholder="标题" />
            <textarea v-model="form.content" rows="3" class="input-dark" placeholder="现象描述" />
            <button class="btn-primary w-full" @click="createTicket">提交（4h 倒计时启动）</button>
          </div>
        </div>
        <div class="panel p-4">
          <h2 class="text-sm font-semibold">模型版本</h2>
          <ul class="mt-3 space-y-2 text-xs">
            <li v-for="m in models" :key="m.ver" class="rounded border border-slate-800 px-3 py-2">
              <div class="flex justify-between"><span class="font-mono text-cyan-300">{{ m.ver }}</span><span class="text-slate-500">{{ m.status }}</span></div>
              <p class="mt-1 text-slate-400">P95 {{ m.p95 }}ms · {{ m.notes }}</p>
            </li>
          </ul>
        </div>
        <div class="panel p-4">
          <h2 class="text-sm font-semibold">健康探针</h2>
          <ul class="mt-3 space-y-2 text-xs">
            <li v-for="p in probes" :key="p.name" class="flex items-center justify-between">
              <span>{{ p.name }}</span>
              <span :class="p.ok ? 'text-emerald-300' : 'text-rose-300'">{{ p.ok ? 'UP' : 'DOWN' }} · {{ p.detail }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
