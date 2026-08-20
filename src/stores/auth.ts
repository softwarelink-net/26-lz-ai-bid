import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin } from '@/composables/useApi'
import { ROLE_LABELS, type AuthUser, type Role } from '@/types'

const TOKEN_KEY = 'lz_ai_token'
const USER_KEY = 'lz_ai_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const user = ref<AuthUser | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const role = computed(() => (user.value?.role || '') as Role | '')
  const roleLabel = computed(() => (role.value ? ROLE_LABELS[role.value as Role] : ''))
  const displayName = computed(() => user.value?.real_name || user.value?.username || '访客')

  function hasRole(roles: string[] = []) {
    if (!roles.length) return true
    if (role.value === 'ROLE_SUPER_ADMIN') return true
    return roles.includes(role.value)
  }

  async function login(username: string, password: string) {
    const res = await apiLogin(username, password)
    if (!res.success) throw new Error(res.error || '登录失败')
    token.value = res.token as string
    user.value = res.user as AuthUser
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    return res.user
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    roleLabel,
    displayName,
    hasRole,
    login,
    logout,
  }
})
