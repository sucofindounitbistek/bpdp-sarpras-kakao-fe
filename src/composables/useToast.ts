import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<ToastItem[]>([]);

export function useToast() {
  function show(message: string, type: ToastType = 'info', title?: string, duration = 4000) {
    const id = Date.now() + Math.random();
    const item: ToastItem = { id, type, title, message, duration };
    toasts.value.push(item);

    if (duration > 0) {
      setTimeout(() => {
        remove(id);
      }, duration);
    }
  }

  function success(message: string, title?: string) {
    show(message, 'success', title);
  }

  function error(message: string, title?: string) {
    show(message, 'error', title);
  }

  function info(message: string, title?: string) {
    show(message, 'info', title);
  }

  function warning(message: string, title?: string) {
    show(message, 'warning', title);
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return {
    toasts,
    show,
    success,
    error,
    info,
    warning,
    remove,
  };
}
