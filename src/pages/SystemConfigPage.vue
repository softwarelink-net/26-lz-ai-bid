<template>
  <div class="bg-white rounded-xl p-4 border shadow-sm">
    <h3 class="font-semibold">System & Feature Flags</h3>
    <div class="mt-4 space-y-3">
      <label class="flex items-center justify-between border rounded-lg p-3">
        <span>启用高级 3D-CT 重建</span>
        <input type="checkbox" checked />
      </label>
      <label class="flex items-center justify-between border rounded-lg p-3">
        <span>全自动报告下发</span>
        <input type="checkbox" checked />
      </label>
      <label class="flex items-center justify-between border rounded-lg p-3">
        <span>高置信度阳性短信预警</span>
        <input type="checkbox" checked />
      </label>
    </div>
    <div class="mt-4">
      <button class="px-4 py-2 bg-slate-900 text-white rounded-md">保存配置并写入审计日志</button>
    </div>
  </div>
</template>
