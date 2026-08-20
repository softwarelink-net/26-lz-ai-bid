<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ScanSearch, FileSignature, Sparkles, Check, Pencil } from 'lucide-vue-next'
import DicomViewer from '@/components/DicomViewer.vue'
import { fetchDiagnostics, inferDiagnostic, reviewDiagnostic, signDiagnostic } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import type { DiagnosticRecord, Roi } from '@/types'

const auth = useAuthStore()
const app = useAppStore()
const records = ref<DiagnosticRecord[]>([])
const currentId = ref('')
const comment = ref('')
const showHeatmap = ref(true)
const showRois = ref(true)
const measureOn = ref(false)
const seriesIndex = ref(0)
const signatures = ref<Array<{ signer: string; role: string; digest: string; at: string }>>([])
const busy = ref('')
const reportDraft = ref('')

const current = computed(() => records.value.find((r) => r.id === currentId.value) || records.value[0] || null)
const rois = computed<Roi[]>(() => current.value?.ai_rois || [])
const meta = computed(() => {
  try {
    return JSON.parse(current.value?.dicom_meta_json || '{}') as Record<string, string>
  } catch {
    return {}
  }
})

const reportTemplate = computed(() => {
  const r = current.value
  if (!r) return ''
  return `【泸州市疾控中心 AI 辅助诊断提示报告】
检查编号：${r.id}
伪化 UID：${r.patient_hash_id}
机构：${r.institution_name || r.institution_id}（${r.district || '—'}）
性别/年龄组：${r.gender === 'M' ? '男' : r.gender === 'F' ? '女' : '其他'} / ${r.age_group}
模态：${r.modality} · ${r.body_part}
AI 状态：${r.ai_status}　置信度：${r.ai_confidence == null ? '—' : (r.ai_confidence * 100).toFixed(1) + '%'}

影像所见（AI 提示，不作为最终诊断）：
${r.ai_finding || '推理尚未完成。'}

质控路径：AI 预筛 → 基层初筛 → 市疾控专家终审。
本报告已完成 PHI 脱敏，不含真实姓名、身份证与联系方式。`
})

async function load() {
  const data = await fetchDiagnostics()
  const list = (data?.records || data || []) as DiagnosticRecord[]
  records.value = Array.isArray(list) ? list : []
  if (!currentId.value && records.value[0]) currentId.value = records.value[0].id
}

watch(current, (r) => {
  if (!r) return
  reportDraft.value = reportTemplate.value
  comment.value = r.review_comment || ''
  seriesIndex.value = r.modality === 'CT' ? 4 : 0
})

onMounted(load)

async function runInfer() {
  if (!current.value) return
  busy.value = 'infer'
  await inferDiagnostic(current.value.id)
  await load()
  busy.value = ''
}

async function adopt(status: 'CONFIRMED' | 'REVISED' | 'REJECTED') {
  if (!current.value) return
  busy.value = 'review'
  await reviewDiagnostic({ id: current.value.id, review_status: status, review_comment: comment.value })
  await load()
  busy.value = ''
}

async function sign() {
  if (!current.value) return
  busy.value = 'sign'
  const res = await signDiagnostic(current.value.id)
  signatures.value.unshift({
    signer: auth.displayName,
    role: auth.roleLabel,
    digest: res?.data?.digest || `SM3:${Date.now()}`,
    at: new Date().toLocaleString('zh-CN'),
  })
  busy.value = ''
}

