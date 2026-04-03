<template>
  <div class="listening-quiz">
    <!-- Quiz Header -->
    <div class="quiz-header">
      <div class="progress-info">
        <span class="progress-text">{{ currentQuestionNumber }}/{{ totalQuestions }}</span>
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
      <div class="score-info">
        <span class="score-text">正確率：{{ accuracyPercentage }}%</span>
      </div>
    </div>

    <!-- Audio Player Section -->
    <div class="audio-section">
      <button
        class="replay-button"
        @click="handleReplayAudio"
        @keydown.enter="handleReplayAudio"
        @keydown.space.prevent="handleReplayAudio"
        :disabled="isAnswerRevealed || isAudioPlaying"
        :aria-label="isAudioPlaying ? '音訊播放中' : '重播音訊'"
        :aria-disabled="isAnswerRevealed || isAudioPlaying"
        type="button"
        tabindex="0"
      >
        <svg 
          class="audio-icon" 
          :class="{ 'is-playing': isAudioPlaying }"
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
        <span class="button-text">{{ isAudioPlaying ? '播放中...' : '重播音訊' }}</span>
        <span v-if="!isAnswerRevealed && !isAudioPlaying" class="ripple"></span>
      </button>
    </div>

    <!-- Quiz Question Section -->
    <div class="quiz-content">
      <div 
        v-if="currentQuestion"
        class="options-grid"
        role="radiogroup"
        :aria-label="`選擇答案，共 ${currentQuestion.options.length} 個選項`"
        :aria-describedby="isAnswerRevealed ? 'feedback-section' : undefined"
      >
        <button
          v-for="(option, index) in currentQuestion.options"
          :key="option.id"
          class="quiz-option"
          :class="{
            'is-selected': selectedAnswer === option.text,
            'is-correct': isAnswerRevealed && option.isCorrect,
            'is-incorrect': isAnswerRevealed && selectedAnswer === option.text && !option.isCorrect,
            'is-disabled': isAnswerRevealed
          }"
          @click="handleSelectAnswer(option.text)"
          @keydown.enter="handleSelectAnswer(option.text)"
          @keydown.space.prevent="handleSelectAnswer(option.text)"
          :disabled="isAnswerRevealed"
          :aria-label="`選項 ${index + 1}：${option.text}${isAnswerRevealed && option.isCorrect ? '，正確答案' : ''}${isAnswerRevealed && selectedAnswer === option.text && !option.isCorrect ? '，錯誤答案' : ''}`"
          :aria-checked="selectedAnswer === option.text"
          :aria-disabled="isAnswerRevealed"
          role="radio"
          type="button"
          tabindex="0"
        >
          <span class="option-text">{{ option.text }}</span>
          <span v-if="isAnswerRevealed && option.isCorrect" class="check-icon" aria-hidden="true">✓</span>
          <span v-if="isAnswerRevealed && selectedAnswer === option.text && !option.isCorrect" class="cross-icon" aria-hidden="true">✗</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state" role="status" aria-live="polite">
        <p>載入題目中...</p>
      </div>
    </div>

    <!-- Feedback Section -->
    <div 
      v-if="isAnswerRevealed"
      id="feedback-section"
      class="feedback-section"
      :class="{ 'is-correct': isLastAnswerCorrect, 'is-incorrect': !isLastAnswerCorrect }"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <p class="feedback-text">
        {{ isLastAnswerCorrect ? '答對了！' : '答錯了！' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { QuizModeType, QuizQuestion } from '@/types/learningMode';
import { useLearningModeStore } from '@/stores/learningMode';
import { audioService } from '@/services/AudioService';
import { useToast } from '@/composables/useToast';

interface Props {
  mode: QuizModeType;
  totalQuestions?: number;
}

interface Emits {
  (e: 'quiz-complete', result: { score: number; accuracy: number }): void;
  (e: 'quiz-exit'): void;
  (e: 'answer-submitted', isCorrect: boolean): void;
  (e: 'next-question'): void;
}

const props = withDefaults(defineProps<Props>(), {
  totalQuestions: 10,
});

const emit = defineEmits<Emits>();

// Composables
const learningModeStore = useLearningModeStore();
const toast = useToast();

// State
const currentQuestion = ref<QuizQuestion | null>(null);
const selectedAnswer = ref<string | null>(null);
const isAnswerRevealed = ref(false);
const score = ref(0);
const questionIndex = ref(0);
const isAudioPlaying = ref(false);
const isLastAnswerCorrect = ref(false);
const autoAdvanceTimer = ref<number | null>(null);

// Computed
const currentQuestionNumber = computed(() => questionIndex.value + 1);

const progressPercentage = computed(() => {
  if (props.totalQuestions === 0) return 0;
  return Math.round((questionIndex.value / props.totalQuestions) * 100);
});

const accuracyPercentage = computed(() => {
  if (questionIndex.value === 0) return 0;
  return Math.round((score.value / questionIndex.value) * 100);
});

// Methods
async function playAudio(text: string, mode: QuizModeType) {
  if (!text) return;
  
  isAudioPlaying.value = true;
  
  try {
    // Determine which language to speak based on mode
    if (mode === 'chinese-to-korean') {
      // Play Chinese audio
      await audioService.speakChinese(text, 'normal');
    } else {
      // Play Korean audio (for korean-to-chinese and korean-to-korean)
      await audioService.speakKorean(text, 'normal');
    }
  } catch (error) {
    console.error('[ListeningQuiz] Audio playback failed:', error);
    toast.warning('音訊播放失敗，請查看文字內容');
  } finally {
    isAudioPlaying.value = false;
  }
}

async function handleReplayAudio() {
  if (!currentQuestion.value || isAnswerRevealed.value || isAudioPlaying.value) return;
  
  await playAudio(currentQuestion.value.audioText, currentQuestion.value.mode);
}

function handleSelectAnswer(answer: string) {
  if (isAnswerRevealed.value || !currentQuestion.value) return;
  
  selectedAnswer.value = answer;
  isAnswerRevealed.value = true;
  
  // Use store's submitAnswer method to check answer and update score
  const isCorrect = learningModeStore.submitAnswer(answer);
  isLastAnswerCorrect.value = isCorrect;
  
  // Update local score from store
  if (learningModeStore.quizSession) {
    score.value = learningModeStore.quizSession.score;
  }
  
  emit('answer-submitted', isCorrect);
  
  // Auto-advance to next question after 1.5 seconds
  autoAdvanceTimer.value = window.setTimeout(() => {
    advanceToNextQuestion();
  }, 1500);
}

function advanceToNextQuestion() {
  // Clear timer
  if (autoAdvanceTimer.value !== null) {
    clearTimeout(autoAdvanceTimer.value);
    autoAdvanceTimer.value = null;
  }
  
  // Check if quiz is complete
  if (questionIndex.value + 1 >= props.totalQuestions) {
    completeQuiz();
    return;
  }
  
  // Update store's question index
  learningModeStore.nextQuestion();
  
  // Reset state for next question
  questionIndex.value++;
  selectedAnswer.value = null;
  isAnswerRevealed.value = false;
  isLastAnswerCorrect.value = false;
  
  emit('next-question');
  
  // Load next question
  loadNextQuestion();
}

async function loadNextQuestion() {
  try {
    // Generate new question from store
    const question = learningModeStore.generateQuizQuestion();
    currentQuestion.value = question;
    
    // Add question to the session's questions array
    if (learningModeStore.quizSession) {
      learningModeStore.quizSession.questions.push(question);
    }
    
    // Automatically play audio when question loads
    await playAudio(question.audioText, question.mode);
  } catch (error) {
    console.error('[ListeningQuiz] Failed to load question:', error);
    toast.error('載入題目失敗，請重試');
  }
}

function completeQuiz() {
  const accuracy = props.totalQuestions > 0 
    ? (score.value / props.totalQuestions) * 100 
    : 0;
  
  emit('quiz-complete', {
    score: score.value,
    accuracy,
  });
}

// Lifecycle
onMounted(async () => {
  // Initialize quiz session in store
  try {
    learningModeStore.startQuizSession(props.mode, props.totalQuestions);
    await loadNextQuestion();
  } catch (error) {
    console.error('[ListeningQuiz] Failed to initialize quiz:', error);
    toast.error('初始化測驗失敗，請重試');
  }
});

onUnmounted(() => {
  // Clean up timer
  if (autoAdvanceTimer.value !== null) {
    clearTimeout(autoAdvanceTimer.value);
  }
  
  // Stop any playing audio
  audioService.stop();
});

// Watch for mode changes
watch(() => props.mode, async () => {
  // Reset quiz when mode changes
  questionIndex.value = 0;
  score.value = 0;
  selectedAnswer.value = null;
  isAnswerRevealed.value = false;
  
  try {
    learningModeStore.startQuizSession(props.mode, props.totalQuestions);
    await loadNextQuestion();
  } catch (error) {
    console.error('[ListeningQuiz] Failed to restart quiz:', error);
    toast.error('重新開始測驗失敗，請重試');
  }
});
</script>

<style scoped>
/* --------------------------------------------------------
   Listening Quiz Container - 戰神風格
   -------------------------------------------------------- */

.listening-quiz {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

/* --------------------------------------------------------
   Quiz Header - 進度和分數顯示
   -------------------------------------------------------- */

.quiz-header {
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

.score-info {
  display: flex;
  justify-content: flex-end;
}

.score-text {
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Audio Section - 戰神風格音訊播放器
   -------------------------------------------------------- */

.audio-section {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.replay-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-8);
  background: var(--gradient-accent);
  color: var(--color-text-primary);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-family: var(--font-display);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
  transition: all var(--duration-base) var(--ease-out);
  border: 2px solid var(--color-accent-dark);
  letter-spacing: 0.02em;
  will-change: transform;
  overflow: visible;
}

.replay-button:active:not(:disabled) {
  transform: translateY(0);
}

.replay-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replay-button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(207, 102, 121, 0.3);
}

.audio-icon {
  width: 24px;
  height: 24px;
  transition: transform var(--duration-base) var(--ease-out);
}

.audio-icon.is-playing {
  animation: audioPlaying 1s var(--ease-in-out) infinite;
}

@keyframes audioPlaying {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.button-text {
  font-size: var(--text-base);
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
   Quiz Content - 選項網格
   -------------------------------------------------------- */

.quiz-content {
  padding: var(--space-6);
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 641px) {
  .options-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.quiz-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-6);
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
  min-height: 80px;
  cursor: pointer;
  will-change: transform;
}

.quiz-option:active:not(:disabled) {
  transform: translateY(0);
}

.quiz-option:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(159, 197, 232, 0.3);
}

.quiz-option.is-selected {
  border-color: var(--color-primary);
  background: var(--gradient-primary);
}

.quiz-option.is-correct {
  border-color: var(--color-success);
  background: linear-gradient(135deg, var(--color-success) 0%, #5a9a3a 100%);
  animation: correctPulse 0.5s var(--ease-out);
}

.quiz-option.is-incorrect {
  border-color: var(--color-error);
  background: linear-gradient(135deg, var(--color-error) 0%, #a83232 100%);
  animation: incorrectShake 0.5s var(--ease-out);
}

.quiz-option.is-disabled {
  cursor: not-allowed;
}

@keyframes correctPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes incorrectShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

.option-text {
  font-size: var(--text-lg);
}

.check-icon,
.cross-icon {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
}

/* --------------------------------------------------------
   Feedback Section - 答案回饋
   -------------------------------------------------------- */

.feedback-section {
  padding: var(--space-6);
  border-radius: var(--radius-sm);
  text-align: center;
  animation: feedbackSlideIn 0.3s var(--ease-out);
}

.feedback-section.is-correct {
  background: linear-gradient(135deg, rgba(106, 176, 76, 0.2) 0%, rgba(90, 154, 58, 0.2) 100%);
  border: 2px solid var(--color-success);
}

.feedback-section.is-incorrect {
  background: linear-gradient(135deg, rgba(207, 102, 121, 0.2) 0%, rgba(168, 50, 50, 0.2) 100%);
  border: 2px solid var(--color-error);
}

@keyframes feedbackSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-text {
  font-size: var(--text-xl);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

/* --------------------------------------------------------
   Loading State
   -------------------------------------------------------- */

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-12);
  color: var(--color-text-secondary);
  font-size: var(--text-lg);
  font-family: var(--font-display);
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .replay-button,
  .quiz-option,
  .progress-fill {
    transition-duration: 0.01ms;
  }

  .ripple,
  .audio-icon.is-playing {
    animation: none;
  }

  .quiz-option.is-correct,
  .quiz-option.is-incorrect,
  .feedback-section {
    animation: none;
  }

  .replay-button:hover:not(:disabled),
  .quiz-option:hover:not(:disabled) {
    transform: none;
  }
}

/* --------------------------------------------------------
   Touch Device Support
   -------------------------------------------------------- */

@media (hover: none) {
  /* Remove hover effects on touch devices */
  .replay-button:hover:not(:disabled),
  .quiz-option:hover:not(:disabled) {
    transform: none;
    box-shadow: var(--shadow-md);
  }
  
  /* Ensure touch targets are large enough */
  .replay-button {
    min-width: 44px;
    min-height: 44px;
  }
  
  .quiz-option {
    min-height: 60px;
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile devices (≤640px) - Single column layout */
@media (max-width: 640px) {
  .listening-quiz {
    padding: var(--space-4);
    gap: var(--space-6);
  }

  .quiz-header {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .progress-text,
  .score-text {
    font-size: var(--text-xs);
  }

  .audio-section {
    padding: var(--space-6) var(--space-4);
  }

  .replay-button {
    padding: var(--space-4) var(--space-6);
    font-size: var(--text-sm);
    /* Ensure minimum touch target size of 44x44px */
    min-width: 44px;
    min-height: 44px;
  }

  .audio-icon {
    width: 20px;
    height: 20px;
  }

  .button-text {
    font-size: var(--text-sm);
  }

  .quiz-content {
    padding: var(--space-4);
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .quiz-option {
    padding: var(--space-5);
    font-size: var(--text-base);
    /* Ensure minimum touch target size of 44x44px */
    min-height: 60px;
  }

  .option-text {
    font-size: var(--text-base);
  }

  .feedback-section {
    padding: var(--space-4);
  }

  .feedback-text {
    font-size: var(--text-lg);
  }
}

/* Tablet devices (641px - 1023px) - Appropriate spacing */
@media (min-width: 641px) and (max-width: 1023px) {
  .listening-quiz {
    padding: var(--space-5);
    gap: var(--space-7);
  }

  .quiz-header {
    padding: var(--space-5);
  }

  .audio-section {
    padding: var(--space-7);
  }

  .replay-button {
    /* Ensure minimum touch target size of 44x44px */
    min-width: 44px;
    min-height: 44px;
  }

  .quiz-content {
    padding: var(--space-5);
  }

  .options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .quiz-option {
    /* Ensure minimum touch target size of 44x44px */
    min-height: 70px;
  }
}

/* Desktop devices (≥1024px) - Optimized layout */
@media (min-width: 1024px) {
  .listening-quiz {
    padding: var(--space-6);
    gap: var(--space-8);
  }

  .quiz-header {
    padding: var(--space-6);
  }

  .audio-section {
    padding: var(--space-8);
  }

  .quiz-content {
    padding: var(--space-6);
  }

  .options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .quiz-option {
    min-height: 80px;
  }

  /* Hover effects only on desktop */
  .replay-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg), var(--shadow-glow-accent);
    border-color: var(--color-accent-light);
  }

  .quiz-option:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
  }
}
</style>
