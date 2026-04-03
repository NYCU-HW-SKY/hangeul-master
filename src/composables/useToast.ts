import { ref } from 'vue';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

const toasts = ref<Toast[]>([]);
let nextId = 1;

export function useToast() {
  const addToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 3000
  ): number => {
    const id = nextId++;
    toasts.value.push({ id, message, type, duration });
    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string, duration?: number) => {
    return addToast(message, 'success', duration);
  };

  const error = (message: string, duration?: number) => {
    return addToast(message, 'error', duration);
  };

  const warning = (message: string, duration?: number) => {
    return addToast(message, 'warning', duration);
  };

  const info = (message: string, duration?: number) => {
    return addToast(message, 'info', duration);
  };

  const clear = () => {
    toasts.value = [];
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear,
  };
}
