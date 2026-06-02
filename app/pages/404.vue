<script setup lang="ts">
useHead({
  title: '404 - SaltWood'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-6">
      <div class="text-6xl">(っ °Д °;)っ</div>
      <h1 class="text-4xl font-bold">404 Not Found</h1>
      <p class="text-(--ui-text-muted) text-lg">啊哦，页面被腐蚀了</p>
      <div class="flex justify-center gap-4">
        <UButton
          @click="$router.back()"
          icon="i-lucide-arrow-left"
          label="返回"
          color="neutral"
          variant="subtle"
        />
        <UButton
          to="/"
          icon="i-lucide-home"
          label="首页"
        />
      </div>
    </div>
  </div>
</template>
