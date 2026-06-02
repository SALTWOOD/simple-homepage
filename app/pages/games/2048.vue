<script setup lang="ts">
definePageMeta({ layout: 'game', ssr: false })

useHead({ title: '2048' })

type Board = number[][]

const board = ref<Board>(Array.from({ length: 4 }, () => Array(4).fill(0)))
const score = ref(0)
const moveCount = ref(0)
const gameOver = ref(false)

const mergedCells = ref<Set<number>>(new Set())
const newTileIndex = ref<number | null>(null)

function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array(4).fill(0))
}

function cloneBoard(b: Board): Board {
  return b.map(row => [...row])
}

function addNewTile() {
  const emptyCells: { x: number, y: number }[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board.value[i][j] === 0) {
        emptyCells.push({ x: i, y: j })
      }
    }
  }
  if (emptyCells.length > 0) {
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    board.value[x][y] = Math.random() < 0.9 ? 2 : 4
    newTileIndex.value = x * 4 + y
  }
}

interface MoveResult {
  board: Board
  moved: boolean
  score: number
  animations: boolean[][]
}

function moveLeft(b: Board): MoveResult {
  const newBoard: Board = []
  let moved = false
  let scoreGained = 0
  const animations: boolean[][] = []

  for (let i = 0; i < 4; i++) {
    const row = b[i]
    const nonZero = row.filter(v => v !== 0)
    const merged: number[] = []
    const rowAnim: boolean[] = []
    let j = 0

    while (j < nonZero.length) {
      if (j + 1 < nonZero.length && nonZero[j] === nonZero[j + 1]) {
        if (!moved) moved = true
        merged.push(nonZero[j] * 2)
        scoreGained += nonZero[j] * 2
        rowAnim.push(true, false)
        j++
      }
      else {
        merged.push(nonZero[j])
        rowAnim.push(false)
      }
      j++
    }

    while (merged.length < 4) merged.push(0)
    while (rowAnim.length < 4) rowAnim.push(false)

    newBoard.push(merged)
    animations.push(rowAnim)

    if (b[i].join() !== merged.join()) moved = true
  }

  return { board: newBoard, moved, score: scoreGained, animations }
}

function moveRight(b: Board): MoveResult {
  const result = moveLeft(b.map(arr => [...arr].reverse()))
  result.board = result.board.map(arr => [...arr].reverse())
  result.animations = result.animations.map(arr => [...arr].reverse())
  return result
}

function moveUp(b: Board): MoveResult {
  const reversedBoard: Board = [0, 1, 2, 3].map(i => b.map(row => row[i]))
  const newBoard: Board = []
  let moved = false
  let scoreGained = 0
  const animations: boolean[][] = []

  for (let i = 0; i < 4; i++) {
    const col = reversedBoard[i]
    const nonZero = col.filter(v => v !== 0)
    const merged: number[] = []
    const colAnim: boolean[] = []
    let j = 0

    while (j < nonZero.length) {
      if (j + 1 < nonZero.length && nonZero[j] === nonZero[j + 1]) {
        if (!moved) moved = true
        merged.push(nonZero[j] * 2)
        scoreGained += nonZero[j] * 2
        colAnim.push(true, false)
        j++
      }
      else {
        merged.push(nonZero[j])
        colAnim.push(false)
      }
      j++
    }

    while (merged.length < 4) merged.push(0)
    while (colAnim.length < 4) colAnim.push(false)

    newBoard.push(merged)
    animations.push(colAnim)

    if (reversedBoard[i].join() !== merged.join()) moved = true
  }

  const resultBoard: Board = [0, 1, 2, 3].map(i => newBoard.map(row => row[i]))
  const resultAnimations = [0, 1, 2, 3].map(i => animations.map(row => row[i]))

  return { board: resultBoard, moved, score: scoreGained, animations: resultAnimations }
}

function moveDown(b: Board): MoveResult {
  const reversed = [...b].reverse()
  const result = moveUp(reversed)
  result.board = [...result.board].reverse()
  result.animations = [...result.animations].reverse()
  return result
}

function checkGameOver(): boolean {
  const b = board.value
  if (b.some(row => row.some(v => v >= 65536))) return true
  for (let i = 0; i < 4; i++) {
    if (b[i].includes(0)) return false
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if ((j < 3 && b[i][j] === b[i][j + 1]) || (i < 3 && b[i][j] === b[i + 1][j])) {
        return false
      }
    }
  }
  return true
}

function handleMove(key: string) {
  if (gameOver.value) return

  let result: MoveResult
  switch (key) {
    case 'ArrowUp': result = moveUp(board.value); break
    case 'ArrowDown': result = moveDown(board.value); break
    case 'ArrowLeft': result = moveLeft(board.value); break
    case 'ArrowRight': result = moveRight(board.value); break
    default: return
  }

  if (!result.moved) return

  board.value = result.board
  score.value += result.score
  moveCount.value++

  mergedCells.value = new Set()
  result.animations.flat().forEach((isMerged, index) => {
    if (isMerged) mergedCells.value.add(index)
  })

  addNewTile()

  if (checkGameOver()) {
    gameOver.value = true
  }
}

function restart() {
  board.value = createEmptyBoard()
  score.value = 0
  moveCount.value = 0
  gameOver.value = false
  mergedCells.value = new Set()
  newTileIndex.value = null
  addNewTile()
  addNewTile()
}

