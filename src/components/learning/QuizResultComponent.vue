<template>
  <div class="quiz-result">
    <!-- Celebration Animation -->
    <div class="celebration-container" aria-hidden="true">
      <div class="celebration-icon">🎉</div>
    </div>

    <!-- Result Header -->
    <div class="result-header">
      <h2 class="result-title">測驗完成！</h2>
    </div>

    <!-- Result Stats -->
    <div class="result-stats" role="region" aria-label="測驗統計資訊">
      <!-- Score -->
      <div class="stat-card" role="group" aria-label="總分統計">
        <div class="stat-icon" aria-hidden="true">✓</div>
        <div class="stat-content">
          <div class="stat-label">總分</div>
          <div class="stat-value" aria-label="`總分 ${score} 分，滿分 ${totalQuestions} 分`">{{ score }}/{{ totalQuestions }}</div>
        </div>
      </div>

      <!-- Accuracy -->
      <div class="stat-card" role="group" aria-label="正確率統計">
        <div class="stat-icon" aria-hidden="true">📊</div>
        <div class="stat-content">
          <div class="stat-label">正確率</div>
          <div class="stat-value" aria-label="`正確率 ${accuracyPercentage} 百分比`">{{ accuracyPercentage }}%</div>
        </div>
      </div>

      <!-- Duration (for matching mode) -->
      <div v-if="isMatchingMode" class="stat-card" role="group" aria-label="完成時間統計">
        <div class="stat-icon" aria-hidden="true">⏱️</div>
        <div class="stat-content">
          <div class="stat-label">完成時間</div>
          <div class="stat-value" aria-label="`完成時間 ${formattedDuration}`">{{ formattedDuration }}</div>
        </div>
      </div>

      <!-- Attempt Count (for matching mode) -->
      <div v-if="isMatchingMode && attemptCount !== undefined" class="stat-card" role="group" aria-label="嘗試次數統計">
        <div class="stat-icon" aria-hidden="true">🔄</div>
        <div class="stat-content">
          <div class="stat-label">嘗試次數</div>
          <div class="stat-value" aria-label="`嘗試次數 ${attemptCount} 次`">{{ attemptCount }}</div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons" role="group" aria-label="測驗結果操作">
      <ButtonComponent
        variant="primary"
        size="large"
        @click="handleRetry"
        @keydown.enter="handleRetry"
        @keydown.space.prevent="handleRetry"
        aria-label="再試一次，重新開始測驗"
      >
        再試一次
      </ButtonComponent>

      <ButtonComponent
        variant="outline"
        size="large"
        @click="handleExit"
        @keydown.enter="handleExit"
        @keydown.space.prevent="handleExit"
        aria-label="返回主選單，選擇其他學習模式"
      >
        返回主選單
      </ButtonComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuizResult, MatchingResult, LearningModeType } from '@/types/learningMode';
import ButtonComponent from '@/components/common/ButtonComponent.vue';

interface Props {
  result: QuizResult | MatchingResult;
  mode: LearningModeType;
}

interface Emits {
  (e: 'retry'): void;
  (e: 'exit'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed
const isMatchingMode = computed(() => props.mode === 'matching');

const score = computed(() => {
  if ('correctAnswers' in props.result) {
    return props.result.correctAnswers;
  }
  return props.result.totalPairs;
});

const totalQuestions = computed(() => {
  if ('totalQuestions' in props.result) {
    return props.result.totalQuestions;
  }
  return props.result.totalPairs;
});

const accuracyPercentage = computed(() => {
  if ('accuracy' in props.result) {
    return Math.round(props.result.accuracy);
  }
  // For matching mode, calculate accuracy as 100% if completed
  return 100;
});

const attemptCount = computed(() => {
  if ('attemptCount' in props.result) {
    return props.result.attemptCount;
  }
  return undefined;
});

const formattedDuration = computed(() => {
  const durationMs = props.result.duration;
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${seconds}秒`;
});

// Methods
function handleRetry() {
  emit('retry');
}

function handleExit() {
  emit('exit');
}
</script>

<style scoped>
/* --------------------------------------------------------
   Quiz Result Container - 戰神風格
   -------------------------------------------------------- */

.quiz-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-8);
  position: relative;
}

/* --------------------------------------------------------
   Celebration Animation - 慶祝動畫
   -------------------------------------------------------- */

.celebration-container {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-raised);
  pointer-events: none;
}

.celebration-icon {
  font-size: var(--text-5xl);
  animation: victoryBounce 1s var(--ease-spring) infinite;
}

@keyframes victoryBounce {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  25% {
    transform: translateY(-20px) scale(1.1);
  }
  50% {
    transform: translateY(0) scale(1);
  }
  75% {
    transform: translateY(-10px) scale(1.05);
  }
}

/* --------------------------------------------------------
   Result Header
   -------------------------------------------------------- */

.result-header {
  text-align: center;
  padding: var(--space-6);
  animation: fadeInDown var(--duration-slow) var(--ease-out);
}

.result-title {
  font-size: var(--text-4xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* --------------------------------------------------------
   Result Stats - 統計卡片
   -------------------------------------------------------- */

.result-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  animation: fadeInUp var(--duration-slow) var(--ease-out);
  animation-delay: 200ms;
  animation-fill-mode: both;
}

@media (min-width: 641px) {
  .result-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.stat-icon {
  font-size: var(--text-4xl);
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.stat-label {
  font-size: var(--text-sm);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.stat-value {
  font-size: var(--text-3xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Action Buttons
   -------------------------------------------------------- */

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  animation: fadeInUp var(--duration-slow) var(--ease-out);
  animation-delay: 400ms;
  animation-fill-mode: both;
}

@media (min-width: 641px) {
  .action-buttons {
    flex-direction: row;
    justify-content: center;
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

@media (max-width: 640px) {
  .quiz-result {
    padding: var(--space-6);
  }

  .result-title {
    font-size: var(--text-3xl);
  }

  .stat-card {
    padding: var(--space-5);
  }

  .stat-icon {
    font-size: var(--text-3xl);
  }

  .stat-value {
    font-size: var(--text-2xl);
  }

  .celebration-icon {
    font-size: var(--text-4xl);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .celebration-icon {
    animation: none;
  }

  .result-header,
  .result-stats,
  .action-buttons {
    animation: none;
  }

  .stat-card:hover {
    transform: none;
  }
}
</style>
