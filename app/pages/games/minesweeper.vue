<script setup lang="ts">
definePageMeta({ layout: 'game' })

useHead({ title: '扫雷' })

interface Cell {
  isMine: boolean
  revealed: boolean
  flagged: boolean
  neighborMines: number
}

const rows = ref(10)
const cols = ref(10)
const mineCount = ref(15)

const inputSize = ref(10)
const inputMines = ref(15)

const board = ref<Cell[][]>([])
const gameOver = ref(false)
const gameWon = ref(false)
const isFirstClick = ref(true)
const flags = ref(15)
const timer = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
let startTime = 0

const toast = useToast()

const maxMines = computed(() => inputSize.value * inputSize.value - 1)
const isValid = computed(() => {
  const s = inputSize.value
  const m = inputMines.value
  return s >= 5 && s <= 30 && m >= 1 && m < s * s
})

const cellSize = computed(() => {
  const s = cols.value
  if (s <= 12) return 35
  if (s <= 18) return 28
  if (s <= 24) return 24
  return 20
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, ${cellSize.value}px)`,
  '--cell-size': `${cellSize.value}px`,
  '--cell-font': cellSize.value <= 24 ? '12px' : cellSize.value <= 28 ? '13px' : '15px',
  '--mine-font': cellSize.value <= 24 ? '14px' : cellSize.value <= 28 ? '15px' : '18px',
  '--flag-font': cellSize.value <= 24 ? '13px' : cellSize.value <= 28 ? '14px' : '16px'
}))

const statusBarWidth = computed(() => {
  const total = cols.value * (cellSize.value + 2) + 12
  return `${total}px`
})

function createBoard(): Cell[][] {
  return Array.from({ length: rows.value }, () =>
    Array.from({ length: cols.value }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      neighborMines: 0
    }))
  )
}

function init() {
  rows.value = inputSize.value
  cols.value = inputSize.value
  mineCount.value = inputMines.value
  gameOver.value = false
  gameWon.value = false
  isFirstClick.value = true
  flags.value = mineCount.value
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
  const r = rows.value
  const c = cols.value
  const m = mineCount.value
  const safeZone = new Set<string>()
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = firstX + dx
      const ny = firstY + dy
      if (nx >= 0 && nx < r && ny >= 0 && ny < c) {
        safeZone.add(`${nx},${ny}`)
      }
    }
  }

  let minesPlaced = 0
  while (minesPlaced < m) {
    const x = Math.floor(Math.random() * r)
    const y = Math.floor(Math.random() * c)
    if (safeZone.has(`${x},${y}`)) continue
    if (!board.value[x][y].isMine) {
      board.value[x][y].isMine = true
      minesPlaced++
    }
  }

  for (let x = 0; x < r; x++) {
    for (let y = 0; y < c; y++) {
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
  const r = rows.value
  const c = cols.value
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = x + dx
      const ny = y + dy
      if (nx >= 0 && nx < r && ny >= 0 && ny < c) {
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
    const r = rows.value
    const c = cols.value
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && nx < r && ny >= 0 && ny < c) {
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
  for (let x = 0; x < rows.value; x++) {
    for (let y = 0; y < cols.value; y++) {
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

      <div class="settings-panel">
        <div class="settings-row">
          <div class="settings-field">
            <label class="settings-label">大小</label>
            <input
              v-model.number="inputSize"
              type="number"
              :min="5"
              :max="30"
              class="settings-input"
            >
          </div>
          <div class="settings-field">
            <label class="settings-label">雷数</label>
            <input
              v-model.number="inputMines"
              type="number"
              :min="1"
              :max="maxMines"
              class="settings-input"
            >
          </div>
        </div>
        <div
          v-if="!isValid"
          class="settings-error"
        >
          雷数必须小于格子总数，大小范围 5–30
        </div>
        <UButton
          label="开始游戏"
          variant="solid"
          color="neutral"
          size="md"
          :disabled="!isValid"
          class="settings-btn"
          @click="init"
        />
      </div>

      <div
        class="status-bar"
        :style="{ width: statusBarWidth }"
      >
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
        :style="gridStyle"
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

.settings-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.settings-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.settings-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.settings-label {
  font-size: 12px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-input {
  width: 64px;
  padding: 6px 8px;
  background: #34495e;
  border: 1px solid #4a6274;
  border-radius: 6px;
  color: #ecf0f1;
  font-size: 14px;
  text-align: center;
  outline: none;
  transition: border-color 0.2s ease;
}

.settings-input:focus {
  border-color: #3498db;
}

.settings-input::-webkit-inner-spin-button,
.settings-input::-webkit-outer-spin-button {
  opacity: 1;
}

.settings-error {
  font-size: 12px;
  color: #e74c3c;
  opacity: 0.9;
}

.settings-btn {
  margin-top: 4px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: calc(100vw - 48px);
  margin-bottom: 16px;
}

.grid {
  display: grid;
  gap: 2px;
  padding: 6px;
  background: #34495e;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.cell {
  width: var(--cell-size, 35px);
  height: var(--cell-size, 35px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: var(--cell-font, 15px);
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
  font-size: var(--mine-font, 18px);
}

.cell.flagged {
  background: #3498db;
  color: #ecf0f1;
  font-size: var(--flag-font, 16px);
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
  .cell {
    font-size: 12px;
  }

  .settings-row {
    gap: 8px;
  }

  .settings-input {
    width: 52px;
    padding: 4px 6px;
    font-size: 13px;
  }
}
</style>
