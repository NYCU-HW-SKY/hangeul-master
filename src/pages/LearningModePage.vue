<template>
  <div class="learning-mode-page">
    <!-- Mode Selection View -->
    <div v-if="currentView === 'selection'" class="mode-selection">
      <div class="page-header">
        <h1 class="page-title">互動式學習模式</h1>
        <p class="page-subtitle">選擇一種學習模式開始練習</p>
      </div>

      <div class="mode-cards" role="group" aria-label="學習模式選擇">
        <!-- Mode 1: 聽韓文選中文 -->
        <button
          class="mode-card"
          @click="selectMode('korean-to-chinese')"
          @keydown.enter="selectMode('korean-to-chinese')"
          @keydown.space.prevent="selectMode('korean-to-chinese')"
          aria-label="選擇聽韓文選中文模式，聽韓文音訊選擇對應的中文翻譯"
          tabindex="0"
        >
          <div class="mode-icon" aria-hidden="true">🎧</div>
          <h2 class="mode-title">聽韓文選中文</h2>
          <p class="mode-description">
            聽韓文音訊，選擇對應的中文翻譯
          </p>
          <div class="mode-badge" aria-hidden="true">聽力測驗</div>
        </button>

        <!-- Mode 2: 聽中文選韓文 -->
        <button
          class="mode-card"
          @click="selectMode('chinese-to-korean')"
          @keydown.enter="selectMode('chinese-to-korean')"
          @keydown.space.prevent="selectMode('chinese-to-korean')"
          aria-label="選擇聽中文選韓文模式，聽中文音訊選擇對應的韓文"
          tabindex="0"
        >
          <div class="mode-icon" aria-hidden="true">🎯</div>
          <h2 class="mode-title">聽中文選韓文</h2>
          <p class="mode-description">
            聽中文音訊，選擇對應的韓文
          </p>
          <div class="mode-badge" aria-hidden="true">聽力測驗</div>
        </button>

        <!-- Mode 3: 聽韓文選韓文 -->
        <button
          class="mode-card"
          @click="selectMode('korean-to-korean')"
          @keydown.enter="selectMode('korean-to-korean')"
          @keydown.space.prevent="selectMode('korean-to-korean')"
          aria-label="選擇聽韓文選韓文模式，聽韓文音訊選擇對應的韓文文字"
          tabindex="0"
        >
          <div class="mode-icon" aria-hidden="true">📝</div>
          <h2 class="mode-title">聽韓文選韓文</h2>
          <p class="mode-description">
            聽韓文音訊，選擇對應的韓文文字
          </p>
          <div class="mode-badge" aria-hidden="true">聽力測驗</div>
        </button>

        <!-- Mode 4: 快速匹配 -->
        <button
          class="mode-card"
          @click="selectMode('matching')"
          @keydown.enter="selectMode('matching')"
          @keydown.space.prevent="selectMode('matching')"
          aria-label="選擇快速匹配模式，拖拉配對韓文和中文"
          tabindex="0"
        >
          <div class="mode-icon" aria-hidden="true">⚡</div>
          <h2 class="mode-title">快速匹配</h2>
          <p class="mode-description">
            拖拉配對韓文和中文
          </p>
          <div class="mode-badge" aria-hidden="true">配對遊戲</div>
        </button>
      </div>
    </div>

    <!-- Quiz View -->
    <div v-else-if="currentView === 'quiz'" class="quiz-view">
      <div class="quiz-header">
        <button
          class="back-button"
          @click="handleExit"
          @keydown.enter="handleExit"
          @keydown.space.prevent="handleExit"
          aria-label="返回模式選擇頁面"
          tabindex="0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h2 class="quiz-title">{{ currentModeTitle }}</h2>
      </div>

      <ListeningQuizComponent
        v-if="selectedMode && selectedMode !== 'matching'"
        :mode="selectedMode"
        :total-questions="10"
        @quiz-complete="handleQuizComplete"
        @quiz-exit="handleExit"
      />
    </div>

    <!-- Matching View -->
    <div v-else-if="currentView === 'matching'" class="matching-view">
      <div class="matching-header">
        <button
          class="back-button"
          @click="handleExit"
          @keydown.enter="handleExit"
          @keydown.space.prevent="handleExit"
          aria-label="返回模式選擇頁面"
          tabindex="0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          返回
        </button>
        <h2 class="matching-title">快速匹配</h2>
      </div>

      <MatchingModeComponent
        :pair-count="6"
        @matching-complete="handleMatchingComplete"
        @matching-exit="handleExit"
      />
    </div>

    <!-- Result View -->
    <div v-else-if="currentView === 'result'" class="result-view">
      <QuizResultComponent
        v-if="currentResult"
        :result="currentResult"
        :mode="selectedMode!"
        @retry="handleRetry"
        @exit="handleExitToSelection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LearningModeType, QuizResult, MatchingResult } from '@/types/learningMode';
