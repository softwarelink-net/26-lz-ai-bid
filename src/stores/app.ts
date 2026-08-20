import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const realtimeStatus = ref('ONLINE')
  const lastSyncAt = ref(new Date().toISOString())
  const flags = ref<Record<string, boolean | string>>({
    FEATURE_AI_3D_CT: true,
    FEATURE_AUTO_ALERT: true,
    FEATURE_AUTO_REPORT: false,
  })

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setRealtime(status: string) {
    realtimeStatus.value = status
    lastSyncAt.value = new Date().toISOString()
  }

  function setFlags(next: Record<string, boolean | string>) {
    flags.value = { ...flags.value, ...next }
  }

  return { sidebarCollapsed, realtimeStatus, lastSyncAt, flags, toggleSidebar, setRealtime, setFlags }
})
