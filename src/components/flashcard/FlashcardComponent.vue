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
      <!-- Card Inner Container (for 3D flip) -->
      <div class="flashcard-inner">
        <!-- Front Side (Korean) -->
        <div class="flashcard-face flashcard-front">
          <div class="card-content">
            <span class="category-badge">{{ category }}</span>
            <p class="korean-text text-korean">{{ korean }}</p>
          </div>
        </div>

        <!-- Back Side (Chinese + Example) -->
        <div class="flashcard-face flashcard-back">
          <div class="card-content">
            <span class="category-badge">{{ category }}</span>
            <p class="chinese-text text-chinese">{{ chinese }}</p>
            <div v-if="example" class="example-section">
              <p class="example-text text-korean">{{ example }}</p>
              <p class="example-translation text-chinese">{{ exampleTranslation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  korean: string;
  chinese: string;
  category: string;
  isFlipped?: boolean;
  isStudied?: boolean;
  example?: string;
  exampleTranslation?: string;
}

interface Emits {
  (e: 'flip'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isFlipped: false,
  isStudied: false,
  example: '',
  exampleTranslation: '',
});

const emit = defineEmits<Emits>();

const handleFlip = () => {
  emit('flip');
};
</script>

<style scoped>
.flashcard-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --------------------------------------------------------
   Flashcard Container - 戰神風格 3D 效果
   -------------------------------------------------------- */

.flashcard {
  position: relative;
  width: 400px;
  height: 260px;
  cursor: pointer;
  perspective: 1200px;
  transition: transform var(--duration-base) var(--ease-out);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  will-change: transform;
}

/* 懸浮效果 - 戰神風格 */
.flashcard:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

/* 已學習狀態 - 綠色發光邊框 */
.flashcard.is-studied {
  box-shadow: 0 10px 30px rgba(106, 176, 76, 0.5);
}

.flashcard.is-studied:hover {
  box-shadow: 0 20px 40px rgba(106, 176, 76, 0.7);
}

.flashcard.is-studied .flashcard-face {
  border-color: rgba(106, 176, 76, 0.8);
  box-shadow: 
    var(--shadow-lg),
    0 0 20px rgba(106, 176, 76, 0.3),
    inset 0 0 20px rgba(106, 176, 76, 0.1);
}

.flashcard.is-studied .flashcard-front {
  border-color: rgba(106, 176, 76, 0.8);
}

.flashcard.is-studied .flashcard-back {
  border-color: rgba(106, 176, 76, 0.9);
}

/* 符文角落裝飾 - 已學習狀態變綠色 */
.flashcard.is-studied .flashcard-face::before {
  border-top-color: rgba(106, 176, 76, 0.8);
  border-left-color: rgba(106, 176, 76, 0.8);
  opacity: 0.9;
}

.flashcard.is-studied .flashcard-face::after {
  border-bottom-color: rgba(106, 176, 76, 0.8);
  border-right-color: rgba(106, 176, 76, 0.8);
  opacity: 0.9;
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
  font-size: var(--text-4xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.chinese-text {
  font-size: var(--text-3xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: 1.3;
}

/* 例句區域 */
.example-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid rgba(159, 197, 232, 0.3);
  width: 100%;
}

.example-text {
  font-size: var(--text-sm);
  font-family: var(--font-display);
  color: var(--color-text-primary);
  line-height: 1.4;
  margin-bottom: var(--space-2);
}

.example-translation {
  font-size: var(--text-xs);
  font-family: var(--font-display);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .flashcard,
  .flashcard-inner {
    transition-duration: 0.01ms;
  }

  .flashcard:hover {
    transform: none;
  }
}

@media (hover: none) {
  .flashcard:hover {
    transform: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }
}
</style>
