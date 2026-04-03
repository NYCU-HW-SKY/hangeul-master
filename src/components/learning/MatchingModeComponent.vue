<template>
  <div class="matching-mode">
    <!-- Header with Progress -->
    <div class="matching-header">
      <div class="progress-info">
        <span class="progress-text">已配對：{{ matchedCount }}/{{ totalPairs }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
            role="progressbar"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
      <div class="stats-info">
        <span class="stats-text">嘗試次數：{{ attemptCount }}</span>
        <span class="stats-text">時間：{{ elapsedTimeFormatted }}</span>
      </div>
    </div>

    <!-- Matching Grid -->
    <div class="matching-content">
      <div class="matching-grid">
        <!-- Korean Items (Left Column) -->
        <div class="items-column korean-column">
          <h3 class="column-title">韓文</h3>
          <div class="items-list" role="list" aria-label="韓文項目列表">
            <div
              v-for="(item, index) in koreanItems"
              :key="item.id"
              :data-id="item.id"
              class="match-item korean-item"
              :class="{
                'is-matched': item.isMatched,
                'is-dragging': draggedItem?.id === item.id,
                'is-drag-over': dragOverItem?.id === item.id,
                'is-selected': selectedKoreanItem?.id === item.id
              }"
              :draggable="!item.isMatched"
              @dragstart="handleDragStart($event, item)"
              @dragend="handleDragEnd"
              @touchstart="handleTouchStart($event, item)"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @click="handleKeyboardSelect(item, 'korean')"
              @keydown.enter="handleKeyboardSelect(item, 'korean')"
              @keydown.space.prevent="handleKeyboardSelect(item, 'korean')"
              @keydown.arrow-down.prevent="focusNextItem('korean', index)"
              @keydown.arrow-up.prevent="focusPreviousItem('korean', index)"
              @keydown.arrow-right.prevent="focusFirstChineseItem"
              :aria-label="`韓文項目 ${index + 1}：${item.text}${item.isMatched ? '，已配對' : ''}${selectedKoreanItem?.id === item.id ? '，已選擇' : ''}`"
              :aria-grabbed="selectedKoreanItem?.id === item.id && !item.isMatched"
              :aria-disabled="item.isMatched"
              role="button"
              tabindex="0"
            >
              <span class="item-text">{{ item.text }}</span>
              <span v-if="item.isMatched" class="check-icon" aria-hidden="true">✓</span>
            </div>
          </div>
        </div>

        <!-- Chinese Items (Right Column) -->
        <div class="items-column chinese-column">
          <h3 class="column-title">中文</h3>
          <div class="items-list" role="list" aria-label="中文項目列表">
            <div
              v-for="(item, index) in chineseItems"
              :key="item.id"
              :data-id="item.id"
              class="match-item chinese-item"
              :class="{
                'is-matched': item.isMatched,
                'is-drop-target': draggedItem && !item.isMatched,
                'is-drag-over': dragOverItem?.id === item.id,
                'is-selected': selectedChineseItem?.id === item.id
              }"
              @dragover="handleDragOver($event, item)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, item)"
              @touchstart="handleTouchStart($event, item)"
              @click="handleKeyboardSelect(item, 'chinese')"
              @keydown.enter="handleKeyboardSelect(item, 'chinese')"
              @keydown.space.prevent="handleKeyboardSelect(item, 'chinese')"
              @keydown.arrow-down.prevent="focusNextItem('chinese', index)"
              @keydown.arrow-up.prevent="focusPreviousItem('chinese', index)"
              @keydown.arrow-left.prevent="focusFirstKoreanItem"
              :aria-label="`中文項目 ${index + 1}：${item.text}${item.isMatched ? '，已配對' : ''}${selectedChineseItem?.id === item.id ? '，已選擇' : ''}`"
              :aria-dropeffect="!item.isMatched && selectedKoreanItem ? 'move' : 'none'"
              :aria-disabled="item.isMatched"
              role="button"
              tabindex="0"
            >
              <span class="item-text">{{ item.text }}</span>
              <span v-if="item.isMatched" class="check-icon" aria-hidden="true">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completion Celebration -->
    <Transition name="celebration">
      <div v-if="isComplete" class="celebration-overlay" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="celebration-content">
          <h2 class="celebration-title">🎉 完成！</h2>
          <div class="celebration-stats">
            <p class="stat-item">完成時間：{{ completionTimeFormatted }}</p>
            <p class="stat-item">嘗試次數：{{ attemptCount }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { MatchItem, MatchingResult } from '@/types/learningMode';
import { useLearningModeStore } from '@/stores/learningMode';
import { useToast } from '@/composables/useToast';

interface Props {
  pairCount?: number;
}

interface Emits {
  (e: 'matching-complete', result: MatchingResult): void;
  (e: 'matching-exit'): void;
}

const props = withDefaults(defineProps<Props>(), {
  pairCount: 6,
});

const emit = defineEmits<Emits>();

// Composables
const learningModeStore = useLearningModeStore();
const toast = useToast();

// State
const koreanItems = ref<MatchItem[]>([]);
const chineseItems = ref<MatchItem[]>([]);
const draggedItem = ref<MatchItem | null>(null);
const dragOverItem = ref<MatchItem | null>(null);
const attemptCount = ref(0);
const startTime = ref(0);
const elapsedTime = ref(0);
const isComplete = ref(false);
const completionTime = ref(0);
const timerInterval = ref<number | null>(null);

// Touch state
const touchStartItem = ref<MatchItem | null>(null);
const touchStartPos = ref<{ x: number; y: number } | null>(null);

// Keyboard navigation state
const selectedKoreanItem = ref<MatchItem | null>(null);
const selectedChineseItem = ref<MatchItem | null>(null);

// Computed
const matchedCount = computed(() => {
  return koreanItems.value.filter(item => item.isMatched).length;
});

const totalPairs = computed(() => {
  return koreanItems.value.length;
});

const progressPercentage = computed(() => {
  if (totalPairs.value === 0) return 0;
  return Math.round((matchedCount.value / totalPairs.value) * 100);
});

const elapsedTimeFormatted = computed(() => {
  return formatTime(elapsedTime.value);
});

const completionTimeFormatted = computed(() => {
  return formatTime(completionTime.value);
});

// Methods
function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  startTime.value = Date.now();
  timerInterval.value = window.setInterval(() => {
    elapsedTime.value = Date.now() - startTime.value;
  }, 100);
}

