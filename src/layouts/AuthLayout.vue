<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl shadow-xl overflow-hidden bg-white">
      <div class="p-8 bg-slate-900 text-slate-100 hidden lg:flex flex-col justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-sky-300">Luzhou CDC 2026</p>
          <h1 class="text-3xl font-semibold mt-4 leading-snug">人工智能辅助诊断信息系统运营服务项目</h1>
          <p class="text-slate-300 mt-4 text-sm">项目编号：N5105012026000255</p>
        </div>
        <p class="text-slate-400 text-sm">融合 DR/CT 影像、疾控质控、数据合规与 4 小时 SLA 运维保障。</p>
      </div>
      <div class="p-6 lg:p-10">
        <RouterView />
      </div>
    </div>
  </div>
</template>