import ListeningQuizComponent from '@/components/learning/ListeningQuizComponent.vue';
import MatchingModeComponent from '@/components/learning/MatchingModeComponent.vue';
import QuizResultComponent from '@/components/learning/QuizResultComponent.vue';
import { useLearningModeStore } from '@/stores/learningMode';

// Types
type ViewType = 'selection' | 'quiz' | 'matching' | 'result';

// State
const currentView = ref<ViewType>('selection');
const selectedMode = ref<LearningModeType | null>(null);
const currentResult = ref<QuizResult | MatchingResult | null>(null);

// Store
const learningModeStore = useLearningModeStore();

// Computed
const currentModeTitle = computed(() => {
  if (!selectedMode.value) return '';
  
  const titles: Record<LearningModeType, string> = {
    'korean-to-chinese': '聽韓文選中文',
    'chinese-to-korean': '聽中文選韓文',
    'korean-to-korean': '聽韓文選韓文',
    'matching': '快速匹配',
  };
  
  return titles[selectedMode.value];
});

// Methods
function selectMode(mode: LearningModeType) {
  selectedMode.value = mode;
  
  if (mode === 'matching') {
    currentView.value = 'matching';
  } else {
    currentView.value = 'quiz';
  }
}

function handleQuizComplete(_result: { score: number; accuracy: number }) {
  // End the quiz session in the store to get the full result
  const fullResult = learningModeStore.endQuizSession();
  currentResult.value = fullResult;
  currentView.value = 'result';
}

function handleMatchingComplete(result: MatchingResult) {
  currentResult.value = result;
  currentView.value = 'result';
}

function handleRetry() {
  currentResult.value = null;
  
  if (selectedMode.value === 'matching') {
    currentView.value = 'matching';
  } else {
    currentView.value = 'quiz';
  }
}

function handleExit() {
  // Clear session when exiting
  learningModeStore.clearSession();
  handleExitToSelection();
}

function handleExitToSelection() {
  currentView.value = 'selection';
  selectedMode.value = null;
  currentResult.value = null;
}
</script>

<style scoped>
/* --------------------------------------------------------
   Learning Mode Page Container - 戰神風格
   -------------------------------------------------------- */

.learning-mode-page {
  min-height: 100vh;
  padding: var(--space-8) var(--space-6);
  background: var(--color-background);
  position: relative;
}

.learning-mode-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(212, 175, 55, 0.03) 2px,
      rgba(212, 175, 55, 0.03) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(212, 175, 55, 0.03) 2px,
      rgba(212, 175, 55, 0.03) 4px
    );
  background-size: 100px 100px;
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}

/* --------------------------------------------------------
   Mode Selection View
   -------------------------------------------------------- */

.mode-selection {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

.page-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.page-title {
  font-size: var(--text-5xl);
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: 0.1em;
  margin-bottom: var(--space-4);
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  position: relative;
  display: inline-block;
}

.page-title::before,
.page-title::after {
  content: '◈';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-secondary);
  font-size: 0.4em;
  opacity: 0.6;
}

.page-title::before {
  left: -1.5em;
}

.page-title::after {
  right: -1.5em;
}

.page-subtitle {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  letter-spacing: 0.05em;
  position: relative;
  padding-top: var(--space-4);
}

.page-subtitle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-secondary), transparent);
}