function stopTimer() {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function initializeMatching() {
  try {
    // Start matching session in store
    learningModeStore.startMatchingSession(props.pairCount);
    
    // Generate matching pairs
    const pairs = learningModeStore.generateMatchingPairs();
    
    // Extract Korean and Chinese items
    koreanItems.value = pairs.map(pair => pair.koreanItem);
    
    // Shuffle Chinese items for the right column
    chineseItems.value = shuffleArray(pairs.map(pair => pair.chineseItem));
    
    // Start timer
    startTimer();
  } catch (error) {
    console.error('[MatchingMode] Failed to initialize:', error);
    toast.error('初始化配對模式失敗，請重試');
  }
}

// Drag and Drop Handlers (Mouse)
function handleDragStart(event: DragEvent, item: MatchItem) {
  if (item.isMatched) return;
  
  draggedItem.value = item;
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.id);
  }
}

function handleDragEnd() {
  draggedItem.value = null;
  dragOverItem.value = null;
}

function handleDragOver(event: DragEvent, item: MatchItem) {
  if (!draggedItem.value || item.isMatched) return;
  
  event.preventDefault();
  
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  
  dragOverItem.value = item;
}

function handleDragLeave() {
  dragOverItem.value = null;
}

function handleDrop(event: DragEvent, targetItem: MatchItem) {
  event.preventDefault();
  
  if (!draggedItem.value || targetItem.isMatched) return;
  
  dragOverItem.value = null;
  
  // Check if it's a valid match
  checkMatch(draggedItem.value, targetItem);
  
  draggedItem.value = null;
}

