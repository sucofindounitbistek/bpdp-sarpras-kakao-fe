<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  title?: string;
  subtitle?: string;
  customClass?: string;
}

defineProps<Props>();
</script>

<template>
  <div :class="cn('rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-slate-100 shadow-sm p-5 md:p-6 transition-colors duration-200', customClass)">
    <div v-if="title || subtitle || $slots.header" class="border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
      <slot name="header">
        <h3 v-if="title" class="text-base font-bold text-slate-900 dark:text-white font-apple-body-strong">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption mt-1">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <div>
      <slot />
    </div>

    <div v-if="$slots.footer" class="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4">
      <slot name="footer" />
    </div>
  </div>
</template>
