<template>
  <div class="study-page">
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
          <svg
            class="back-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>
        <h1 class="view-title">單字卡學習</h1>
        <div class="header-spacer"></div>
      </header>

      <!-- Category Grid -->
      <CategoryGridComponent
        :categories="categoryListWithProgress"
        @select="handleCategorySelectFromGrid"
      />
    </div>

    <!-- Study View -->
    <div v-else class="study-view">
      <!-- Top Navigation -->
      <header class="study-header">
        <button
          class="back-button"
          @click="handleBackToGrid"
          aria-label="返回分類選擇"
          type="button"
        >
          <svg
            class="back-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>分類</span>
        </button>

        <!-- Progress Display -->
        <div class="progress-display">
          <span class="progress-text">
            {{ currentCardIndex + 1 }} / {{ totalCards }}
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>

        <!-- Category Actions -->
        <button
          class="category-action-button"
          @click="handleToggleCategoryStudied"
          :aria-label="isCurrentCategoryFullyStudied ? '取消分類所有學習標記' : '標記分類全部已學習'"
          type="button"
          :title="isCurrentCategoryFullyStudied ? '取消全部' : '全部標記'"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </button>
      </header>

      <!-- Main Content Area -->
      <main class="study-content">
      <div v-if="currentCard" class="card-container">
        <!-- Flashcard Component -->
        <FlashcardComponent
          :korean="currentCard.korean"
          :chinese="currentCard.chinese"
          :category="currentCard.category"
          :is-flipped="isFlipped"
          :show-audio-button="false"
          :is-studied="isCurrentCardStudied"
          @flip="handleFlip"
        />

        <!-- Audio Player -->
        <div class="audio-section">
          <AudioPlayerComponent
            v-if="currentCard.korean"
            :text="currentCard.korean"
            :auto-play="false"
            :show-controls="true"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <p>此分類沒有單字卡</p>
      </div>
      </main>

      <!-- Bottom Control Bar -->
      <footer class="control-bar">
        <button
          class="control-button nav-button"
          :disabled="currentCardIndex === 0"
          @click="handlePrevious"
          aria-label="上一張"
          type="button"
        >
          <svg
            class="control-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button
          class="control-button primary-button"
          :class="{ 'is-studied': isCurrentCardStudied }"
          @click="handleToggleStudied"
          :aria-label="isCurrentCardStudied ? '取消學習標記' : '標記已學習'"
          type="button"
        >
          <svg
            class="control-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{{ isCurrentCardStudied ? '已學習' : '標記學習' }}</span>
        </button>

        <button
          class="control-button nav-button"
          :disabled="currentCardIndex >= totalCards - 1"
          @click="handleNext"
          aria-label="下一張"
          type="button"
        >
          <svg
            class="control-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabularyStore } from '../stores/vocabulary';
import { useProgressStore } from '../stores/progress';
import { useToast } from '../composables/useToast';
import FlashcardComponent from '../components/flashcard/FlashcardComponent.vue';
import AudioPlayerComponent from '../components/audio/AudioPlayerComponent.vue';
import CategoryGridComponent from '../components/common/CategoryGridComponent.vue';

const router = useRouter();
const vocabularyStore = useVocabularyStore();
const progressStore = useProgressStore();
const { success } = useToast();

// State
const isFlipped = ref(false);
const showCategoryGrid = ref(true);
let touchStartX = 0;
let touchEndX = 0;

// Computed
const currentCard = computed(() => vocabularyStore.currentCard);
const currentCardIndex = computed(() => vocabularyStore.currentCardIndex);
const totalCards = computed(() => vocabularyStore.totalCards);
const currentCategory = computed(() => vocabularyStore.currentCategory);
const isCurrentCardStudied = computed(() => {
  return currentCard.value ? progressStore.isCardStudied(currentCard.value.id) : false;
});

const progressPercentage = computed(() => {
  if (totalCards.value === 0) return 0;
  return Math.round(((currentCardIndex.value + 1) / totalCards.value) * 100);
});

