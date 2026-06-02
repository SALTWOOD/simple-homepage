<script setup lang="ts">
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Floating back button -->
    <div class="fixed top-4 left-4 z-50">
      <UButton
        to="/"
        icon="i-lucide-arrow-left"
        variant="subtle"
        color="neutral"
        size="sm"
      />
    </div>
    <slot />
  </div>
</template>
