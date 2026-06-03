<script setup lang="ts">
definePageMeta({ layout: 'game', ssr: false })

useHead({ title: '俄罗斯方块' })

// ── Constants ──
const COLS = 10
const ROWS = 20
const BLOCK = 30
const GAME_W = COLS * BLOCK
const GAME_H = ROWS * BLOCK
const NEXT_SIZE = 120

const COLORS = [
  null,
  '#00f0f0', // I - cyan
  '#f0f000', // O - yellow
  '#a000f0', // T - purple
  '#0000f0', // L - blue (dark)
  '#f0a000', // J - orange
  '#00f000', // S - green
  '#f00000', // Z - red
]

// Tetromino shapes indexed by type (1-7). Each is a list of [row, col] offsets.
const SHAPES: Record<number, number[][]> = {
  1: [[0, -1], [0, 0], [0, 1], [0, 2]], // I
  2: [[0, 0], [0, 1], [1, 0], [1, 1]], // O
  3: [[0, -1], [0, 0], [0, 1], [1, 0]], // T
  4: [[0, -1], [0, 0], [0, 1], [1, -1]], // L
  5: [[0, -1], [0, 0], [0, 1], [1, 1]], // J
  6: [[0, 0], [0, 1], [1, -1], [1, 0]], // S
  7: [[0, -1], [0, 0], [1, 0], [1, 1]], // Z
}

// SRS wall kick data: [type][rotationState][kickIndex][dx,dy]
// Types: 0 = I-piece, 1 = other pieces
// Rotation states: 0→1, 1→2, 2→3, 3→0
const WALL_KICKS: Record<number, number[][][]> = {
  0: [ // I-piece
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  ],
  1: [ // Other pieces
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  ],
}

// ── State ──
const gameCanvas = ref<HTMLCanvasElement | null>(null)
const nextCanvas = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const gameOver = ref(false)
const started = ref(false)

let arena: number[][] = []
let currentPiece: { type: number, rot: number, x: number, y: number } | null = null
let nextType = 0
let animFrameId: number | null = null
let lastDrop = 0
let dropInterval = 1000

// ── Helpers ──
function createArena(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

function randomType(): number {
  return Math.floor(Math.random() * 7) + 1
}

function getBlocks(type: number, rot: number): number[][] {
  const base = SHAPES[type]
  if (type === 2) return base // O doesn't rotate
  return base.map(([r, c]) => {
    for (let i = 0; i < rot; i++) {
      const tmp = r
      r = c
      c = -tmp
    }
    return [r, c]
  })
}

function collides(blocks: number[][], ax: number, ay: number): boolean {
  for (const [r, c] of blocks) {
    const nx = ax + c
    const ny = ay + r
    if (nx < 0 || nx >= COLS || ny >= ROWS) return true
    if (ny >= 0 && arena[ny][nx] !== 0) return true
  }
  return false
}

// ── Piece management ──
function spawnPiece(): void {
  const type = nextType
  nextType = randomType()
  const blocks = getBlocks(type, 0)
  const minX = Math.min(...blocks.map(([, c]) => c))
  const maxX = Math.max(...blocks.map(([, c]) => c))
  const x = Math.floor((COLS - (maxX - minX + 1)) / 2) - minX
  const y = type === 1 ? -1 : 0

  currentPiece = { type, rot: 0, x, y }

  if (collides(blocks, x, y)) {
    gameOver.value = true
    currentPiece = null
  }
}

function rotatePiece(dir: number): void {
  if (!currentPiece || currentPiece.type === 2) return
  const { type, rot, x, y } = currentPiece
  const newRot = (rot + dir + 4) % 4
  const newBlocks = getBlocks(type, newRot)
  const kickTable = WALL_KICKS[type === 1 ? 0 : 1][dir === 1 ? rot : newRot]

  for (const [dx, dy] of kickTable) {
    if (!collides(newBlocks, x + dx, y + dy)) {
      currentPiece.rot = newRot
      currentPiece.x = x + dx
      currentPiece.y = y + dy
      return
    }
  }
}

function movePiece(dx: number, dy: number): boolean {
  if (!currentPiece) return false
  const blocks = getBlocks(currentPiece.type, currentPiece.rot)
  if (!collides(blocks, currentPiece.x + dx, currentPiece.y + dy)) {
    currentPiece.x += dx
    currentPiece.y += dy
    return true
  }
  return false
}

function hardDrop(): void {
  if (!currentPiece) return
  const blocks = getBlocks(currentPiece.type, currentPiece.rot)
  let dy = 0
  while (!collides(blocks, currentPiece.x, currentPiece.y + dy + 1)) {
    dy++
  }
  currentPiece.y += dy
  score.value += dy * 2
  lockPiece()
}

function lockPiece(): void {
  if (!currentPiece) return
  const blocks = getBlocks(currentPiece.type, currentPiece.rot)
  for (const [r, c] of blocks) {
    const ny = currentPiece.y + r
    const nx = currentPiece.x + c
    if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
      arena[ny][nx] = currentPiece.type
    }
  }
  clearLines()
  spawnPiece()
}

