<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    currentPage?: number;
    pageSize?: number;
    totalItems?: number;
    pageSizeOptions?: number[];
    disabled?: boolean;
  }>(),
  {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    pageSizeOptions: () => [10, 25, 50],
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void;
  (e: 'update:pageSize', size: number): void;
  (e: 'change', payload: { page: number; pageSize: number }): void;
}>();

const totalPages = computed(() => {
  if (!props.totalItems || props.totalItems <= 0) return 1;
  return Math.ceil(props.totalItems / props.pageSize) || 1;
});

const fromItem = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const toItem = computed(() => {
  return Math.min(props.currentPage * props.pageSize, props.totalItems);
});

const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value;
  const current = props.currentPage;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
});

function handlePageChange(newPage: number) {
  if (props.disabled) return;
  if (newPage < 1 || newPage > totalPages.value || newPage === props.currentPage) return;
  emit('update:currentPage', newPage);
  emit('change', { page: newPage, pageSize: props.pageSize });
}

function handlePageSizeChange(event: Event) {
  if (props.disabled) return;
  const target = event.target as HTMLSelectElement;
  const newSize = parseInt(target.value, 10);
  if (isNaN(newSize) || newSize === props.pageSize) return;

  emit('update:pageSize', newSize);
  emit('update:currentPage', 1);
  emit('change', { page: 1, pageSize: newSize });
}
</script>

<template>
  <div
    class="flex flex-col md:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-b-2xl text-xs text-slate-500 dark:text-slate-400 select-none"
  >
    <!-- Left: Info & Items Per Page -->
    <div class="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
      <span class="text-xs">
        Menampilkan
        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ fromItem }}-{{ toItem }}</span>
        dari
        <span class="font-semibold text-slate-800 dark:text-slate-200">{{ totalItems }}</span>
        data
      </span>

      <div class="flex items-center gap-1.5 text-xs">
        <span class="hidden sm:inline text-slate-400">Tampilkan</span>
        <select
          :value="pageSize"
          :disabled="disabled"
          @change="handlePageSizeChange"
          class="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>
        <span>per halaman</span>
      </div>
    </div>

    <!-- Right: Page Navigation -->
    <div class="flex items-center gap-1 w-full md:w-auto justify-center md:justify-end">
      <!-- First Page -->
      <button
        type="button"
        :disabled="disabled || currentPage <= 1"
        @click="handlePageChange(1)"
        title="Halaman Pertama"
        class="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors"
      >
        <ChevronsLeft class="w-3.5 h-3.5" />
      </button>

      <!-- Previous Page -->
      <button
        type="button"
        :disabled="disabled || currentPage <= 1"
        @click="handlePageChange(currentPage - 1)"
        title="Halaman Sebelumnya"
        class="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
      </button>

      <!-- Page Numbers -->
      <template v-for="(p, idx) in visiblePages" :key="idx">
        <span v-if="typeof p === 'string'" class="px-1 text-slate-400 font-semibold select-none">
          {{ p }}
        </span>
        <button
          v-else
          type="button"
          :disabled="disabled"
          @click="handlePageChange(p)"
          :class="[
            'h-8 min-w-[2rem] px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all',
            p === currentPage
              ? 'bg-[#066C2A] text-white shadow-xs font-bold'
              : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50',
          ]"
        >
          {{ p }}
        </button>
      </template>

      <!-- Next Page -->
      <button
        type="button"
        :disabled="disabled || currentPage >= totalPages"
        @click="handlePageChange(currentPage + 1)"
        title="Halaman Berikutnya"
        class="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors"
      >
        <ChevronRight class="w-3.5 h-3.5" />
      </button>

      <!-- Last Page -->
      <button
        type="button"
        :disabled="disabled || currentPage >= totalPages"
        @click="handlePageChange(totalPages)"
        title="Halaman Terakhir"
        class="h-8 w-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors"
      >
        <ChevronsRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