function cellValueClass(value: number): string {
  if (value === 0) return ''
  // Map actual values to CSS class names
  const known = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]
  return known.includes(value) ? `cell-${value}` : ''
}

useEventListener('keydown', (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    handleMove(e.key)
  }
})

// Touch support
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (Math.max(absDx, absDy) < 30) return

  if (absDx > absDy) {
    handleMove(dx > 0 ? 'ArrowRight' : 'ArrowLeft')
  }
  else {
    handleMove(dy > 0 ? 'ArrowDown' : 'ArrowUp')
  }
}

onMounted(() => {
  addNewTile()
  addNewTile()
})
</script>

<template>
  <div class="game-page">
    <div class="game-container">
      <div class="game-header">
        <h1 class="game-title">
          2048
        </h1>
        <UButton
          label="重新开始"
          variant="outline"
          color="neutral"
          size="sm"
          @click="restart"
        />
      </div>

      <div class="stats">
        <div class="stat-item">
          得分：{{ score }}
        </div>
        <div class="stat-item">
          移动次数：{{ moveCount }}
        </div>
      </div>

      <div
        class="board"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <div
          v-for="(cell, index) in board.flat()"
          :key="index"
          class="cell"
          :class="[
            cellValueClass(cell),
            { merged: mergedCells.has(index) },
            { 'new-tile': newTileIndex === index }
          ]"
          :data-value="cell || ''"
        >
          {{ cell || '' }}
        </div>
      </div>

      <!-- Game Over Overlay -->
      <Transition name="overlay">
        <div
          v-if="gameOver"
          class="game-over-overlay"
        >
          <div class="game-over-content">
            <h2>游戏结束！</h2>
            <p class="final-score">
              最终得分：{{ score }}
            </p>
            <UButton
              label="再玩一次"
              variant="solid"
              color="neutral"
              size="lg"
              @click="restart"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.game-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #faf8ef;
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  user-select: none;
}

.game-container {
  width: 400px;
  max-width: calc(100vw - 32px);
  padding: 20px;
  position: relative;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.game-title {
  font-size: 48px;
  font-weight: 800;
  color: #776e65;
  margin: 0;
  letter-spacing: -2px;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 16px;
  color: #776e65;
  font-weight: 600;
}

.stat-item {
  background: #bbada0;
  padding: 6px 16px;
  border-radius: 4px;
  color: #eee4da;
}

.board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
  background-color: #bbada0;
  border-radius: 6px;
  position: relative;
}

.cell {
  aspect-ratio: 1;
  background-color: rgba(238, 228, 218, 0.35);
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  font-weight: 700;
  color: white;
  transition: background-color 0.15s ease;
}

.cell.merged {
  animation: pop 0.15s ease;
}

.cell.new-tile {
  animation: appear 0.15s ease;
}

@keyframes pop {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes appear {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Tile colors */
.cell.cell-1 { background-color: #cdc1b4; color: #776e65; }
.cell.cell-2 { background-color: #eee4da; color: #776e65; }
.cell.cell-4 { background-color: #ede0c8; color: #776e65; }
.cell.cell-8 { background-color: #f2b179; }
.cell.cell-16 { background-color: #f59563; }
.cell.cell-32 { background-color: #f67c5f; }
.cell.cell-64 { background-color: #f65e3b; }
.cell.cell-128 { background-color: #edcf72; font-size: 36px; }
.cell.cell-256 { background-color: #edcc61; font-size: 36px; }
.cell.cell-512 { background-color: #edc850; font-size: 36px; }
.cell.cell-1024 { background-color: #edc53f; font-size: 30px; }
.cell.cell-2048 { background-color: #edc22e; font-size: 30px; }
.cell.cell-4096 { background-color: #5e00aa; font-size: 30px; }
.cell.cell-8192 { background-color: #7d3cff; font-size: 30px; }
.cell.cell-16384 { background-color: #0066cc; font-size: 28px; }
.cell.cell-32768 { background-color: #003399; font-size: 28px; }
.cell.cell-65536 { background-color: #000066; font-size: 28px; }

/* Game Over Overlay */
.game-over-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(238, 228, 218, 0.73);
  border-radius: 6px;
  z-index: 10;
}

.game-over-content {
  text-align: center;
  color: #776e65;
}

.game-over-content h2 {
  font-size: 40px;
  font-weight: 800;
  margin: 0 0 12px;
}

.final-score {
  font-size: 18px;
  margin: 0 0 20px;
  font-weight: 600;
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
@media (max-width: 440px) {
  .game-container {
    width: 100%;
    padding: 12px;
  }

  .board {
    gap: 8px;
    padding: 8px;
  }

  .cell {
    font-size: 28px;
  }

  .cell.cell-128,
  .cell.cell-256,
  .cell.cell-512 {
    font-size: 26px;
  }

  .cell.cell-1024,
  .cell.cell-2048,
  .cell.cell-4096,
  .cell.cell-8192 {
    font-size: 22px;
  }

  .cell.cell-16384,
  .cell.cell-32768,
  .cell.cell-65536 {
    font-size: 18px;
  }

  .game-title {
    font-size: 36px;
  }
}
</style>
