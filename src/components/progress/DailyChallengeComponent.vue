<template>
  <div class="daily-challenge">
    <!-- Streak Display -->
    <div class="streak-container">
      <div class="streak-icon">STREAK</div>
      <div class="streak-info">
        <div class="streak-current" aria-live="polite">
          <span class="streak-number">{{ animatedStreak }}</span>
          <span class="streak-label">天連續</span>
        </div>
        <div class="streak-longest">
          最長紀錄：{{ longestStreak }} 天
        </div>
      </div>
    </div>

    <!-- Weekly Calendar -->
    <div class="calendar-container">
      <h3 class="section-title">本週挑戰</h3>
      <div class="calendar-grid">
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            today: day.isToday,
            completed: day.completed,
            future: day.isFuture
          }"
          :aria-label="getCalendarDayLabel(day)"
        >
          <div class="day-name">{{ day.name }}</div>
          <div class="day-number">{{ day.dayNumber }}</div>
          <div v-if="day.completed" class="day-check">✓</div>
        </div>
      </div>
    </div>

    <!-- Today's Challenge Card -->
    <div v-if="challenge" class="challenge-card">
      <div class="challenge-header">
        <h3 class="challenge-title">今日挑戰</h3>
        <div class="challenge-date">{{ formatDate(challenge.date) }}</div>
      </div>

      <!-- Progress Ring -->
      <div class="challenge-progress" :class="{ 'completed': challenge.completed }">
        <svg class="progress-ring" viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color: var(--color-primary); stop-opacity: 1" />
              <stop offset="100%" style="stop-color: var(--color-secondary); stop-opacity: 1" />
            </linearGradient>
          </defs>
          <circle
            class="progress-ring-bg"
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke-width="10"
          />
          <circle
            class="progress-ring-fill"
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke-width="10"
            stroke="url(#progressGradient)"
            :stroke-dasharray="progressCircumference"
            :stroke-dashoffset="progressOffset"
            :style="{ transition: `stroke-dashoffset ${animationDuration}ms ease-out` }"
          />
        </svg>
        <div class="progress-center">
          <div class="progress-value">{{ animatedProgress }}%</div>
          <div class="progress-label">完成度</div>
        </div>
        <div class="rune-decoration rune-top">◈</div>
        <div class="rune-decoration rune-bottom">◈</div>
      </div>

      <!-- Card Preview -->
      <div class="card-preview">
        <div class="preview-label">學習卡片</div>
        <div class="preview-count">{{ challenge.cardIds.length }} 張</div>
      </div>

      <!-- Completion Status -->
      <div v-if="challenge.completed" class="completion-status">
        <div class="completion-icon">VICTORY</div>
        <div class="completion-text">今日挑戰完成！</div>
        <div v-if="challenge.completedAt" class="completion-time">
          完成於 {{ formatTime(challenge.completedAt) }}
        </div>
      </div>

      <!-- Reminder Message -->
      <div v-else class="reminder-message">
        <div class="reminder-text">
          {{ getReminderMessage() }}
        </div>
      </div>
    </div>

    <!-- No Challenge State -->
    <div v-else class="no-challenge">
      <div class="no-challenge-text">尚未生成今日挑戰</div>
    </div>

    <!-- Celebration Animation -->
    <Transition name="celebration">
      <div v-if="showCelebration" class="celebration-overlay">
        <div class="celebration-content">
          <div class="celebration-icon">◈</div>
          <div class="celebration-text">挑戰完成！</div>
          <div class="runes">
            <div v-for="i in 12" :key="i" class="rune-piece" :style="getRuneStyle(i)">◈</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { DailyChallenge } from '../../types';

interface Props {
  challenge?: DailyChallenge;
  streak: number;
  longestStreak: number;
}

const props = withDefaults(defineProps<Props>(), {
  streak: 0,
  longestStreak: 0,
});

// Animation state
const animatedStreak = ref(0);
const animatedProgress = ref(0);
const showCelebration = ref(false);
const animationDuration = 800;

// Progress ring calculations
const progressRadius = 70;
const progressCircumference = 2 * Math.PI * progressRadius;

const progressOffset = computed(() => {
  const progress = animatedProgress.value / 100;
  return progressCircumference * (1 - progress);
});

// Week days calculation
interface WeekDay {
  date: string;
  name: string;
  dayNumber: number;
  isToday: boolean;
  completed: boolean;
  isFuture: boolean;
}

const weekDays = computed((): WeekDay[] => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const days: WeekDay[] = [];
  const dayNames = ['一', '二', '三', '四', '五', '六', '日'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const isToday = dateStr === today.toISOString().slice(0, 10);
    const isFuture = date > today;

    days.push({
      date: dateStr,
      name: dayNames[i]!,
      dayNumber: date.getDate(),
      isToday,
      completed: false, // Will be updated based on challenge data
      isFuture,
    });
  }

  return days;
});

// Format functions
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCalendarDayLabel = (day: WeekDay): string => {
  const status = day.completed ? '已完成' : day.isFuture ? '未來' : '未完成';
  return `星期${day.name} ${day.dayNumber}日 - ${status}`;
};

