<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { Roi } from '@/types'

const props = withDefaults(
  defineProps<{
    modality?: string
    rois?: Roi[]
    showHeatmap?: boolean
    showRois?: boolean
    seriesIndex?: number
    lesionHint?: boolean
  }>(),
  {
    modality: 'DR',
    rois: () => [],
    showHeatmap: true,
    showRois: true,
    seriesIndex: 0,
    lesionHint: true,
  },
)

const canvas = ref<HTMLCanvasElement | null>(null)
const wrap = ref<HTMLDivElement | null>(null)

const ww = ref(255)
const wl = ref(127)
const zoom = ref(1)
const pan = reactive({ x: 0, y: 0 })
const measure = reactive({ active: false, x0: 0, y0: 0, x1: 0, y1: 0 })
const dragging = ref<'pan' | 'win' | 'measure' | null>(null)
const last = reactive({ x: 0, y: 0 })

const W = 512
const H = 512

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function applyWindow(v: number) {
  const low = wl.value - ww.value / 2
  const high = wl.value + ww.value / 2
  if (v <= low) return 0
  if (v >= high) return 255
  return ((v - low) / (high - low)) * 255
}

function lungField(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  const dx = (x - cx) / rx
  const dy = (y - cy) / ry
  return dx * dx + dy * dy
}

function noise(x: number, y: number, s: number) {
  const n = Math.sin(x * 0.17 + s) * Math.cos(y * 0.13 + s * 1.7)
  return (n + 1) * 0.5
}

function samplePixel(x: number, y: number) {
  const nx = x + 0.4 * Math.sin((y + props.seriesIndex * 7) * 0.04)
  const ny = y
  let v = 18
  const rib = Math.abs(Math.sin((ny - 40) / 18))
  if (rib > 0.92 && ny > 70 && ny < 430) v += 55
  const spine = 1 - Math.min(1, Math.abs(nx - 256) / 18)
  v += spine * 70
  const heart = lungField(nx, ny, 292, 300, 70, 90)
  if (heart < 1) v += (1 - heart) * 50
  const left = lungField(nx, ny, 175, 250, 95, 150)
  const right = lungField(nx, ny, 340, 250, 95, 150)
  if (left < 1) v += 28 + noise(nx, ny, 2) * 18
  if (right < 1) v += 26 + noise(nx, ny, 5) * 18
  if (ny < 70) v += 40
  if (ny > 470) v += 30
  if (props.lesionHint) {
    const lesion = lungField(nx, ny, 330, 200, 38, 30)
    if (lesion < 1) v += (1 - lesion) * 90 + (props.modality === 'CT' ? 20 : 0)
    const cavity = lungField(nx, ny, 338, 205, 10, 9)
    if (cavity < 1) v -= (1 - cavity) * 50
  }
  v += (props.seriesIndex % 12) * 1.2
  return clamp(v, 0, 255)
}

function jet(t: number): [number, number, number] {
  const x = clamp(t, 0, 1)
  return [clamp(1.5 - Math.abs(4 * x - 3), 0, 1) * 255, clamp(1.5 - Math.abs(4 * x - 2), 0, 1) * 255, clamp(1.5 - Math.abs(4 * x - 1), 0, 1) * 255]
}

function draw() {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const g = applyWindow(samplePixel(x, y))
      const i = (y * W + x) * 4
      img.data[i] = g
      img.data[i + 1] = g
      img.data[i + 2] = g
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)

  if (props.showHeatmap && props.rois.length) {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (const roi of props.rois) {
      const cx = roi.x + roi.w / 2
      const cy = roi.y + roi.h / 2
      const rad = Math.max(roi.w, roi.h) * 1.4
      const grd = ctx.createRadialGradient(cx, cy, 4, cx, cy, rad)
      const [r, g, b] = jet(roi.confidence ?? 0.8)
      grd.addColorStop(0, `rgba(${r},${g * 0.4},${b * 0.1},0.85)`)
      grd.addColorStop(0.45, `rgba(250,180,40,0.35)`)
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (props.showRois) {
    for (const roi of props.rois) {
      ctx.strokeStyle = roi.type === 'cavity' ? '#fb7185' : roi.type === 'calcification' ? '#38bdf8' : '#fbbf24'
      ctx.lineWidth = 2
      ctx.strokeRect(roi.x, roi.y, roi.w, roi.h)
      const label = `${roi.label || roi.type || 'ROI'} ${(roi.confidence ? roi.confidence * 100 : 0).toFixed(0)}%`
      ctx.font = '12px ui-sans-serif'
      const tw = ctx.measureText(label).width
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      ctx.fillRect(roi.x, Math.max(0, roi.y - 18), tw + 8, 16)
      ctx.fillStyle = '#e2e8f0'
      ctx.fillText(label, roi.x + 4, Math.max(12, roi.y - 6))
    }
  }

  if (measure.active || (measure.x1 && measure.y1 && dragging.value === 'measure')) {
    ctx.strokeStyle = '#22d3ee'
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(measure.x0, measure.y0)
    ctx.lineTo(measure.x1, measure.y1)
    ctx.stroke()
    ctx.setLineDash([])
    const dx = measure.x1 - measure.x0
    const dy = measure.y1 - measure.y0
    const mm = Math.hypot(dx, dy) * 0.35
    ctx.fillStyle = '#67e8f9'
    ctx.font = '11px ui-monospace'
    ctx.fillText(`${mm.toFixed(1)} mm`, measure.x1 + 6, measure.y1 - 6)
  }

  ctx.strokeStyle = 'rgba(148,163,184,0.35)'
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1)
}

