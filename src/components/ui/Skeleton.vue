<script setup lang="ts">
import { cn } from '@/lib/utils';

interface Props {
  width?: string;
  height?: string;
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '1rem',
  customClass: '',
});
</script>

<template>
  <div
    :class="cn('animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl transition-colors duration-200', customClass)"
    :style="{ width, height }"
  />
</template>
