<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel space-y-4 p-6 text-sm">
    <h2 class="text-lg font-semibold text-slate-100">机构账号注册</h2>
    <p class="text-slate-400">
      演示环境不开放自助注册。医疗机构接入需由市疾控中心信息科开通租户、分配 RBAC 角色，并完成远程医疗平台网关证书绑定。
    </p>
    <ul class="space-y-1 text-xs text-slate-500">
      <li>超级管理员：admin@lzcdc.cn / Admin@2026</li>
      <li>疾控质控专家：expert@lzcdc.cn / Expert@2026</li>
      <li>临床医生：doctor@lzcdc.cn / Doctor@2026</li>
      <li>运维工程师：ops@lzcdc.cn / Ops@2026</li>
    </ul>
    <RouterLink to="/auth/login" class="btn-primary inline-flex">返回登录</RouterLink>
  </div>
</template>
