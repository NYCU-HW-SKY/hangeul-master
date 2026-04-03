<template>
  <div class="audio-player">
    <!-- Main Controls Row -->
    <div class="controls-row">
      <!-- Left Speed Button -->
      <button
        v-if="showControls"
        class="speed-button"
        :class="{ 'is-active': currentSpeed === 'slow' }"
        @click="handleSpeedChange('slow')"
        aria-label="慢速度"
        :aria-pressed="currentSpeed === 'slow'"
        title="慢速度"
        type="button"
      >
        <span class="speed-text">慢</span>
      </button>

      <!-- Play Button -->
      <button
        class="play-button"
        :class="{ 'is-playing': isPlaying, 'is-loading': isLoading, 'has-error': error }"
        @click="handlePlayToggle"
        :disabled="(isLoading && !isPlaying) || !!error"
        :aria-label="isPlaying ? '停止播放' : '播放音訊'"
        type="button"
      >
        <!-- Play Icon -->
        <svg
          v-if="!isPlaying && !isLoading && !error"
          class="play-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>

        <!-- Stop Icon -->
        <svg
          v-if="isPlaying && !isLoading && !error"
          class="stop-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <rect x="6" y="6" width="12" height="12" />
        </svg>

        <!-- Loading Spinner -->
        <div v-if="isLoading" class="loading-spinner" aria-hidden="true"></div>

        <!-- Error Icon -->
        <svg
          v-if="error"
          class="error-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        <!-- Pulse Animation Ring -->
        <span v-if="isPlaying" class="pulse-ring" aria-hidden="true"></span>
      </button>

      <!-- Middle Speed Button -->
      <button
        v-if="showControls"
        class="speed-button"
        :class="{ 'is-active': currentSpeed === 'normal' }"
        @click="handleSpeedChange('normal')"
        aria-label="正常速度"
        :aria-pressed="currentSpeed === 'normal'"
        title="正常速度"
        type="button"
      >
        <span class="speed-text">正常</span>
      </button>

      <!-- Right Speed Button -->
      <button
        v-if="showControls"
        class="speed-button"
        :class="{ 'is-active': currentSpeed === 'fast' }"
        @click="handleSpeedChange('fast')"
        aria-label="快速度"
        :aria-pressed="currentSpeed === 'fast'"
        title="快速度"
        type="button"
      >
        <span class="speed-text">快</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message" role="alert">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { audioService, type SpeedMode } from '../../services/AudioService';

interface Props {
  text: string;
  speed?: SpeedMode;
  autoPlay?: boolean;
  showControls?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  speed: 'normal',
  autoPlay: false,
  showControls: true,
});

const isPlaying = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentSpeed = ref<SpeedMode>(props.speed);
let playRequestId = 0;
let playEndTimeoutId: number | null = null;
const MIN_PLAYING_DURATION_MS = 500;

const handlePlayToggle = async () => {
  if (isPlaying.value) {
    stopAudio();
  } else {
    await playAudio();
  }
};

const playAudio = async () => {
  if (!props.text || props.text.trim() === '') {
    error.value = '無文字內容';
    return;
  }

  const requestId = ++playRequestId;
  const startedAt = Date.now();
  isLoading.value = true;
  error.value = null;
  isPlaying.value = true;

  try {
    await audioService.playAudio(props.text, currentSpeed.value);
    if (requestId !== playRequestId) return;

    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, MIN_PLAYING_DURATION_MS - elapsed);
    playEndTimeoutId = window.setTimeout(() => {
      if (requestId !== playRequestId) return;
      isPlaying.value = false;
      isLoading.value = false;
      playEndTimeoutId = null;
    }, remaining);
  } catch (err) {
    if (requestId !== playRequestId) return;
    isLoading.value = false;
    isPlaying.value = false;
    error.value = err instanceof Error ? err.message : '播放失敗';
    console.error('[AudioPlayerComponent] Play error:', err);
  }
};

const stopAudio = () => {
  playRequestId += 1;
  if (playEndTimeoutId !== null) {
    window.clearTimeout(playEndTimeoutId);
    playEndTimeoutId = null;
  }
  audioService.stop();
  isPlaying.value = false;
  isLoading.value = false;
};

const handleSpeedChange = (speed: SpeedMode) => {
  currentSpeed.value = speed;
  
  // If currently playing, restart with new speed
  if (isPlaying.value) {
    stopAudio();
    playAudio();
  }
};

