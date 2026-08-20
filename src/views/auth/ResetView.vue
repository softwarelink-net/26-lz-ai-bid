<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel space-y-4 p-6 text-sm">
    <h2 class="text-lg font-semibold text-slate-100">找回密码</h2>
    <p class="text-slate-400">
      演示环境账号由信息科统一发放，不支持自助重置。请使用预置演示口令登录，或联系超级管理员在系统设置中重置。
    </p>
    <ul class="space-y-1 text-xs text-slate-500">
      <li>管理员：admin@lzcdc.cn / Admin@2026</li>
      <li>疾控专家：expert@lzcdc.cn / Expert@2026</li>
      <li>临床医生：doctor@lzcdc.cn / Doctor@2026</li>
      <li>运维工程师：ops@lzcdc.cn / Ops@2026</li>
    </ul>
    <RouterLink to="/auth/login" class="btn-primary inline-flex">返回登录</RouterLink>
  </div>
</template>
