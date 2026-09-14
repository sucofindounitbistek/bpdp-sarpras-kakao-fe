<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

const { toasts, remove } = useToast();

const getToastClasses = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-50/95 border-emerald-200 text-emerald-950';
    case 'error':
      return 'bg-rose-50/95 border-rose-200 text-rose-950';
    case 'warning':
      return 'bg-amber-50/95 border-amber-200 text-amber-950';
    case 'info':
    default:
      return 'bg-sky-50/95 border-sky-200 text-sky-950';
  }
};

const getIconComponent = (type: ToastType) => {
  switch (type) {
    case 'success':
      return CheckCircle2;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
    default:
      return Info;
  }
};

const getIconClasses = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'text-emerald-600';
    case 'error':
      return 'text-rose-600';
    case 'warning':
      return 'text-amber-600';
    case 'info':
    default:
      return 'text-sky-600';
  }
};
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-2xl shadow-xl border backdrop-blur-md p-4 flex items-start gap-3 transition-all"
        :class="getToastClasses(toast.type)"
      >
        <component :is="getIconComponent(toast.type)" class="w-5 h-5 mt-0.5 shrink-0" :class="getIconClasses(toast.type)" />

        <div class="flex-1 min-w-0">
          <h4 v-if="toast.title" class="text-sm font-semibold leading-tight font-apple-body-strong">
            {{ toast.title }}
          </h4>
          <p class="text-xs mt-0.5 opacity-90 leading-normal font-apple-caption">
            {{ toast.message }}
          </p>
        </div>

        <button
          type="button"
          @click="remove(toast.id)"
          class="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors shrink-0"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
