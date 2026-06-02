<script setup lang="ts">
definePageMeta({ layout: 'game' })

useHead({ title: '烟花' })

interface Particle {
  id: number
  tx: number
  ty: number
  x: number
  y: number
  hue: number
  size: number
  duration: number
}

interface Trail {
  id: number
  x: number
  y: number
  hue: number
}

const particles = ref<Particle[]>([])
const trails = ref<Trail[]>([])
const showTip = ref(true)

let nextId = 0

function createFirework(x: number, y: number) {
  const trailCount = 3
  for (let i = 0; i < trailCount; i++) {
    const trail: Trail = {
      id: nextId++,
      x,
      y,
      hue: Math.random() * 360,
    }
    trails.value.push(trail)
    const trailId = trail.id
    setTimeout(() => {
      trails.value = trails.value.filter(t => t.id !== trailId)
    }, 800)
  }

  const particleCount = Math.floor(Math.random() * 30 + 125)
  const hue = Math.random() * 360

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.PI * 2 * Math.random()
    const velocity = Math.random() * 300 + 100
    const duration = Math.random() * 0.5 + 1

    const particle: Particle = {
      id: nextId++,
      tx: Math.cos(angle) * velocity,
      ty: Math.sin(angle) * velocity,
      x,
      y,
      hue: hue + Math.random() * 60 - 30,
      size: Math.random() * 5 + 4,
      duration,
    }
    particles.value.push(particle)
    const particleId = particle.id
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id !== particleId)
    }, duration * 1000)
  }
}

function handleClick(e: MouseEvent) {
  createFirework(e.clientX, e.clientY)
}

onMounted(() => {
  setTimeout(() => {
    showTip.value = false
  }, 4500)
})
</script>

<template>
  <div class="firework-canvas" @click="handleClick">
    <div v-if="showTip" class="tip">点击屏幕燃放烟花</div>
    <div
      v-for="trail in trails"
      :key="trail.id"
      class="launch"
      :style="{
        left: `${trail.x}px`,
        top: `${trail.y}px`,
        background: `hsl(${trail.hue}, 100%, 50%)`,
      }"
    />
    <div
      v-for="particle in particles"
      :key="particle.id"
      class="firework"
      :style="{
        ['--tx' as string]: `${particle.tx}px`,
        ['--ty' as string]: `${particle.ty}px`,
        left: `${particle.x}px`,
        top: `${particle.y}px`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        background: `hsl(${particle.hue}, 100%, 50%)`,
        animationDuration: `${particle.duration}s`,
      }"
    />
  </div>
</template>

<style scoped>
.firework-canvas {
  position: fixed;
  inset: 0;
  background: #000;
  overflow: hidden;
  cursor: crosshair;
}

.tip {
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  font-size: 24px;
  text-align: center;
  color: #fff;
  user-select: none;
  z-index: 20;
  animation: fadeOut 1.5s ease-in-out 3s forwards;
}

.firework {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fff;
  border-radius: 50%;
  animation: explode 1s ease-out forwards;
  filter: blur(1px);
}

.launch {
  position: absolute;
  width: 3px;
  height: 15px;
  background: #fff;
  animation: rise 0.8s ease-out;
}

@keyframes explode {
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

@keyframes rise {
  to {
    transform: translateY(-100vh) rotate(180deg);
    opacity: 0;
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
