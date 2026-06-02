<script setup lang="ts">
const colorMode = useColorMode()
const scrolled = ref(false)

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(val: boolean) {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

function handleScroll() {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="page-background" :class="{ blurred: scrolled }" />

  <!-- Fixed Navigation Header -->
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'nav-scrolled' : 'bg-transparent'"
  >
    <nav class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 text-lg font-semibold">
        <img src="/favicon.ico" alt="" class="w-6 h-6" />
        <span>盐木的主页</span>
      </NuxtLink>

      <div class="flex items-center gap-1">
        <UButton
          to="https://blog.ski.ink"
          target="_blank"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-book-open"
          label="博客"
          class="nav-labeled-btn"
        />
        <UButton
          to="https://travellings.cn"
          target="_blank"
          variant="ghost"
          color="neutral"
          size="sm"
          icon="i-lucide-train-front"
          label="开往"
          class="nav-labeled-btn"
        />
        <UButton
          :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="深色模式"
          @click="isDark = !isDark"
        />
      </div>
    </nav>
  </header>

  <!-- Main Content -->
  <UMain class="pt-14">
    <slot />
  </UMain>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer-content">
      <p class="footer-text">
        背景图 (PID: 126628153) 已得到作者授权使用
      </p>
      <p class="footer-text" v-html="'<i class=&quot;fa-brands fa-github&quot;></i> 本项目已在 <a href=&quot;https://github.com/SALTWOOD/simple-homepage&quot; target=&quot;_blank&quot;>GitHub</a> 开源<br>'" />
      <div class="flex flex-col items-center gap-y-1 footer-text">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" class="hover:underline">
          闽ICP备2024070515号-4
        </a>
        <a href="http://www.beian.gov.cn/" target="_blank" rel="noopener" class="hover:underline">
          公网安备35018102240084号
        </a>
        <a href="https://icp.gov.moe/" target="_blank" rel="noopener" class="hover:underline">
          萌ICP备20250399号
        </a>
        <a href="https://icp.gov.moe/" target="_blank" rel="noopener" class="hover:underline">
          团ICP备20250399号
        </a>
      </div>
      <div class="flex items-center justify-center gap-3">
        <a href="https://travellings.cn" target="_blank" rel="noopener">
          <img
            src="https://www.travellings.cn/assets/logo.svg"
            alt="开往-友链接力"
            class="h-5 opacity-70 hover:opacity-100 transition-opacity"
          />
        </a>
        <a href="https://travellings.cn" target="_blank" rel="noopener" class="footer-text hover:underline">
          异次元之旅
        </a>
      </div>
      <p class="footer-version">Version v2.0.0</p>
    </div>
  </footer>
</template>

<style scoped>
.nav-scrolled {
  background: color-mix(in srgb, var(--ui-bg) 80%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.footer {
  border-top: 1px solid var(--ui-border);
  background: color-mix(in srgb, var(--ui-bg) 80%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
  gap: 0.75rem;
}

.footer-text {
  font-size: 0.9em;
  color: var(--ui-text-dimmed);
  line-height: 1.6;
}

.footer-version {
  font-size: 0.85em;
  color: var(--ui-text-dimmed);
}

@media (max-width: 768px) {
  .nav-labeled-btn :deep(span) {
    display: none;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 1.5rem 0.5rem;
  }
}
</style>
