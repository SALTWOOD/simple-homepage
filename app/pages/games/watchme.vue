<script setup lang="ts">
definePageMeta({ layout: 'default' })

useHead({ title: '似了吗？' })

const {
  devices,
  loading,
  error,
  lastUpdate,
  countdown,
  refreshing,
  overallStatusInfo,
  fetchStatus,
  getDeviceStatus,
  getBatteryInfo,
  formatDateTime
} = useDeviceStatus()

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) return ''
  return lastUpdate.value.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})
</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-[1000px] mx-auto px-5 py-5 flex flex-col gap-5">
      <!-- Page Header -->
      <section class="section-card">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold">
              似了吗？
            </h1>
            <p class="text-sm text-(--ui-text-muted) mt-1">
              设备状态监控
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="lastUpdate"
              class="text-xs text-(--ui-text-dimmed)"
            >
              上次更新: {{ formattedLastUpdate }} · {{ countdown }}s 后刷新
            </span>
            <UButton
              icon="i-lucide-refresh-cw"
              variant="outline"
              size="sm"
              :loading="refreshing"
              label="刷新"
              @click="fetchStatus"
            />
          </div>
        </div>
      </section>

      <!-- Overall Status Banner -->
      <section class="section-card">
        <div class="flex items-center gap-3">
          <UIcon
            :name="overallStatusInfo.icon"
            class="size-6"
            :class="{
              'text-green-500': overallStatusInfo.color === 'success',
              'text-amber-500': overallStatusInfo.color === 'warning',
              'text-red-500': overallStatusInfo.color === 'error'
            }"
          />
          <div>
            <span class="font-semibold">综合状态：</span>
            <UBadge
              :color="overallStatusInfo.color"
              variant="subtle"
              size="lg"
            >
              {{ overallStatusInfo.label }}
            </UBadge>
          </div>
        </div>
      </section>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="section-card flex items-center justify-center py-16"
      >
        <div class="flex flex-col items-center gap-3">
          <UIcon
            name="i-lucide-loader-2"
            class="size-8 text-(--ui-text-dimmed) animate-spin"
          />
          <p class="text-(--ui-text-muted)">
            正在获取设备状态...
          </p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="section-card"
      >
        <div class="flex flex-col items-center gap-3 py-8">
          <UIcon
            name="i-lucide-alert-triangle"
            class="size-8 text-red-500"
          />
          <p class="text-red-500 font-medium">
            获取状态失败
          </p>
          <p class="text-sm text-(--ui-text-dimmed)">
            {{ error }}
          </p>
          <UButton
            label="重试"
            icon="i-lucide-refresh-cw"
            variant="outline"
            size="sm"
            @click="fetchStatus"
          />
        </div>
      </div>

      <!-- Device Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <UCard
          v-for="device in devices"
          :key="device.name"
          class="device-card"
        >
          <!-- Device Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <h3 class="font-semibold truncate">
                {{ device.name }}
              </h3>
              <UBadge
                v-if="device.ignored"
                color="neutral"
                variant="subtle"
                size="xs"
              >
                已忽略
              </UBadge>
            </div>
            <UBadge
              :color="getDeviceStatus(device).color"
              variant="subtle"
              size="sm"
            >
              <template #leading>
                <UIcon
                  :name="getDeviceStatus(device).icon"
                  class="size-3"
                />
              </template>
              {{ getDeviceStatus(device).label }}
            </UBadge>
          </div>

          <!-- Device Details -->
          <div class="space-y-2 text-sm">
            <!-- Message -->
            <div
              v-if="device.message"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-message-square"
                class="size-4 text-(--ui-text-dimmed) shrink-0 mt-0.5"
              />
              <span class="text-(--ui-text-muted) break-all">{{ device.message }}</span>
            </div>

            <!-- Battery -->
            <div
              v-if="device.battery"
              class="flex items-center gap-2"
            >
              <UIcon
                :name="getBatteryInfo(device.battery).icon"
                class="size-4 shrink-0"
                :class="getBatteryInfo(device.battery).color"
              />
              <span :class="getBatteryInfo(device.battery).color">
                {{ getBatteryInfo(device.battery).text }}
              </span>
            </div>

            <!-- Last Heartbeat -->
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-heart-pulse"
                class="size-4 text-(--ui-text-dimmed) shrink-0"
              />
              <span class="text-(--ui-text-muted)">
                心跳: {{ formatDateTime(device.lastUpdatedAt) }}
              </span>
            </div>

            <!-- Last Online -->
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-clock"
                class="size-4 text-(--ui-text-dimmed) shrink-0"
              />
              <span class="text-(--ui-text-muted)">
                上次在线: {{ formatDateTime(device.lastOnline) }}
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && !error && devices.length === 0"
        class="section-card flex items-center justify-center py-12"
      >
        <div class="flex flex-col items-center gap-3">
          <UIcon
            name="i-lucide-inbox"
            class="size-8 text-(--ui-text-dimmed)"
          />
          <p class="text-(--ui-text-muted)">
            暂无设备数据
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-card {
  background: color-mix(in srgb, var(--ui-bg) 90%, transparent);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

:root.dark .section-card {
  background: color-mix(in srgb, var(--ui-bg) 90%, transparent);
}

.device-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.device-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .section-card {
    padding: 1.2rem;
  }
}

@media (max-width: 480px) {
  .section-card {
    border-radius: 0;
    box-shadow: none;
  }
}
</style>
