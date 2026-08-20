<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  ScanSearch,
  Shield,
  Headset,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { DEMO_USERS } from '@/composables/useApi'
import { ALL_ROLES } from '@/types'

const auth = useAuthStore()
const app = useAppStore()
const route = useRoute()
const router = useRouter()
const switching = ref(false)

const navItems = [
  { name: 'dashboard', label: '控制台总览', icon: LayoutDashboard, roles: ALL_ROLES },
  {
    name: 'studio',
    label: 'AI 诊断工作台',
    icon: ScanSearch,
    roles: ['ROLE_SUPER_ADMIN', 'ROLE_CDC_EXPERT', 'ROLE_CLINICAL_DOCTOR'],
  },
  { name: 'gateway', label: '接入与脱敏网关', icon: Shield, roles: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'] },
  { name: 'ops', label: '4小时 SLA 调度', icon: Headset, roles: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'] },
  { name: 'bid', label: '招标公告', icon: FileText, roles: ALL_ROLES },
  { name: 'settings', label: '系统与权限', icon: Settings, roles: ['ROLE_SUPER_ADMIN'] },
]

const visibleNav = computed(() => navItems.filter((item) => auth.hasRole(item.roles)))

const breadcrumbs = computed(() => {
  const crumbs: { label: string; to: string | null }[] = [{ label: '首页', to: '/' }]
  if (route.name && route.name !== 'dashboard') {
    crumbs.push({ label: (route.meta.title as string) || String(route.name), to: null })
  }
  return crumbs
})

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}

async function switchDemo(email: string) {
  const demo = DEMO_USERS.find((u) => u.email === email)
  if (!demo) return
  switching.value = true
  try {
    await auth.login(demo.email, demo.password)
    if (route.meta.roles && !auth.hasRole(route.meta.roles as string[])) {
      await router.push({ name: 'dashboard' })
    }
  } finally {
    switching.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-40px)]">
    <aside
      :class="[
        'sticky top-[40px] h-[calc(100vh-40px)] shrink-0 border-r border-slate-800 bg-clinic-900/90 transition-all duration-200',
        app.sidebarCollapsed ? 'w-[72px]' : 'w-60',
      ]"
    >
      <div class="flex h-14 items-center justify-between border-b border-slate-800 px-3">
        <div v-if="!app.sidebarCollapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-cyan-300">26-LZ-AI-BID</p>
          <p class="truncate text-[10px] text-slate-500">泸州疾控 · AI 辅助诊断</p>
        </div>
        <button class="btn-ghost !p-1.5" :title="app.sidebarCollapsed ? '展开' : '收起'" @click="app.toggleSidebar()">
          <ChevronRight v-if="app.sidebarCollapsed" class="h-4 w-4" />
          <ChevronLeft v-else class="h-4 w-4" />
        </button>
      </div>

      <nav class="space-y-1 overflow-y-auto p-2" style="max-height: calc(100vh - 220px)">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
          :class="{ 'bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-500/30': route.name === item.name }"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span v-if="!app.sidebarCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-3">
        <div v-if="!app.sidebarCollapsed" class="mb-2 flex items-center gap-2 text-xs text-slate-400">
          <Activity class="h-3.5 w-3.5 text-emerald-400" />
          <span class="truncate">{{ auth.roleLabel }}</span>
        </div>
        <button class="btn-ghost w-full !justify-start" @click="logout">
          <LogOut class="h-4 w-4" />
          <span v-if="!app.sidebarCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="sticky top-[40px] z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-800 bg-clinic-950/80 px-4 backdrop-blur"
      >
        <nav class="flex min-w-0 items-center gap-2 text-sm text-slate-400">
          <template v-for="(c, i) in breadcrumbs" :key="i">
            <RouterLink v-if="c.to" :to="c.to" class="hover:text-cyan-300">{{ c.label }}</RouterLink>
            <span v-else class="truncate text-slate-200">{{ c.label }}</span>
            <span v-if="i < breadcrumbs.length - 1" class="text-slate-600">/</span>
          </template>
        </nav>
        <div class="flex items-center gap-3 text-xs">
          <label class="hidden items-center gap-2 lg:flex">
            <span class="text-slate-500">Demo Switcher</span>
            <select
              class="rounded border-slate-700 bg-slate-950 py-1 text-xs text-slate-200"
              :value="auth.user?.email"
              :disabled="switching"
              @change="switchDemo(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="d in DEMO_USERS" :key="d.email" :value="d.email">
                {{ d.real_name.split('（')[0] }}
              </option>
            </select>
          </label>
          <div class="hidden items-center gap-2 sm:flex">
            <span
              class="inline-block h-2 w-2 rounded-full"
              :class="app.realtimeStatus === 'ONLINE' ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'"
            />
            <span class="text-slate-400">边缘 {{ app.realtimeStatus }}</span>
          </div>
          <div class="text-right">
            <p class="font-medium text-slate-200">{{ auth.displayName }}</p>
            <p class="max-w-[160px] truncate text-slate-500">{{ auth.user?.organization }}</p>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
