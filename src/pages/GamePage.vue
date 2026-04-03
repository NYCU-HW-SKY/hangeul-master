<template>
  <div class="game-page">
    <!-- Category Selection View -->
    <div v-if="showCategoryGrid" class="category-view">
      <!-- Header -->
      <header class="category-view-header">
        <button
          class="back-button"
          @click="handleBack"
          aria-label="返回首頁"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>返回</span>
        </button>
        <h1 class="view-title">記憶遊戲</h1>
        <div class="header-spacer"></div>
      </header>

      <!-- Category Grid -->
      <GameCategoryGridComponent
        :categories="categoryListForGame"
        :selected-level="selectedLevel"
        @select-category="handleCategorySelectFromGrid"
        @select-level="handleLevelChange"
      />
    </div>

    <!-- Game View -->
    <div v-else class="game-view">
      <!-- Top Navigation -->
      <header class="game-header">
        <button 
          class="back-button" 
          @click="handleBackToGrid"
          aria-label="返回分類選擇"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div class="game-info">
          <div class="info-ornament">⟨ 挑戰中 ⟩</div>
          <h1 class="game-title-text">{{ currentCategoryName }}</h1>
        </div>
        
        <div class="header-spacer"></div>
      </header>

    <!-- Game Content -->
    <main class="game-content">
      <div class="game-area">
        <MemoryGameComponent
          v-if="gameCards.length > 0"
          :key="gameInstanceKey"
          :cards="gameCards"
          :grid-size="gridSize"
          @game-complete="handleGameComplete"
          @move-made="handleMoveMade"
          @matched-pairs-update="handleMatchedPairsUpdate"
        />
        
        <div v-else class="no-cards-message">
          <p>目前分類沒有足夠的卡片來開始遊戲</p>
          <p class="hint">請選擇其他分類或添加更多單字卡</p>
        </div>
      </div>

      <!-- Side Stats Panel -->
      <aside class="stats-panel">
        <div class="panel-ornament">戰況</div>
        
        <div class="stat-card-large">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <div class="stat-label">移動次數</div>
          <div class="stat-value-large">{{ moves }}</div>
        </div>

        <div class="stat-card-large">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="stat-label">配對成功</div>
          <div class="stat-value-large">{{ matchedPairsCount }} / {{ gameCards.length }}</div>
        </div>

        <div class="stat-card-large">
          <div class="stat-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-label">遊戲時間</div>
          <div class="stat-value-large">{{ formattedTime }}</div>
        </div>

        <ButtonComponent
          variant="outline"
          size="large"
          @click="handleRestart"
          class="restart-button-side"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          重新開始
        </ButtonComponent>
      </aside>
    </main>
    </div>

    <!-- Game Completion Dialog -->
    <Transition name="dialog">
      <div v-if="showCompletionDialog" class="dialog-overlay" @click="handleCloseDialog">
        <div class="dialog-content" @click.stop>
          <!-- Celebration Animation -->
          <div class="celebration-animation" aria-hidden="true">
            <div class="trophy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
            <div class="victory-text">VICTORY</div>
          </div>

          <!-- Stats -->
          <h2 class="dialog-title">任務完成</h2>
          <div class="game-stats">
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <span class="stat-value">{{ completionStats.moves }}</span>
              <span class="stat-label">移動次數</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span class="stat-value">{{ formatDuration(completionStats.duration) }}</span>
              <span class="stat-label">遊戲時間</span>
            </div>
            <div class="stat-card">
              <div class="stat-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span class="stat-value">{{ completionStats.pairs }}</span>
              <span class="stat-label">配對成功</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="dialog-actions">
            <ButtonComponent
              variant="primary"
              size="large"
              @click="handlePlayAgain"
            >
              再玩一次
            </ButtonComponent>
            <ButtonComponent
              variant="outline"
              size="large"
              @click="handleBackToHome"
            >
              返回首頁
            </ButtonComponent>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabularyStore } from '../stores/vocabulary';
import { useAchievementStore } from '../stores/achievement';
import MemoryGameComponent from '../components/game/MemoryGameComponent.vue';
import GameCategoryGridComponent from '../components/game/GameCategoryGridComponent.vue';
import ButtonComponent from '../components/common/ButtonComponent.vue';
import { storageService, STORAGE_KEYS } from '../services/StorageService';
import type { GameHistory } from '../types/game';

const router = useRouter();
const vocabularyStore = useVocabularyStore();
const achievementStore = useAchievementStore();

