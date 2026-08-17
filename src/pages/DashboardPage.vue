<script setup lang="ts">
const districts = ['江阳', '龙马潭', '纳溪', '合江', '叙永', '古蔺', '泸县']
</script>

<template>
  <div class="space-y-4">
    <section class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
      <article class="bg-white rounded-xl p-4 shadow-sm border"><p class="text-slate-500 text-sm">全市筛查总量</p><h3 class="text-2xl font-semibold mt-2">129,840</h3></article>
      <article class="bg-white rounded-xl p-4 shadow-sm border"><p class="text-slate-500 text-sm">AI 推理 P95/P99</p><h3 class="text-2xl font-semibold mt-2">182ms / 347ms</h3></article>
      <article class="bg-white rounded-xl p-4 shadow-sm border"><p class="text-slate-500 text-sm">阳性预警检出率</p><h3 class="text-2xl font-semibold mt-2">93.4%</h3></article>
      <article class="bg-white rounded-xl p-4 shadow-sm border"><p class="text-slate-500 text-sm">实时队列任务</p><h3 class="text-2xl font-semibold mt-2">76</h3></article>
    </section>

    <section class="grid lg:grid-cols-3 gap-4">
      <article class="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border">
        <h3 class="font-semibold">区县接入节点拓扑状态</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div v-for="d in districts" :key="d" class="border rounded-lg p-3 bg-slate-50">
            <p class="text-sm text-slate-500">{{ d }}</p>
            <p class="text-emerald-600 font-semibold">ONLINE</p>
          </div>
        </div>
      </article>
      <article class="bg-white rounded-xl p-4 shadow-sm border">
        <h3 class="font-semibold">审计实时流</h3>
        <ul class="mt-3 space-y-2 text-sm text-slate-600">
          <li>17:00 VIEW_IMAGE by expert@lzcdc.cn</li>
          <li>16:58 TRIGGER_AI by doctor@lzcdc.cn</li>
          <li>16:55 UPDATE_CONFIG by admin@lzcdc.cn</li>
        </ul>
      </article>
    </section>
  </div>
</template>
