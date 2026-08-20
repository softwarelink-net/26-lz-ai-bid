<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShieldAlert } from 'lucide-vue-next'
</script>

<template>
  <div class="mx-auto max-w-md py-16 text-center">
    <ShieldAlert class="mx-auto h-12 w-12 text-amber-400" />
    <h1 class="mt-4 text-xl font-semibold text-slate-100">无权访问该模块</h1>
    <p class="mt-2 text-sm text-slate-400">当前角色不在该路由的 RBAC 许可范围内。请使用顶部 Demo Switcher 切换演示账号，或返回控制台。</p>
    <RouterLink to="/" class="btn-primary mt-6">返回控制台总览</RouterLink>
  </div>
</template>
