<template>
  <div class="flashcard-wrapper">
    <div 
      class="flashcard" 
      :class="{ 'is-flipped': isFlipped, 'is-studied': isStudied }"
      @click="handleFlip"
      role="button"
      tabindex="0"
      :aria-label="isFlipped ? `卡片背面：${chinese}` : `卡片正面：${korean}`"
      @keydown.enter="handleFlip"
      @keydown.space.prevent="handleFlip"
    >
      <!-- Audio Button -->
      <button
        v-if="showAudioButton && audioUrl"
        class="audio-button"
        @click.stop="handlePlayAudio"
        :aria-label="`播放 ${korean} 的發音`"
        type="button"
      >
        <svg 
          class="audio-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M11 5L6 9H2v6h4l5 4V5z" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
        <span class="ripple"></span>
      </button>

      <!-- Card Inner Container (for 3D flip) -->
      <div class="flashcard-inner">
        <!-- Front Side (Korean) -->
        <div class="flashcard-face flashcard-front">
          <div class="card-content">
            <span class="category-badge">{{ category }}</span>
            <p class="korean-text text-korean">{{ korean }}</p>
          </div>
        </div>

        <!-- Back Side (Chinese) -->
        <div class="flashcard-face flashcard-back">
          <div class="card-content">
            <span class="category-badge">{{ category }}</span>
            <p class="chinese-text text-chinese">{{ chinese }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Study Button (below card) -->
    <button
      class="study-button"
      :class="{ 'is-studied': isStudied }"
      @click="handleStudied"
      :aria-label="isStudied ? `${korean} 已標記為已學習` : `標記 ${korean} 為已學習`"
      type="button"
    >
      <svg 
        class="check-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.5"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{{ isStudied ? '✓ 已學習' : '標記已學習' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  korean: string;
  chinese: string;
  audioUrl?: string;
  category: string;
  isFlipped?: boolean;
  showAudioButton?: boolean;
  isStudied?: boolean;
}

interface Emits {
  (e: 'flip'): void;
  (e: 'playAudio'): void;
  (e: 'studied'): void;
}

const props = withDefaults(defineProps<Props>(), {
  audioUrl: '',
  isFlipped: false,
  showAudioButton: true,
  isStudied: false,
});

const emit = defineEmits<Emits>();

const handleFlip = () => {
  emit('flip');
};

const handlePlayAudio = () => {
  emit('playAudio');
};

const handleStudied = () => {
  emit('studied');
};
</script>

<style scoped>
.flashcard-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

/* --------------------------------------------------------
   Flashcard Container - 戰神風格 3D 效果
   -------------------------------------------------------- */

.flashcard {
  position: relative;
  width: 320px;
  height: 200px;
  cursor: pointer;
  perspective: 1200px;
  transition: transform var(--duration-base) var(--ease-out);
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.6));
  will-change: transform;
}

/* 懸浮效果 - 戰神風格 */
.flashcard:hover {
  transform: translateY(-8px);
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8));
}

/* 已學習狀態 */
.flashcard.is-studied {
  filter: drop-shadow(0 10px 30px rgba(106, 176, 76, 0.4));
}

.flashcard.is-studied:hover {
  filter: drop-shadow(0 20px 40px rgba(106, 176, 76, 0.6));
}

/* Focus State */
.flashcard:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
  border-radius: var(--radius-sm);
}

/* --------------------------------------------------------
   3D Flip Animation Container - 戰神風格
   -------------------------------------------------------- */

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform var(--duration-slow) var(--ease-epic);
  transform-style: preserve-3d;
  border-radius: var(--radius-sm);
}

.flashcard.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

/* --------------------------------------------------------
   Card Faces (Front & Back) - 戰神風格石板質感
   -------------------------------------------------------- */

.flashcard-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  border: 2px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

/* 符文角落裝飾 */
.flashcard-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-top: 2px solid var(--color-primary);
  border-left: 2px solid var(--color-primary);
  opacity: 0.6;
}

.flashcard-face::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-bottom: 2px solid var(--color-primary);
  border-right: 2px solid var(--color-primary);
  opacity: 0.6;
}

.flashcard-front {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%);
  border-color: var(--color-border);
}

.flashcard-back {
  background: var(--gradient-primary);
  transform: rotateY(180deg);
  border-color: var(--color-primary-dark);
}

/* --------------------------------------------------------
   Card Content - 戰神風格排版
   -------------------------------------------------------- */

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 1;
}

.category-badge {
  font-size: var(--text-xs);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  background: transparent;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid var(--color-border);
}

.flashcard-back .category-badge {
  background: rgba(159, 197, 232, 0.2);
  color: var(--color-text-primary);
  border-color: var(--color-primary-light);
}

.korean-text {
  font-size: var(--text-3xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.chinese-text {
  font-size: var(--text-2xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: 1.3;
}

/* --------------------------------------------------------
   Audio Button - 戰神風格脈衝效果
   -------------------------------------------------------- */

.audio-button {
  position: absolute;
  top: var(--space-5);
  right: var(--space-5);
  z-index: 10;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--gradient-accent);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
  overflow: visible;
  border: 2px solid var(--color-accent-dark);
  will-change: transform;
}

.audio-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow-accent);
  border-color: var(--color-accent-light);
}

.audio-button:active {
  transform: translateY(0);
}

.audio-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.audio-icon {
  width: 20px;
  height: 20px;
  position: relative;
  z-index: 2;
}

/* 脈衝波紋動畫 - 戰神風格 */
.ripple {
  position: absolute;
  inset: -6px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-accent);
  opacity: 0.6;
  animation: ripplePulse 2s var(--ease-in-out) infinite;
  pointer-events: none;
}

@keyframes ripplePulse {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* --------------------------------------------------------
   Study Button - 戰神風格成功按鈕
   -------------------------------------------------------- */

.study-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--color-success) 0%, #5a9a3a 100%);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
  border: 2px solid #5a9a3a;
  letter-spacing: 0.02em;
  will-change: transform;
}

.study-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-success);
}

.study-button:active {
  transform: translateY(0);
}

.study-button:focus-visible {
  outline: 2px solid var(--color-success);
  outline-offset: 2px;
}

.study-button.is-studied {
  background: linear-gradient(135deg, #5a9a3a 0%, #4a7a2a 100%);
  border-color: #4a7a2a;
  opacity: 0.8;
}

.study-button.is-studied:hover {
  opacity: 1;
  transform: translateY(-2px);
}

.check-icon {
  width: 20px;
  height: 20px;
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .flashcard,
  .flashcard-inner,
  .audio-button,
  .study-button {
    transition-duration: 0.01ms;
  }

  .ripple {
    animation: none;
  }

  .flashcard:hover {
    transform: none;
  }
}

@media (hover: none) {
  .flashcard:hover,
  .audio-button:hover,
  .study-button:hover {
    transform: none;
    box-shadow: var(--shadow-md);
  }

  .audio-button:hover::before,
  .study-button:hover::before {
    opacity: 0;
  }
}
</style>
