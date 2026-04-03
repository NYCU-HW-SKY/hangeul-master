<template>
  <div class="hangul40-page">
    <!-- Top Navigation -->
    <header class="hangul-header">
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

      <h1 class="page-title">韓文40音</h1>

      <div class="spacer"></div>
    </header>

    <!-- Section Tabs -->
    <nav class="section-tabs">
      <button
        v-for="section in sections"
        :key="section.id"
        class="tab-button"
        :class="{ 'is-active': currentSection === section.id }"
        @click="currentSection = section.id"
        type="button"
      >
        <span class="tab-text">{{ section.name }}</span>
        <span class="tab-count">{{ section.items.length }}</span>
      </button>
    </nav>

    <!-- Main Content -->
    <main class="hangul-content">
      <div class="section-description">
        {{ currentSectionData?.description }}
      </div>

      <!-- Hangul Grid -->
      <div class="hangul-grid">
        <div
          v-for="item in currentSectionData?.items"
          :key="item.id"
          class="hangul-card"
          @click="selectItem(item)"
          :class="{ 'is-selected': selectedItem?.id === item.id }"
          role="button"
          tabindex="0"
          @keydown.enter="selectItem(item)"
          @keydown.space.prevent="selectItem(item)"
        >
          <div class="hangul-char">{{ item.hangul }}</div>
          <div class="hangul-roman">{{ item.romanization }}</div>
          <div class="hangul-chinese">{{ item.chinese }}</div>
        </div>
      </div>

      <!-- Detail Panel Overlay -->
      <transition name="fade">
        <div 
          v-if="selectedItem" 
          class="detail-overlay"
          @click="selectedItem = null"
          role="button"
          tabindex="0"
          @keydown.escape="selectedItem = null"
          aria-label="關閉詳細面板"
        ></div>
      </transition>

      <!-- Detail Panel -->
      <transition name="slide-up">
        <div v-if="selectedItem" class="detail-panel">
          <button
            class="close-button"
            @click="selectedItem = null"
            aria-label="關閉"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div class="detail-content" @click.stop>
            <div class="detail-char">{{ selectedItem.hangul }}</div>
            
            <div class="detail-info">
              <div class="info-row">
                <span class="info-label">羅馬拼音</span>
                <span class="info-value">{{ selectedItem.romanization }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">中文發音</span>
                <span class="info-value">{{ selectedItem.chinese }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">發音說明</span>
                <span class="info-value">{{ selectedItem.pronunciation }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">範例</span>
                <span class="info-value">{{ selectedItem.example }}</span>
              </div>
            </div>

            <!-- Audio Player -->
            <div class="detail-audio">
              <AudioPlayerComponent
                v-if="selectedItem.hangul"
                :text="selectedItem.hangul"
                :auto-play="false"
                :show-controls="true"
              />
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AudioPlayerComponent from '../components/audio/AudioPlayerComponent.vue';
import { hangul40Data } from '@/data/hangul40';

interface HangulItem {
  id: string;
  hangul: string;
  romanization: string;
  chinese: string;
  pronunciation: string;
  example: string;
  type: string;
}

interface HangulSection {
  id: string;
  name: string;
  description: string;
  order: number;
  items: HangulItem[];
}

const router = useRouter();
const sections = ref<HangulSection[]>([]);
const currentSection = ref('basic-vowels');
const selectedItem = ref<HangulItem | null>(null);

const currentSectionData = computed(() => {
  return sections.value.find(s => s.id === currentSection.value);
});

const handleBack = () => {
  router.push('/');
};

const selectItem = (item: HangulItem) => {
  selectedItem.value = item;
};

// Load data
onMounted(async () => {
  try {
    sections.value = JSON.parse(JSON.stringify(hangul40Data.sections)) as HangulSection[];
  } catch (error) {
    console.error('Failed to load Hangul 40 data:', error);
  }
});
</script>

<style scoped>
.hangul40-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

/* --------------------------------------------------------
   Header
   -------------------------------------------------------- */

.hangul-header {
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

.back-icon {
  width: 20px;
  height: 20px;
}

.page-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.spacer {
  width: 80px;
}

/* --------------------------------------------------------
   Section Tabs
   -------------------------------------------------------- */

.section-tabs {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-divider);
  overflow-x: auto;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-divider);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  white-space: nowrap;
}

.tab-button:hover {
  background-color: var(--color-border);
}

.tab-button.is-active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary-light);
}

.tab-count {
  font-size: var(--text-xs);
  opacity: 0.8;
}

/* --------------------------------------------------------
   Main Content
   -------------------------------------------------------- */

.hangul-content {
  flex: 1;
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.section-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  text-align: center;
}

/* --------------------------------------------------------
   Hangul Grid
   -------------------------------------------------------- */

.hangul-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.hangul-card {
  background: var(--gradient-card);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.hangul-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.hangul-card.is-selected {
  background: var(--gradient-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.hangul-char {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  line-height: 1;
}

.hangul-roman {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.hangul-chinese {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

/* --------------------------------------------------------
   Detail Panel Overlay
   -------------------------------------------------------- */

.detail-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 99;
  cursor: pointer;
}

/* --------------------------------------------------------
   Detail Panel
   -------------------------------------------------------- */

.detail-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-elevated);
  border-top: 2px solid var(--color-primary);
  box-shadow: var(--shadow-xl);
  padding: var(--space-6);
  max-height: 60vh;
  overflow-y: auto;
  z-index: 100;
}

.close-button {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  background-color: var(--color-divider);
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-colors);
}

.close-button:hover {
  background-color: var(--color-border);
}

.close-button svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-primary);
}

.detail-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.detail-char {
  font-family: var(--font-display);
  font-size: 6rem;
  font-weight: var(--font-bold);
  color: var(--color-primary);
  text-align: center;
  line-height: 1;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.info-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  text-align: right;
}

.detail-audio {
  display: flex;
  justify-content: center;
}

/* --------------------------------------------------------
   Transitions
   -------------------------------------------------------- */

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform var(--duration-base) var(--ease-out);
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

/* --------------------------------------------------------
   Responsive
   -------------------------------------------------------- */

@media (max-width: 640px) {
  .hangul-header {
    padding: var(--space-3) var(--space-4);
  }

  .back-button span {
    display: none;
  }

  .page-title {
    font-size: var(--text-lg);
  }

  .section-tabs {
    padding: var(--space-3) var(--space-4);
    gap: var(--space-2);
  }

  .tab-button {
    padding: var(--space-2) var(--space-4);
    font-size: 0.75rem;
  }

  .hangul-content {
    padding: var(--space-4);
  }

  .hangul-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--space-3);
  }

  .hangul-card {
    padding: var(--space-4);
  }

  .hangul-char {
    font-size: 2rem;
  }

  .detail-panel {
    padding: var(--space-4);
  }

  .detail-char {
    font-size: 4rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .info-value {
    text-align: left;
  }
}

  @media (prefers-reduced-motion: reduce) {
  .hangul-card:hover {
    transform: none;
  }

  .fade-enter-active,
  .fade-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
