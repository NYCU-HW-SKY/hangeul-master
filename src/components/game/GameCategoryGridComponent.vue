<template>
  <div class="game-category-grid-container">
    <!-- Header -->
    <div class="grid-header">
      <div class="header-ornament">⟨ 準備挑戰 ⟩</div>
      <h2 class="grid-title">記憶挑戰</h2>
      <p class="grid-subtitle">選擇你的題目與難度</p>
    </div>

    <!-- Difficulty Selector -->
    <div class="difficulty-selector">
      <h3 class="selector-title">選擇難度</h3>
      <div class="difficulty-cards">
        <button
          v-for="level in levels"
          :key="level.value"
          class="difficulty-card"
          :class="{ 'is-selected': selectedLevel === level.value }"
          @click="handleLevelSelect(level.value)"
          type="button"
        >
          <div class="difficulty-icon">{{ level.icon }}</div>
          <h4 class="difficulty-name">{{ level.label }}</h4>
          <p class="difficulty-desc">{{ level.pairs }} 組配對</p>
        </button>
      </div>
    </div>

    <!-- Category Grid -->
    <div class="category-section">
      <h3 class="selector-title">選擇分類</h3>
      <div class="category-grid">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          :class="{ 'is-disabled': category.cardCount < selectedPairs }"
          @click="handleCategorySelect(category.id)"
          :disabled="category.cardCount < selectedPairs"
          :aria-label="`${category.name}分類，${category.cardCount}張卡片`"
          type="button"
        >
          <!-- Rune Decorations -->
          <div class="rune-tl">◈</div>
          <div class="rune-tr">◈</div>
          <div class="rune-bl">◈</div>
          <div class="rune-br">◈</div>

          <!-- Icon -->
          <div class="card-icon">{{ category.icon }}</div>

          <!-- Name -->
          <h4 class="card-name">{{ category.name }}</h4>

          <!-- Card Count -->
          <div class="card-count">
            <span class="count-value">{{ category.cardCount }}</span>
            <span class="count-label">單字</span>
          </div>

          <!-- Insufficient Badge -->
          <div v-if="category.cardCount < selectedPairs" class="insufficient-badge">
            單字不足
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Category {
  id: string;
  name: string;
  icon: string;
  cardCount: number;
}

interface Level {
  value: 'easy' | 'normal' | 'hard';
  label: string;
  icon: string;
  pairs: number;
}

interface Props {
  categories: Category[];
  selectedLevel: 'easy' | 'normal' | 'hard';
}

interface Emits {
  (e: 'select-category', categoryId: string): void;
  (e: 'select-level', level: 'easy' | 'normal' | 'hard'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const levels: Level[] = [
  { value: 'easy', label: '簡單', icon: '◈ I', pairs: 4 },
  { value: 'normal', label: '一般', icon: '◈ II', pairs: 6 },
  { value: 'hard', label: '困難', icon: '◈ III', pairs: 8 },
];

const selectedPairs = computed(() => {
  const level = levels.find(l => l.value === props.selectedLevel);
  return level?.pairs || 6;
});

const handleLevelSelect = (level: 'easy' | 'normal' | 'hard') => {
  emit('select-level', level);
};

const handleCategorySelect = (categoryId: string) => {
  emit('select-category', categoryId);
};
</script>

<style scoped>
/* --------------------------------------------------------
   Container
   -------------------------------------------------------- */

.game-category-grid-container {
  width: 100%;
  padding: var(--space-8) var(--space-6);
  animation: fadeIn 0.4s var(--ease-out);
}

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
   Header
   -------------------------------------------------------- */

.grid-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.header-ornament {
  display: inline-block;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-regular);
  letter-spacing: 0.3em;
  color: var(--color-secondary);
  padding: var(--space-2) var(--space-6);
  border-top: 1px solid var(--color-secondary);
  border-bottom: 1px solid var(--color-secondary);
  margin-bottom: var(--space-6);
}

.grid-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
  letter-spacing: 0.05em;
}

.grid-subtitle {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: var(--font-regular);
}

/* --------------------------------------------------------
   Section Title
   -------------------------------------------------------- */

.selector-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-6);
  text-align: center;
  letter-spacing: 0.05em;
}

/* --------------------------------------------------------
   Difficulty Selector
   -------------------------------------------------------- */

.difficulty-selector {
  max-width: 1000px;
  margin: 0 auto var(--space-16);
}

.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.difficulty-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 2px solid var(--color-border);
  padding: var(--space-8);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  min-height: 180px;
}