const categoryListWithProgress = computed(() => {
  return vocabularyStore.categories.map((cat) => {
    const categoryCards = vocabularyStore.flashcards.filter((card) => card.category === cat.id);
    const cardCount = categoryCards.length;
    const studiedCount = categoryCards.filter(card => progressStore.isCardStudied(card.id)).length;
    const progress = cardCount > 0 ? Math.round((studiedCount / cardCount) * 100) : 0;
    
    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      cardCount,
      progress,
    };
  });
});

const currentCategoryCardIds = computed(() => {
  return vocabularyStore.currentCategoryCards.map(card => card.id);
});

const isCurrentCategoryFullyStudied = computed(() => {
  return progressStore.isCategoryFullyStudied(currentCategory.value, currentCategoryCardIds.value);
});

// Methods
const handleBack = () => {
  router.push('/');
};

const handleBackToGrid = () => {
  showCategoryGrid.value = true;
};

const handleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const handleCategorySelectFromGrid = (categoryId: string) => {
  vocabularyStore.setCategory(categoryId);
  showCategoryGrid.value = false;
  isFlipped.value = false;
};

const handleNext = () => {
  if (currentCardIndex.value < totalCards.value - 1) {
    vocabularyStore.nextCard();
    isFlipped.value = false;
    saveProgress();
  }
};

const handlePrevious = () => {
  if (currentCardIndex.value > 0) {
    vocabularyStore.previousCard();
    isFlipped.value = false;
    saveProgress();
  }
};

const handleToggleStudied = () => {
  if (currentCard.value) {
    const wasStudied = isCurrentCardStudied.value;
    progressStore.toggleCardStudied(currentCard.value.id, currentCard.value.category);
    
    if (wasStudied) {
      success('已取消學習標記');
    } else {
      success('已標記為已學習！');
      
      // Auto advance to next card only when marking as studied
      if (currentCardIndex.value < totalCards.value - 1) {
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    }
  }
};

const handleToggleCategoryStudied = () => {
  if (currentCategoryCardIds.value.length === 0) return;
  
  const isFullyStudied = isCurrentCategoryFullyStudied.value;
  
  if (isFullyStudied) {
    progressStore.unmarkCategoryStudied(currentCategory.value, currentCategoryCardIds.value);
    success(`已取消「${vocabularyStore.categories.find(c => c.id === currentCategory.value)?.name}」分類的所有學習標記`);
  } else {
    progressStore.markCategoryStudied(currentCategory.value, currentCategoryCardIds.value);
    success(`已標記「${vocabularyStore.categories.find(c => c.id === currentCategory.value)?.name}」分類的所有單字為已學習！`);
  }
};

const saveProgress = () => {
  progressStore.debouncedSaveProgress();
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // Space key - flip card
  if (event.code === 'Space') {
    event.preventDefault();
    handleFlip();
  }
  // Left arrow - previous card
  else if (event.code === 'ArrowLeft') {
    event.preventDefault();
    handlePrevious();
  }
  // Right arrow - next card
  else if (event.code === 'ArrowRight') {
    event.preventDefault();
    handleNext();
  }
  // Enter key - toggle studied
  else if (event.code === 'Enter') {
    event.preventDefault();
    handleToggleStudied();
  }
};

// Touch gestures for mobile
const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.changedTouches[0].screenX;
};

const handleTouchEnd = (event: TouchEvent) => {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  // Swipe left - next card
  if (diff > swipeThreshold) {
    handleNext();
  }
  // Swipe right - previous card
  else if (diff < -swipeThreshold) {
    handlePrevious();
  }
};

// Lifecycle
onMounted(() => {
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeydown);
  
  // Add touch event listeners
  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchend', handleTouchEnd);
  
  // Load progress and initialize with vocabulary data
  progressStore.loadProgress();
  progressStore.initializeCategoryProgress(
    vocabularyStore.categories,
    vocabularyStore.flashcards
  );
});

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
  
  // Flush any pending saves immediately on unmount
  progressStore.flushSave();
});

// Watch for card changes and auto-save
watch(currentCardIndex, () => {
  saveProgress();
});
</script>

<style scoped>
/* --------------------------------------------------------
   Study Page Layout
   -------------------------------------------------------- */

