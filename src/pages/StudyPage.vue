<template>
  <div class="study-page">
    <!-- Top Navigation -->
    <header class="study-header">
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
    </header>

    <!-- Category Selector -->
    <div class="category-section">
      <CategorySelectorComponent
        :categories="categoryList"
        :current-category="currentCategory"
        @select="handleCategorySelect"
      />
    </div>

    <!-- Main Content Area -->
    <main class="study-content">
      <div v-if="currentCard" class="card-container">
        <!-- Flashcard Component -->
        <FlashcardComponent
          :korean="currentCard.korean"
          :chinese="currentCard.chinese"
          :audio-url="currentCard.audioUrl"
          :category="currentCard.category"
          :is-flipped="isFlipped"
          :show-audio-button="false"
          :is-studied="isCurrentCardStudied"
          @flip="handleFlip"
          @studied="handleMarkStudied"
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
        class="control-button"
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
        <span>上一張</span>
      </button>

      <button
        class="control-button primary"
        :class="{ 'is-studied': isCurrentCardStudied }"
        @click="handleMarkStudied"
        :aria-label="isCurrentCardStudied ? '已標記為已學習' : '標記已學習'"
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
        <span>{{ isCurrentCardStudied ? '✓ 已學習' : '已學習' }}</span>
      </button>

      <button
        class="control-button"
        :disabled="currentCardIndex >= totalCards - 1"
        @click="handleNext"
        aria-label="下一張"
        type="button"
      >
        <span>下一張</span>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabularyStore } from '../stores/vocabulary';
import { useProgressStore } from '../stores/progress';
import { useToast } from '../composables/useToast';
import FlashcardComponent from '../components/flashcard/FlashcardComponent.vue';
import AudioPlayerComponent from '../components/audio/AudioPlayerComponent.vue';
import CategorySelectorComponent from '../components/common/CategorySelectorComponent.vue';

const router = useRouter();
const vocabularyStore = useVocabularyStore();
const progressStore = useProgressStore();
const { success } = useToast();

// State
const isFlipped = ref(false);
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

const categoryList = computed(() => {
  return vocabularyStore.categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    cardCount: vocabularyStore.flashcards.filter((card) => card.category === cat.id).length,
  }));
});

// Methods
const handleBack = () => {
  router.push('/');
};

const handleFlip = () => {
  isFlipped.value = !isFlipped.value;
};

const handleCategorySelect = (categoryId: string) => {
  vocabularyStore.setCategory(categoryId);
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

const handleMarkStudied = () => {
  if (currentCard.value) {
    progressStore.markCardStudied(currentCard.value.id, currentCard.value.category);
    success('已標記為已學習！');
    
    // Auto advance to next card
    if (currentCardIndex.value < totalCards.value - 1) {
      setTimeout(() => {
        handleNext();
      }, 500);
    }
  }
};

const saveProgress = () => {
  progressStore.saveProgress();
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
  // Enter key - mark as studied
  else if (event.code === 'Enter') {
    event.preventDefault();
    handleMarkStudied();
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
  
  // Save progress on unmount
  saveProgress();
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
   Header - Top Navigation
   -------------------------------------------------------- */

.study-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-6);
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
  padding: var(--space-2) var(--space-4);
  background-color: transparent;
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-colors);
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

/* --------------------------------------------------------
   Progress Display
   -------------------------------------------------------- */

.progress-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
  min-width: 120px;
}

.progress-text {
  font-size: 0.75rem;
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--color-divider);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width var(--duration-base) var(--ease-out);
}

/* --------------------------------------------------------
   Category Section
   -------------------------------------------------------- */

.category-section {
  padding: var(--space-4) 0;
  background-color: transparent;
  border-bottom: 1px solid var(--color-divider);
}

/* --------------------------------------------------------
   Main Content Area
   -------------------------------------------------------- */

.study-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-6);
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  width: 100%;
  max-width: 500px;
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
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6);
  background-color: color-mix(in srgb, var(--color-surface) 95%, transparent);
  border-top: var(--rule-thin) solid var(--color-border);
  position: sticky;
  bottom: 0;
  z-index: var(--z-sticky);
}

.control-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-divider);
  color: var(--color-text-primary);
  border: none;
  border-radius: 0;
  border: var(--rule-thin) solid var(--color-border);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-colors), transform var(--duration-base) var(--ease-out);
  flex: 1;
  justify-content: center;
  min-height: 48px;
}

.control-button:hover:not(:disabled) {
  background-color: var(--color-background-alt);
}

.control-button:active:not(:disabled) {
  transform: translateY(0);
}

.control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.control-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Primary Button (Mark as Studied) */
.control-button.primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.control-button.primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.control-button.primary.is-studied {
  background: var(--color-success);
  border-color: var(--color-success);
  opacity: 0.8;
}

.control-button.primary.is-studied:hover:not(:disabled) {
  background: var(--color-success);
  opacity: 1;
}

.control-icon {
  width: 20px;
  height: 20px;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .study-header {
    padding: var(--space-3) var(--space-4);
  }

  .back-button span {
    display: none;
  }

  .back-icon {
    width: 24px;
    height: 24px;
  }

  .progress-display {
    min-width: 90px;
  }

  .progress-text {
    font-size: 0.625rem;
  }

  .progress-bar {
    height: 3px;
  }

  .category-section {
    padding: var(--space-3) 0;
  }

  .study-content {
    padding: var(--space-6) var(--space-4);
  }

  .card-container {
    gap: var(--space-6);
  }

  .control-bar {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .control-button {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-sm);
    min-height: 44px;
  }

  .control-button span {
    display: none;
  }

  .control-icon {
    width: 24px;
    height: 24px;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .study-header {
    padding: var(--space-4) var(--space-6);
  }

  .study-content {
    padding: var(--space-8) var(--space-6);
  }

  .card-container {
    max-width: 600px;
  }

  .control-bar {
    padding: var(--space-5);
    gap: var(--space-4);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
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
    max-width: 700px;
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
