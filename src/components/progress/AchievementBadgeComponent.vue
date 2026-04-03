<template>
  <div
    class="achievement-badge"
    :class="[
      `size-${size}`,
      { unlocked: isUnlocked, locked: !isUnlocked, 'show-unlock-animation': showUnlockAnimation }
    ]"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    :aria-label="ariaLabel"
    role="img"
  >
    <!-- Badge Hexagon/Shield -->
    <div class="badge-shape">
      <!-- Glow Effect (only when unlocked) -->
      <div v-if="isUnlocked" class="badge-glow"></div>
      
      <!-- Icon -->
      <div class="badge-icon">
        <svg v-if="!isUnlocked" class="lock-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2"></rect>
          <path d="M8 11V8a4 4 0 1 1 8 0v3"></path>
        </svg>
        <span v-else class="achievement-text">{{ getBadgeMark(achievement.id) }}</span>
      </div>
      
      <!-- Rarity Ring -->
      <svg class="rarity-ring" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          :stroke="rarityColor"
          stroke-width="2"
          :class="`rarity-${achievement.rarity}`"
        />
      </svg>
      
      <!-- Progress Ring (only when locked and has progress) -->
      <svg v-if="!isUnlocked && userAchievement && userAchievement.progress > 0" class="progress-ring" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="var(--color-primary)"
          stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="progressOffset"
          stroke-linecap="round"
        />
      </svg>
    </div>
    
    <!-- Unlock Animation Glow -->
    <div v-if="showUnlockAnimation" class="unlock-glow"></div>
    
    <!-- Tooltip -->
    <Transition name="tooltip">
      <div v-if="showTooltip" class="tooltip" role="tooltip">
        <div class="tooltip-header">
          <span class="tooltip-name">{{ achievement.name }}</span>
          <span class="tooltip-rarity" :class="`rarity-${achievement.rarity}`">
            {{ rarityLabel }}
          </span>
        </div>
        <p class="tooltip-description">{{ achievement.description }}</p>
        <div v-if="!isUnlocked && userAchievement" class="tooltip-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <span class="progress-text">
            {{ userAchievement.progress }} / {{ achievement.requirement.value }}
          </span>
        </div>
        <div v-if="isUnlocked && userAchievement?.unlockedAt" class="tooltip-date">
          解鎖於 {{ formatDate(userAchievement.unlockedAt) }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Achievement, UserAchievement } from '../../types';

interface Props {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
});

// State
const showTooltip = ref(false);
const showUnlockAnimation = ref(false);

// Computed
const isUnlocked = computed(() => props.userAchievement?.unlocked ?? false);

const progressPercentage = computed(() => {
  if (!props.userAchievement) return 0;
  return Math.round((props.userAchievement.progress / props.achievement.requirement.value) * 100);
});

const rarityColor = computed(() => {
  const colors: Record<string, string> = {
    common: '#94a3b8',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[props.achievement.rarity] || colors.common;
});

const rarityLabel = computed(() => {
  const labels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說',
  };
  return labels[props.achievement.rarity] || '普通';
});

const ariaLabel = computed(() => {
  const status = isUnlocked.value ? '已解鎖' : '未解鎖';
  return `${props.achievement.name} - ${status} - ${props.achievement.description}`;
});

// Progress ring calculations
const radius = 48;
const circumference = 2 * Math.PI * radius;
const progressOffset = computed(() => {
  const progress = progressPercentage.value / 100;
  return circumference * (1 - progress);
});

const getBadgeMark = (id: string): string => {
  const normalized = id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return normalized.slice(0, 2) || 'OK';
};

// Date formatting
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Watch for unlock animation
watch(
  () => props.userAchievement?.unlocked,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      showUnlockAnimation.value = true;
      setTimeout(() => {
        showUnlockAnimation.value = false;
      }, 1000);
    }
  }
);
</script>

<style scoped>
/* --------------------------------------------------------
   Achievement Badge Container
   -------------------------------------------------------- */

.achievement-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-base) var(--ease-out);
  filter: drop-shadow(var(--shadow-lg));
}

.achievement-badge:hover {
  transform: translateY(-4px);
}

.achievement-badge:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* Size variants */
.achievement-badge.size-small {
  width: 60px;
  height: 60px;
}

.achievement-badge.size-medium {
  width: 80px;
  height: 80px;
}

.achievement-badge.size-large {
  width: 120px;
  height: 120px;
}

/* --------------------------------------------------------
   Badge Shape - Hexagon/Shield with God of War Style
   -------------------------------------------------------- */

.badge-shape {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  overflow: visible;
}

/* Unlocked state - Rune Gold gradient with metallic texture */
.achievement-badge.unlocked .badge-shape {
  background: linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 50%, var(--color-secondary-light) 100%);
  border: 2px solid var(--color-secondary-light);
  box-shadow: 
    inset 0 2px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 8px rgba(0, 0, 0, 0.4),
    var(--shadow-xl);
}

