<script setup lang="ts">
import { techBadges, friends } from '~/composables/useSiteData'
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Banner -->
    <section class="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        {{ $t('title') }}
      </h1>
      <p class="text-lg md:text-xl text-(--ui-text-muted) max-w-xl">
        {{ $t('banner') }}
      </p>
      <div class="scroll-indicator absolute bottom-8 left-1/2">
        <UIcon
          name="i-lucide-chevron-down"
          class="size-6 text-(--ui-text-dimmed)"
        />
      </div>
    </section>

    <!-- Content wrapper -->
    <div class="main-content">
      <div class="max-w-[1000px] mx-auto px-5 py-5 flex flex-col gap-5">
        <!-- About Section -->
        <section class="section-card">
          <h2 class="section-title">
            About
          </h2>
          <div class="section-body">
            <div class="flex flex-col items-center gap-8">
              <PersonCard
                avatar="https://static.ski.ink/avatar.webp"
                name="SALTWOOD"
                :description1="$t('about.description1')"
                :description2="$t('about.description2')"
                link="https://ski.ink"
              />

              <p
                class="text-center max-w-2xl leading-relaxed"
                v-html="$t('about.content')"
              />

              <!-- Contact Buttons -->
              <div class="flex flex-wrap justify-center gap-3">
                <UButton
                  to="mailto:admin@ski.ink"
                  target="_blank"
                  icon="i-lucide-mail"
                  :label="$t('contact.email')"
                  variant="outline"
                />
                <UButton
                  to="https://blog.ski.ink"
                  target="_blank"
                  icon="i-lucide-book-open"
                  :label="$t('contact.blog')"
                  variant="outline"
                />
                <UButton
                  to="https://github.com/SALTWOOD"
                  target="_blank"
                  icon="i-simple-icons-github"
                  label="GitHub"
                  variant="outline"
                />
                <UButton
                  to="https://saltwood.top:5244/d/Monero/wallet_address.txt"
                  target="_blank"
                  icon="i-simple-icons-monero"
                  :label="$t('contact.monero')"
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Websites Section -->
        <section class="section-card">
          <h2 class="section-title">
            Websites
          </h2>
          <div class="section-body">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <UButton
                to="https://blog.ski.ink"
                target="_blank"
                icon="i-lucide-book-open"
                :label="$t('websites.blog')"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="https://saltwood.top:3001/status/all"
                target="_blank"
                icon="i-lucide-activity"
                :label="$t('websites.status')"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="https://travellings.cn"
                target="_blank"
                icon="i-lucide-train-front"
                :label="$t('websites.travellings')"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="/html/watchme.html"
                icon="i-lucide-eye"
                :label="$t('websites.watchme')"
                block
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </section>

        <!-- Tech Stacks Section -->
        <section class="section-card">
          <h2 class="section-title">
            Technology Stacks
          </h2>
          <div class="section-body">
            <p
              class="mb-6"
              v-html="$t('tech.description')"
            />
            <div class="flex flex-wrap">
              <img
                v-for="tech in techBadges"
                :key="tech.label"
                :src="`https://img.shields.io/badge/${tech.label}-${tech.color}?style=flat-square&logo=${tech.logo}&logoColor=white`"
                :alt="tech.label"
                class="tech-badge"
                height="28"
              >
            </div>
          </div>
        </section>

        <!-- Games Section -->
        <section class="section-card">
          <h2 class="section-title">
            Games
          </h2>
          <div class="section-body">
            <p class="mb-6">
              {{ $t('games.title') }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <UButton
                to="/html/2048.html"
                icon="i-lucide-grid-2x2"
                label="2048"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/firework.html"
                icon="i-lucide-sparkles"
                :label="$t('games.firework')"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/tetris.html"
                icon="i-lucide-layout-grid"
                :label="$t('games.tetris')"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/minesweeper.html"
                icon="i-lucide-bomb"
                :label="$t('games.minesweeper')"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/balls.html"
                icon="i-lucide-circle"
                :label="$t('games.balls')"
                block
                variant="outline"
                size="lg"
              />
            </div>
          </div>
        </section>

        <!-- Friends Section -->
        <section class="section-card">
          <h2 class="section-title">
            Friends
          </h2>
          <div class="section-body">
            <p
              class="mb-6"
              v-html="$t('friends.desc')"
            />
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PersonCard
                v-for="friend in friends"
                :key="friend.name"
                :avatar="friend.avatar"
                :name="friend.name"
                :description1="friend.desc"
                :link="friend.link"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  min-height: 100vh;
}

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

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid color-mix(in srgb, var(--color-amber-400) 25%, transparent);
}

.section-body {
  padding: 0 10px;
  overflow-wrap: break-word;
}

.section-body p {
  margin: 1rem 0;
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

  .section-body {
    padding: 0;
  }

  .main-content :deep(> div) {
    padding-left: 0;
    padding-right: 0;
    gap: 0;
  }

  .section-card {
    padding: 1rem 0.75rem;
  }
}
</style>
