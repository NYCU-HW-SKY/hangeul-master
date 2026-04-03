<template>
  <button
    class="btn"
    :class="[
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-disabled': disabled, 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="btn-spinner" aria-hidden="true">
      <svg class="spinner-icon" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="60"
          stroke-dashoffset="30"
        />
      </svg>
    </span>

    <!-- Button Content -->
    <span class="btn-content" :class="{ 'btn-content-hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
});

interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const emit = defineEmits<Emits>();

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-display);
  font-weight: var(--font-bold);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  user-select: none;
  white-space: nowrap;
  outline: none;
  letter-spacing: 0.05em;
  overflow: hidden;
  will-change: transform;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

/* --------------------------------------------------------
   Size Variants
   -------------------------------------------------------- */

.btn-small {
  padding: var(--space-2) var(--space-5);
  font-size: var(--text-sm);
  min-height: 36px;
}

.btn-medium {
  padding: var(--space-3) var(--space-7);
  font-size: var(--text-base);
  min-height: 48px;
}

.btn-large {
  padding: var(--space-5) var(--space-12);
  font-size: var(--text-lg);
  min-height: 64px;
  font-weight: 700;
}

/* --------------------------------------------------------
   Primary Variant - 戰神風格（冰霜藍）
   -------------------------------------------------------- */

.btn-primary {
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  border-color: var(--color-primary-dark);
  box-shadow: var(--shadow-md);
  position: relative;
}

.btn-primary::before {
  background: var(--color-primary-dark);
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading) {
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  transform: translateY(-4px);
  border-color: var(--color-primary-light);
}

.btn-primary:hover:not(.btn-disabled):not(.btn-loading)::before {
  opacity: 0.3;
}

.btn-primary:active:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* --------------------------------------------------------
   Secondary Variant - 戰神風格（戰神紅）
   -------------------------------------------------------- */

.btn-secondary {
  background: var(--gradient-accent);
  color: var(--color-text-primary);
  border-color: var(--color-accent-dark);
  box-shadow: var(--shadow-md);
}

.btn-secondary::before {
  background: var(--color-accent-dark);
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading) {
  box-shadow: var(--shadow-lg), var(--shadow-glow-accent);
  transform: translateY(-4px);
  border-color: var(--color-accent-light);
}

.btn-secondary:hover:not(.btn-disabled):not(.btn-loading)::before {
  opacity: 0.3;
}

.btn-secondary:active:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* --------------------------------------------------------
   Outline Variant - 戰神風格（透明背景）
   -------------------------------------------------------- */

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-inset);
}

.btn-outline::before {
  background: var(--color-primary);
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading) {
  color: var(--color-text-primary);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  transform: translateY(-4px);
  background: rgba(159, 197, 232, 0.1);
}

.btn-outline:hover:not(.btn-disabled):not(.btn-loading)::before {
  opacity: 0.2;
}

.btn-outline:active:not(.btn-disabled):not(.btn-loading) {
  transform: translateY(-2px);
}

/* --------------------------------------------------------
   Ghost Variant
   -------------------------------------------------------- */

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.btn-ghost::before {
  background: var(--color-surface-elevated);
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading) {
  border-color: var(--color-border);
}

.btn-ghost:hover:not(.btn-disabled):not(.btn-loading)::before {
  opacity: 1;
}

/* --------------------------------------------------------
   Disabled State
   -------------------------------------------------------- */

.btn-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
  box-shadow: none;
}

/* --------------------------------------------------------
   Loading State
   -------------------------------------------------------- */

.btn-loading {
  cursor: wait;
  pointer-events: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: opacity var(--duration-base) var(--ease-out);
  position: relative;
  z-index: 1;
}

.btn-content-hidden {
  opacity: 0;
}

/* --------------------------------------------------------
   Loading Spinner
   -------------------------------------------------------- */

.btn-spinner {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.spinner-icon {
  width: 1.5em;
  height: 1.5em;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* --------------------------------------------------------
   Responsive Design
   -------------------------------------------------------- */

@media (max-width: 640px) {
  .btn-small {
    padding: var(--space-2) var(--space-4);
    font-size: 0.625rem;
    min-height: 32px;
  }

  .btn-medium {
    padding: var(--space-3) var(--space-5);
    font-size: var(--text-sm);
    min-height: 40px;
  }

  .btn-large {
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-base);
    min-height: 52px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn::before {
    transition-duration: 0.01ms !important;
  }

  .btn:hover {
    transform: none !important;
  }

  .spinner-icon {
    animation: none !important;
  }
}
</style>