const getReminderMessage = (): string => {
  const messages = [
    '繼續保持！完成今日挑戰吧！',
    '每天進步一點點！',
    '堅持就是勝利！',
    '今天也要加油喔！',
    '學習韓文，從今天開始！',
  ];
  const hour = new Date().getHours();
  if (hour < 12) return '早安！開始今天的學習吧！';
  if (hour < 18) return '下午好！別忘了今日挑戰！';
  return messages[Math.floor(Math.random() * messages.length)]!;
};

// Confetti animation
const getRuneStyle = (index: number) => {
  const angle = (index / 12) * 360;
  const distance = 150;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  return {
    '--delay': `${index * 0.05}s`,
    '--x': `${x}px`,
    '--y': `${y}px`,
    '--rotation': `${angle}deg`,
  };
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

// Watch for prop changes
watch(
  () => props.streak,
  (newValue) => {
    animateNumber(newValue, animatedStreak, animationDuration);
  }
);

watch(
  () => props.challenge?.progress,
  (newValue) => {
    if (newValue !== undefined) {
      animateNumber(newValue, animatedProgress, animationDuration);
    }
  }
);

watch(
  () => props.challenge?.completed,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      showCelebration.value = true;
      setTimeout(() => {
        showCelebration.value = false;
      }, 2000);
    }
  }
);

// Initialize on mount
onMounted(() => {
  setTimeout(() => {
    animateNumber(props.streak, animatedStreak, animationDuration);
    if (props.challenge?.progress !== undefined) {
      animateNumber(props.challenge.progress, animatedProgress, animationDuration);
    }
  }, 100);
});
</script>

<style scoped>
/* --------------------------------------------------------
   Daily Challenge Container
   -------------------------------------------------------- */

.daily-challenge {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 600px;
  width: 100%;
  position: relative;
}

/* Rune decorations at corners */
.daily-challenge::before,
.daily-challenge::after {
  content: '◈';
  position: absolute;
  top: var(--space-4);
  color: var(--color-primary);
  font-size: var(--text-lg);
  opacity: 0.7;
}

.daily-challenge::before {
  left: var(--space-4);
}

.daily-challenge::after {
  right: var(--space-4);
}

/* --------------------------------------------------------
   Streak Display
   -------------------------------------------------------- */

.streak-container {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  position: relative;
}

.streak-icon {
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  font-weight: var(--font-black);
  font-family: var(--font-display);
  color: var(--color-text-inverse);
  border: 2px solid var(--color-secondary);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, var(--color-secondary-dark), var(--color-secondary));
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    0 4px 12px rgba(244, 208, 63, 0.4);
}

.streak-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.streak-current {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.streak-number {
  font-size: var(--text-5xl);
  font-weight: var(--font-black);
  color: var(--color-secondary);
  font-family: var(--font-display);
  line-height: 1;
  text-shadow: 0 2px 8px rgba(244, 208, 63, 0.5);
}

.streak-label {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  font-family: var(--font-display);
}

.streak-longest {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  font-family: var(--font-body);
}

/* --------------------------------------------------------
   Weekly Calendar
   -------------------------------------------------------- */

.calendar-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-3);
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  transition: all var(--duration-base) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.calendar-day.today {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  color: var(--color-text-inverse);
  transform: scale(1.08);
  box-shadow: 
    0 4px 12px rgba(111, 168, 220, 0.4),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.calendar-day.completed {
  background: linear-gradient(135deg, var(--color-secondary-dark), var(--color-secondary));
  border-color: var(--color-secondary);
  color: var(--color-text-inverse);
  box-shadow: 
    0 4px 12px rgba(244, 208, 63, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  position: relative;
}

.calendar-day.completed::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.calendar-day.completed .day-name,
.calendar-day.completed .day-number {
  opacity: 0.25;
  position: relative;
  z-index: 0;
}

.calendar-day.future {
  opacity: 0.4;
}

.day-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-1);
  font-family: var(--font-display);
}

.day-number {
  font-size: var(--text-xl);
  font-weight: var(--font-black);
  font-family: var(--font-display);
}

.day-check {
  position: absolute;
  top: var(--space-1);
  right: var(--space-1);
  font-size: var(--text-base);
  color: var(--color-text-inverse);
  font-weight: var(--font-bold);
}

/* --------------------------------------------------------
   Challenge Card
   -------------------------------------------------------- */

.challenge-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);
  background: linear-gradient(135deg, var(--color-surface-elevated) 0%, var(--color-surface) 100%);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.challenge-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
  font-family: var(--font-display);
  letter-spacing: 0.02em;
}

.challenge-date {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
  font-family: var(--font-body);
}

/* --------------------------------------------------------
   Progress Ring
   -------------------------------------------------------- */

.challenge-progress {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
}

.challenge-progress.completed .progress-ring-fill {
  animation: ringGlowRotate 3s linear infinite;
}

@keyframes ringGlowRotate {
  from {
    filter: drop-shadow(0 0 10px var(--color-secondary)) hue-rotate(0deg);
  }
  to {
    filter: drop-shadow(0 0 10px var(--color-secondary)) hue-rotate(360deg);
  }
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 8px rgba(111, 168, 220, 0.3));
}

