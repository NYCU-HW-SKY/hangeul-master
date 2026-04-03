<template>
  <div class="progress-tracker">
    <!-- Circular Progress Ring -->
    <div class="progress-ring-container">
      <svg class="progress-ring" viewBox="0 0 200 200" aria-hidden="true">
        <!-- Gradient Definition -->
        <defs>
          <linearGradient id="frostGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: var(--color-primary-dark); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--color-primary); stop-opacity: 1" />
          </linearGradient>
        </defs>
        
        <!-- Background Circle -->
        <circle
          class="progress-ring-bg"
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke-width="12"
        />
        
        <!-- Progress Circle -->
        <circle
          class="progress-ring-fill"
          cx="100"
          cy="100"
          r="85"
          fill="none"
          stroke-width="12"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          :style="{ transition: `stroke-dashoffset ${animationDuration}ms ease-out` }"
        />
      </svg>
      
      <!-- Center Statistics -->
      <div class="progress-center">
        <div class="progress-percentage" aria-live="polite">
          {{ animatedPercentage }}%
        </div>
        <div class="progress-label">完成度</div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" aria-live="polite">{{ animatedTotalStudied }}</div>
        <div class="stat-label">已學習</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value" aria-live="polite">{{ totalCards }}</div>
        <div class="stat-label">總卡片</div>
      </div>
    </div>

    <!-- Category Progress Bars -->
    <div v-if="categoryProgress.length > 0" class="category-progress-list">
      <h3 class="section-title">分類進度</h3>
      
      <div
        v-for="category in categoryProgress"
        :key="category.categoryId"
        class="category-item"
      >
        <div class="category-header">
          <span class="category-name">{{ getCategoryName(category.categoryId) }}</span>
          <span class="category-percentage">{{ category.percentage }}%</span>
        </div>
        
        <div class="progress-bar-container">
          <div
            class="progress-bar-fill"
            :style="{
              width: `${category.percentage}%`,
              transition: `width ${animationDuration}ms ease-out`
            }"
            role="progressbar"
            :aria-valuenow="category.percentage"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${getCategoryName(category.categoryId)} 進度 ${category.percentage}%`"
          ></div>
        </div>
        
        <div class="category-stats">
          <span class="category-count">
            {{ category.studiedCardIds.length }} / {{ category.totalCards }}
          </span>
          <span v-if="category.lastStudiedAt" class="category-date">
            最後學習：{{ formatDate(category.lastStudiedAt) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { CategoryProgress } from '../../types';

interface Props {
  categoryProgress: CategoryProgress[];
  totalStudied: number;
  totalCards: number;
}

const props = withDefaults(defineProps<Props>(), {
  categoryProgress: () => [],
  totalStudied: 0,
  totalCards: 0,
});

// Animation state
const animatedPercentage = ref(0);
const animatedTotalStudied = ref(0);
const animationDuration = 800;

// SVG circle calculations
const radius = 85;
const circumference = 2 * Math.PI * radius;

// Computed values
const overallPercentage = computed(() => {
  if (props.totalCards === 0) return 0;
  return Math.round((props.totalStudied / props.totalCards) * 100);
});

const progressOffset = computed(() => {
  const progress = animatedPercentage.value / 100;
  return circumference * (1 - progress);
});

// Category name mapping
const categoryNames: Record<string, string> = {
  numbers: '數字',
  greetings: '問候語',
  'daily-phrases': '日常用語',
  food: '食物',
  family: '家庭',
  colors: '顏色',
  animals: '動物',
  weather: '天氣',
};

const getCategoryName = (categoryId: string): string => {
  return categoryNames[categoryId] || categoryId;
};

// Date formatting
const formatDate = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  
  return new Date(date).toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
};

// Animate number counting
const animateNumber = (
  target: number,
  current: { value: number },
  duration: number
) => {
  const start = current.value;
  const diff = target - start;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    current.value = Math.round(start + diff * easeOut);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Watch for prop changes and animate
watch(
  () => overallPercentage.value,
  (newValue) => {
    animateNumber(newValue, animatedPercentage, animationDuration);
  }
);

watch(
  () => props.totalStudied,
  (newValue) => {
    animateNumber(newValue, animatedTotalStudied, animationDuration);
  }
);

// Initialize on mount
onMounted(() => {
  // Delay initial animation slightly for better UX
  setTimeout(() => {
    animateNumber(overallPercentage.value, animatedPercentage, animationDuration);
    animateNumber(props.totalStudied, animatedTotalStudied, animationDuration);
  }, 100);
});
</script>

<style scoped>
/* --------------------------------------------------------
   Progress Tracker Container
   -------------------------------------------------------- */

.progress-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  max-width: 600px;
  width: 100%;
  position: relative;
}

/* Rune decorations at corners */
.progress-tracker::before,
.progress-tracker::after {
  content: '◈';
  position: absolute;
  top: var(--space-4);
  color: var(--color-primary);
  font-size: var(--text-sm);
  opacity: 0.6;
}

.progress-tracker::before {
  left: var(--space-4);
}

.progress-tracker::after {
  right: var(--space-4);
}

/* --------------------------------------------------------
   Circular Progress Ring
   -------------------------------------------------------- */

.progress-ring-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 8px var(--color-primary-glow));
}

.progress-ring-bg {
  stroke: var(--color-surface-elevated);
  stroke-opacity: 0.5;
}

.progress-ring-fill {
  stroke: url(#frostGradient);
  stroke-linecap: round;
  filter: drop-shadow(0 0 4px var(--color-primary));
}

/* --------------------------------------------------------
   Center Statistics
   -------------------------------------------------------- */

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  line-height: 1;
  font-family: var(--font-display);
  text-shadow: 0 0 12px var(--color-primary-glow);
}

.progress-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
  font-weight: var(--font-medium);
  font-family: var(--font-display);
}

/* --------------------------------------------------------
   Statistics Grid
   -------------------------------------------------------- */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  width: 100%;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-5);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset);
  position: relative;
}

/* Rune decoration for stat cards */
.stat-card::before {
  content: '◈';
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  color: var(--color-primary);
  font-size: var(--text-xs);
  opacity: 0.4;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
  font-family: var(--font-display);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
  font-weight: var(--font-medium);
  font-family: var(--font-display);
}

/* --------------------------------------------------------
   Category Progress List
   -------------------------------------------------------- */

.category-progress-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin: 0;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-display);
}

.section-title::before {
  content: '⟨ ';
  color: var(--color-primary);
}

.section-title::after {
  content: ' ⟩';
  color: var(--color-primary);
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-inset);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  font-family: var(--font-display);
}

.category-percentage {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  font-family: var(--font-display);
}

/* --------------------------------------------------------
   Progress Bar
   -------------------------------------------------------- */

.progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: var(--color-background-alt);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-inset);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  border-radius: var(--radius-md);
  transition: width var(--duration-slow) var(--ease-out);
  box-shadow: 0 0 8px var(--color-primary-glow);
  position: relative;
}

/* Frost glow at progress bar end */
.progress-bar-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  box-shadow: 0 0 12px var(--color-primary), 0 0 20px var(--color-primary-glow);
  opacity: 0.9;
}

/* --------------------------------------------------------
   Category Stats
   -------------------------------------------------------- */

.category-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.category-count {
  font-weight: var(--font-medium);
}

.category-date {
  font-style: italic;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .progress-tracker {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .progress-ring-container {
    width: 160px;
    height: 160px;
  }

  .progress-percentage {
    font-size: var(--text-4xl);
  }

  .stat-value {
    font-size: var(--text-2xl);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    padding: var(--space-4);
  }

  .section-title {
    font-size: var(--text-lg);
  }

  .category-item {
    padding: var(--space-3);
  }

  .category-name {
    font-size: var(--text-sm);
  }

  .category-percentage {
    font-size: var(--text-base);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .progress-tracker {
    max-width: 700px;
  }

  .progress-ring-container {
    width: 180px;
    height: 180px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .progress-tracker {
    padding: var(--space-8);
    gap: var(--space-10);
  }

  .progress-ring-container {
    width: 220px;
    height: 220px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .stat-card {
    padding: var(--space-6);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .progress-ring-fill,
  .progress-bar-fill,
  .stat-card,
  .category-item {
    transition-duration: 0.01ms;
  }

  .stat-card:hover,
  .category-item:hover {
    transform: none;
  }
}
</style>