// Game state
const moves = ref(0);
const matchedPairsCount = ref(0);
const showCompletionDialog = ref(false);
const showCategoryGrid = ref(true);
const gameStartTime = ref<Date | null>(null);
const gameInstanceKey = ref(0);
const elapsedTime = ref(0);
let timerInterval: number | null = null;
const completionStats = ref({
  moves: 0,
  duration: 0,
  pairs: 0,
});
const selectedLevel = ref<'easy' | 'normal' | 'hard'>('normal');
const levelOptions = [
  { value: 'easy' as const, label: '簡單 (4組)' },
  { value: 'normal' as const, label: '一般 (6組)' },
  { value: 'hard' as const, label: '困難 (8組)' },
];
const PAIRS_PER_LEVEL: Record<'easy' | 'normal' | 'hard', number> = {
  easy: 4,
  normal: 6,
  hard: 8,
};

// Get cards from vocabulary store
const gameCards = computed(() => {
  const cards = vocabularyStore.currentCategoryCards;
  const pairCount = PAIRS_PER_LEVEL[selectedLevel.value];
  return cards.slice(0, pairCount).map(card => ({
    id: card.id,
    korean: card.korean,
    chinese: card.chinese,
  }));
});

const categoryListForGame = computed(() => {
  return vocabularyStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    cardCount: vocabularyStore.flashcards.filter((card) => card.category === cat.id).length,
  }));
});

const currentCategoryName = computed(() => {
  const category = vocabularyStore.categories.find(
    cat => cat.id === vocabularyStore.currentCategory
  );
  return category?.name || '所有分類';
});

const gridSize = computed(() => {
  const cardCount = gameCards.value.length;
  if (cardCount <= 4) return 'small';
  if (cardCount <= 6) return 'medium';
  return 'large';
});

const formattedTime = computed(() => {
  const mins = Math.floor(elapsedTime.value / 60);
  const secs = elapsedTime.value % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

// Timer functions
const startTimer = () => {
  stopTimer();
  elapsedTime.value = 0;
  timerInterval = window.setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Initialize game
onMounted(() => {
  gameStartTime.value = new Date();
});

onUnmounted(() => {
  stopTimer();
});

// Event handlers
const handleMoveMade = (moveCount: number) => {
  moves.value = moveCount;
};

const handleMatchedPairsUpdate = (count: number) => {
  matchedPairsCount.value = count;
};

const handleBack = () => {
  router.push('/');
};

const handleBackToGrid = () => {
  stopTimer();
  showCategoryGrid.value = true;
};

const handleCategorySelectFromGrid = (categoryId: string) => {
  vocabularyStore.setCategory(categoryId);
  showCategoryGrid.value = false;
  handleRestart();
  startTimer();
};

const handleGameComplete = (finalMoves: number) => {
  stopTimer();
  const duration = elapsedTime.value;

  completionStats.value = {
    moves: finalMoves,
    duration,
    pairs: gameCards.value.length,
  };

  showCompletionDialog.value = true;
  saveGameHistory(finalMoves, duration);
};

const handleRestart = () => {
  moves.value = 0;
  matchedPairsCount.value = 0;
  gameStartTime.value = new Date();
  showCompletionDialog.value = false;
  gameInstanceKey.value += 1;
  startTimer();
};

const handlePlayAgain = () => {
  showCompletionDialog.value = false;
  handleRestart();
};

const handleLevelChange = (level: 'easy' | 'normal' | 'hard') => {
  if (selectedLevel.value === level) return;
  selectedLevel.value = level;
  if (!showCategoryGrid.value) {
    handleRestart();
  }
};

const handleCategoryChange = (categoryId: string) => {
  if (vocabularyStore.currentCategory === categoryId) return;
  vocabularyStore.setCategory(categoryId);
  handleRestart();
};

const handleBackToHome = () => {
  showCompletionDialog.value = false;
  router.push('/');
};

const handleCloseDialog = () => {
  showCompletionDialog.value = false;
};

// Save game history to localStorage
const saveGameHistory = (finalMoves: number, duration: number) => {
  try {
    const history: GameHistory[] = storageService.load<GameHistory[]>(STORAGE_KEYS.GAME_HISTORY) || [];
    
    const newRecord: GameHistory = {
      gameId: `game-${Date.now()}`,
      categoryId: vocabularyStore.currentCategory,
      moves: finalMoves,
      duration,
      completedAt: new Date(),
    };

    history.push(newRecord);
    
    // Keep only last 50 games
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    storageService.save(STORAGE_KEYS.GAME_HISTORY, history);
    
    // Check achievements after completing game
    achievementStore.checkAchievements({
      gamesCompleted: history.length,
    });
  } catch (error) {
    console.error('Failed to save game history:', error);
  }
};

// Format duration in MM:SS format
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

</script>

<style scoped>
/* --------------------------------------------------------
   Game Page Layout
   -------------------------------------------------------- */

.game-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* --------------------------------------------------------
   Category View
   -------------------------------------------------------- */

.category-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.category-view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-bottom: var(--rule-thin) solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.view-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.02em;
}

.header-spacer {
  width: 80px;
}

/* --------------------------------------------------------
   Game View
   -------------------------------------------------------- */

.game-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --------------------------------------------------------
   Game Header
   -------------------------------------------------------- */

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  background: linear-gradient(135deg, rgba(30, 35, 41, 0.98) 0%, rgba(26, 29, 35, 0.98) 100%);
  border-bottom: 2px solid var(--color-accent);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  box-shadow: var(--shadow-lg), 0 4px 20px rgba(193, 68, 14, 0.3);
}

.game-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.5;
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-primary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--duration-base) var(--ease-out);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  font-family: var(--font-display);
  box-shadow: var(--shadow-sm);
}