.difficulty-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(159, 197, 232, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.difficulty-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.difficulty-card:hover::before {
  opacity: 1;
}

.difficulty-card.is-selected {
  border-color: var(--color-accent);
  background: linear-gradient(135deg, rgba(193, 68, 14, 0.1) 0%, rgba(159, 197, 232, 0.05) 100%);
  box-shadow: var(--shadow-lg), var(--shadow-glow-accent);
}

.difficulty-card.is-selected::after {
  content: '✓';
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 28px;
  height: 28px;
  background: var(--color-accent);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  box-shadow: var(--shadow-md);
}

.difficulty-icon {
  font-size: var(--text-4xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  transition: color var(--duration-base) var(--ease-out);
  letter-spacing: 0.05em;
}

.difficulty-card:hover .difficulty-icon,
.difficulty-card.is-selected .difficulty-icon {
  color: var(--color-primary);
}

.difficulty-name {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0.02em;
}

.difficulty-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

/* --------------------------------------------------------
   Category Section
   -------------------------------------------------------- */

.category-section {
  max-width: 1400px;
  margin: 0 auto;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-6);
}

/* --------------------------------------------------------
   Category Card
   -------------------------------------------------------- */

.category-card {
  position: relative;
  background: var(--gradient-card);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  padding: var(--space-6);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  min-height: 200px;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(159, 197, 232, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

/* Rune Decorations */
.rune-tl,
.rune-tr,
.rune-bl,
.rune-br {
  position: absolute;
  font-size: var(--text-xs);
  color: var(--color-secondary);
  opacity: 0.3;
  transition: all var(--duration-base) var(--ease-out);
  font-family: var(--font-display);
}

.rune-tl {
  top: var(--space-2);
  left: var(--space-2);
}

.rune-tr {
  top: var(--space-2);
  right: var(--space-2);
}

.rune-bl {
  bottom: var(--space-2);
  left: var(--space-2);
}

.rune-br {
  bottom: var(--space-2);
  right: var(--space-2);
}

/* Hover Effects */
.category-card:not(.is-disabled):hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.category-card:not(.is-disabled):hover::before {
  opacity: 1;
}

.category-card:not(.is-disabled):hover .rune-tl,
.category-card:not(.is-disabled):hover .rune-tr,
.category-card:not(.is-disabled):hover .rune-bl,
.category-card:not(.is-disabled):hover .rune-br {
  opacity: 1;
  color: var(--color-primary);
}

.category-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* Disabled State */
.category-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-left-color: var(--color-text-tertiary);
}

.category-card.is-disabled .card-icon {
  color: var(--color-text-tertiary);
}

/* --------------------------------------------------------
   Card Content
   -------------------------------------------------------- */

.card-icon {
  font-size: var(--text-4xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  transition: all var(--duration-base) var(--ease-out);
  letter-spacing: 0.05em;
  line-height: 1;
  margin: var(--space-2) 0;
}

.category-card:not(.is-disabled):hover .card-icon {
  color: var(--color-primary);
  transform: scale(1.1);
}

.card-name {
  font-size: var(--text-lg);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  letter-spacing: 0.02em;
}

.card-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-divider);
  width: 100%;
}

.count-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.count-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
}

/* --------------------------------------------------------
   Insufficient Badge
   -------------------------------------------------------- */

.insufficient-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: var(--color-error);
  color: var(--color-text-inverse);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .game-category-grid-container {
    padding: var(--space-6) var(--space-4);
  }

  .grid-header {
    margin-bottom: var(--space-8);
  }

  .header-ornament {
    font-size: 0.625rem;
    padding: var(--space-1) var(--space-4);
    margin-bottom: var(--space-4);
  }

  .grid-title {
    font-size: var(--text-3xl);
  }

  .grid-subtitle {
    font-size: var(--text-sm);
  }

  .difficulty-selector {
    margin-bottom: var(--space-10);
  }

  .selector-title {
    font-size: var(--text-xl);
    margin-bottom: var(--space-4);
  }

  .difficulty-cards {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .difficulty-card {
    padding: var(--space-6);
    min-height: 140px;
  }

  .difficulty-icon {
    font-size: var(--text-3xl);
  }

  .difficulty-name {
    font-size: var(--text-lg);
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .category-card {
    padding: var(--space-5);
    min-height: 180px;
  }

  .card-icon {
    font-size: var(--text-3xl);
  }

  .card-name {
    font-size: var(--text-base);
  }

  .count-value {
    font-size: var(--text-xl);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .difficulty-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-title {
    font-size: var(--text-4xl);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .game-category-grid-container {
    padding: var(--space-12) var(--space-8);
  }

  .grid-header {
    margin-bottom: var(--space-16);
  }

  .grid-title {
    font-size: var(--text-5xl);
  }

  .grid-subtitle {
    font-size: var(--text-lg);
  }

  .difficulty-selector {
    margin-bottom: var(--space-20);
  }

  .selector-title {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-8);
  }

  .difficulty-cards {
    gap: var(--space-8);
  }

  .difficulty-card {
    padding: var(--space-10);
    min-height: 200px;
  }

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-8);
  }

  .category-card {
    padding: var(--space-8);
    min-height: 220px;
  }

  .card-name {
    font-size: var(--text-xl);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .game-category-grid-container,
  .difficulty-card,
  .category-card,
  .card-icon {
    animation: none;
    transition-duration: 0.01ms;
  }

  .difficulty-card:hover,
  .category-card:hover {
    transform: none;
  }

  .category-card:hover .card-icon {
    transform: none;
  }
}
</style>