function toLocal(e: MouseEvent) {
  const el = canvas.value!
  const rect = el.getBoundingClientRect()
  const x = ((e.clientX - rect.left - pan.x) / rect.width) * W
  const y = ((e.clientY - rect.top - pan.y) / rect.height) * H
  return { x: clamp(x, 0, W), y: clamp(y, 0, H) }
}

function onDown(e: MouseEvent) {
  const p = toLocal(e)
  last.x = e.clientX
  last.y = e.clientY
  if (e.shiftKey || measure.active) {
    dragging.value = 'measure'
    measure.active = true
    measure.x0 = p.x
    measure.y0 = p.y
    measure.x1 = p.x
    measure.y1 = p.y
  } else if (e.altKey || e.button === 2) {
    dragging.value = 'win'
  } else {
    dragging.value = 'pan'
  }
}

function onMove(e: MouseEvent) {
  if (!dragging.value) return
  if (dragging.value === 'pan') {
    pan.x += e.clientX - last.x
    pan.y += e.clientY - last.y
  } else if (dragging.value === 'win') {
    ww.value = clamp(ww.value + (e.clientX - last.x), 20, 400)
    wl.value = clamp(wl.value - (e.clientY - last.y), 0, 255)
  } else if (dragging.value === 'measure') {
    const p = toLocal(e)
    measure.x1 = p.x
    measure.y1 = p.y
  }
  last.x = e.clientX
  last.y = e.clientY
  draw()
}

function onUp() {
  dragging.value = null
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const next = clamp(zoom.value * (e.deltaY > 0 ? 0.92 : 1.08), 0.6, 4)
  zoom.value = next
}

function resetView() {
  zoom.value = 1
  pan.x = 0
  pan.y = 0
  ww.value = 255
  wl.value = 127
  measure.active = false
  measure.x1 = 0
  measure.y1 = 0
  draw()
}

onMounted(() => {
  draw()
  window.addEventListener('mouseup', onUp)
})
onUnmounted(() => window.removeEventListener('mouseup', onUp))
watch(() => [props.rois, props.showHeatmap, props.showRois, props.seriesIndex, props.modality, props.lesionHint], draw, { deep: true })

defineExpose({ resetView, ww, wl, zoom })
</script>

<template>
  <div ref="wrap" class="relative overflow-hidden rounded-lg bg-black">
    <canvas
      ref="canvas"
      :width="W"
      :height="H"
      class="h-full w-full cursor-grab touch-none"
      :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }"
      @mousedown.prevent="onDown"
      @mousemove="onMove"
      @wheel.prevent="onWheel"
      @contextmenu.prevent
    />
    <div class="pointer-events-none absolute left-3 top-3 space-y-0.5 font-mono text-[10px] text-cyan-200/80">
      <p>{{ modality }} · CHEST · PA</p>
      <p>WW {{ ww.toFixed(0) }} / WL {{ wl.toFixed(0) }}</p>
      <p>ZOOM {{ zoom.toFixed(2) }}× · 序列 {{ seriesIndex + 1 }}</p>
    </div>
    <div class="pointer-events-none absolute bottom-3 right-3 text-[10px] text-slate-400">
      拖拽平移 · Alt 窗宽窗位 · Shift 测距 · 滚轮缩放
    </div>
  </div>
</template>
