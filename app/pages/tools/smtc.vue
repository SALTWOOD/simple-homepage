<template>
  <div class="w-full min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
    <UCard class="w-full sm:w-80 bg-zinc-900 text-white shadow-xl rounded-2xl border border-zinc-800 overflow-hidden">
      <div class="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-800 mb-4 shadow-md">
        <img
          v-if="thumbnailUrl"
          :src="thumbnailUrl"
          alt="Album Artwork"
          class="w-full h-full object-cover transition-transform duration-300"
          @error="handleImageError"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-zinc-600"
        >
          <UIcon
            name="i-lucide-music"
            class="w-16 h-16"
          />
        </div>
      </div>

      <div class="text-center space-y-1 mb-4">
        <h2 class="text-lg font-semibold truncate text-zinc-100">
          {{ playerState?.title || '未在播放' }}
        </h2>
        <p class="text-sm text-zinc-400 truncate">
          {{ playerState?.artist || '未知' }}
        </p>
        <p
          v-if="playerState?.albumtitle"
          class="text-xs text-zinc-500 truncate"
        >
          {{ playerState.albumtitle }}
        </p>
      </div>

      <div
        v-if="playerState"
        class="space-y-1 mb-4"
      >
        <USlider
          v-model="sliderPosition"
          :max="playerState.duration"
          :step="1"
          color="primary"
          size="sm"
          class="bg-zinc-700"
          @update:model-value="handleSeekStart"
          @change="handleSeekEnd"
        />
        <div class="flex justify-between text-xs text-zinc-400">
          <span>{{ formatTime(sliderPosition) }}</span>
          <span>{{ formatTime(playerState.duration) }}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mb-2">
        <UButton
          icon="i-lucide-skip-back"
          color="zinc"
          variant="ghost"
          square
          aria-label="Previous"
          @click="sendControl('previous')"
        />
        <UButton
          icon="i-lucide-circle-stop"
          color="zinc"
          variant="ghost"
          square
          aria-label="Stop"
          @click="sendControl('stop')"
        />
        <UButton
          :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
          color="primary"
          variant="solid"
          size="lg"
          square
          aria-label="Toggle Play"
          class="rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
          @click="togglePlay"
        />
        <UButton
          icon="i-lucide-skip-forward"
          color="zinc"
          variant="ghost"
          square
          aria-label="Next"
          @click="sendControl('next')"
        />
      </div>

      <template #footer>
        <div class="flex flex-col gap-3 border-t border-zinc-800 pt-2 text-xs text-zinc-500">
          <div class="flex items-center gap-2">
            <UIcon
              :name="volumeSliderPosition === 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
              class="w-4 h-4 shrink-0"
            />
            <USlider
              v-model="volumeSliderPosition"
              :max="100"
              :step="1"
              color="neutral"
              size="xs"
              @update:model-value="handleVolumeStart"
              @change="handleVolumeEnd"
            />
            <span class="w-8 text-right shrink-0">{{ volumeSliderPosition }}%</span>
          </div>

          <div class="flex justify-between items-center">
            <span>Status Panel</span>
            <span
              class="flex items-center gap-1"
              :class="isOnline ? 'text-emerald-500' : 'text-zinc-500'"
            >
              <span
                class="h-2 w-2 rounded-full bg-current"
                :class="{ 'animate-pulse': isOnline }"
              />
              {{ isOnline ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

// --- Types ---
interface PlayerState {
  title: string
  artist: string
  albumtitle: string
  albumartist: string
  duration: number
  currentposition: number
  state: string
  volume: number
  muted: boolean
}

const BASE_URL = 'https://saltwood.top:33123'
let socket: Socket | null = null

const playerState = ref<PlayerState | null>(null)
const sliderPosition = ref(0)
const volumeSliderPosition = ref(0)
const isOnline = ref(false)
const thumbnailTimestamp = ref(Date.now())
const hasThumbnailError = ref(false)
const isUserDragging = ref(false)
const isUserDraggingVolume = ref(false)

const isPlaying = computed(() => playerState.value?.state === 'playing')

const thumbnailUrl = computed(() => {
  if (hasThumbnailError.value) {
    return null
  }
  return `${BASE_URL}/api/image?t=${thumbnailTimestamp.value}`
})

function onStateUpdate(data: PlayerState) {
  if (playerState.value?.title !== data.title) {
    thumbnailTimestamp.value = Date.now()
    hasThumbnailError.value = false
  }

  playerState.value = data

  if (!isUserDragging.value) {
    sliderPosition.value = data.currentposition
  }

  if (!isUserDraggingVolume.value) {
    volumeSliderPosition.value = data.volume
  }
}

function onThumbnailUpdate(data: { timestamp: number }) {
  thumbnailTimestamp.value = data.timestamp
  hasThumbnailError.value = false
}

const sendControl = async (command: 'play' | 'pause' | 'previous' | 'next' | 'stop'): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/${command}`, {
      method: 'POST'
    })
    if (!response.ok) {
      throw new Error(`Command failed: ${command}`)
    }
  } catch (error) {
    console.error(`Failed to send command [${command}]:`, error)
  }
}

const togglePlay = (): void => {
  const command = isPlaying.value ? 'pause' : 'play'
  sendControl(command)
}

const handleSeekStart = (): void => {
  isUserDragging.value = true
}

const handleSeekEnd = async (): Promise<void> => {
  try {
    const targetPosition = Math.round(sliderPosition.value)
    const response = await fetch(`${BASE_URL}/api/seek`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: targetPosition })
    })
    if (!response.ok) {
      throw new Error(`Seek failed with value: ${targetPosition}`)
    }
  } catch (error) {
    console.error('Failed to execute seek operation:', error)
  } finally {
    isUserDragging.value = false
  }
}

const handleVolumeStart = (): void => {
  isUserDraggingVolume.value = true
}

const handleVolumeEnd = async (): Promise<void> => {
  try {
    const targetVolume = Math.round(volumeSliderPosition.value)
    const response = await fetch(`${BASE_URL}/api/setvolume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: targetVolume })
    })
    if (!response.ok) {
      throw new Error(`Set volume failed with value: ${targetVolume}`)
    }
  } catch (error) {
    console.error('Failed to execute set volume operation:', error)
  } finally {
    isUserDraggingVolume.value = false
  }
}

const handleImageError = (): void => {
  console.warn('Failed to load artwork thumbnail, falling back to placeholder.')
  hasThumbnailError.value = true
}

const formatTime = (seconds: number | undefined): string => {
  if (seconds === undefined || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onMounted(() => {
  socket = io(BASE_URL, {
    transports: ['websocket']
  })

  socket.on('connect', () => {
    isOnline.value = true
  })

  socket.on('disconnect', () => {
    isOnline.value = false
  })

  socket.on('stateUpdate', onStateUpdate)
  socket.on('thumbnailUpdate', onThumbnailUpdate)
})

onUnmounted(() => {
  if (socket) {
    socket.off('stateUpdate', onStateUpdate)
    socket.off('thumbnailUpdate', onThumbnailUpdate)
    socket.disconnect()
    socket = null
  }
})
</script>