.back-button span {
  display: inline;
}

.back-button:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  transform: translateX(-2px);
  box-shadow: var(--shadow-md);
}

.back-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
}

.header-spacer {
  width: 80px;
}

.info-ornament {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-weight: var(--font-regular);
  letter-spacing: 0.3em;
  color: var(--color-accent);
  text-transform: uppercase;
}

.game-title-text {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.05em;
  text-align: center;
}

/* --------------------------------------------------------
   Game Content
   -------------------------------------------------------- */

.game-content {
  flex: 1;
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6);
  overflow: hidden;
}

.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

/* --------------------------------------------------------
   Side Stats Panel
   -------------------------------------------------------- */

.stats-panel {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: linear-gradient(135deg, rgba(30, 35, 41, 0.98) 0%, rgba(26, 29, 35, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(159, 197, 232, 0.15);
  overflow-y: auto;
  position: relative;
}

.stats-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.6;
}

.panel-ornament {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-bold);
  letter-spacing: 0.15em;
  color: var(--color-primary);
  text-align: center;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-divider);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  position: relative;
}

.panel-ornament::before,
.panel-ornament::after {
  content: '◈';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--text-sm);
  color: var(--color-primary);
  opacity: 0.4;
}

.panel-ornament::before {
  left: var(--space-4);
}

.panel-ornament::after {
  right: var(--space-4);
}

.stat-card-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: linear-gradient(135deg, rgba(159, 197, 232, 0.05) 0%, rgba(111, 168, 220, 0.03) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-base) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.stat-card-large::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.stat-card-large:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), 0 0 20px rgba(159, 197, 232, 0.2);
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(159, 197, 232, 0.08) 0%, rgba(111, 168, 220, 0.05) 100%);
}

.stat-card-large:hover::before {
  opacity: 1;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: rgba(159, 197, 232, 0.1);
  border-radius: var(--radius-full);
  padding: var(--space-3);
}

.stat-icon-wrapper svg {
  width: 100%;
  height: 100%;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  text-align: center;
  letter-spacing: 0.05em;
}

.stat-value-large {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
  text-align: center;
}

.restart-button-side {
  margin-top: auto;
  width: 100%;
}

.category-selector {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
  position: relative;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 100%;
}

.category-button {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  letter-spacing: 0.02em;
  position: relative;
  min-width: 100px;
}

.category-button:hover:not(.is-active) {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  transform: translateY(-2px);
}

.category-button.is-active {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: var(--color-text-inverse);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(111, 168, 220, 0.4);
  transform: translateY(-2px);
}

.category-button.is-active::before {
  content: '▸';
  position: absolute;
  left: var(--space-2);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
}

.level-selector {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
  position: relative;
}

/* 符文裝飾 */
.level-selector::before {
  content: '◈';
  position: absolute;
  left: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  font-size: var(--text-xs);
  opacity: 0.5;
}

.level-selector::after {
  content: '◈';
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  font-size: var(--text-xs);
  opacity: 0.5;
}

.level-button {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  font-family: var(--font-display);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  letter-spacing: 0.02em;
  position: relative;
  min-width: 120px;
}

.level-button:hover:not(.is-active) {
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  transform: translateY(-2px);
}

.level-button.is-active {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: var(--color-text-inverse);
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(111, 168, 220, 0.4);
  transform: translateY(-2px);
}

.level-button.is-active::before {
  content: '▸';
  position: absolute;
  left: var(--space-2);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
}

.no-cards-message {
  text-align: center;
  color: var(--color-text-secondary);
}

.no-cards-message p {
  margin: var(--space-2) 0;
}

.hint {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
}

/* --------------------------------------------------------
   Game Actions
   -------------------------------------------------------- */

