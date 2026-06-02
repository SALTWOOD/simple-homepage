<script setup lang="ts">
import { techBadges, friends } from '~/composables/useSiteData'
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Banner -->
    <section class="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        盐木的主页
      </h1>
      <p class="text-lg md:text-xl text-(--ui-text-muted) max-w-xl">
        欢迎光临，这里是盐木的小破窝~
      </p>
      <div class="scroll-indicator absolute bottom-8 left-1/2">
        <UIcon name="i-lucide-chevron-down" class="size-6 text-(--ui-text-dimmed)" />
      </div>
    </section>

    <!-- Content wrapper -->
    <div class="main-content">
      <div class="max-w-[1000px] mx-auto px-5 py-5 flex flex-col gap-5">

        <!-- About Section -->
        <section class="section-card">
          <h2 class="section-title">About</h2>
          <div class="section-body">
            <div class="flex flex-col items-center gap-8">
              <PersonCard
                avatar="https://saltwood.top:5244/d/友链头像/盐木.png"
                name="SALTWOOD"
                description1="来自广东省的一个废物高中生"
                description2="爱折腾编程，喜欢聊天，啥都想干却啥都干不好"
                link="https://ski.ink"
              />

              <p class="text-center max-w-2xl leading-relaxed" v-html="'来自广东省的一位学生，网名 <strong>SaltWood_233</strong>，大家可以叫我<strong>盐木</strong>！<br>喜欢写写代码、玩玩游戏，和听歌~<br>爱玩碧蓝航线之类的二游、部分音游、战舰世界和 Minecraft！<br>'" />

              <!-- Contact Buttons -->
              <div class="flex flex-wrap justify-center gap-3">
                <UButton
                  to="mailto:admin@ski.ink"
                  target="_blank"
                  icon="i-lucide-mail"
                  label="邮箱"
                  variant="outline"
                />
                <UButton
                  to="https://blog.ski.ink"
                  target="_blank"
                  icon="i-lucide-book-open"
                  label="博客"
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
                  label="请给我钱"
                  variant="outline"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Websites Section -->
        <section class="section-card">
          <h2 class="section-title">Websites</h2>
          <div class="section-body">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <UButton
                to="https://blog.ski.ink"
                target="_blank"
                icon="i-lucide-book-open"
                label="博客"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="https://saltwood.top:3001/status/all"
                target="_blank"
                icon="i-lucide-activity"
                label="服务状态"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="https://travellings.cn"
                target="_blank"
                icon="i-lucide-train-front"
                label="开往"
                block
                size="lg"
                variant="outline"
              />
              <UButton
                to="/html/watchme.html"
                icon="i-lucide-eye"
                label="视奸我"
                block
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </section>

        <!-- Tech Stacks Section -->
        <section class="section-card">
          <h2 class="section-title">Technology Stacks</h2>
          <div class="section-body">
            <p class="mb-6" v-html="'盐木一直比较闲的说！<br>如果你和我关系还算不错，欢迎随时来请教技术上的问题哦qwq<br>要我写项目也不是不行啦……只是神金学校放假太少很大可能写不完（悲）<br><div style=&quot;font-size: 0.6em;&quot;>我会的都在下面啦（小声）</div>'" />
            <div class="flex flex-wrap gap-3">
              <img
                v-for="tech in techBadges"
                :key="tech.label"
                :src="`https://img.shields.io/badge/${tech.label}-${tech.color}?style=flat-square&logo=${tech.logo}&logoColor=white`"
                :alt="tech.label"
                class="tech-badge"
                height="28"
              />
            </div>
          </div>
        </section>

        <!-- Games Section -->
        <section class="section-card">
          <h2 class="section-title">Games</h2>
          <div class="section-body">
            <p class="mb-6">这里是盐木做的一些 HTML 小游戏！</p>
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
                label="烟花"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/tetris.html"
                icon="i-lucide-layout-grid"
                label="俄罗斯方块"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/minesweeper.html"
                icon="i-lucide-bomb"
                label="扫雷"
                block
                variant="outline"
                size="lg"
              />
              <UButton
                to="/html/balls.html"
                icon="i-lucide-circle"
                label="小球"
                block
                variant="outline"
                size="lg"
              />
            </div>
          </div>
        </section>

        <!-- Friends Section -->
        <section class="section-card">
          <h2 class="section-title">Friends</h2>
          <div class="section-body">
            <p class="mb-6" v-html="'这里放一些好朋友的友链！<br>如果你没在这里看到你的链接，不妨去<a href=&quot;https://blog.ski.ink/friends&quot; target=&quot;_blank&quot;>这里</a>看看？<br>'" />
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
}
</style>