/* --------------------------------------------------------
   Mode Cards Grid
   -------------------------------------------------------- */

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.mode-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background: linear-gradient(135deg, rgba(30, 35, 41, 0.95) 0%, rgba(26, 29, 35, 0.95) 100%);
  border-radius: 0;
  border: 3px solid var(--color-border);
  border-left: 4px solid var(--color-secondary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(212, 175, 55, 0.1);
  transition: all 500ms var(--ease-out);
  cursor: pointer;
  text-align: center;
  will-change: transform;
  overflow: visible;
}

.mode-card::before,
.mode-card::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-secondary);
  opacity: 0.4;
  transition: all 500ms var(--ease-out);
}

.mode-card::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.mode-card::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.mode-card:hover {
  transform: translateY(-8px);
  border-color: var(--color-secondary);
  border-left-color: var(--color-secondary);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.9),
    0 0 40px rgba(212, 175, 55, 0.4),
    inset 0 1px 0 rgba(212, 175, 55, 0.2);
}

.mode-card:hover::before,
.mode-card:hover::after {
  opacity: 1;
  border-color: var(--color-secondary);
}

.mode-card:hover::before {
  width: 30px;
  height: 30px;
  top: -3px;
  left: -3px;
}

.mode-card:hover::after {
  width: 30px;
  height: 30px;
  bottom: -3px;
  right: -3px;
}

.mode-card:active {
  transform: translateY(-4px);
}

.mode-card:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 4px;
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.9),
    0 0 0 3px rgba(212, 175, 55, 0.5);
}

.mode-icon {
  font-size: var(--text-6xl);
  margin-bottom: var(--space-2);
}

.mode-title {
  font-size: var(--text-2xl);
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: 0.08em;
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

.mode-description {
  font-size: var(--text-base);
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.mode-badge {
  display: inline-block;
  padding: var(--space-2) var(--space-5);
  background: linear-gradient(135deg, var(--color-secondary-dark), var(--color-secondary));
  color: var(--color-text-inverse);
  border-radius: 0;
  border: 2px solid var(--color-secondary-dark);
  font-size: var(--text-xs);
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
}

.mode-badge::before,
.mode-badge::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--color-secondary-light);
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.mode-badge::before {
  left: var(--space-2);
}

.mode-badge::after {
  right: var(--space-2);
}

/* --------------------------------------------------------
   Quiz View & Matching View
   -------------------------------------------------------- */

.quiz-view,
.matching-view {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

.quiz-header,
.matching-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-6);
  border-bottom: 3px solid var(--color-border);
  position: relative;
}

.quiz-header::after,
.matching-header::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 100px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-secondary), transparent);
}

.back-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: linear-gradient(135deg, rgba(30, 35, 41, 0.95) 0%, rgba(26, 29, 35, 0.95) 100%);
  color: var(--color-secondary);
  border-radius: 0;
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: 900;
  border: 3px solid var(--color-border);
  border-left: 4px solid var(--color-secondary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
  transition: all 500ms var(--ease-out);
  cursor: pointer;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
}

.back-button::before {
  content: '◀';
  position: absolute;
  left: var(--space-2);
  color: var(--color-secondary);
  font-size: var(--text-xs);
  opacity: 0.6;
}

.back-button:hover {
  transform: translateX(-4px);
  border-color: var(--color-secondary);
  border-left-color: var(--color-secondary);
  color: var(--color-text-primary);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.9),
    0 0 30px rgba(212, 175, 55, 0.3);
}

.back-button:active {
  transform: translateX(-2px);
}

.back-button:focus-visible {
  outline: 3px solid var(--color-secondary);
  outline-offset: 4px;
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.9),
    0 0 0 3px rgba(212, 175, 55, 0.5);
}

.back-button svg {
  width: 20px;
  height: 20px;
}

.quiz-title,
.matching-title {
  font-size: var(--text-3xl);
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--color-text-primary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  position: relative;
  padding-left: var(--space-6);
}

.quiz-title::before,
.matching-title::before {
  content: '◈';
  position: absolute;
  left: 0;
  color: var(--color-secondary);
  font-size: 0.6em;
  top: 50%;
  transform: translateY(-50%);
}

