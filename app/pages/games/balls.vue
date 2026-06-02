<script setup lang="ts">
definePageMeta({ layout: 'game', ssr: false })

useHead({ title: '物理小球' })

interface Ball {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  color: string
}

const CONFIG = {
  BALL_COUNT_MIN: 80,
  BALL_COUNT_MAX: 120,
  RADIUS_MIN: 8,
  RADIUS_MAX: 25,
  INITIAL_SPEED_MIN: -10,
  INITIAL_SPEED_MAX: 10,
  MAX_SPEED: 32,
} as const

const canvasRef = ref<HTMLCanvasElement | null>(null)

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function limitSpeedVector(vx: number, vy: number): [number, number] {
  const speed = Math.sqrt(vx ** 2 + vy ** 2)
  if (speed > CONFIG.MAX_SPEED) {
    const ratio = CONFIG.MAX_SPEED / speed
    return [vx * ratio, vy * ratio]
  }
  return [vx, vy]
}

function handleBoundary(ball: Ball, width: number, height: number): void {
  if (ball.x < ball.radius) {
    ball.x = ball.radius
    ball.vx = Math.abs(ball.vx)
  }
  if (ball.x > width - ball.radius) {
    ball.x = width - ball.radius
    ball.vx = -Math.abs(ball.vx)
  }
  if (ball.y < ball.radius) {
    ball.y = ball.radius
    ball.vy = Math.abs(ball.vy)
  }
  if (ball.y > height - ball.radius) {
    ball.y = height - ball.radius
    ball.vy = -Math.abs(ball.vy)
  }
}

function createBalls(width: number, height: number): Ball[] {
  const balls: Ball[] = []
  const ballCount = Math.floor(random(CONFIG.BALL_COUNT_MIN, CONFIG.BALL_COUNT_MAX))

  for (let i = 0; i < ballCount; i++) {
    const radius = random(CONFIG.RADIUS_MIN, CONFIG.RADIUS_MAX)
    let validPosition = false
    let x = 0
    let y = 0

    while (!validPosition) {
      x = random(radius, width - radius)
      y = random(radius, height - radius)
      validPosition = true
      for (const ball of balls) {
        const dx = x - ball.x
        const dy = y - ball.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < radius + ball.radius) {
          validPosition = false
          break
        }
      }
    }

    const [vx, vy] = limitSpeedVector(
      random(CONFIG.INITIAL_SPEED_MIN, CONFIG.INITIAL_SPEED_MAX),
      random(CONFIG.INITIAL_SPEED_MIN, CONFIG.INITIAL_SPEED_MAX),
    )

    balls.push({ x, y, radius, vx, vy, color: `hsl(${random(0, 360)}, 70%, 50%)` })
  }

  return balls
}

function handleCollisions(balls: Ball[]): void {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const ball1 = balls[i]
      const ball2 = balls[j]
      const dx = ball2.x - ball1.x
      const dy = ball2.y - ball1.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = ball1.radius + ball2.radius

      if (distance < minDistance) {
        const nx = dx / distance
        const ny = dy / distance
        const relVx = ball1.vx - ball2.vx
        const relVy = ball1.vy - ball2.vy
        const speed = relVx * nx + relVy * ny

        if (speed < 0) {
          const m1 = ball1.radius ** 2
          const m2 = ball2.radius ** 2
          const impulse = (2 * speed) / (m1 + m2)

          ball1.vx -= impulse * m2 * nx
          ball1.vy -= impulse * m2 * ny
          ball2.vx += impulse * m1 * nx
          ball2.vy += impulse * m1 * ny

          const [limitedVx1, limitedVy1] = limitSpeedVector(ball1.vx, ball1.vy)
          ball1.vx = limitedVx1
          ball1.vy = limitedVy1

          const [limitedVx2, limitedVy2] = limitSpeedVector(ball2.vx, ball2.vy)
          ball2.vx = limitedVx2
          ball2.vy = limitedVy2

          const overlap = minDistance - distance
          ball1.x -= nx * overlap * 0.5
          ball1.y -= ny * overlap * 0.5
          ball2.x += nx * overlap * 0.5
          ball2.y += ny * overlap * 0.5
        }
      }
    }
  }
}

let animationFrameId: number | null = null
let balls: Ball[] = []

function startAnimation(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
  function animate(): void {
    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)

    for (const ball of balls) {
      ball.x += ball.vx
      ball.y += ball.vy
      handleBoundary(ball, width, height)
      const [limitedVx, limitedVy] = limitSpeedVector(ball.vx, ball.vy)
      ball.vx = limitedVx
      ball.vy = limitedVy
    }

    handleCollisions(balls)

    for (const ball of balls) {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
      ctx.fillStyle = ball.color
      ctx.fill()
      ctx.closePath()
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  animate()
}

function initScene(): void {
  const canvas = canvasRef.value
  if (!canvas) return

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  balls = createBalls(canvas.width, canvas.height)
  startAnimation(canvas, ctx)
}

onMounted(() => {
  initScene()
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
})

useEventListener('resize', useDebounceFn(() => {
  initScene()
}, 200))
</script>

<template>
  <canvas ref="canvasRef" class="block size-full bg-[#1a1a1a]" />
</template>
