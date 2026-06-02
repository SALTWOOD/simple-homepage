<script setup lang="ts">
definePageMeta({ layout: 'game' })

useHead({ title: '扫雷' })

interface Cell {
  isMine: boolean
  revealed: boolean
  flagged: boolean
  neighborMines: number
}

const SIZE = 10
const MINES = 15

const board = ref<Cell[][]>([])
const gameOver = ref(false)
const gameWon = ref(false)
const isFirstClick = ref(true)
const flags = ref(MINES)
const timer = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
let startTime = 0

const toast = useToast()

function createBoard(): Cell[][] {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      neighborMines: 0
    }))
  )
}

function init() {
  gameOver.value = false
  gameWon.value = false
  isFirstClick.value = true
  flags.value = MINES
  timer.value = 0
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  board.value = createBoard()
}

function updateTimer() {
  timer.value = Math.floor((Date.now() - startTime) / 1000)
}

function generateMines(firstX: number, firstY: number) {
  const safeZone = new Set<string>()
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = firstX + dx
      const ny = firstY + dy
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
        safeZone.add(`${nx},${ny}`)
      }
    }
  }

  let minesPlaced = 0
  while (minesPlaced < MINES) {
    const x = Math.floor(Math.random() * SIZE)
    const y = Math.floor(Math.random() * SIZE)
    if (safeZone.has(`${x},${y}`)) continue
    if (!board.value[x][y].isMine) {
      board.value[x][y].isMine = true
      minesPlaced++
    }
  }

  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      if (!board.value[x][y].isMine) {
        board.value[x][y].neighborMines = countNeighborMines(x, y)
      }
    }
  }

  startTime = Date.now()
  timerInterval = setInterval(updateTimer, 1000)
}

function countNeighborMines(x: number, y: number): number {
  let count = 0
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
        if (board.value[nx][ny].isMine) count++
      }
    }
  }
  return count
}

function reveal(x: number, y: number) {
  if (gameOver.value || gameWon.value) return
  if (board.value[x][y].revealed || board.value[x][y].flagged) return

  if (isFirstClick.value) {
    generateMines(x, y)
    isFirstClick.value = false
  }

  board.value[x][y].revealed = true

  if (board.value[x][y].isMine) {
    gameOver.value = true
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    showMines()
    toast.add({ title: '游戏结束！', color: 'error', icon: 'i-lucide-bomb' })
    return
  }

  if (board.value[x][y].neighborMines === 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
          if (!board.value[nx][ny].revealed) {
            reveal(nx, ny)
          }
        }
      }
    }
  }

  checkWin()
}

function checkWin() {
  const won = board.value.every(row =>
    row.every(cell => cell.isMine || cell.revealed)
  )
  if (won) {
    gameWon.value = true
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    toast.add({ title: '胜利！', color: 'success', icon: 'i-lucide-trophy' })
  }
}

function toggleFlag(x: number, y: number) {
  if (gameOver.value || gameWon.value) return
  if (board.value[x][y].revealed) return
  if (!board.value[x][y].flagged && flags.value <= 0) return

  board.value[x][y].flagged = !board.value[x][y].flagged
  flags.value += board.value[x][y].flagged ? -1 : 1
}

function showMines() {
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      if (board.value[x][y].isMine) {
        board.value[x][y].revealed = true
      }
    }
  }
}

function onCellClick(x: number, y: number) {
  reveal(x, y)
}

function onCellRightClick(x: number, y: number, event: Event) {
  event.preventDefault()
  toggleFlag(x, y)
}

function cellContent(cell: Cell): string {
  if (cell.flagged && !cell.revealed) return '🚩'
  if (!cell.revealed) return ''
  if (cell.isMine) return '💣'
  if (cell.neighborMines > 0) return String(cell.neighborMines)
  return ''
}

function cellClass(cell: Cell): Record<string, boolean> {
  return {
    revealed: cell.revealed && !cell.isMine,
    mine: cell.revealed && cell.isMine,
    flagged: cell.flagged && !cell.revealed,
    [`number-${cell.neighborMines}`]: cell.revealed && !cell.isMine && cell.neighborMines > 0
  }
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
})

