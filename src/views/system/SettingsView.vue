<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchConfigs, updateConfig } from '@/composables/useApi'
import { useAppStore } from '@/stores/app'
import { ROLE_LABELS, type Role } from '@/types'

const app = useAppStore()
const data = ref<Record<string, unknown> | null>(null)
const saving = ref('')

onMounted(async () => {
  data.value = await fetchConfigs()
  const flags = data.value?.feature_flags as Record<string, boolean | string> | undefined
  if (flags) app.setFlags(flags)
})

const configs = () => (data.value?.configs || []) as Array<{ key: string; value: string; description?: string; category?: string }>
const users = () => (data.value?.users || []) as Array<{ id: string; email: string; real_name: string; role: Role; organization: string; is_active?: number }>
const institutions = () => (data.value?.institutions || []) as Array<{ id: string; name: string; district: string; tier_level: string; sync_status: string; pacs_endpoint?: string }>

async function toggle(c: { key: string; value: string }) {
  if (c.key === 'SLA_MAX_RESPONSE_HOURS' || c.key === 'DICOM_GATEWAY_NODE') return
  const next = c.value === 'true' ? 'false' : 'true'
  saving.value = c.key
  await updateConfig(c.key, next)
  c.value = next
  app.setFlags({ [c.key]: next === 'true' })
  saving.value = ''
}

function statusBadge(s: string) {
  if (s === 'ONLINE') return 'badge-online'
  if (s === 'DEGRADED') return 'badge-degraded'
  return 'badge-offline'
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-slate-100">系统配置与权限管理</h1>
      <p class="mt-1 text-sm text-slate-400">多租户机构 · Feature Flags · 用户 RBAC · 仅超级管理员</p>
    </div>

    <section class="grid gap-4 md:grid-cols-2">
      <div class="panel p-5">
        <h2 class="text-sm font-semibold">部署元数据</h2>
        <dl class="mt-4 space-y-3 text-xs">
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Host</dt><dd class="font-mono text-cyan-300">{{ data?.host }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Repo</dt><dd class="truncate font-mono text-cyan-300">{{ data?.repo }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">Worker</dt><dd class="font-mono text-slate-300">{{ data?.worker }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">R2</dt><dd class="font-mono text-slate-300">{{ data?.r2 }}</dd></div>
          <div class="flex justify-between gap-4"><dt class="text-slate-500">D1</dt><dd class="font-mono text-slate-300">{{ data?.d1 }}</dd></div>
        </dl>
      </div>
      <div class="panel p-5">
        <h2 class="text-sm font-semibold">演示账号</h2>
        <ul class="mt-4 space-y-2 text-xs text-slate-400">
          <li><span class="text-slate-200">ROLE_SUPER_ADMIN</span> — admin@lzcdc.cn / Admin@2026</li>
          <li><span class="text-slate-200">ROLE_CDC_EXPERT</span> — expert@lzcdc.cn / Expert@2026</li>
          <li><span class="text-slate-200">ROLE_CLINICAL_DOCTOR</span> — doctor@lzcdc.cn / Doctor@2026</li>
          <li><span class="text-slate-200">ROLE_OPS_ENGINEER</span> — ops@lzcdc.cn / Ops@2026</li>
        </ul>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">Feature Flags</div>
      <ul class="divide-y divide-slate-800">
        <li v-for="c in configs()" :key="c.key" class="flex items-start justify-between gap-4 px-5 py-4 text-sm">
          <div>
            <p class="font-mono text-cyan-300">{{ c.key }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ c.category }} · {{ c.description }}</p>
          </div>
          <button
            class="shrink-0 rounded px-2 py-0.5 text-xs"
            :class="c.value === 'true' || c.value === 'false' ? (c.value === 'true' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-700/50 text-slate-300') : 'bg-slate-800 font-mono text-slate-300'"
            :disabled="saving === c.key || (c.value !== 'true' && c.value !== 'false')"
            @click="toggle(c)"
          >
            {{ c.value }}
          </button>
        </li>
      </ul>
    </section>

    <section class="panel">
      <div class="panel-header">用户与角色</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-xs">
          <thead class="text-slate-500">
            <tr>
              <th class="px-4 py-2">姓名</th>
              <th class="px-4 py-2">邮箱</th>
              <th class="px-4 py-2">角色</th>
              <th class="px-4 py-2">机构</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users()" :key="u.id" class="border-t border-slate-800 text-slate-300">
              <td class="px-4 py-2">{{ u.real_name }}</td>
              <td class="px-4 py-2 font-mono">{{ u.email }}</td>
              <td class="px-4 py-2">{{ ROLE_LABELS[u.role] || u.role }}</td>
              <td class="px-4 py-2">{{ u.organization }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">多租户医疗机构</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-xs">
          <thead class="text-slate-500">
            <tr>
              <th class="px-4 py-2">机构</th>
              <th class="px-4 py-2">区县</th>
              <th class="px-4 py-2">等级</th>
              <th class="px-4 py-2">PACS</th>
              <th class="px-4 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in institutions()" :key="i.id" class="border-t border-slate-800 text-slate-300">
              <td class="px-4 py-2">{{ i.name }}</td>
              <td class="px-4 py-2">{{ i.district }}</td>
              <td class="px-4 py-2">{{ i.tier_level }}</td>
              <td class="px-4 py-2 font-mono">{{ i.pacs_endpoint }}</td>
              <td class="px-4 py-2"><span :class="statusBadge(i.sync_status)">{{ i.sync_status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
