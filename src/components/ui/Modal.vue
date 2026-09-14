<script setup lang="ts">
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  title?: string;
  closeOnOverlay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overflowVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true,
  size: 'md',
  overflowVisible: false,
});

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
};

const currentSizeClass = computed(() => sizeClasses[props.size] || 'max-w-md');

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="handleOverlayClick">
        <div :class="['relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-4', currentSizeClass, overflowVisible ? 'overflow-visible' : 'overflow-hidden']">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-lg font-semibold text-slate-900 font-apple-body-strong">
              {{ title }}
            </h3>
            <button type="button" @click="emit('close')" class="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors hover:bg-slate-100">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="py-2">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="border-t border-slate-100 pt-3 flex justify-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
