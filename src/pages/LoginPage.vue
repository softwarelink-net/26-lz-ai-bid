<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const error = ref('')
const form = reactive({
  email: 'admin@lzcdc.cn',
  password: 'Admin@2026',
})

function handleSubmit() {
  const ok = auth.login(form.email, form.password)
  if (!ok) {
    error.value = '账号或密码错误，请使用演示账号登录。'
    return
  }
  router.push('/')
}
</script>

<template>
  <div>
    <h3 class="text-2xl font-semibold text-slate-900">系统登录</h3>
    <p class="text-sm text-slate-500 mt-2">登录后进入 AI 诊断工作台与疾控运营总览。</p>
    <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
      <label class="block">
        <span class="text-sm text-slate-600">邮箱</span>
        <input v-model="form.email" class="mt-1 w-full border rounded-md px-3 py-2" />
      </label>
      <label class="block">
        <span class="text-sm text-slate-600">密码</span>
        <input v-model="form.password" type="password" class="mt-1 w-full border rounded-md px-3 py-2" />
      </label>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <button class="w-full bg-slate-900 text-white py-2 rounded-md">登录系统</button>
    </form>
  </div>
</template>
