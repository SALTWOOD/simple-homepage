<script setup lang="ts">
interface Props {
  avatar: string
  name: string
  description1?: string
  description2?: string
  link?: string
}

const props = defineProps<Props>()
</script>

<template>
  <NuxtLink
    v-if="link"
    :to="link"
    target="_blank"
    class="block"
  >
    <UCard
      class="hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer h-full"
    >
      <div class="flex items-center gap-4">
        <img
          :src="avatar"
          :alt="name"
          class="w-16 h-16 rounded-full object-cover shrink-0"
        />
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-base truncate">{{ name }}</h3>
          <p v-if="description1" class="text-sm text-(--ui-text-muted) truncate">
            {{ description1 }}
          </p>
          <p v-if="description2" class="text-xs text-(--ui-text-dimmed) truncate">
            {{ description2 }}
          </p>
        </div>
        <UIcon name="i-lucide-external-link" class="shrink-0 text-(--ui-text-dimmed) size-4" />
      </div>
    </UCard>
  </NuxtLink>

  <UCard v-else class="h-full">
    <div class="flex items-center gap-4">
      <img
        :src="avatar"
        :alt="name"
        class="w-20 h-20 rounded-full object-cover shrink-0"
      />
      <div class="min-w-0 flex-1">
        <h3 class="font-semibold text-lg">{{ name }}</h3>
        <p v-if="description1" class="text-sm text-(--ui-text-muted)">
          {{ description1 }}
        </p>
        <p v-if="description2" class="text-sm text-(--ui-text-dimmed)">
          {{ description2 }}
        </p>
      </div>
    </div>
  </UCard>
</template>
