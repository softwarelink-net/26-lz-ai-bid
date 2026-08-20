import { useAuthStore } from '@/stores/auth'
import { applySeo } from '@/composables/useSeo'
import type { Router } from 'vue-router'

export function setupGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()
    const isPublic = to.matched.some((r) => r.meta.public) || to.name === 'forbidden'
    const isAuthRoute = to.path.startsWith('/auth')

    applySeo(undefined, to.meta?.title as string | undefined)

    if (!auth.isAuthenticated && !isPublic && !isAuthRoute) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    if (auth.isAuthenticated && to.name === 'login') {
      return next({ name: 'dashboard' })
    }

    const roles = to.meta.roles as string[] | undefined
    if (roles && auth.isAuthenticated && !auth.hasRole(roles)) {
      return next({ name: 'forbidden' })
    }

    return next()
  })
}