.game-actions {
  display: flex;
  justify-content: center;
  padding: var(--space-6);
  background-color: transparent;
  border-top: var(--rule-thin) solid var(--color-border);
}

/* --------------------------------------------------------
   Completion Dialog
   -------------------------------------------------------- */

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(4px);
  padding: var(--space-4);
}

.dialog-content {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(30px);
  border: 2px solid var(--color-border);
  padding: var(--space-12) var(--space-10);
  max-width: 600px;
  width: 100%;
  box-shadow: var(--shadow-2xl), 0 0 60px rgba(0, 217, 255, 0.3);
  animation: dialogSlideUp 0.5s var(--ease-spring);
  overflow: hidden;
}

.dialog-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* --------------------------------------------------------
   Celebration Animation
   -------------------------------------------------------- */

.celebration-animation {
  position: relative;
  height: 160px;
  margin-bottom: var(--space-8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.trophy-icon {
  width: 80px;
  height: 80px;
  color: var(--color-primary);
  animation: trophyFloat 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.6));
}

.trophy-icon svg {
  width: 100%;
  height: 100%;
}

@keyframes trophyFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.victory-text {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  text-transform: uppercase;
  animation: victoryPulse 1.5s ease-in-out infinite;
}

@keyframes victoryPulse {
  0%, 100% {
    opacity: 0.8;
    text-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
  }
}

/* --------------------------------------------------------
   Dialog Content
   -------------------------------------------------------- */

.dialog-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin: 0 0 var(--space-10);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-6);
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
}

.stat-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.stat-icon-wrapper svg {
  width: 100%;
  height: 100%;
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.dialog-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* --------------------------------------------------------
   Vue Transitions
   -------------------------------------------------------- */

.dialog-enter-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.dialog-leave-active {
  transition: opacity var(--duration-base) var(--ease-in);
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .game-header {
    padding: var(--space-4) var(--space-4);
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .back-button {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }

  .back-button svg {
    width: 20px;
    height: 20px;
  }

  .game-info {
    order: 3;
    width: 100%;
    padding: var(--space-2) 0 0;
    border-top: 1px solid var(--color-divider);
  }

  .header-spacer {
    display: none;
  }

  .info-ornament {
    font-size: 0.625rem;
  }

  .game-title-text {
    font-size: var(--text-lg);
  }

  .game-content {
    flex-direction: column;
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .game-area {
    width: 100%;
  }

  .stats-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .panel-ornament {
    width: 100%;
    margin-bottom: 0;
  }

  .stat-card-large {
    flex: 1;
    min-width: calc(50% - var(--space-2));
    padding: var(--space-4);
  }

  .stat-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .stat-value-large {
    font-size: var(--text-2xl);
  }

  .restart-button-side {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .category-selector {
    width: 100%;
  }

  .category-button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.75rem;
    min-width: 80px;
  }

  .level-selector {
    width: 100%;
    justify-content: space-between;
  }

  .level-button {
    padding: var(--space-2) var(--space-3);
    font-size: 0.625rem;
  }

  .game-actions {
    padding: var(--space-4);
  }

  .dialog-content {
    padding: var(--space-8) var(--space-6);
    margin: var(--space-4);
  }

  .dialog-title {
    font-size: var(--text-2xl);
  }

  .game-stats {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    padding: var(--space-3);
  }

  .stat-icon {
    font-size: var(--text-2xl);
  }

  .stat-value {
    font-size: var(--text-xl);
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .celebration-animation {
    height: 100px;
  }

  .trophy-icon {
    font-size: 60px;
  }

  .dialog-actions {
    gap: var(--space-2);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .game-header {
    padding: var(--space-4) var(--space-6);
  }

  .game-content {
    padding: var(--space-6);
  }

  .game-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .dialog-content {
    max-width: 550px;
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .game-header {
    padding: var(--space-6) var(--space-8);
  }

  .back-button {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-lg);
  }

  .back-button svg {
    width: 24px;
    height: 24px;
  }

  .info-ornament {
    font-size: var(--text-sm);
  }

  .game-title-text {
    font-size: var(--text-2xl);
  }

  .header-spacer {
    width: 100px;
  }

  .game-content {
    padding: var(--space-8);
  }

  .game-actions {
    padding: var(--space-8);
  }

  .dialog-content {
    padding: var(--space-16) var(--space-10);
  }

  .game-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .stat-card {
    padding: var(--space-6);
  }

  .celebration-animation {
    height: 140px;
  }

  .trophy-icon {
    font-size: 90px;
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .dialog-content,
  .trophy-icon,
  .sparkle {
    animation: none;
  }

  .dialog-content {
    transform: none;
  }
}
</style>
