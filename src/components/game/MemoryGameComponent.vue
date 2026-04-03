<template>
  <div class="memory-game">
    <!-- Game Grid -->
    <div 
      class="game-grid" 
      :class="`grid-${gridSize}`"
      role="grid"
      aria-label="記憶遊戲卡片網格"
    >
      <button
        v-for="card in shuffledCards"
        :key="card.id"
        v-memo="[card.id, card.isFlipped, card.isMatched, isChecking && flippedCards.includes(card.id)]"
        class="memory-card"
        :class="{
          'is-flipped': card.isFlipped,
          'is-matched': card.isMatched,
          'is-checking': isChecking && flippedCards.includes(card.id)
        }"
        @click="handleCardClick(card)"
        :disabled="isChecking || card.isFlipped || card.isMatched"
        :aria-label="`卡片 ${card.id}`"
        :aria-pressed="card.isFlipped"
        type="button"
      >
        <!-- Card Inner (for 3D flip) -->
        <div class="card-inner">
          <!-- Card Back (Korean Pattern) -->
          <div class="card-face card-back">
            <div class="magazine-cover">
              <div class="cover-headline">HAN GUL</div>
              <div class="cover-subtitle">KOREAN VOCAB</div>
              <div class="korean-pattern"></div>
              <div class="cover-issue">ISSUE {{ card.id.slice(-2).toUpperCase() }}</div>
            </div>
          </div>

          <!-- Card Front (Content) -->
          <div class="card-face card-front">
            <span class="card-content" :class="`text-${card.type}`">
              {{ card.content }}
            </span>
          </div>
        </div>
      </button>
    </div>

    <!-- Completion Celebration -->
    <Transition name="celebration">
      <div v-if="gameCompleted" class="celebration-overlay" role="alert" aria-live="polite">
        <div class="celebration-content">
          <div class="confetti-container" aria-hidden="true">
            <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
          </div>
          <h2 class="celebration-title">🎉 恭喜完成！</h2>
          <p class="celebration-message">你用了 {{ moves }} 步完成遊戲</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';

interface Card {
  id: string;
  korean: string;
  chinese: string;
}

interface MemoryCard {
  id: string;
  flashcardId: string;
  type: 'korean' | 'chinese';
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  cards: Card[];
  gridSize?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  gridSize: 'medium',
});

// Emits
interface Emits {
  (e: 'game-complete', moves: number): void;
  (e: 'move-made', moves: number): void;
  (e: 'matched-pairs-update', count: number): void;
}

const emit = defineEmits<Emits>();

// Internal state
const shuffledCards = ref<MemoryCard[]>([]);
const flippedCards = ref<string[]>([]);
const matchedPairs = ref<string[]>([]);
const moves = ref(0);
const isChecking = ref(false);
const gameCompleted = ref(false);
const checkTimeoutId = ref<number | null>(null);

// Computed
const totalPairs = computed(() => props.cards.length);

