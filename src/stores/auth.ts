import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type UserRole =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_CDC_EXPERT'
  | 'ROLE_CLINICAL_DOCTOR'
  | 'ROLE_OPS_ENGINEER'

interface DemoUser {
  email: string
  password: string
  role: UserRole
  realName: string
  organization: string
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@lzcdc.cn',
    password: 'Admin@2026',
    role: 'ROLE_SUPER_ADMIN',
    realName: '系统管理员',
    organization: '泸州市疾病预防控制中心',
  },
  {
    email: 'expert@lzcdc.cn',
    password: 'Expert@2026',
    role: 'ROLE_CDC_EXPERT',
    realName: '疾控质控专家',
    organization: '泸州市疾控中心结核病防制科',
  },
  {
    email: 'doctor@lzcdc.cn',
    password: 'Doctor@2026',
    role: 'ROLE_CLINICAL_DOCTOR',
    realName: '临床医生',
    organization: '基层医疗机构',
  },
  {
    email: 'ops@lzcdc.cn',
    password: 'Ops@2026',
    role: 'ROLE_OPS_ENGINEER',
    realName: '运维工程师',
    organization: '运营服务技术支持中心',
  },
]

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('lz_ai_token'))
  const currentUser = ref<DemoUser | null>(null)

  const isAuthed = computed(() => !!token.value && !!currentUser.value)

  function restoreSession() {
    const saved = localStorage.getItem('lz_ai_user')
    if (saved) {
      currentUser.value = JSON.parse(saved) as DemoUser
    }
  }

  function login(email: string, password: string) {
    const user = demoUsers.find((u) => u.email === email && u.password === password)
    if (!user) return false

    token.value = `demo-token-${Date.now()}`
    currentUser.value = user
    localStorage.setItem('lz_ai_token', token.value)
    localStorage.setItem('lz_ai_user', JSON.stringify(user))
    return true
  }

  function logout() {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('lz_ai_token')
    localStorage.removeItem('lz_ai_user')
  }

  function switchRole(role: UserRole) {
    const user = demoUsers.find((u) => u.role === role)
    if (!user) return
    currentUser.value = user
    localStorage.setItem('lz_ai_user', JSON.stringify(user))
  }

  return {
    currentUser,
    isAuthed,
    login,
    logout,
    switchRole,
    restoreSession,
  }
})
