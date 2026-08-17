<template>
  <div class="space-y-4">
    <section class="bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">4 小时本地化应急响应调度看板</h3>
      <div class="grid md:grid-cols-3 gap-3 mt-4">
        <article class="border rounded-lg p-3 bg-red-50 border-red-200">
          <p class="text-sm text-red-700">CRITICAL · LZ-SLA-20260817-001</p>
          <p class="font-medium mt-1">叙永县节点推理超时持续 15 分钟</p>
          <p class="text-xs text-red-700 mt-2">剩余响应时间：01:22:14</p>
        </article>
        <article class="border rounded-lg p-3">
          <p class="text-sm text-slate-500">IN_PROGRESS · LZ-SLA-20260817-002</p>
          <p class="font-medium mt-1">纳溪区 DR 影像上传抖动</p>
          <p class="text-xs mt-2">工单负责人：陈工</p>
        </article>
        <article class="border rounded-lg p-3">
          <p class="text-sm text-slate-500">OPEN · LZ-SLA-20260817-003</p>
          <p class="font-medium mt-1">江阳区网关证书即将到期</p>
          <p class="text-xs mt-2">计划现场打卡：18:30</p>
        </article>
      </div>
    </section>
    <section class="bg-white rounded-xl p-4 border shadow-sm">
      <h3 class="font-semibold">模型版本与健康探针</h3>
      <div class="grid md:grid-cols-4 gap-3 mt-3 text-sm">
        <div class="border rounded p-3">当前模型：TBNet-v2.6.3</div>
        <div class="border rounded p-3">灰度发布：15%</div>
        <div class="border rounded p-3">成功率：99.42%</div>
        <div class="border rounded p-3">健康探针：PASS</div>
      </div>
    </section>
  </div>
</template>
