<template>
  <div class="progress-tracker">
    <!-- Compact Stats Grid -->
    <div class="compact-stats">
      <div class="main-stat">
        <div class="stat-value-large">{{ animatedPercentage }}%</div>
        <div class="stat-label">完成度</div>
      </div>
      
      <div class="stat-divider"></div>
      
      <div class="side-stats">
        <div class="stat-item">
          <span class="stat-value">{{ animatedTotalStudied }}</span>
          <span class="stat-label">已學習</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ totalCards }}</span>
          <span class="stat-label">總卡片</span>
        </div>
      </div>
    </div>

    <!-- Simplified Category Progress -->
    <div v-if="categoryProgress.length > 0" class="category-list">
      <div
        v-for="category in categoryProgress"
        :key="category.categoryId"
        class="category-row"
      >
        <span class="category-name">{{ getCategoryName(category.categoryId) }}</span>
        <div class="category-progress">
          <div class="progress-mini">
            <div
              class="progress-mini-fill"
              :style="{ width: `${category.percentage}%` }"
            ></div>
          </div>
          <span class="category-percent">{{ category.percentage }}%</span>
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
const animationDuration = 600;

// Computed values
const overallPercentage = computed(() => {
  if (props.totalCards === 0) return 0;
  return Math.round((props.totalStudied / props.totalCards) * 100);
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
    const easeOut = 1 - Math.pow(1 - progress, 3);
    current.value = Math.round(start + diff * easeOut);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Watch for prop changes and animate
watch(() => overallPercentage.value, (newValue) => {
  animateNumber(newValue, animatedPercentage, animationDuration);
});

watch(() => props.totalStudied, (newValue) => {
  animateNumber(newValue, animatedTotalStudied, animationDuration);
});

// Initialize on mount
onMounted(() => {
  setTimeout(() => {
    animateNumber(overallPercentage.value, animatedPercentage, animationDuration);
    animateNumber(props.totalStudied, animatedTotalStudied, animationDuration);
  }, 100);
});
</script>

<style scoped>
.progress-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  width: 100%;
}

/* Compact Stats */
.compact-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-4);
  background: var(--color-background-alt);
  border-radius: var(--radius-md);
}

.main-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.stat-value-large {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-black);
  color: var(--color-primary);
  line-height: 1;
}

.stat-divider {
  width: 1px;
  height: 60px;
  background: var(--color-border);
}

.side-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

/* Category List */
.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3);
  background: var(--color-background-alt);
  border-radius: var(--radius-md);
  border-left: 2px solid var(--color-primary);
}

.category-name {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  min-width: 80px;
}

.category-progress {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.progress-mini {
  flex: 1;
  height: 6px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-mini-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 600ms ease-out;
}

.category-percent {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  min-width: 45px;
  text-align: right;
}

/* Responsive */
@media (max-width: 640px) {
  .progress-tracker {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .compact-stats {
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-3);
  }

  .stat-value-large {
    font-size: var(--text-4xl);
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }

  .side-stats {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }

  .stat-item {
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .stat-value {
    font-size: var(--text-xl);
  }

  .category-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }

  .category-name {
    min-width: auto;
  }

  .category-progress {
    gap: var(--space-2);
  }
}
</style>