// Initialize game
const initializeGame = () => {
  if (checkTimeoutId.value !== null) {
    window.clearTimeout(checkTimeoutId.value);
    checkTimeoutId.value = null;
  }

  // Create pairs: each card has Korean and Chinese version
  const pairs: MemoryCard[] = [];
  
  props.cards.forEach((card, index) => {
    const normalizedCardId = String(card.id ?? index);
    const pairId = `pair-${normalizedCardId}`;
    
    // Korean card
    pairs.push({
      id: `${normalizedCardId}-korean`,
      flashcardId: normalizedCardId,
      type: 'korean',
      content: card.korean,
      pairId,
      isFlipped: false,
      isMatched: false,
    });
    
    // Chinese card
    pairs.push({
      id: `${normalizedCardId}-chinese`,
      flashcardId: normalizedCardId,
      type: 'chinese',
      content: card.chinese,
      pairId,
      isFlipped: false,
      isMatched: false,
    });
  });
  
  // Shuffle cards randomly
  shuffledCards.value = shuffleArray(pairs);
  flippedCards.value = [];
  matchedPairs.value = [];
  moves.value = 0;
  isChecking.value = false;
  gameCompleted.value = false;
  
  // Emit initial matched pairs count
  emit('matched-pairs-update', 0);
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Handle card click
const handleCardClick = (card: MemoryCard) => {
  // Prevent flipping if checking, already flipped, or matched
  if (isChecking.value || card.isFlipped || card.isMatched) {
    return;
  }
  
  // Prevent flipping more than 2 cards
  if (flippedCards.value.length >= 2) {
    return;
  }
  
  // Flip the card
  card.isFlipped = true;
  flippedCards.value.push(card.id);
  
  // Check for match when 2 cards are flipped
  if (flippedCards.value.length === 2) {
    moves.value++;
    emit('move-made', moves.value);
    checkMatch();
  }
};

// Check if two flipped cards match
const checkMatch = () => {
  isChecking.value = true;
  
  const [firstCardId, secondCardId] = flippedCards.value;
  const firstCard = shuffledCards.value.find(c => c.id === firstCardId);
  const secondCard = shuffledCards.value.find(c => c.id === secondCardId);
  
  if (!firstCard || !secondCard) {
    isChecking.value = false;
    return;
  }
  
  // Delay to show the cards before checking
  checkTimeoutId.value = window.setTimeout(() => {
    const currentFirstCard = shuffledCards.value.find(c => c.id === firstCardId);
    const currentSecondCard = shuffledCards.value.find(c => c.id === secondCardId);

    if (!currentFirstCard || !currentSecondCard) {
      flippedCards.value = [];
      isChecking.value = false;
      checkTimeoutId.value = null;
      return;
    }

    if (currentFirstCard.pairId === currentSecondCard.pairId) {
      // Match success!
      currentFirstCard.isMatched = true;
      currentSecondCard.isMatched = true;
      matchedPairs.value.push(currentFirstCard.pairId);
      
      // Emit matched pairs count update
      emit('matched-pairs-update', matchedPairs.value.length);
      
      // Check if game is completed
      if (matchedPairs.value.length === totalPairs.value) {
        gameCompleted.value = true;
        emit('game-complete', moves.value);
      }
    } else {
      // No match - flip back
      currentFirstCard.isFlipped = false;
      currentSecondCard.isFlipped = false;
    }
    
    // Reset flipped cards
    flippedCards.value = [];
    isChecking.value = false;
    checkTimeoutId.value = null;
  }, 1000);
};

// Confetti style generator - 戰神配色
const getConfettiStyle = (index: number) => {
  const colors = ['#9fc5e8', '#c1440e', '#d4af37', '#6fa8dc', '#e06c3a'];
  const randomColor = colors[index % colors.length];
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  const randomDuration = 2 + Math.random() * 2;
  
  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
  };
};

// Watch for cards prop changes to reinitialize game
watch(() => props.cards, () => {
  initializeGame();
}, { immediate: true });

onBeforeUnmount(() => {
  if (checkTimeoutId.value !== null) {
    window.clearTimeout(checkTimeoutId.value);
    checkTimeoutId.value = null;
  }
});
</script>

<style scoped>
/* --------------------------------------------------------
   Memory Game Container - 戰神風格
   -------------------------------------------------------- */

.memory-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-6);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: 
    radial-gradient(
      circle at 50% 0%,
      rgba(159, 197, 232, 0.05) 0%,
      transparent 50%
    ),
    linear-gradient(
      135deg,
      var(--color-background) 0%,
      var(--color-background-alt) 50%,
      var(--color-background) 100%
    );
  border-radius: var(--radius-lg);
}

/* --------------------------------------------------------
   Game Stats - 戰神風格
   -------------------------------------------------------- */

.game-stats {
  display: flex;
  gap: var(--space-8);
  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  position: relative;
}

/* 符文裝飾 */
.game-stats::before {
  content: '◈';
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  font-size: var(--text-sm);
  opacity: 0.5;
}

.game-stats::after {
  content: '◈';
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  font-size: var(--text-sm);
  opacity: 0.5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: 0 var(--space-4);
}

.stat-label {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.stat-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  color: var(--color-primary);
  font-weight: var(--font-bold);
  text-shadow: 0 2px 8px rgba(159, 197, 232, 0.4);
}

/* --------------------------------------------------------
   Game Grid Layout
   -------------------------------------------------------- */

