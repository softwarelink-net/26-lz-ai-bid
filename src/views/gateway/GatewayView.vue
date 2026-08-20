<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ShieldCheck, Lock, Workflow } from 'lucide-vue-next'
import { fetchGateway, maskPhi } from '@/composables/useApi'

const data = ref<Record<string, unknown> | null>(null)
const form = reactive({ name: '王建国', id_card: '510502197803120017', phone: '13800138000' })
const masked = ref<Record<string, string> | null>(null)

onMounted(async () => {
  data.value = await fetchGateway()
})

async function runMask() {
  masked.value = await maskPhi(form)
}

const events = () => (data.value?.events || []) as Array<Record<string, unknown>>
const stats = () => (data.value?.stats || {}) as Record<string, number>
const compliance = () => (data.value?.compliance || []) as string[]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-slate-100">远程医疗数据接入与脱敏网关</h1>
      <p class="mt-1 text-sm text-slate-400">DICOM / HL7 / FHIR 专网接入 · 动态 PHI 掩码 · 合规证书审计</p>
    </div>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="panel p-4">
        <p class="label-muted">接入中继</p>
        <p class="mt-2 break-all font-mono text-sm text-cyan-300">{{ data?.node }}</p>
        <p class="mt-2 text-xs text-slate-500">{{ data?.tls }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">吞吐 EPS</p>
        <p class="stat-value mt-2">{{ stats().throughput_eps || 0 }}</p>
        <p class="mt-1 text-xs text-slate-500">今日掩码字段 {{ stats().masked_fields_today || 0 }}</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">传输成功率</p>
        <p class="stat-value mt-2">{{ stats().success_rate || 0 }}%</p>
        <p class="mt-1 flex items-center gap-1 text-xs text-emerald-300"><Lock class="h-3 w-3" /> mTLS 会话保活</p>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <div class="panel p-5">
        <h2 class="flex items-center gap-2 text-sm font-semibold"><Workflow class="h-4 w-4 text-cyan-300" /> PHI 动态脱敏沙箱</h2>
        <p class="mt-1 text-xs text-slate-500">输入明文仅在边缘内存处理，落库仅为哈希伪化 UID。</p>
        <div class="mt-4 space-y-3 text-xs">
          <label class="block text-slate-400">姓名<input v-model="form.name" class="input-dark" /></label>
          <label class="block text-slate-400">身份证<input v-model="form.id_card" class="input-dark font-mono" /></label>
          <label class="block text-slate-400">联系方式<input v-model="form.phone" class="input-dark font-mono" /></label>
          <button class="btn-primary" @click="runMask">执行掩码 / 伪化</button>
        </div>
        <dl v-if="masked" class="mt-4 grid grid-cols-2 gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3 font-mono text-xs text-cyan-100">
          <div><dt class="text-slate-500">姓名</dt><dd>{{ masked.name }}</dd></div>
          <div><dt class="text-slate-500">证件</dt><dd>{{ masked.id_card }}</dd></div>
          <div><dt class="text-slate-500">电话</dt><dd>{{ masked.phone }}</dd></div>
          <div><dt class="text-slate-500">UID</dt><dd>{{ masked.uid }}</dd></div>
        </dl>
      </div>
      <div class="panel p-5">
        <h2 class="flex items-center gap-2 text-sm font-semibold"><ShieldCheck class="h-4 w-4 text-emerald-300" /> 合规证书与制度映射</h2>
        <ul class="mt-4 space-y-2 text-sm text-slate-300">
          <li v-for="c in compliance()" :key="c" class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {{ c }}
          </li>
        </ul>
        <div class="mt-5 rounded-md border border-slate-700 p-3 text-xs text-slate-400">
          <p>证书链：泸州远程医疗平台 CA → 边缘网关叶子证书（演示）</p>
          <p class="mt-1">有效期：2026-01-01 ~ 2027-12-31 · 算法 ECDSA P-256</p>
          <p class="mt-1">审计签名哈希写入 <span class="font-mono text-cyan-300">lz_ai_audit_logs</span></p>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">传输流水</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-xs">
          <thead class="text-slate-500">
            <tr>
              <th class="px-4 py-2">时间</th>
              <th class="px-4 py-2">协议</th>
              <th class="px-4 py-2">机构</th>
              <th class="px-4 py-2">摘要</th>
              <th class="px-4 py-2">掩码字段</th>
              <th class="px-4 py-2">延迟</th>
              <th class="px-4 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in events()" :key="String(e.id)" class="border-t border-slate-800 text-slate-300">
              <td class="px-4 py-2 font-mono">{{ e.created_at }}</td>
              <td class="px-4 py-2">{{ e.protocol }} {{ e.direction }}</td>
              <td class="px-4 py-2">{{ e.institution_name }}</td>
              <td class="px-4 py-2">{{ e.payload_summary }}</td>
              <td class="px-4 py-2">{{ e.phi_fields_masked }}</td>
              <td class="px-4 py-2">{{ e.latency_ms }} ms</td>
              <td class="px-4 py-2">
                <span :class="e.status === 'OK' ? 'text-emerald-300' : 'text-rose-300'">{{ e.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