function statusTone(s: string) {
  if (s === 'CONFIRMED') return 'text-emerald-300'
  if (s === 'REVISED') return 'text-amber-300'
  if (s === 'REJECTED') return 'text-rose-300'
  return 'text-slate-400'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-100">影像 AI 辅助诊断工作台</h1>
        <p class="mt-1 text-sm text-slate-400">轻量 DICOM 渲染 · ROI / Grad-CAM · 疾控标准提示报告 · 多级电子签名</p>
      </div>
      <div class="flex flex-wrap gap-2 text-xs">
        <label class="flex items-center gap-1 text-slate-400"><input v-model="showRois" type="checkbox" class="rounded border-slate-600 bg-slate-900" /> ROI</label>
        <label class="flex items-center gap-1 text-slate-400"><input v-model="showHeatmap" type="checkbox" class="rounded border-slate-600 bg-slate-900" /> Grad-CAM</label>
        <label class="flex items-center gap-1 text-slate-400"><input v-model="measureOn" type="checkbox" class="rounded border-slate-600 bg-slate-900" /> 测距模式</label>
        <span v-if="app.flags.FEATURE_AI_3D_CT" class="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300">3D-CT 特征已开</span>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-[240px_1fr_340px]">
      <aside class="panel max-h-[780px] overflow-auto">
        <div class="panel-header">任务列表</div>
        <button
          v-for="r in records"
          :key="r.id"
          class="block w-full border-b border-slate-800 px-3 py-3 text-left text-xs hover:bg-slate-800/60"
          :class="{ 'bg-cyan-600/15': r.id === current?.id }"
          @click="currentId = r.id"
        >
          <p class="font-mono text-cyan-300">{{ r.id }}</p>
          <p class="mt-0.5 text-slate-300">{{ r.institution_name || r.institution_id }}</p>
          <p class="mt-1 flex justify-between text-slate-500">
            <span>{{ r.modality }} · {{ r.age_group }}</span>
            <span :class="statusTone(r.review_status)">{{ r.review_status }}</span>
          </p>
        </button>
      </aside>

      <section class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-sm text-slate-300">
            <ScanSearch class="h-4 w-4 text-cyan-300" />
            <span>{{ current?.patient_hash_id || '—' }}</span>
            <span class="text-slate-500">{{ current?.modality }} 序列</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-if="current?.modality === 'CT'"
              v-model.number="seriesIndex"
              type="range"
              min="0"
              max="11"
              class="w-32 accent-cyan-500"
            />
            <button class="btn-ghost !py-1 text-xs" :disabled="busy === 'infer'" @click="runInfer">
              <Sparkles class="h-3.5 w-3.5" /> 重新推理
            </button>
          </div>
        </div>
        <DicomViewer
          :modality="current?.modality || 'DR'"
          :rois="rois"
          :show-heatmap="showHeatmap"
          :show-rois="showRois"
          :series-index="seriesIndex"
          :lesion-hint="(current?.ai_confidence || 0) > 0.4"
          class="h-[560px]"
        />
        <p v-if="measureOn" class="text-[11px] text-cyan-300/80">测距已开启：在影像上按住 Shift 拖拽标尺。</p>
        <dl class="grid grid-cols-2 gap-2 text-[11px] text-slate-400 md:grid-cols-4">
          <div class="panel px-3 py-2"><dt>厂商</dt><dd class="text-slate-200">{{ meta.Manufacturer || 'Mindray' }}</dd></div>
          <div class="panel px-3 py-2"><dt>kVp</dt><dd class="text-slate-200">{{ meta.KVP || '120' }}</dd></div>
          <div class="panel px-3 py-2"><dt>置信度</dt><dd class="text-amber-300">{{ current?.ai_confidence == null ? '—' : (current.ai_confidence * 100).toFixed(1) + '%' }}</dd></div>
          <div class="panel px-3 py-2"><dt>AI 状态</dt><dd class="text-slate-200">{{ current?.ai_status }}</dd></div>
        </dl>
      </section>

      <aside class="space-y-3">
        <div class="panel">
          <div class="panel-header">AI 辅助诊断提示报告</div>
          <textarea v-model="reportDraft" rows="12" class="input-dark min-h-[220px] border-0 bg-transparent font-mono text-[11px] leading-relaxed" />
        </div>
        <div class="panel p-3 space-y-2">
          <p class="text-xs text-slate-400">质控意见</p>
          <textarea v-model="comment" rows="3" class="input-dark text-xs" placeholder="采纳 / 修订说明…" />
          <div class="flex flex-wrap gap-2">
            <button class="btn-primary !py-1.5 text-xs" :disabled="busy === 'review'" @click="adopt('CONFIRMED')">
              <Check class="h-3.5 w-3.5" /> 一键采纳
            </button>
            <button class="btn-ghost !py-1.5 text-xs" :disabled="busy === 'review'" @click="adopt('REVISED')">
              <Pencil class="h-3.5 w-3.5" /> 修订
            </button>
            <button class="btn-danger !py-1.5 text-xs" :disabled="busy === 'review'" @click="adopt('REJECTED')">驳回</button>
          </div>
        </div>
        <div class="panel p-3 space-y-2">
          <p class="flex items-center gap-2 text-xs font-semibold text-slate-200"><FileSignature class="h-4 w-4 text-cyan-300" /> 多级电子签名</p>
          <button class="btn-ghost w-full text-xs" :disabled="busy === 'sign'" @click="sign">以当前角色签署</button>
          <ul class="space-y-1 text-[11px] text-slate-400">
            <li v-for="(s, i) in signatures" :key="i">{{ s.signer }} · {{ s.role }} · {{ s.at }}</li>
            <li v-if="!signatures.length" class="text-slate-600">尚无签名。基层医生首诊签署后，疾控专家可终审加签。</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>