function clearLines(): void {
  let cleared = 0
  for (let r = ROWS - 1; r >= 0; r--) {
    if (arena[r].every(c => c !== 0)) {
      arena.splice(r, 1)
      arena.unshift(Array(COLS).fill(0))
      cleared++
      r++ // re-check same row
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800]
    score.value += (points[cleared] ?? cleared * 100)
  }
}

// ── Drawing ──
function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = BLOCK): void {
  ctx.fillStyle = color
  ctx.fillRect(x * size, y * size, size, size)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.lineWidth = 1
  ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1)
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(x * size + 1, y * size + 1, size - 2, 3)
  ctx.fillRect(x * size + 1, y * size + 1, 3, size - 2)
}

function drawGhostBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color + '33'
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK)
  ctx.strokeStyle = color + '66'
  ctx.lineWidth = 1
  ctx.strokeRect(x * BLOCK + 0.5, y * BLOCK + 0.5, BLOCK - 1, BLOCK - 1)
}

function drawGame(ctx: CanvasRenderingContext2D): void {
  // Background
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(0, 0, GAME_W, GAME_H)

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath()
    ctx.moveTo(c * BLOCK, 0)
    ctx.lineTo(c * BLOCK, GAME_H)
    ctx.stroke()
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath()
    ctx.moveTo(0, r * BLOCK)
    ctx.lineTo(GAME_W, r * BLOCK)
    ctx.stroke()
  }

  // Arena blocks
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (arena[r][c] !== 0) {
        drawBlock(ctx, c, r, COLORS[arena[r][c]]!)
      }
    }
  }

  // Current piece + ghost
  if (currentPiece) {
    const blocks = getBlocks(currentPiece.type, currentPiece.rot)
    const color = COLORS[currentPiece.type]!

    // Ghost
    let ghostY = currentPiece.y
    while (!collides(blocks, currentPiece.x, ghostY + 1)) {
      ghostY++
    }
    if (ghostY !== currentPiece.y) {
      for (const [r, c] of blocks) {
        const gy = ghostY + r
        const gx = currentPiece.x + c
        if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
          drawGhostBlock(ctx, gx, gy, color)
        }
      }
    }

    // Actual piece
    for (const [r, c] of blocks) {
      const py = currentPiece.y + r
      const px = currentPiece.x + c
      if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
        drawBlock(ctx, px, py, color)
      }
    }
  }
}

function drawNext(ctx: CanvasRenderingContext2D): void {
  const blockSmall = NEXT_SIZE / 5
  ctx.fillStyle = '#2c3e50'
  ctx.fillRect(0, 0, NEXT_SIZE, NEXT_SIZE)

  if (nextType === 0) return

  const blocks = getBlocks(nextType, 0)
  const color = COLORS[nextType]!
  const minR = Math.min(...blocks.map(([r]) => r))
  const maxR = Math.max(...blocks.map(([r]) => r))
  const minC = Math.min(...blocks.map(([, c]) => c))
  const maxC = Math.max(...blocks.map(([, c]) => c))
  const pieceH = maxR - minR + 1
  const pieceW = maxC - minC + 1
  const offX = (5 - pieceW) / 2 - minC
  const offY = (5 - pieceH) / 2 - minR

  for (const [r, c] of blocks) {
    const dx = (offX + c) * blockSmall
    const dy = (offY + r) * blockSmall
    ctx.fillStyle = color
    ctx.fillRect(dx, dy, blockSmall, blockSmall)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(dx + 0.5, dy + 0.5, blockSmall - 1, blockSmall - 1)
  }
}

// ── Game loop ──
function gameLoop(time: number): void {
  if (!started.value || gameOver.value) return

  if (time - lastDrop > dropInterval) {
    if (!movePiece(0, 1)) {
      lockPiece()
    }
    lastDrop = time
  }

  const gCtx = gameCanvas.value?.getContext('2d')
  const nCtx = nextCanvas.value?.getContext('2d')
  if (gCtx) drawGame(gCtx)
  if (nCtx) drawNext(nCtx)

  animFrameId = requestAnimationFrame(gameLoop)
}

// ── Controls ──
function resetGame(): void {
  arena = createArena()
  score.value = 0
  gameOver.value = false
  started.value = false
  currentPiece = null
  nextType = 0
  lastDrop = 0
  dropInterval = 1000

  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }

  // Draw empty state
  const gCtx = gameCanvas.value?.getContext('2d')
  const nCtx = nextCanvas.value?.getContext('2d')
  if (gCtx) {
    gCtx.fillStyle = '#2c3e50'
    gCtx.fillRect(0, 0, GAME_W, GAME_H)
  }
  if (nCtx) {
    nCtx.fillStyle = '#2c3e50'
    nCtx.fillRect(0, 0, NEXT_SIZE, NEXT_SIZE)
  }
}

