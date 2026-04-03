<template>
  <div class="category-selector">
    <div 
      class="category-list" 
      role="tablist"
      aria-label="分類選擇器"
    >
      <button
        v-for="category in categories"
        :key="category.id"
        v-memo="[category.id, currentCategory === category.id]"
        class="category-card"
        :class="{ 'is-active': category.id === currentCategory }"
        @click="handleSelect(category.id)"
        role="tab"
        :aria-selected="category.id === currentCategory"
        :aria-label="`${category.name}分類，${category.cardCount}張卡片`"
        type="button"
      >
        <div class="card-content">
          <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
          <span class="category-name">{{ category.name }}</span>
          <span class="card-count">{{ category.cardCount }} 張</span>
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
}

interface Props {
  categories: Category[];
  currentCategory: string;
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
   Category Selector Container
   -------------------------------------------------------- */

.category-selector {
  width: 100%;
  padding: var(--space-4) 0;
}

/* --------------------------------------------------------
   Category List (Horizontal Scrolling)
   -------------------------------------------------------- */

.category-list {
  display: flex;
  gap: var(--space-4);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS momentum scrolling */
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  padding: var(--space-2) var(--space-4);
}

/* Custom Scrollbar for Webkit Browsers */
.category-list::-webkit-scrollbar {
  height: 6px;
}

.category-list::-webkit-scrollbar-track {
  background: transparent;
}

.category-list::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.category-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-text-tertiary);
}

/* Desktop: Show all categories without scrolling */
@media (min-width: 1024px) {
  .category-list {
    justify-content: center;
    overflow-x: visible;
  }
}

/* --------------------------------------------------------
   Category Card
   -------------------------------------------------------- */

.category-card {
  flex-shrink: 0;
  min-width: 150px;
  padding: var(--space-4) var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  border-top: 2px solid var(--color-border);
  border-left: 2px solid var(--color-border);
  opacity: 0.6;
  transition: all var(--duration-base) var(--ease-out);
}

.category-card:hover {
  background-color: var(--color-surface-elevated);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.category-card:hover::before {
  border-color: var(--color-primary);
  opacity: 1;
}

.category-card:active {
  transform: translateY(0);
}

.category-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.category-card.is-active {
  border-color: var(--color-primary);
  background-color: rgba(159, 197, 232, 0.1);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.category-card.is-active::before {
  border-color: var(--color-primary);
  opacity: 1;
}

/* Desktop: Show all categories without scrolling */
@media (min-width: 1024px) {
  .category-list {
    justify-content: center;
    overflow-x: visible;
    flex-wrap: wrap;
  }

  .category-card {
    min-width: 160px;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .category-list {
    justify-content: flex-start;
  }

  .category-card {
    min-width: 150px;
  }
}

/* Mobile: Smaller cards */
@media (max-width: 640px) {
  .category-selector {
    padding: var(--space-3) 0;
  }

  .category-list {
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
  }

  .category-card {
    min-width: 110px;
    padding: var(--space-3) var(--space-4);
  }

  .category-icon {
    font-size: var(--text-2xl);
  }

  .category-name {
    font-size: var(--text-sm);
  }

  .card-count {
    font-size: 0.625rem;
    padding: 2px var(--space-2);
  }
}

/* --------------------------------------------------------
   Card Content
   -------------------------------------------------------- */

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
}

/* --------------------------------------------------------
   Category Icon - 戰神風格符文符號
   -------------------------------------------------------- */

.category-icon {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  line-height: 1;
  color: var(--color-text-secondary);
  transition: all var(--duration-base) var(--ease-out);
  letter-spacing: 0.05em;
}

.category-card.is-active .category-icon {
  color: var(--color-primary);
  transform: none;
}

/* --------------------------------------------------------
   Category Name - 戰神風格
   -------------------------------------------------------- */

.category-name {
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
  transition: color var(--duration-base) var(--ease-out);
  letter-spacing: 0.02em;
}

.category-card.is-active .category-name {
  color: var(--color-primary);
}

/* --------------------------------------------------------
   Card Count - 戰神風格
   -------------------------------------------------------- */

.card-count {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-text-tertiary);
  background-color: transparent;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  transition: all var(--duration-base) var(--ease-out);
}

.category-card.is-active .card-count {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(159, 197, 232, 0.1);
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .category-list {
    scroll-behavior: auto;
  }

  .category-card,
  .category-icon,
  .category-name,
  .card-count {
    transition-duration: 0.01ms;
  }

  .category-card:hover,
  .category-card.is-active {
    transform: none;
  }

  .category-card.is-active .category-icon {
    transform: none;
  }
}
</style>