.progress-ring-bg {
  stroke: var(--color-surface-elevated);
  stroke-opacity: 0.5;
}

.progress-ring-fill {
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-slow) var(--ease-out);
}

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  color: var(--color-primary);
  font-family: var(--font-display);
  line-height: 1;
  text-shadow: 0 0 20px rgba(111, 168, 220, 0.5);
}

.progress-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-2);
  font-weight: var(--font-medium);
  font-family: var(--font-display);
}

.rune-decoration {
  position: absolute;
  color: var(--color-primary);
  font-size: var(--text-xl);
  opacity: 0.6;
  animation: runeFloat 3s ease-in-out infinite;
}

.rune-top {
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.rune-bottom {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 1.5s;
}

@keyframes runeFloat {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
    opacity: 0.9;
  }
}

/* --------------------------------------------------------
   Card Preview
   -------------------------------------------------------- */

.card-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: rgba(249, 251, 250, 0.9);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(149, 164, 184, 0.16);
}

.preview-label {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

.preview-count {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  font-family: var(--font-display);
}

/* --------------------------------------------------------
   Completion Status
   -------------------------------------------------------- */

.completion-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: linear-gradient(180deg, #edf5fb 0%, #dce9f6 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(74, 123, 167, 0.3);
  animation: completionPulse 0.6s ease-out;
}

@keyframes completionPulse {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.completion-icon {
  font-size: var(--text-xs);
  letter-spacing: 0.18em;
  font-weight: var(--font-bold);
  color: #2e5984;
  border: 1px solid rgba(46, 89, 132, 0.3);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
}

.completion-text {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: #2e5984;
}

.completion-time {
  font-size: var(--text-sm);
  color: #4a7ba7;
}

/* --------------------------------------------------------
   Reminder Message
   -------------------------------------------------------- */

.reminder-message {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: linear-gradient(180deg, #edf5fb 0%, #dce9f6 100%);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(74, 123, 167, 0.3);
}

.reminder-text {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: #2e5984;
  flex: 1;
}

/* --------------------------------------------------------
   No Challenge State
   -------------------------------------------------------- */

.no-challenge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  opacity: 0.7;
}

.no-challenge-text {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: var(--font-medium);
}

/* --------------------------------------------------------
   Celebration Animation
   -------------------------------------------------------- */

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--z-overlay);
  pointer-events: none;
}

.celebration-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-8);
  background-color: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  animation: celebrationBounce 0.6s ease-out;
}

@keyframes celebrationBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.celebration-text {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  font-family: var(--font-display);
}

.confetti {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: var(--color);
  top: 50%;
  left: 50%;
  animation: confettiFall 2s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes confettiFall {
  0% {
    transform: translate(-50%, -50%) translateX(0) translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) translateX(var(--x)) translateY(var(--y)) rotate(var(--rotation));
    opacity: 0;
  }
}

/* Celebration transitions */
.celebration-enter-active,
.celebration-leave-active {
  transition: opacity var(--duration-base) var(--ease-out);
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .daily-challenge {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .streak-container {
    padding: var(--space-4);
    flex-direction: column;
    text-align: center;
  }

  .streak-icon {
    font-size: var(--text-4xl);
  }

  .streak-number {
    font-size: var(--text-3xl);
  }

  .streak-label {
    font-size: var(--text-base);
  }

  .calendar-grid {
    gap: var(--space-1);
  }

  .calendar-day {
    padding: var(--space-2);
  }

  .day-name {
    font-size: 0.625rem;
  }

  .day-number {
    font-size: var(--text-base);
  }

  .challenge-card {
    padding: var(--space-4);
    gap: var(--space-3);
  }

  .challenge-title {
    font-size: var(--text-lg);
  }

  .challenge-progress {
    width: 100px;
    height: 100px;
  }

  .progress-value {
    font-size: var(--text-2xl);
  }

  .card-preview {
    padding: var(--space-3);
  }

  .preview-count {
    font-size: var(--text-xl);
  }

  .celebration-content {
    padding: var(--space-6);
    margin: var(--space-4);
  }

  .celebration-text {
    font-size: var(--text-2xl);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .daily-challenge {
    max-width: 700px;
  }

  .calendar-grid {
    gap: var(--space-2);
  }

  .calendar-day {
    padding: var(--space-3);
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .daily-challenge {
    padding: var(--space-8);
    gap: var(--space-8);
  }

  .streak-container {
    padding: var(--space-6);
  }

  .calendar-grid {
    gap: var(--space-3);
  }

  .calendar-day {
    padding: var(--space-4);
  }

  .challenge-card {
    padding: var(--space-6);
    gap: var(--space-5);
  }

  .challenge-progress {
    width: 140px;
    height: 140px;
  }

  .progress-value {
    font-size: var(--text-4xl);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .streak-icon,
  .calendar-day,
  .completion-status,
  .celebration-content,
  .celebration-icon,
  .confetti-piece {
    animation: none !important;
  }

  .progress-ring-fill {
    transition-duration: 0.01ms;
  }
}
</style>