// Touch Handlers (Mobile)
function handleTouchStart(event: TouchEvent, item: MatchItem) {
  if (item.isMatched) return;
  
  const touch = event.touches[0];
  touchStartItem.value = item;
  touchStartPos.value = { x: touch.clientX, y: touch.clientY };
  
  // Prevent default to avoid scrolling
  event.preventDefault();
}

function handleTouchMove(event: TouchEvent) {
  if (!touchStartItem.value) return;
  
  event.preventDefault();
  
  const touch = event.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Find if we're over a Chinese item
  const chineseItemElement = element?.closest('.chinese-item');
  if (chineseItemElement) {
    const itemId = chineseItemElement.getAttribute('data-id');
    const targetItem = chineseItems.value.find(item => item.id === itemId);
    if (targetItem && !targetItem.isMatched) {
      dragOverItem.value = targetItem;
    }
  } else {
    dragOverItem.value = null;
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!touchStartItem.value) return;
  
  event.preventDefault();
  
  const touch = event.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Find if we dropped on a Chinese item
  const chineseItemElement = element?.closest('.chinese-item');
  if (chineseItemElement) {
    const itemId = chineseItemElement.getAttribute('data-id');
    const targetItem = chineseItems.value.find(item => item.id === itemId);
    
    if (targetItem && !targetItem.isMatched) {
      checkMatch(touchStartItem.value, targetItem);
    }
  }
  
  // Reset touch state
  touchStartItem.value = null;
  touchStartPos.value = null;
  dragOverItem.value = null;
}

function checkMatch(sourceItem: MatchItem, targetItem: MatchItem) {
  // Increment attempt count
  attemptCount.value++;
  
  // Check match using store
  const isCorrect = learningModeStore.checkMatch(sourceItem.id, targetItem.id);
  
  if (isCorrect) {
    // Match is correct
    sourceItem.isMatched = true;
    targetItem.isMatched = true;
    
    // Show success feedback
    showMatchFeedback(sourceItem, targetItem, true);
    
    // Check if all pairs are matched
    if (learningModeStore.isMatchingComplete()) {
      completeMatching();
    }
  } else {
    // Match is incorrect
    showMatchFeedback(sourceItem, targetItem, false);
  }
}

function showMatchFeedback(sourceItem: MatchItem, targetItem: MatchItem, isCorrect: boolean) {
  if (isCorrect) {
    // Success animation - items fade and become semi-transparent
    const sourceElement = document.querySelector(`[data-id="${sourceItem.id}"]`);
    const targetElement = document.querySelector(`[data-id="${targetItem.id}"]`);
    
    if (sourceElement && targetElement) {
      sourceElement.classList.add('match-success');
      targetElement.classList.add('match-success');
    }
  } else {
    // Error animation - shake
    const sourceElement = document.querySelector(`[data-id="${sourceItem.id}"]`);
    const targetElement = document.querySelector(`[data-id="${targetItem.id}"]`);
    
    if (sourceElement && targetElement) {
      sourceElement.classList.add('match-error');
      targetElement.classList.add('match-error');
      
      // Remove error class after animation
      setTimeout(() => {
        sourceElement.classList.remove('match-error');
        targetElement.classList.remove('match-error');
      }, 500);
    }
  }
}

function completeMatching() {
  stopTimer();
  completionTime.value = elapsedTime.value;
  isComplete.value = true;
  
  // End matching session in store
  const result = learningModeStore.endMatchingSession();
  
  // Emit completion event after a delay to show celebration
  setTimeout(() => {
    emit('matching-complete', result);
  }, 3000);
}

// Keyboard Navigation Handlers
function handleKeyboardSelect(item: MatchItem, type: 'korean' | 'chinese') {
  if (item.isMatched) return;
  
  if (type === 'korean') {
    // Select Korean item
    selectedKoreanItem.value = item;
    selectedChineseItem.value = null;
  } else {
    // Select Chinese item and attempt match if Korean item is selected
    if (selectedKoreanItem.value && !selectedKoreanItem.value.isMatched) {
      checkMatch(selectedKoreanItem.value, item);
      selectedKoreanItem.value = null;
      selectedChineseItem.value = null;
    } else {
      selectedChineseItem.value = item;
      selectedKoreanItem.value = null;
    }
  }
}