init()
</script>

<template>
  <div class="minesweeper-page">
    <div class="game-container">
      <h1 class="game-title">
        扫雷
      </h1>

      <div class="status-bar">
        <UBadge
          variant="subtle"
          color="error"
          size="lg"
          icon="i-lucide-bomb"
        >
          {{ flags }}
        </UBadge>
        <UBadge
          variant="subtle"
          color="neutral"
          size="lg"
          icon="i-lucide-clock"
        >
          {{ timer }}s
        </UBadge>
      </div>

      <div
        class="grid"
        @contextmenu.prevent
      >
        <template
          v-for="(row, x) in board"
          :key="x"
        >
          <div
            v-for="(cell, y) in row"
            :key="`${x}-${y}`"
            class="cell"
            :class="cellClass(cell)"
            @click="onCellClick(x, y)"
            @contextmenu="onCellRightClick(x, y, $event)"
          >
            {{ cellContent(cell) }}
          </div>
        </template>
      </div>

      <UButton
        label="重新开始"
        variant="outline"
        color="neutral"
        size="md"
        class="restart-btn"
        @click="init"
      />

      <!-- Game Over / Win Overlay -->
      <Transition name="overlay">
        <div
          v-if="gameOver || gameWon"
          class="game-end-overlay"
        >
          <div class="game-end-content">
            <h2>{{ gameWon ? '🎉 胜利！' : '💥 游戏结束！' }}</h2>
            <p class="end-info">
              用时：{{ timer }} 秒
            </p>
            <UButton
              :label="'再来一局'"
              variant="solid"
              color="neutral"
              size="lg"
              @click="init"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.minesweeper-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #2c3e50;
  font-family: 'Source Sans 3', 'Noto Sans SC', sans-serif;
  user-select: none;
  color: #ecf0f1;
}

.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 20px;
}

.game-title {
  font-size: 36px;
  font-weight: 700;
  color: #ecf0f1;
  margin: 0 0 16px;
  letter-spacing: 2px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 370px;
  max-width: calc(100vw - 48px);
  margin-bottom: 16px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(10, 35px);
  gap: 2px;
  padding: 6px;
  background: #34495e;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cell {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  background: #95a5a6;
  color: #2c3e50;
  border-radius: 2px;
  transition: background-color 0.15s ease;
}

.cell:hover {
  background: #7f8c8d;
}

.cell.revealed {
  background: #bdc3c7;
  cursor: default;
}

.cell.mine {
  background: #e74c3c;
  color: #ecf0f1;
  font-size: 18px;
}

.cell.flagged {
  background: #3498db;
  color: #ecf0f1;
  font-size: 16px;
}

/* Number colors */
.cell.number-1 { color: #2980b9; }
.cell.number-2 { color: #27ae60; }
.cell.number-3 { color: #e74c3c; }
.cell.number-4 { color: #8e44ad; }
.cell.number-5 { color: #f1c40f; }
.cell.number-6 { color: #16a085; }
.cell.number-7 { color: #2c3e50; }
.cell.number-8 { color: #7f8c8d; }

.restart-btn {
  margin-top: 16px;
}

/* Game End Overlay */
.game-end-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(44, 62, 80, 0.85);
  border-radius: 8px;
  z-index: 10;
}

.game-end-content {
  text-align: center;
  color: #ecf0f1;
}

.game-end-content h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
}

.end-info {
  font-size: 18px;
  margin: 0 0 20px;
  opacity: 0.8;
}

/* Overlay transition */
.overlay-enter-active {
  animation: fade-in 0.3s ease;
}
.overlay-leave-active {
  animation: fade-in 0.2s ease reverse;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 420px) {
  .grid {
    grid-template-columns: repeat(10, 28px);
  }

  .cell {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .status-bar {
    width: 310px;
  }
}
</style>