function startGame(): void {
  if (started.value && !gameOver.value) return
  resetGame()
  started.value = true
  nextType = randomType()
  spawnPiece()
  lastDrop = performance.now()
  animFrameId = requestAnimationFrame(gameLoop)
}

const onKeyDownTetris = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    startGame()
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    resetGame()
    return
  }

  if (!started.value || gameOver.value || !currentPiece) return

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault()
      movePiece(-1, 0)
      break
    case 'ArrowRight':
      e.preventDefault()
      movePiece(1, 0)
      break
    case 'ArrowDown':
      e.preventDefault()
      if (movePiece(0, 1)) score.value += 1
      break
    case 'ArrowUp':
      e.preventDefault()
      rotatePiece(1)
      break
    case 'z':
    case 'Z':
      rotatePiece(-1)
      break
    case ' ':
      e.preventDefault()
      hardDrop()
      break
  }
}
onMounted(() => window.addEventListener('keydown', onKeyDownTetris))
onUnmounted(() => window.removeEventListener('keydown', onKeyDownTetris))

// ── Lifecycle ──
onMounted(() => {
  arena = createArena()

  const gCtx = gameCanvas.value?.getContext('2d')
  const nCtx = nextCanvas.value?.getContext('2d')
  if (gCtx) {
    gCtx.fillStyle = '#2c3e50'
    gCtx.fillRect(0, 0, GAME_W, GAME_H)
  }
  if (nCtx) {
    nCtx.fillStyle = '#2c3e50'
    nCtx.fillRect(0, 0, NEXT_SIZE, NEXT_SIZE)
  }
})

onUnmounted(() => {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
})
</script>

<template>
  <div class="tetris-page">
    <div class="tetris-container">
      <!-- Game area -->
      <div class="game-area">
        <canvas
          ref="gameCanvas"
          :width="GAME_W"
          :height="GAME_H"
          class="game-canvas"
        />

        <!-- Start prompt -->
        <Transition name="overlay">
          <div
            v-if="!started && !gameOver"
            class="overlay"
          >
            <div class="overlay-content">
              <h2 class="overlay-title">
                俄罗斯方块
              </h2>
              <p class="overlay-hint">
                按 Enter 开始游戏
              </p>
            </div>
          </div>
        </Transition>

        <!-- Game Over -->
        <Transition name="overlay">
          <div
            v-if="gameOver"
            class="overlay"
          >
            <div class="overlay-content">
              <h2 class="overlay-title">
                游戏结束
              </h2>
              <p class="overlay-score">
                得分：{{ score }}
              </p>
              <p class="overlay-hint">
                按 Enter 重新开始
              </p>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <div class="panel">
          <h3 class="panel-label">
            下一个
          </h3>
          <canvas
            ref="nextCanvas"
            :width="NEXT_SIZE"
            :height="NEXT_SIZE"
            class="next-canvas"
          />
        </div>

        <div class="panel">
          <h3 class="panel-label">
            得分
          </h3>
          <p class="score-value">
            {{ score }}
          </p>
        </div>

        <div class="panel controls">
          <h3 class="panel-label">
            操作说明
          </h3>
          <div class="control-list">
            <div class="control-item">
              <kbd>←→</kbd><span>移动</span>
            </div>
            <div class="control-item">
              <kbd>↑</kbd><span>旋转</span>
            </div>
            <div class="control-item">
              <kbd>Z</kbd><span>反转</span>
            </div>
            <div class="control-item">
              <kbd>↓</kbd><span>软降</span>
            </div>
            <div class="control-item">
              <kbd>空格</kbd><span>硬降</span>
            </div>
            <div class="control-item">
              <kbd>ESC</kbd><span>重置</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #2c3e50;
  font-family: 'Segoe UI', system-ui, sans-serif;
  user-select: none;
}

.tetris-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.game-area {
  position: relative;
  line-height: 0;
}

.game-canvas {
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 140px;
}

.panel {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 12px;
}

.panel-label {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.4);
}

.next-canvas {
  border-radius: 4px;
  display: block;
}

.score-value {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #f1c40f;
  font-variant-numeric: tabular-nums;
}

.control-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}

.control-item kbd {
  display: inline-block;
  min-width: 36px;
  padding: 1px 5px;
  font-size: 11px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

/* Overlay */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(44, 62, 80, 0.85);
  border-radius: 4px;
  z-index: 10;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  color: #ecf0f1;
}

.overlay-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.overlay-score {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #f1c40f;
}

.overlay-hint {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

/* Overlay transitions */
.overlay-enter-active {
  animation: fade-in 0.25s ease;
}
.overlay-leave-active {
  animation: fade-in 0.2s ease reverse;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 520px) {
  .tetris-container {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .sidebar {
    flex-direction: row;
    flex-wrap: wrap;
    width: auto;
    justify-content: center;
  }
  .panel.controls {
    display: none;
  }
}
</style>