function focusNextItem(type: 'korean' | 'chinese', currentIndex: number) {
  const items = type === 'korean' ? koreanItems.value : chineseItems.value;
  const nextIndex = currentIndex + 1;
  
  if (nextIndex < items.length) {
    const nextElement = document.querySelector(
      `.${type}-item[data-id="${items[nextIndex].id}"]`
    ) as HTMLElement;
    nextElement?.focus();
  }
}

function focusPreviousItem(type: 'korean' | 'chinese', currentIndex: number) {
  const items = type === 'korean' ? koreanItems.value : chineseItems.value;
  const prevIndex = currentIndex - 1;
  
  if (prevIndex >= 0) {
    const prevElement = document.querySelector(
      `.${type}-item[data-id="${items[prevIndex].id}"]`
    ) as HTMLElement;
    prevElement?.focus();
  }
}

function focusFirstChineseItem() {
  if (chineseItems.value.length > 0) {
    const firstElement = document.querySelector(
      `.chinese-item[data-id="${chineseItems.value[0].id}"]`
    ) as HTMLElement;
    firstElement?.focus();
  }
}

function focusFirstKoreanItem() {
  if (koreanItems.value.length > 0) {
    const firstElement = document.querySelector(
      `.korean-item[data-id="${koreanItems.value[0].id}"]`
    ) as HTMLElement;
    firstElement?.focus();
  }
}

// Lifecycle
onMounted(() => {
  initializeMatching();
});

onUnmounted(() => {
  stopTimer();
  learningModeStore.clearSession();
});
</script>

<style scoped>
/* --------------------------------------------------------
   Matching Mode Container - 戰神風格
   -------------------------------------------------------- */

.matching-mode {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

/* --------------------------------------------------------
   Header - 進度和統計
   -------------------------------------------------------- */

.matching-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.progress-text {
  font-size: var(--text-sm);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width var(--duration-base) var(--ease-out);
  border-radius: var(--radius-sm);
}

.stats-info {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
}

.stats-text {
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Matching Grid - 配對區域
   -------------------------------------------------------- */

.matching-content {
  padding: var(--space-6);
}

.matching-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.items-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.column-title {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  text-align: center;
  letter-spacing: 0.02em;
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-border);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* --------------------------------------------------------
   Match Items - 配對項目
   -------------------------------------------------------- */

.match-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
  border: 2px solid var(--color-border);
  letter-spacing: 0.02em;
  min-height: 60px;
  cursor: grab;
  user-select: none;
  touch-action: none;
}

.match-item:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(159, 197, 232, 0.3);
}

.match-item.is-dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.match-item.is-drag-over {
  border-color: var(--color-primary);
  background: var(--gradient-primary);
  transform: scale(1.02);
}

.match-item.is-drop-target:not(.is-matched) {
  border-color: var(--color-primary-light);
  background: linear-gradient(135deg, rgba(159, 197, 232, 0.1) 0%, rgba(159, 197, 232, 0.05) 100%);
}

.match-item.is-matched {
  opacity: 0.6;
  cursor: default;
  border-color: var(--color-success);
  background: linear-gradient(135deg, rgba(124, 179, 66, 0.2) 0%, rgba(90, 154, 58, 0.2) 100%);
}

.match-item.is-selected {
  border-color: var(--color-accent);
  background: var(--gradient-accent);
  box-shadow: var(--shadow-lg), 0 0 0 2px rgba(207, 102, 121, 0.3);
}

.match-item.match-success {
  animation: matchSuccess 0.6s var(--ease-out);
}

.match-item.match-error {
  animation: matchError 0.5s var(--ease-out);
}

@keyframes matchSuccess {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(124, 179, 66, 0.6);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes matchError {
  0%, 100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-10px);
  }
  30% {
    transform: translateX(10px);
  }
  45% {
    transform: translateX(-8px);
  }
  60% {
    transform: translateX(8px);
  }
  75% {
    transform: translateX(-4px);
  }
  90% {
    transform: translateX(4px);
  }
}