/* --------------------------------------------------------
   Result View
   -------------------------------------------------------- */

.result-view {
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn var(--duration-slow) var(--ease-out);
}

/* --------------------------------------------------------
   Animations
   -------------------------------------------------------- */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile devices (≤640px) - Single column layout */
@media (max-width: 640px) {
  .learning-mode-page {
    padding: var(--space-6) var(--space-4);
  }

  .page-header {
    margin-bottom: var(--space-8);
  }

  .page-title {
    font-size: var(--text-3xl);
  }

  .page-subtitle {
    font-size: var(--text-lg);
  }

  .mode-cards {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .mode-card {
    padding: var(--space-6);
    /* Ensure minimum touch target size of 44x44px */
    min-height: 44px;
  }

  .mode-icon {
    font-size: var(--text-5xl);
  }

  .mode-title {
    font-size: var(--text-xl);
  }

  .mode-description {
    font-size: var(--text-sm);
  }

  .quiz-header,
  .matching-header {
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .quiz-title,
  .matching-title {
    font-size: var(--text-2xl);
  }

  .back-button {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
    /* Ensure minimum touch target size of 44x44px */
    min-width: 44px;
    min-height: 44px;
  }

  .back-button svg {
    width: 16px;
    height: 16px;
  }
}

/* Tablet devices (641px - 1023px) - Two column layout */
@media (min-width: 641px) and (max-width: 1023px) {
  .learning-mode-page {
    padding: var(--space-7) var(--space-5);
  }

  .page-header {
    margin-bottom: var(--space-10);
  }

  .page-title {
    font-size: var(--text-4xl);
  }

  .page-subtitle {
    font-size: var(--text-xl);
  }

  .mode-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-5);
  }

  .mode-card {
    padding: var(--space-7);
    /* Ensure minimum touch target size of 44x44px */
    min-height: 44px;
  }

  .mode-icon {
    font-size: var(--text-6xl);
  }

  .mode-title {
    font-size: var(--text-2xl);
  }

  .quiz-header,
  .matching-header {
    margin-bottom: var(--space-7);
  }

  .quiz-title,
  .matching-title {
    font-size: var(--text-3xl);
  }

  .back-button {
    /* Ensure minimum touch target size of 44x44px */
    min-width: 44px;
    min-height: 44px;
  }
}

/* Desktop devices (≥1024px) - Optimized two column layout */
@media (min-width: 1024px) {
  .learning-mode-page {
    padding: var(--space-8) var(--space-6);
  }

  .page-header {
    margin-bottom: var(--space-12);
  }

  .page-title {
    font-size: var(--text-5xl);
  }

  .page-subtitle {
    font-size: var(--text-xl);
  }

  .mode-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .mode-card {
    padding: var(--space-8);
  }

  .mode-icon {
    font-size: var(--text-6xl);
  }

  .mode-title {
    font-size: var(--text-2xl);
  }

  .quiz-header,
  .matching-header {
    margin-bottom: var(--space-8);
  }

  .quiz-title,
  .matching-title {
    font-size: var(--text-3xl);
  }

  /* Hover effects only on desktop */
  .mode-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-2xl), var(--shadow-glow);
    border-color: var(--color-primary);
  }

  .back-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }
}

/* Large desktop (≥1280px) - Maximum width constraint */
@media (min-width: 1280px) {
  .mode-selection,
  .quiz-view,
  .matching-view,
  .result-view {
    max-width: 1200px;
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .mode-selection,
  .quiz-view,
  .matching-view,
  .result-view {
    animation: none;
  }

  .mode-card,
  .back-button {
    transition-duration: 0.01ms;
  }

  .mode-card:hover,
  .back-button:hover {
    transform: none;
  }
}

/* --------------------------------------------------------
   Touch Device Support
   -------------------------------------------------------- */

@media (hover: none) {
  /* Remove hover effects on touch devices */
  .mode-card:hover,
  .back-button:hover {
    transform: none;
    box-shadow: var(--shadow-lg);
  }
  
  /* Ensure touch targets are large enough */
  .mode-card {
    min-height: 44px;
  }
  
  .back-button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