.game-grid {
  display: grid;
  gap: var(--space-3);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

/* Grid sizes */
.grid-small {
  grid-template-columns: repeat(4, 1fr);
  /* 4x2 = 8 cards (4 pairs) */
}

.grid-medium {
  grid-template-columns: repeat(4, 1fr);
  /* 4x3 = 12 cards (6 pairs) */
}

.grid-large {
  grid-template-columns: repeat(4, 1fr);
  /* 4x4 = 16 cards (8 pairs) */
}

@media (max-width: 640px) {
  .memory-game {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .game-grid {
    gap: var(--space-2);
    max-width: 100%;
  }
  
  .grid-small,
  .grid-medium,
  .grid-large {
    grid-template-columns: repeat(3, 1fr);
  }

  .card-content.text-korean {
    font-size: var(--text-xl);
  }

  .card-content.text-chinese {
    font-size: var(--text-base);
  }

  .cover-headline {
    font-size: 0.625rem;
  }

  .celebration-content {
    padding: var(--space-8) var(--space-6);
    margin: var(--space-4);
    max-width: 320px;
  }

  .celebration-title {
    font-size: var(--text-3xl);
  }

  .celebration-message {
    font-size: var(--text-base);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .memory-game {
    max-width: 550px;
  }

  .game-grid {
    gap: var(--space-3);
    max-width: 500px;
  }

  .grid-small {
    grid-template-columns: repeat(4, 1fr);
  }

  .grid-medium,
  .grid-large {
    grid-template-columns: repeat(4, 1fr);
  }

  .card-content.text-korean {
    font-size: var(--text-2xl);
  }

  .card-content.text-chinese {
    font-size: var(--text-lg);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .memory-game {
    padding: var(--space-8);
    gap: var(--space-10);
    max-width: 650px;
  }

  .game-grid {
    gap: var(--space-4);
    max-width: 600px;
  }

  .grid-small,
  .grid-medium,
  .grid-large {
    grid-template-columns: repeat(4, 1fr);
  }

  .card-content.text-korean {
    font-size: var(--text-3xl);
  }

  .card-content.text-chinese {
    font-size: var(--text-xl);
  }
}

/* --------------------------------------------------------
   Memory Card - 戰神風格
   -------------------------------------------------------- */

.memory-card {
  position: relative;
  aspect-ratio: 3 / 4;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  transition: transform var(--duration-base) var(--ease-out);
  perspective: 1000px;
}

.memory-card:hover:not(:disabled) {
  transform: translateY(-3px);
}

.memory-card:hover:not(:disabled) .card-back {
  border-color: var(--color-primary);
  box-shadow: 
    inset 0 0 20px rgba(159, 197, 232, 0.05),
    0 6px 16px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(159, 197, 232, 0.2);
}

.memory-card:disabled {
  cursor: not-allowed;
}

.memory-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* --------------------------------------------------------
   Card Inner (3D Flip Container) - 戰神風格
   -------------------------------------------------------- */

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 350ms var(--ease-epic);
}

.memory-card.is-flipped .card-inner,
.memory-card.is-matched .card-inner {
  transform: rotateY(180deg);
}

/* --------------------------------------------------------
   Card Faces - 戰神風格
   -------------------------------------------------------- */

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  backface-visibility: hidden;
  box-shadow: var(--shadow-md);
}

.card-back {
  background: linear-gradient(135deg, #1a1d23 0%, #0d0f12 100%);
  border: 2px solid rgba(159, 197, 232, 0.3);
  transform: rotateY(0deg);
  box-shadow: 
    inset 0 0 20px rgba(159, 197, 232, 0.03),
    0 4px 12px rgba(0, 0, 0, 0.5);
}

.card-front {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid var(--color-primary);
  transform: rotateY(180deg);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(159, 197, 232, 0.2);
  position: relative;
  overflow: hidden;
}

/* 簡潔的角落裝飾 */
.card-front::before,
.card-front::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 1.5px solid var(--color-primary);
  opacity: 0.6;
}

.card-front::before {
  top: var(--space-2);
  left: var(--space-2);
  border-right: none;
  border-bottom: none;
}

.card-front::after {
  bottom: var(--space-2);
  right: var(--space-2);
  border-left: none;
  border-top: none;
}

/* --------------------------------------------------------
   Minimalist Card Back - 戰神風格
   -------------------------------------------------------- */

.magazine-cover {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, #1a1d23 0%, #0d0f12 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 中央符文 */
.magazine-cover::after {
  content: '◈';
  font-size: var(--text-5xl);
  color: var(--color-primary);
  opacity: 0.2;
  text-shadow: 0 0 20px rgba(159, 197, 232, 0.3);
}

.cover-headline {
  display: none;
}

.cover-subtitle {
  display: none;
}

.korean-pattern {
  display: none;
}

.cover-issue {
  display: none;
}

/* --------------------------------------------------------
   Card Content - 戰神風格
   -------------------------------------------------------- */

.card-content {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: #1a1d24;
  text-align: center;
  word-break: break-word;
  line-height: 1.3;
  position: relative;
  z-index: 1;
  padding: var(--space-4);
}

.card-content.text-korean {
  font-family: var(--font-korean);
  color: var(--color-primary-dark);
  font-size: var(--text-3xl);
  font-weight: var(--font-black);
}

.card-content.text-chinese {
  font-family: var(--font-chinese);
  color: #2a2d35;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

/* --------------------------------------------------------
   Match Success Animation - Frost Glow Pulse (戰神風格)
   -------------------------------------------------------- */

.memory-card.is-matched .card-inner {
  animation: matchSuccess 600ms var(--ease-epic);
}

.memory-card.is-matched .card-front {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 25px rgba(159, 197, 232, 0.6);
  animation: frostGlowPulse 2s var(--ease-in-out) infinite;
  border-color: var(--color-primary-light);
}

@keyframes matchSuccess {
  0% {
    transform: rotateY(180deg) scale(1);
  }
  40% {
    transform: rotateY(180deg) scale(1.05);
  }
  100% {
    transform: rotateY(180deg) scale(1);
  }
}

@keyframes frostGlowPulse {
  0%, 100% {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 0 25px rgba(159, 197, 232, 0.6);
  }
  50% {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 0 35px rgba(159, 197, 232, 0.8);
  }
}

/* --------------------------------------------------------
   Match Fail Animation - Shake Effect (戰神風格)
   -------------------------------------------------------- */

.memory-card.is-checking:not(.is-matched) .card-inner {
  animation: matchFailShake 500ms var(--ease-in-out);
}

@keyframes matchFailShake {
  0%, 100% {
    transform: rotateY(180deg) translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: rotateY(180deg) translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: rotateY(180deg) translateX(8px);
  }
}

/* --------------------------------------------------------
   Celebration Overlay - 戰神風格
   -------------------------------------------------------- */

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(13, 15, 18, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  backdrop-filter: blur(8px);
}

.celebration-content {
  position: relative;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-elevated) 100%);
  padding: var(--space-12) var(--space-8);
  border: 2px solid var(--color-primary-dark);
  border-radius: var(--radius-lg);
  box-shadow: 
    var(--shadow-2xl),
    0 0 40px rgba(159, 197, 232, 0.3);
  text-align: center;
  max-width: 400px;
  animation: popIn var(--duration-slow) var(--ease-epic);
}

/* 符文角落裝飾 */
.celebration-content::before,
.celebration-content::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-primary);
}

.celebration-content::before {
  top: var(--space-3);
  left: var(--space-3);
  border-right: none;
  border-bottom: none;
}

.celebration-content::after {
  bottom: var(--space-3);
  right: var(--space-3);
  border-left: none;
  border-top: none;
}

.celebration-title {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-4);
  text-shadow: 0 4px 12px rgba(159, 197, 232, 0.5);
  letter-spacing: 0.05em;
}

.celebration-message {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
}

/* --------------------------------------------------------
   Confetti Animation - 戰神配色
   -------------------------------------------------------- */

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  border-radius: var(--radius-lg);
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -20px;
  animation: confettiFall linear forwards;
}

@keyframes confettiFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(500px) rotate(720deg);
    opacity: 0;
  }
}

/* --------------------------------------------------------
   Vue Transitions
   -------------------------------------------------------- */

.celebration-enter-active {
  transition: opacity var(--duration-base) var(--ease-out);
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
  .memory-card,
  .card-inner {
    transition-duration: 0.01ms;
  }

  .memory-card:hover:not(:disabled) {
    transform: none;
  }

  .memory-card.is-matched .card-inner,
  .memory-card.is-checking:not(.is-matched) .card-front,
  .confetti,
  .celebration-content {
    animation: none;
  }
}
</style>