.study-page {
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
   Study View
   -------------------------------------------------------- */

.study-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --------------------------------------------------------
   Header - Top Navigation
   -------------------------------------------------------- */

.study-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-bottom: var(--rule-thin) solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: transparent;
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-colors);
  flex-shrink: 0;
}

.back-button:hover {
  background-color: var(--color-divider);
}

.back-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.category-action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: var(--space-2);
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-colors);
  flex-shrink: 0;
}

.category-action-button:hover {
  background-color: var(--color-divider);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.category-action-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.category-action-button svg {
  width: 20px;
  height: 20px;
}

/* --------------------------------------------------------
   Progress Display
   -------------------------------------------------------- */

.progress-display {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.progress-text {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--color-divider);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-base) var(--ease-out);
}

/* --------------------------------------------------------
   Main Content Area
   -------------------------------------------------------- */

.study-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  width: 100%;
  max-width: 600px;
}

.audio-section {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Empty State */
.empty-state {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-lg);
}

/* --------------------------------------------------------
   Bottom Control Bar
   -------------------------------------------------------- */

.control-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-top: var(--rule-thin) solid var(--color-border);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-colors);
  min-height: 48px;
}

.control-button:hover:not(:disabled) {
  background-color: var(--color-surface-elevated);
  border-color: var(--color-primary);
}

.control-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Navigation Buttons */
.nav-button {
  width: 56px;
  padding: var(--space-3);
}

/* Primary Button (Mark as Studied) */
.primary-button {
  background: var(--gradient-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
  flex: 1;
  max-width: 300px;
}

.primary-button:hover:not(:disabled) {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

.primary-button.is-studied {
  background: var(--color-success);
  border-color: var(--color-success);
}

.primary-button.is-studied:hover:not(:disabled) {
  opacity: 0.9;
}

.control-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .category-view-header {
    padding: var(--space-3) var(--space-4);
  }

  .view-title {
    font-size: var(--text-lg);
  }

  .header-spacer {
    width: 60px;
  }

  .study-header {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-3);
  }

  .back-button span {
    display: none;
  }

  .back-icon {
    width: 24px;
    height: 24px;
  }

  .category-action-button {
    width: 36px;
    height: 36px;
  }

  .category-action-button svg {
    width: 18px;
    height: 18px;
  }

  .progress-text {
    font-size: 0.75rem;
  }

  .progress-bar {
    height: 4px;
  }

  .study-content {
    padding: var(--space-4);
  }

  .card-container {
    gap: var(--space-4);
  }

  .control-bar {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-3);
  }

  .control-button {
    font-size: var(--text-sm);
    min-height: 44px;
  }

  .nav-button {
    width: 48px;
  }

  .primary-button span {
    font-size: 0.875rem;
  }

  .control-icon {
    width: 20px;
    height: 20px;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .category-view-header {
    padding: var(--space-4) var(--space-6);
  }

  .view-title {
    font-size: var(--text-xl);
  }

  .study-header {
    padding: var(--space-4) var(--space-6);
  }

  .study-content {
    padding: var(--space-8) var(--space-6);
  }

  .card-container {
    max-width: 700px;
  }

  .control-bar {
    padding: var(--space-5);
    gap: var(--space-4);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .category-view-header {
    padding: var(--space-5) var(--space-8);
  }

  .view-title {
    font-size: var(--text-2xl);
  }

  .header-spacer {
    width: 100px;
  }

  .study-header {
    padding: var(--space-5) var(--space-8);
  }

  .back-button {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-lg);
  }

  .progress-display {
    min-width: 140px;
  }

  .progress-text {
    font-size: var(--text-base);
  }

  .study-content {
    padding: var(--space-12) var(--space-8);
  }

  .card-container {
    max-width: 800px;
    gap: var(--space-10);
  }

  .control-bar {
    padding: var(--space-8);
    gap: var(--space-6);
  }

  .control-button {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-lg);
    min-height: 52px;
  }

  .control-icon {
    width: 22px;
    height: 22px;
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .control-button,
  .progress-fill {
    transition-duration: 0.01ms;
  }

  .control-button:hover:not(:disabled) {
    transform: none;
  }
}
</style>