// Watch for autoPlay prop
watch(
  () => props.autoPlay,
  (shouldAutoPlay) => {
    if (shouldAutoPlay && !isPlaying.value && !error.value) {
      playAudio();
    }
  },
  { immediate: true }
);

// Watch for text changes
watch(
  () => props.text,
  () => {
    stopAudio();
    error.value = null;
    
    if (props.autoPlay) {
      playAudio();
    }
  }
);

// Cleanup on unmount
onUnmounted(() => {
  stopAudio();
});
</script>

<style scoped>
/* ============================================================
   Audio Player Component - God of War Style
   ============================================================ */

/* --------------------------------------------------------
   Audio Player Container
   -------------------------------------------------------- */

.audio-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  position: relative;
}

/* --------------------------------------------------------
   Controls Row - Play Button with Speed Controls
   -------------------------------------------------------- */

.controls-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

/* --------------------------------------------------------
   Play Button - Smaller Circular with Frost Blue Background
   -------------------------------------------------------- */

.play-button {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: transform var(--duration-base) var(--ease-out),
              background-color var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
  overflow: visible;
  cursor: pointer;
  flex-shrink: 0;
}

.play-button:hover:not(:disabled) {
  background-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}

.play-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.play-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-button.has-error {
  background-color: var(--color-accent);
}

.play-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* --------------------------------------------------------
   Icons - Geometric Shapes
   -------------------------------------------------------- */

.play-icon,
.stop-icon {
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 2;
}

.error-icon {
  width: 28px;
  height: 28px;
  position: relative;
  z-index: 2;
}

/* --------------------------------------------------------
   Loading Spinner
   -------------------------------------------------------- */

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

/* --------------------------------------------------------
   Pulse Ring Animation - War Red when Playing
   -------------------------------------------------------- */

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  border: 3px solid var(--color-accent);
  animation: war-pulse 2s ease-out infinite;
  pointer-events: none;
}

@keyframes war-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

/* --------------------------------------------------------
   Speed Buttons - Compact Side Controls
   -------------------------------------------------------- */

.speed-button {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-base) var(--ease-out);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.speed-button:hover {
  background-color: var(--color-divider);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.speed-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.speed-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.speed-button.is-active {
  background-color: var(--color-primary);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.speed-text {
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  transition: color var(--duration-base) var(--ease-out);
}

.speed-button.is-active .speed-text {
  color: var(--color-text-inverse);
}

/* --------------------------------------------------------
   Error Message
   -------------------------------------------------------- */

.error-message {
  font-size: var(--text-sm);
  color: var(--color-accent);
  text-align: center;
  padding: var(--space-3) var(--space-5);
  background-color: rgba(193, 68, 14, 0.15);
  border: 1px solid var(--color-accent-dark);
  border-radius: var(--radius-md);
  max-width: 280px;
  font-family: var(--font-body);
  box-shadow: var(--shadow-sm);
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .audio-player {
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .controls-row {
    gap: var(--space-3);
  }

  .play-button {
    width: 48px;
    height: 48px;
  }

  .play-icon,
  .stop-icon {
    width: 20px;
    height: 20px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
  }

  .speed-button {
    width: 36px;
    height: 36px;
  }

  .speed-text {
    font-size: 0.625rem;
  }

  .error-message {
    font-size: var(--text-xs);
    padding: var(--space-2) var(--space-4);
    max-width: 240px;
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .play-button {
    width: 52px;
    height: 52px;
  }

  .play-icon,
  .stop-icon {
    width: 22px;
    height: 22px;
  }

  .speed-button {
    width: 40px;
    height: 40px;
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .audio-player {
    gap: var(--space-4);
    padding: var(--space-5);
  }

  .controls-row {
    gap: var(--space-5);
  }

  .play-button {
    width: 64px;
    height: 64px;
  }

  .play-icon,
  .stop-icon {
    width: 28px;
    height: 28px;
  }

  .speed-button {
    width: 48px;
    height: 48px;
  }

  .speed-text {
    font-size: var(--text-sm);
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .play-button,
  .speed-button {
    transition-duration: 0.01ms;
  }

  .pulse-ring,
  .loading-spinner {
    animation: none;
  }

  .play-button:hover:not(:disabled),
  .speed-button:hover {
    transform: none;
  }
}
</style>
