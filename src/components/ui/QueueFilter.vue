<script setup lang="ts">
import { computed } from 'vue';
import { Search, X } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';
import CascadingPaketSelect from '@/components/ui/CascadingPaketSelect.vue';

interface Props {
  search: string;
  status: string;
  jenisSarpras: string;
  statusOptions?: { value: string; label: string }[];
  jenisSarprasOptions?: { value: string; label: string }[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:search', val: string): void;
  (e: 'update:status', val: string): void;
  (e: 'update:jenisSarpras', val: string): void;
  (e: 'reset'): void;
}>();

// Check if any filter is active to show the reset button
const isAnyFilterActive = computed(() => {
  return props.search.trim() !== '' || props.status !== '' || props.jenisSarpras !== '';
});

// Map status options from LOCALIZATION (deduplicated by label)
const defaultStatusOptions = computed(() => {
  const seenLabels = new Set<string>();
  const options: { value: string; label: string }[] = [];
  for (const [key, val] of Object.entries(LOCALIZATION.proposalStatus)) {
    if (!seenLabels.has(val)) {
      seenLabels.add(val);
      options.push({ value: key, label: val });
    }
  }
  return options;
});

const statusOptions = computed(() => {
  return props.statusOptions || defaultStatusOptions.value;
});

const handleReset = () => {
  emit('reset');
};</script>

<template>
  <div class="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl w-full">
    <!-- Search Keyword Input -->
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search class="w-4 h-4" />
      </div>
      <input
        type="text"
        :value="search"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        :placeholder="LOCALIZATION.filter.searchPlaceholder"
        class="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] outline-none transition-all"
      />
    </div>

    <!-- Status Dropdown Select -->
    <div class="w-full lg:w-56">
      <select
        :value="status"
        @change="emit('update:status', ($event.target as HTMLSelectElement).value)"
        class="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A] outline-none transition-all cursor-pointer"
      >
        <option value="">{{ LOCALIZATION.filter.allStatuses }}</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Windows Desktop Style Hover Cascading Double Dropdown for Filter Paket Sarpras -->
    <div class="w-full lg:w-72">
      <CascadingPaketSelect
        :model-value="jenisSarpras"
        placeholder="Semua Paket Sarpras"
        @update:model-value="(val) => emit('update:jenisSarpras', (val as string) || '')"
      />
    </div>

    <!-- Reset Filter Button -->
    <Transition name="fade">
      <button
        v-if="isAnyFilterActive"
        type="button"
        @click="handleReset"
        class="h-10 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200/50 dark:border-rose-900/50 transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
      >
        <X class="w-3.5 h-3.5" />
        <span>{{ LOCALIZATION.filter.resetLabel }}</span>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
/* Smooth fade transition for reset button appearance */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
