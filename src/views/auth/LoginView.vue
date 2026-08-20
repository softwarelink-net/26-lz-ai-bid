<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { DEMO_USERS } from '@/composables/useApi'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin@lzcdc.cn')
const password = ref('Admin@2026')
const loading = ref(false)
const errorMsg = ref('')

function fillDemo(email: string, pwd: string) {
  username.value = email
  password.value = pwd
}

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="panel space-y-5 p-6" @submit.prevent="submit">
    <div>
      <h2 class="text-lg font-semibold text-slate-100">身份认证</h2>
      <p class="mt-1 text-xs text-slate-400">RBAC · JWT · PHI 脱敏会话 · N5105012026000255</p>
    </div>

    <div class="space-y-3">
      <label class="block text-xs text-slate-400">
        工作邮箱 / 用户名
        <input v-model="username" type="text" required class="input-dark" autocomplete="username" />
      </label>
      <label class="block text-xs text-slate-400">
        密码
        <input v-model="password" type="password" required class="input-dark" autocomplete="current-password" />
      </label>
    </div>

    <p v-if="errorMsg" class="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
      {{ errorMsg }}
    </p>

    <button type="submit" class="btn-primary w-full" :disabled="loading">
      {{ loading ? '校验中…' : '登录控制台' }}
    </button>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="d in DEMO_USERS"
        :key="d.email"
        type="button"
        class="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-cyan-500/50 hover:text-cyan-300"
        @click="fillDemo(d.email, d.password)"
      >
        {{ d.real_name.split('（')[0] }}
      </button>
    </div>

    <div class="flex items-center justify-between border-t border-slate-800 pt-4 text-xs">
      <div class="flex gap-3">
        <RouterLink to="/auth/register" class="text-cyan-400 hover:text-cyan-300">注册</RouterLink>
        <RouterLink to="/auth/reset" class="text-cyan-400 hover:text-cyan-300">找回密码</RouterLink>
      </div>
      <span class="text-slate-500">N5105012026000255</span>
    </div>
  </form>
</template>
