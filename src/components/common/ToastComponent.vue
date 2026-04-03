<template>
  <div
    class="toast"
    :class="[`toast-${type}`, { 'toast-closing': isClosing }]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
    :aria-atomic="true"
  >
    <!-- Icon -->
    <div class="toast-icon" aria-hidden="true">
      <span v-if="type === 'success'">◈</span>
      <span v-else-if="type === 'error'">✕</span>
      <span v-else-if="type === 'warning'">▸</span>
      <span v-else-if="type === 'info'">◈</span>
    </div>

    <!-- Message -->
    <div class="toast-message">{{ message }}</div>

    <!-- Close Button -->
    <button
      class="toast-close"
      @click="handleClose"
      aria-label="關閉通知"
      type="button"
    >
      <span aria-hidden="true">×</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, 0 means no auto-close
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
});

interface Emits {
  (e: 'close'): void;
}

const emit = defineEmits<Emits>();

// State
const isClosing = ref(false);
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

// Methods
const handleClose = () => {
  isClosing.value = true;
  // Wait for animation to complete before emitting close event
  setTimeout(() => {
    emit('close');
  }, 300); // Match animation duration
};

const startAutoClose = () => {
  if (props.duration > 0) {
    autoCloseTimer = setTimeout(() => {
      handleClose();
    }, props.duration);
  }
};

const stopAutoClose = () => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
};

// Lifecycle
onMounted(() => {
  startAutoClose();
});

onUnmounted(() => {
  stopAutoClose();
});
</script>

<style scoped>
/* --------------------------------------------------------
   Toast Base Styles - 戰神風格
   -------------------------------------------------------- */

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 280px;
  max-width: 420px;
  padding: var(--space-4);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-xl);
  pointer-events: auto;
  animation: toastSlideIn var(--duration-base) var(--ease-out);
  margin-bottom: var(--space-3);
  border: 1px solid var(--color-border);
  border-left: 3px solid;
  position: relative;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-top: 2px solid currentColor;
  border-left: 2px solid currentColor;
  opacity: 0.4;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-closing {
  animation: toastSlideOut var(--duration-base) var(--ease-in);
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* --------------------------------------------------------
   Toast Type Variants - 戰神風格
   -------------------------------------------------------- */

.toast-success {
  border-left-color: var(--color-success);
  color: var(--color-success);
}

.toast-success .toast-icon {
  color: var(--color-success);
  background-color: rgba(124, 179, 66, 0.15);
}

.toast-error {
  border-left-color: var(--color-accent);
  color: var(--color-accent);
}

.toast-error .toast-icon {
  color: var(--color-accent);
  background-color: rgba(193, 68, 14, 0.15);
}

.toast-warning {
  border-left-color: var(--color-secondary);
  color: var(--color-secondary);
}

.toast-warning .toast-icon {
  color: var(--color-secondary);
  background-color: rgba(212, 175, 55, 0.15);
}

.toast-info {
  border-left-color: var(--color-primary);
  color: var(--color-primary);
}

.toast-info .toast-icon {
  color: var(--color-primary);
  background-color: rgba(159, 197, 232, 0.15);
}

/* --------------------------------------------------------
   Toast Icon - 戰神風格符文符號
   -------------------------------------------------------- */

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  font-size: var(--text-lg);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  flex-shrink: 0;
}

/* --------------------------------------------------------
   Toast Message
   -------------------------------------------------------- */

.toast-message {
  flex: 1;
  font-size: var(--text-base);
  font-family: var(--font-body);
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
  word-break: break-word;
}

/* --------------------------------------------------------
   Toast Close Button
   -------------------------------------------------------- */

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  font-size: var(--text-2xl);
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-colors);
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: var(--color-divider);
  color: var(--color-text-primary);
}

.toast-close:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.toast-close:active {
  transform: scale(0.95);
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

/* Mobile (≤640px) */
@media (max-width: 640px) {
  .toast {
    min-width: 260px;
    max-width: calc(100vw - var(--space-8));
    padding: var(--space-3);
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .toast-icon {
    width: 28px;
    height: 28px;
    font-size: var(--text-base);
  }

  .toast-message {
    font-size: var(--text-sm);
  }

  .toast-close {
    width: 20px;
    height: 20px;
    font-size: var(--text-xl);
  }
}

/* Tablet (641px - 1023px) */
@media (min-width: 641px) and (max-width: 1023px) {
  .toast {
    min-width: 300px;
    max-width: 400px;
  }
}

/* Desktop (≥1024px) */
@media (min-width: 1024px) {
  .toast {
    min-width: 320px;
    max-width: 480px;
  }
}

/* --------------------------------------------------------
   Reduced Motion Support
   -------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: toastFadeIn var(--duration-fast) ease-out;
  }

  .toast-closing {
    animation: toastFadeOut var(--duration-fast) ease-in;
  }

  @keyframes toastFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes toastFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .toast-close:active {
    transform: none;
  }
}
</style>
