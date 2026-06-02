<script setup lang="ts">
const { locale, locales, setLocale, t } = useI18n()
const scrolled = ref(false)

function cycleLocale() {
  const codes = (locales.value as Array<{ code: string, name: string }>).map(l => l.code)
  const currentIndex = codes.indexOf(locale.value)
  const nextIndex = (currentIndex + 1) % codes.length
  setLocale(codes[nextIndex])
}

const mobileMenuItems = computed(() => [
  [
    {
      label: t('nav.blog'),
      icon: 'i-lucide-book-open',
      to: 'https://blog.ski.ink',
      target: '_blank'
    },
    {
      label: t('nav.travellings'),
      icon: 'i-lucide-train-front',
      to: 'https://travellings.cn',
      target: '_blank'
    }
  ],
  [
    {
      label: t('nav.language'),
      icon: 'i-lucide-languages',
      onSelect: cycleLocale
    }
  ]
])

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
  <div>
    <div
      class="page-background"
      :class="{ blurred: scrolled }"
    />

    <!-- Fixed Navigation Header -->
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="scrolled ? 'nav-scrolled' : 'bg-transparent'"
    >
      <nav class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-lg font-semibold"
        >
          <img
            src="/favicon.ico"
            alt=""
            class="w-6 h-6"
          >
          <span>{{ $t('nav.home') }}</span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-1">
          <UButton
            to="https://blog.ski.ink"
            target="_blank"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-book-open"
            :label="$t('nav.blog')"
            class="nav-labeled-btn"
          />
          <UButton
            to="https://travellings.cn"
            target="_blank"
            variant="ghost"
            color="neutral"
            size="sm"
            icon="i-lucide-train-front"
            :label="$t('nav.travellings')"
            class="nav-labeled-btn"
          />
          <UColorModeButton />
          <UButton
            icon="i-lucide-languages"
            color="neutral"
            variant="ghost"
            size="sm"
            :aria-label="$t('nav.language')"
            @click="cycleLocale"
          />
        </div>

        <div class="flex md:hidden items-center gap-1">
          <UColorModeButton />
          <UDropdownMenu :items="mobileMenuItems">
            <UButton
              icon="i-lucide-menu"
              variant="ghost"
              color="neutral"
              size="sm"
              :aria-label="$t('nav.menu')"
            />
          </UDropdownMenu>
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
        <span class="footer-text">{{ $t('footer.background') }}</span>
        <span class="footer-text">
          <UIcon
            name="i-simple-icons-github"
            class="size-4"
          />
          <a
            href="https://github.com/SALTWOOD/simple-homepage"
            target="_blank"
          >
            SALTWOOD/simple-homepage
          </a>
        </span>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener"
          class="footer-text hover:underline"
        >
          闽ICP备2024070515号-4
        </a>
        <a
          href="http://www.beian.gov.cn/"
          target="_blank"
          rel="noopener"
          class="footer-text hover:underline"
        >
          公网安备35018102240084号
        </a>
        <a
          href="https://icp.gov.moe/"
          target="_blank"
          rel="noopener"
          class="footer-text hover:underline"
        >
          萌ICP备20250399号
        </a>
        <a
          href="https://icp.gov.moe/"
          target="_blank"
          rel="noopener"
          class="footer-text hover:underline"
        >
          团ICP备20250399号
        </a>
        <a
          href="https://travellings.cn"
          target="_blank"
          rel="noopener"
        >
          <img
            src="https://www.travellings.cn/assets/logo.svg"
            alt="开往-友链接力"
            class="h-5 opacity-70 hover:opacity-100 transition-opacity"
          >
        </a>
        <a
          href="https://travellings.cn"
          target="_blank"
          rel="noopener"
          class="footer-text hover:underline"
        >
          异次元之旅
        </a>
        <span class="footer-text">Version v2.0.0</span>
      </div>
    </footer>
  </div>
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
  line-height: 1;
  text-align: center;
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
