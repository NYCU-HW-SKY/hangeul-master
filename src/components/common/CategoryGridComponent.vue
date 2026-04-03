<template>
  <div class="category-grid-container">
    <!-- Header -->
    <div class="grid-header">
      <div class="header-ornament">⟨ 選擇你的題目 ⟩</div>
      <h2 class="grid-title">學習分類</h2>
      <p class="grid-subtitle">{{ categories.length }} 個挑戰等待征服</p>
    </div>

    <!-- Category Grid -->
    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-card"
        :class="{ 'is-completed': category.progress === 100 }"
        @click="handleSelect(category.id)"
        :aria-label="`${category.name}分類，${category.cardCount}張卡片，已學習${category.progress}%`"
        type="button"
      >
        <!-- Rune Decorations -->
        <div class="rune-tl">◈</div>
        <div class="rune-tr">◈</div>
        <div class="rune-bl">◈</div>
        <div class="rune-br">◈</div>

        <!-- Progress Ring -->
        <div class="progress-ring">
          <svg class="progress-svg" viewBox="0 0 120 120">
            <circle
              class="progress-ring-bg"
              cx="60"
              cy="60"
              r="52"
            />
            <circle
              class="progress-ring-fill"
              cx="60"
              cy="60"
              r="52"
              :style="{
                strokeDasharray: `${2 * Math.PI * 52}`,
                strokeDashoffset: `${2 * Math.PI * 52 * (1 - category.progress / 100)}`
              }"
            />
          </svg>
          <div class="progress-content">
            <div class="card-icon">{{ category.icon }}</div>
          </div>
        </div>

        <!-- Name -->
        <h3 class="card-name">{{ category.name }}</h3>

        <!-- Stats -->
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-value">{{ category.cardCount }}</span>
            <span class="stat-label">單字</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ category.progress }}%</span>
            <span class="stat-label">完成</span>
          </div>
        </div>

        <!-- Completion Badge -->
        <div v-if="category.progress === 100" class="completion-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Category {
  id: string;
  name: string;
  icon: string;
  cardCount: number;
  progress: number;
}

interface Props {
  categories: Category[];
}

interface Emits {
  (e: 'select', categoryId: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSelect = (categoryId: string) => {
  emit('select', categoryId);
};
</script>

<style scoped>
/* --------------------------------------------------------
   Container
   -------------------------------------------------------- */

.category-grid-container {
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
   Grid Layout
   -------------------------------------------------------- */

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-8);
  max-width: 1400px;
  margin: 0 auto;
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
  padding: var(--space-8);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  min-height: 280px;
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
.category-card:hover {
  transform: translateY(-6px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.category-card:hover::before {
  opacity: 1;
}

.category-card:hover .rune-tl,
.category-card:hover .rune-tr,
.category-card:hover .rune-bl,
.category-card:hover .rune-br {
  opacity: 1;
  color: var(--color-primary);
}

.category-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.category-card:active {
  transform: translateY(-3px);
}

/* Completed State */
.category-card.is-completed {
  border-left-color: var(--color-success);
}

.category-card.is-completed .progress-ring-fill {
  stroke: var(--color-success);
}

/* --------------------------------------------------------
   Progress Ring
   -------------------------------------------------------- */

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: var(--space-2) 0;
}

.progress-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: var(--color-divider);
  stroke-width: 4;
}

.progress-ring-fill {
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 4;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-slow) var(--ease-out),
              stroke var(--duration-base) var(--ease-out);
}

.progress-content {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon {
  font-size: var(--text-4xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  transition: all var(--duration-base) var(--ease-out);
  letter-spacing: 0.05em;
  line-height: 1;
}

.category-card:hover .card-icon {
  color: var(--color-primary);
  transform: scale(1.1);
}

/* --------------------------------------------------------
   Card Content
   -------------------------------------------------------- */

.card-name {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
  letter-spacing: 0.02em;
  transition: color var(--duration-base) var(--ease-out);
}

.category-card:hover .card-name {
  color: var(--color-primary);
}

/* --------------------------------------------------------
   Stats
   -------------------------------------------------------- */

.card-stats {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-divider);
  width: 100%;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background-color: var(--color-divider);
}

/* --------------------------------------------------------
   Completion Badge
   -------------------------------------------------------- */

.completion-badge {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  background: var(--color-success);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  animation: badgePop 0.5s var(--ease-spring);
}

.completion-badge svg {
  width: 18px;
  height: 18px;
  color: var(--color-text-inverse);
}

@keyframes badgePop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) - 1 column */
@media (max-width: 640px) {
  .category-grid-container {
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

  .category-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .category-card {
    padding: var(--space-6);
    min-height: 260px;
  }

  .progress-ring {
    width: 100px;
    height: 100px;
  }

  .card-icon {
    font-size: var(--text-3xl);
  }

  .card-name {
    font-size: var(--text-lg);
  }

  .stat-value {
    font-size: var(--text-lg);
  }
}

/* Tablet (641px - 1023px) - 2 columns */
@media (min-width: 641px) and (max-width: 1023px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .grid-title {
    font-size: var(--text-4xl);
  }
}

/* Desktop (≥1024px) - 3-4 columns */
@media (min-width: 1024px) {
  .category-grid-container {
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

  .category-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--space-10);
  }

  .category-card {
    padding: var(--space-10);
    min-height: 300px;
  }

  .card-name {
    font-size: var(--text-2xl);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .category-grid-container,
  .category-card,
  .card-icon,
  .progress-ring-fill,
  .completion-badge {
    animation: none;
    transition-duration: 0.01ms;
  }

  .category-card:hover {
    transform: none;
  }

  .category-card:hover .card-icon {
    transform: none;
  }
}
</style>
