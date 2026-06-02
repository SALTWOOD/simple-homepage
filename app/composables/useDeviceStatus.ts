export interface DeviceBattery {
  power: number
  charging: boolean
}

export interface DeviceInfo {
  name: string
  status: number // 0=offline, 1=online, 2=screen-off, 3=locked
  lastUpdatedAt: string
  lastOnline: string
  message: string
  ignored: boolean
  battery: DeviceBattery
}

export interface StatusApiResponse {
  data: DeviceInfo[]
}

export type OverallStatus = 'online' | 'maybe' | 'offline'

export interface DeviceStatusInfo {
  label: string
  color: 'success' | 'warning' | 'error' | 'neutral'
  icon: string
}

const HEARTBEAT_TIMEOUT_MINUTES = 8
const ONLINE_WINDOW_MINUTES = 15
const MAYBE_WINDOW_MINUTES = 60
const REFRESH_INTERVAL_SECONDS = 10

function getMinutesDiff(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return (now.getTime() - target.getTime()) / 60000
}

function isHeartbeatTimeout(device: DeviceInfo): boolean {
  return getMinutesDiff(device.lastUpdatedAt) > HEARTBEAT_TIMEOUT_MINUTES
}

function getDeviceStatus(device: DeviceInfo): DeviceStatusInfo {
  if (device.ignored) {
    return { label: '已忽略', color: 'neutral', icon: 'i-lucide-eye-off' }
  }

  if (device.status === 0 || isHeartbeatTimeout(device)) {
    return { label: '离线', color: 'error', icon: 'i-lucide-circle-off' }
  }

  switch (device.status) {
    case 1:
      return { label: '在线', color: 'success', icon: 'i-lucide-circle-check' }
    case 2:
      return { label: '屏幕关闭', color: 'warning', icon: 'i-lucide-monitor-off' }
    case 3:
      return { label: '已锁定', color: 'warning', icon: 'i-lucide-lock' }
    default:
      return { label: '未知', color: 'neutral', icon: 'i-lucide-help-circle' }
  }
}

function getOverallStatus(devices: DeviceInfo[]): OverallStatus {
  const activeDevices = devices.filter(d => !d.ignored)

  if (activeDevices.length === 0) {
    return 'offline'
  }

  const anyOnline = activeDevices.some(d =>
    (d.status === 1 && !isHeartbeatTimeout(d))
    || getMinutesDiff(d.lastOnline) <= ONLINE_WINDOW_MINUTES
  )

  if (anyOnline) return 'online'

  const anyMaybe = activeDevices.some(d =>
    getMinutesDiff(d.lastOnline) <= MAYBE_WINDOW_MINUTES
  )

  if (anyMaybe) return 'maybe'

  return 'offline'
}

function getOverallStatusInfo(status: OverallStatus): DeviceStatusInfo {
  switch (status) {
    case 'online':
      return { label: '在线', color: 'success', icon: 'i-lucide-wifi' }
    case 'maybe':
      return { label: '可能在', color: 'warning', icon: 'i-lucide-wifi-off' }
    case 'offline':
      return { label: '离线', color: 'error', icon: 'i-lucide-circle-off' }
  }
}

function getBatteryInfo(battery: DeviceBattery): { icon: string; text: string; color: string } {
  if (battery.charging) {
    if (battery.power >= 100) {
      return { icon: 'i-lucide-battery-charging', text: '已充满', color: 'text-green-500' }
    }
    return { icon: 'i-lucide-battery-charging', text: `${battery.power}%`, color: 'text-green-500' }
  }

  if (battery.power <= 20) {
    return { icon: 'i-lucide-battery-low', text: `${battery.power}%`, color: 'text-red-500' }
  }

  return { icon: 'i-lucide-battery-medium', text: `${battery.power}%`, color: 'text-(--ui-text-muted)' }
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function useDeviceStatus() {
  const devices = ref<DeviceInfo[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdate = ref<Date | null>(null)
  const countdown = ref(REFRESH_INTERVAL_SECONDS)
  const refreshing = ref(false)

  let intervalId: ReturnType<typeof setInterval> | null = null

  async function fetchStatus() {
    try {
      refreshing.value = true
      error.value = null
      const response = await $fetch<StatusApiResponse>('https://saltwood.top:4042/api/v1/status')
      devices.value = response.data
      lastUpdate.value = new Date()
      countdown.value = REFRESH_INTERVAL_SECONDS
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '获取状态失败'
    }
    finally {
      loading.value = false
      refreshing.value = false
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh()
    countdown.value = REFRESH_INTERVAL_SECONDS
    intervalId = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        fetchStatus()
      }
    }, 1000)
  }

  function stopAutoRefresh() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const overallStatus = computed(() => getOverallStatus(devices.value))
  const overallStatusInfo = computed(() => getOverallStatusInfo(overallStatus.value))

  onMounted(() => {
    fetchStatus().then(() => startAutoRefresh())
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    devices,
    loading,
    error,
    lastUpdate,
    countdown,
    refreshing,
    overallStatus,
    overallStatusInfo,
    fetchStatus,
    startAutoRefresh,
    stopAutoRefresh,
    getDeviceStatus,
    getBatteryInfo,
    formatDateTime,
    isHeartbeatTimeout
  }
}