/* Locked state - Gray, semi-transparent */
.achievement-badge.locked .badge-shape {
  background: linear-gradient(135deg, #3a3f47 0%, #5f6368 50%, #3a3f47 100%);
  border: 2px solid #5f6368;
  opacity: 0.5;
  box-shadow: var(--shadow-md);
  filter: grayscale(1);
}

/* --------------------------------------------------------
   Badge Glow Effect - God of War Style
   -------------------------------------------------------- */

.badge-glow {
  position: absolute;
  width: 140%;
  height: 140%;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, rgba(244, 208, 63, 0.3) 0%, transparent 70%);
  animation: runeGlowGold 2s ease-in-out infinite;
  pointer-events: none;
  z-index: -1;
}

/* --------------------------------------------------------
   Badge Icon - Text Abbreviations
   -------------------------------------------------------- */

.badge-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  width: 28px;
  height: 28px;
  stroke: rgba(232, 230, 227, 0.8);
  stroke-width: 2;
  fill: none;
}

.size-small .lock-icon {
  width: 20px;
  height: 20px;
}

.size-large .lock-icon {
  width: 36px;
  height: 36px;
}

.achievement-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: var(--font-black);
  letter-spacing: 0.05em;
  color: var(--color-text-inverse);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.size-small .achievement-text {
  font-size: 1rem;
}

.size-large .achievement-text {
  font-size: 2.5rem;
}

/* --------------------------------------------------------
   Rarity Ring
   -------------------------------------------------------- */

.rarity-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.achievement-badge.unlocked .rarity-ring circle {
  animation: ringRotate 3s linear infinite;
}

@keyframes ringRotate {
  from {
    stroke-dasharray: 10 5;
    stroke-dashoffset: 0;
  }
  to {
    stroke-dasharray: 10 5;
    stroke-dashoffset: 15;
  }
}

/* --------------------------------------------------------
   Progress Ring
   -------------------------------------------------------- */

.progress-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
  pointer-events: none;
}

.progress-ring circle {
  transition: stroke-dashoffset var(--duration-slow) var(--ease-out);
}

/* --------------------------------------------------------
   Unlock Animation - Glow expanding from center
   -------------------------------------------------------- */

.unlock-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background: radial-gradient(circle, rgba(244, 208, 63, 0.8) 0%, transparent 70%);
  animation: unlockGlowExpand 1s ease-out forwards;
  pointer-events: none;
  z-index: 3;
}

@keyframes unlockGlowExpand {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

.show-unlock-animation .badge-shape {
  animation: unlockBounce 0.6s ease-out;
}

@keyframes unlockBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* --------------------------------------------------------
   Tooltip
   -------------------------------------------------------- */

.tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  padding: var(--space-4);
  box-shadow: var(--shadow-xl);
  min-width: 200px;
  max-width: 280px;
  z-index: 1000;
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-border);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.tooltip-name {
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  flex: 1;
}

.tooltip-rarity {
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tooltip-rarity.rarity-common {
  background-color: #5f6368;
  color: var(--color-text-primary);
}

.tooltip-rarity.rarity-rare {
  background-color: var(--color-primary-dark);
  color: var(--color-text-primary);
}

.tooltip-rarity.rarity-epic {
  background-color: var(--color-accent);
  color: var(--color-text-primary);
}

.tooltip-rarity.rarity-legendary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
}

.tooltip-description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--leading-relaxed);
}

.tooltip-progress {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background-color: var(--color-divider);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm);
  transition: width var(--duration-base) var(--ease-out);
  box-shadow: 0 0 8px rgba(159, 197, 232, 0.5);
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-align: center;
  font-weight: var(--font-medium);
}

.tooltip-date {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  font-style: italic;
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-divider);
}

/* Tooltip transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .achievement-badge.size-small {
    width: 50px;
    height: 50px;
  }

  .achievement-badge.size-medium {
    width: 70px;
    height: 70px;
  }

  .achievement-badge.size-large {
    width: 100px;
    height: 100px;
  }

  .achievement-text {
    font-size: 1.2rem;
  }

  .size-small .achievement-text {
    font-size: 0.875rem;
  }

  .size-large .achievement-text {
    font-size: 2rem;
  }

  .tooltip {
    min-width: 180px;
    max-width: 240px;
    padding: var(--space-3);
  }

  .tooltip-name {
    font-size: var(--text-sm);
  }

  .tooltip-description {
    font-size: 0.625rem;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .achievement-badge.size-large {
    width: 110px;
    height: 110px;
  }

  .tooltip {
    min-width: 220px;
    max-width: 300px;
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .achievement-badge.size-small {
    width: 70px;
    height: 70px;
  }

  .achievement-badge.size-medium {
    width: 90px;
    height: 90px;
  }

  .achievement-badge.size-large {
    width: 140px;
    height: 140px;
  }

  .size-large .achievement-text {
    font-size: 3rem;
  }

  .tooltip {
    min-width: 240px;
    max-width: 320px;
    padding: var(--space-5);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .achievement-badge,
  .badge-shape,
  .badge-glow,
  .achievement-text,
  .rarity-ring circle,
  .progress-ring circle,
  .unlock-glow,
  .tooltip {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }

  .achievement-badge:hover {
    transform: none;
  }
}
</style>
