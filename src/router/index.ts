import { createRouter, createWebHistory } from 'vue-router'
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'
import { useAuthStore, type UserRole } from '../stores/auth'

const roleMap: Record<UserRole, string> = {
  ROLE_SUPER_ADMIN: '超级管理员',
  ROLE_CDC_EXPERT: '疾控中心专家',
  ROLE_CLINICAL_DOCTOR: '基层临床医生',
  ROLE_OPS_ENGINEER: '运维与安全工程师',
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true, title: '控制台总览' },
      children: [
        { path: '', name: 'dashboard', component: () => import('../pages/DashboardPage.vue') },
        {
          path: 'diagnostic',
          name: 'diagnostic',
          component: () => import('../pages/DiagnosticStudioPage.vue'),
          meta: {
            requiresRole: ['ROLE_SUPER_ADMIN', 'ROLE_CDC_EXPERT', 'ROLE_CLINICAL_DOCTOR'],
            title: 'AI 诊断工作台',
          },
        },
        {
          path: 'gateway',
          name: 'gateway',
          component: () => import('../pages/GatewayPage.vue'),
          meta: { requiresRole: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'], title: '数据接入与脱敏网关' },
        },
        {
          path: 'operations',
          name: 'operations',
          component: () => import('../pages/OperationsPage.vue'),
          meta: { requiresRole: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'], title: '运维与 SLA 调度' },
        },
        {
          path: 'system',
          name: 'system',
          component: () => import('../pages/SystemConfigPage.vue'),
          meta: { requiresRole: ['ROLE_SUPER_ADMIN'], title: '系统配置与权限管理' },
        },
      ],
    },
    {
      path: '/',
      component: AuthLayout,
      children: [{ path: 'login', name: 'login', component: () => import('../pages/LoginPage.vue') }],
    },
    { path: '/403', name: 'forbidden', component: () => import('../pages/ForbiddenPage.vue') },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  auth.restoreSession()
  if (to.meta.requiresAuth && !auth.isAuthed) {
    return '/login'
  }
  const requiredRoles = to.meta.requiresRole as UserRole[] | undefined
  if (requiredRoles && auth.currentUser && !requiredRoles.includes(auth.currentUser.role)) {
    return '/403'
  }
  const baseTitle = '泸州疾控 AI 辅助诊断系统'
  const routeTitle = (to.meta.title as string | undefined) ?? '系统'
  const roleText = auth.currentUser ? ` - ${roleMap[auth.currentUser.role]}` : ''
  document.title = `${routeTitle} | ${baseTitle}${roleText}`
  return true
})

export default router
