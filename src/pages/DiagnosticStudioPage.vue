<script setup lang="ts">
import { ref } from 'vue'

const ww = ref(1450)
const wl = ref(-520)
const zoom = ref(1.2)
const panX = ref(12)
const panY = ref(-8)
const showGradCam = ref(true)
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">影像 AI 辅助诊断工作台</h3>
      <div class="grid lg:grid-cols-[1fr_340px] gap-4 mt-4">
        <div class="border rounded-lg bg-slate-950 min-h-[420px] relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_60%_45%,rgba(220,38,38,0.22),transparent_35%)]"></div>
          <div class="absolute left-[42%] top-[36%] w-24 h-20 border-2 border-amber-400 rounded-md"></div>
          <div class="absolute left-[42%] top-[33%] text-xs bg-amber-300 text-slate-900 px-2 py-1 rounded">活动性病灶 ROI 0.94</div>
          <div v-if="showGradCam" class="absolute inset-0 bg-[radial-gradient(circle_at_45%_45%,rgba(239,68,68,0.45),transparent_26%)]"></div>
          <div class="absolute bottom-2 right-2 text-xs text-slate-200 bg-slate-800/70 px-2 py-1 rounded">
            WW/WL: {{ ww }}/{{ wl }} | Zoom {{ zoom }}x | Pan({{ panX }}, {{ panY }})
          </div>
        </div>
        <aside class="space-y-3">
          <div class="border rounded-lg p-3">
            <p class="text-sm text-slate-600">窗宽窗位</p>
            <input v-model="ww" type="range" min="400" max="2200" class="w-full" />
            <input v-model="wl" type="range" min="-1000" max="200" class="w-full" />
          </div>
          <div class="border rounded-lg p-3">
            <p class="text-sm text-slate-600">缩放平移</p>
            <input v-model="zoom" type="range" min="0.5" max="2" step="0.1" class="w-full" />
            <div class="grid grid-cols-2 gap-2 mt-2">
              <input v-model="panX" type="number" class="border rounded px-2 py-1" />
              <input v-model="panY" type="number" class="border rounded px-2 py-1" />
            </div>
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="showGradCam" type="checkbox" />
            显示 Grad-CAM 热力图
          </label>
        </aside>
      </div>
    </div>
    <div class="bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">AI 辅助诊断提示报告</h3>
      <textarea class="w-full mt-3 border rounded-lg p-3 min-h-36" readonly>
初筛结论：右肺上叶见斑片状、纤维索条状高密度影，伴可疑微小空洞形成，高度提示活动性肺结核。
建议：建议结合痰涂片/分子生物学检测进一步确诊，并纳入疾控重点随访。
      </textarea>
      <div class="flex flex-wrap gap-2 mt-3">
        <button class="px-3 py-2 bg-emerald-600 text-white rounded-md">一键采纳</button>
        <button class="px-3 py-2 bg-amber-500 text-white rounded-md">修订后签署</button>
        <button class="px-3 py-2 bg-slate-800 text-white rounded-md">提交二级电子签名</button>
      </div>
    </div>
  </div>
</template>
