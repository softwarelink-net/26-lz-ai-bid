import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guard'
import { ALL_ROLES } from '@/types'

const routes = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { public: true, title: '登录' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { public: true, title: '注册' },
      },
      {
        path: 'reset',
        name: 'reset',
        component: () => import('@/views/auth/ResetView.vue'),
        meta: { public: true, title: '找回密码' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '控制台总览', roles: ALL_ROLES },
      },
      {
        path: 'studio',
        name: 'studio',
        component: () => import('@/views/diagnostic/StudioView.vue'),
        meta: {
          title: '影像 AI 辅助诊断工作台',
          roles: ['ROLE_SUPER_ADMIN', 'ROLE_CDC_EXPERT', 'ROLE_CLINICAL_DOCTOR'],
        },
      },
      {
        path: 'gateway',
        name: 'gateway',
        component: () => import('@/views/gateway/GatewayView.vue'),
        meta: { title: '远程医疗数据接入与脱敏网关', roles: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'] },
      },
      {
        path: 'ops',
        name: 'ops',
        component: () => import('@/views/ops/SlaView.vue'),
        meta: { title: '运营与 4 小时 SLA 调度', roles: ['ROLE_SUPER_ADMIN', 'ROLE_OPS_ENGINEER'] },
      },
      {
        path: 'bid',
        name: 'bid',
        component: () => import('@/views/bid/BidNoticeView.vue'),
        meta: { title: '招标公告', roles: ALL_ROLES },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/system/SettingsView.vue'),
        meta: { title: '系统配置与权限', roles: ['ROLE_SUPER_ADMIN'] },
      },
      {
        path: '403',
        name: 'forbidden',
        component: () => import('@/views/ForbiddenView.vue'),
        meta: { title: '无访问权限', public: true },
      },
    ],
  },
  { path: '/login', redirect: '/auth/login' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupGuards(router)

export default router
