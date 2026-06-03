<script setup lang="ts">
definePageMeta({ layout: 'game' })

useHead({ title: '烟花' })

// ── Interfaces ──
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
  startX: number
  startY: number
  travelY: number // Relative distance to travel upwards (negative value)
  hue: number
}

// ── Reactive State ──
const particles = ref<Particle[]>([])
const trails = ref<Trail[]>([])
const showTip = ref(true)

let nextId = 0

// Helper function to handle async timing between launch and explosion
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ── Core Logic ──
async function createFirework(targetX: number, targetY: number) {
  const launchDuration = 800 // Must match the CSS animation duration (0.8s)
  const startY = window.innerHeight // Launch from the bottom of the viewport
  const travelY = targetY - startY   // Pixel distance to travel upwards

  // 1. Spawn launch trail
  const trail: Trail = {
    id: nextId++,
    startX: targetX,
    startY: startY,
    travelY: travelY,
    hue: Math.random() * 360
  }
  trails.value.push(trail)

  // Clean up trail data after animation finishes
  setTimeout(() => {
    trails.value = trails.value.filter(t => t.id !== trail.id)
  }, launchDuration)

  // 2. Wait for the shell to reach the apex (target height)
  await delay(launchDuration)

  // 3. Trigger explosion particles at the apex
  const particleCount = Math.floor(Math.random() * 30 + 125)
  const hue = trail.hue // Keep particle colors consistent with the trail

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.PI * 2 * Math.random()
    const velocity = Math.random() * 250 + 80
    const duration = Math.random() * 0.5 + 1

    const particle: Particle = {
      id: nextId++,
      tx: Math.cos(angle) * velocity,
      ty: Math.sin(angle) * velocity,
      x: targetX,
      y: targetY,
      hue: hue + Math.random() * 40 - 20,
      size: Math.random() * 4 + 3,
      duration
    }
    particles.value.push(particle)

    // Clean up individual particle after its duration ends
    setTimeout(() => {
      particles.value = particles.value.filter(p => p.id !== particle.id)
    }, duration * 1000)
  }
}

function handleClick(e: MouseEvent) {
  createFirework(e.clientX, e.clientY)
}

// ── Lifecycle Hooks ──
onMounted(() => {
  setTimeout(() => {
    showTip.value = false
  }, 4500)
})
</script>

<template>
  <div class="firework-canvas" @click="handleClick">
    <div v-if="showTip" class="tip">
      点击屏幕燃放烟花
    </div>

    <div
      v-for="trail in trails"
      :key="trail.id"
      class="launch"
      :style="{
        ['--ty' as string]: `${trail.travelY}px`,
        left: `${trail.startX}px`,
        top: `${trail.startY}px`,
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
        animationDuration: `${particle.duration}s`
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

/* Explosion particle styling */
.firework {
  position: absolute;
  border-radius: 50%;
  animation: explode 1s ease-out forwards;
  filter: blur(0.5px);
  transform: translate(0, 0);
  pointer-events: none;
}

/* Rising trail styling */
.launch {
  position: absolute;
  width: 3px;
  height: 25px;
  border-radius: 50% 50% 0 0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  /* Cubic-bezier curve creates a realistic deceleration effect near apex */
  animation: rise 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  pointer-events: none;
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
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    transform: translateY(var(--ty));
    opacity: 0;
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
