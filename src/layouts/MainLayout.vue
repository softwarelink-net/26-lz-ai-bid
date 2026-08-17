<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore, type UserRole } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  void router.push('/login')
}

const navs = [
  { to: '/', label: '控制台总览' },
  { to: '/diagnostic', label: 'AI 诊断工作台' },
  { to: '/gateway', label: '数据网关与脱敏' },
  { to: '/operations', label: '运维与 SLA' },
  { to: '/system', label: '系统配置' },
]

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'ROLE_SUPER_ADMIN', label: '超级管理员' },
  { value: 'ROLE_CDC_EXPERT', label: '疾控中心专家' },
  { value: 'ROLE_CLINICAL_DOCTOR', label: '基层临床医生' },
  { value: 'ROLE_OPS_ENGINEER', label: '运维与安全工程师' },
]

const currentRole = computed({
  get: () => auth.currentUser?.role ?? 'ROLE_SUPER_ADMIN',
  set: (v) => auth.switchRole(v),
})
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-[40px] z-40">
      <div>
        <p class="text-sm text-slate-500">泸州市疾病预防控制中心</p>
        <h2 class="font-semibold text-slate-900">AI 辅助诊断信息系统</h2>
      </div>
      <div class="flex items-center gap-3 text-sm">
        <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i class="w-2 h-2 rounded-full bg-emerald-500"></i>系统状态正常
        </span>
        <select v-model="currentRole" class="px-2 py-1 border rounded-md bg-white">
          <option v-for="item in roleOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <button class="px-3 py-1 rounded-md bg-slate-800 text-white" @click="logout">退出</button>
      </div>
    </header>
    <div class="grid grid-cols-[240px_1fr] min-h-[calc(100vh-56px)]">
      <aside class="bg-slate-900 text-slate-100 p-4">
        <nav class="space-y-2">
          <RouterLink
            v-for="item in navs"
            :key="item.to"
            :to="item.to"
            class="block px-3 py-2 rounded-md hover:bg-slate-800"
            :class="route.path === item.to ? 'bg-slate-700' : ''"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </aside>
      <section class="p-4 lg:p-6">
        <div class="text-sm text-slate-500 mb-4">当前位置 / {{ route.meta.title ?? '首页' }}</div>
        <RouterView />
      </section>
    </div>
  </div>
</template>