.item-text {
  flex: 1;
  font-size: var(--text-lg);
}

.check-icon {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-success);
}

/* --------------------------------------------------------
   Celebration Overlay - 完成慶祝
   -------------------------------------------------------- */

.celebration-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(13, 15, 18, 0.9);
  backdrop-filter: blur(8px);
  z-index: var(--z-modal);
}

.celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-12);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-primary);
  box-shadow: var(--shadow-2xl), var(--shadow-glow);
  animation: celebrationBounce 0.8s var(--ease-spring);
}

@keyframes celebrationBounce {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.celebration-title {
  font-size: var(--text-5xl);
  font-family: var(--font-display);
  font-weight: var(--font-black);
  color: var(--color-text-primary);
  text-align: center;
  letter-spacing: 0.02em;
  animation: victoryPulse 1s var(--ease-in-out) infinite;
}

@keyframes victoryPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.celebration-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  text-align: center;
}

.stat-item {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Celebration Transition
   -------------------------------------------------------- */

.celebration-enter-active {
  transition: opacity var(--duration-slow) var(--ease-out);
}

.celebration-leave-active {
  transition: opacity var(--duration-base) var(--ease-in);
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .match-item,
  .progress-fill {
    transition-duration: 0.01ms;
  }

  .match-item.match-success,
  .match-item.match-error,
  .celebration-content,
  .celebration-title {
    animation: none;
  }

  .match-item:not(.is-matched):hover {
    transform: none;
  }
}

/* --------------------------------------------------------
   Touch Device Support
   -------------------------------------------------------- */

@media (hover: none) {
  /* Remove hover effects on touch devices */
  .match-item:not(.is-matched):hover {
    transform: none;
    box-shadow: var(--shadow-md);
  }
  
  /* Ensure touch targets are large enough */
  .match-item {
    min-width: 44px;
    min-height: 50px;
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile devices (≤640px) - Single column layout */
@media (max-width: 640px) {
  .matching-mode {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .matching-header {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .progress-text,
  .stats-text {
    font-size: var(--text-xs);
  }

  .stats-info {
    flex-direction: column;
    gap: var(--space-2);
  }

  .matching-content {
    padding: var(--space-4);
  }

  .matching-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .column-title {
    font-size: var(--text-lg);
  }

  .match-item {
    padding: var(--space-4) var(--space-5);
    font-size: var(--text-base);
    /* Ensure minimum touch target size of 44x44px */
    min-height: 50px;
    min-width: 44px;
  }

  .item-text {
    font-size: var(--text-base);
  }

  .check-icon {
    font-size: var(--text-xl);
  }

  .celebration-content {
    padding: var(--space-8);
    margin: var(--space-4);
  }

  .celebration-title {
    font-size: var(--text-3xl);
  }

  .stat-item {
    font-size: var(--text-lg);
  }
}

/* Tablet devices (641px - 1023px) - Appropriate spacing */
@media (min-width: 641px) and (max-width: 1023px) {
  .matching-mode {
    padding: var(--space-5);
    gap: var(--space-7);
  }

  .matching-header {
    padding: var(--space-5);
  }

  .matching-content {
    padding: var(--space-5);
  }

  .matching-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  .match-item {
    /* Ensure minimum touch target size of 44x44px */
    min-height: 56px;
    min-width: 44px;
  }

  .celebration-content {
    padding: var(--space-10);
  }
}

/* Desktop devices (≥1024px) - Optimized layout */
@media (min-width: 1024px) {
  .matching-mode {
    padding: var(--space-6);
    gap: var(--space-8);
  }

  .matching-header {
    padding: var(--space-6);
  }

  .matching-content {
    padding: var(--space-6);
  }

  .matching-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-8);
  }

  .match-item {
    min-height: 60px;
  }

  /* Hover effects only on desktop */
  .match-item:not(.is-matched):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }

  .celebration-content {
    padding: var(--space-12);
  }
}

/* Landscape orientation on mobile - adjust grid */
@media (max-width: 768px) and (orientation: landscape) {
  .matching-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}
</style>
