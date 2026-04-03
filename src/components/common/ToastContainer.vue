<template>
  <div class="toast-container">
    <TransitionGroup name="toast-list">
      <ToastComponent
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast';
import ToastComponent from './ToastComponent.vue';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-4);
  right: var(--space-4);
  z-index: var(--z-toast);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-3);
  max-width: 420px;
}

/* Toast list transitions */
.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all var(--duration-base) var(--ease-out);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-active {
  position: absolute;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .toast-container {
    top: var(--space-2);
    right: var(--space-2);
    left: var(--space-2);
    max-width: none;
    align-items: stretch;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toast-list-move,
  .toast-list-enter-active,
  .toast-list-leave-active {
    transition-duration: 0.01ms !important;
  }

  .toast-list-enter-from,
  .toast-list-leave-to {
    transform: none;
  }
}
</style>
