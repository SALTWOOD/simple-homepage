<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: '404 - SaltWood'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-6">
      <div class="text-6xl">{{ t('404.emoji') }}</div>
      <h1 class="text-4xl font-bold">{{ t('404.title') }}</h1>
      <p class="text-(--ui-text-muted) text-lg">{{ t('404.message') }}</p>
      <div class="flex justify-center gap-4">
        <UButton
          @click="$router.back()"
          icon="i-lucide-arrow-left"
          :label="t('404.back')"
          color="neutral"
          variant="subtle"
        />
        <UButton
          to="/"
          icon="i-lucide-home"
          :label="t('404.home')"
        />
      </div>
    </div>
  </div>
</template>
