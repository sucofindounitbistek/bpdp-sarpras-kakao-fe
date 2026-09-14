<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-vue-next';

interface Props {
  modelValue?: string | number | null;
  minYear?: number;
  maxYear?: number;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  id?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  minYear: 1945,
  maxYear: () => new Date().getFullYear(),
  label: '',
  placeholder: 'Pilih Tahun Tanam',
  required: false,
  error: '',
  id: 'yearPicker',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const isOpen = ref(false);
const containerRef = ref<HTMLElement | null>(null);

const currentYearNum = computed(() => {
  if (!props.modelValue) return null;
  const num = Number(props.modelValue);
  return isNaN(num) ? null : num;
});

// Start year of the 12-year window (e.g. 2013 for 2013-2024)
const windowStartYear = ref(
  currentYearNum.value
    ? Math.floor((currentYearNum.value - 1) / 12) * 12 + 1
    : Math.floor((props.maxYear - 1) / 12) * 12 + 1,
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      const num = Number(newVal);
      if (!isNaN(num)) {
        windowStartYear.value = Math.floor((num - 1) / 12) * 12 + 1;
      }
    }
  },
);

const windowYears = computed(() => {
  const start = windowStartYear.value;
  const years: number[] = [];
  for (let i = 0; i < 12; i++) {
    years.push(start + i);
  }
  return years;
});

const windowEndYear = computed(() => windowStartYear.value + 11);

const canPrev = computed(() => windowStartYear.value > props.minYear);
const canNext = computed(() => windowEndYear.value < props.maxYear);

function prevWindow() {
  if (canPrev.value) {
    windowStartYear.value -= 12;
  }
}

function nextWindow() {
  if (canNext.value) {
    windowStartYear.value += 12;
  }
}

function selectYear(year: number) {
  if (year < props.minYear || year > props.maxYear || props.disabled) return;
  const strVal = String(year);
  emit('update:modelValue', strVal);
  emit('change', strVal);
  isOpen.value = false;
}

function clearYear(e: Event) {
  e.stopPropagation();
  emit('update:modelValue', '');
  emit('change', '');
}

function selectCurrentYear() {
  selectYear(props.maxYear);
}

const dropUp = ref(false);

function toggleDropdown() {
  if (props.disabled) return;
  if (!isOpen.value) {
    if (currentYearNum.value) {
      windowStartYear.value = Math.floor((currentYearNum.value - 1) / 12) * 12 + 1;
    } else {
      windowStartYear.value = Math.floor((props.maxYear - 1) / 12) * 12 + 1;
    }

    if (containerRef.value) {
      const rect = containerRef.value.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      dropUp.value = spaceBelow < 280 && rect.top > 280;
    }
  }
  isOpen.value = !isOpen.value;
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div ref="containerRef" class="relative flex flex-col gap-1.5 w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="id"
      class="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 font-apple-caption"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>

    <!-- Input Trigger -->
    <div
      :id="id"
      role="button"
      tabindex="0"
      @click="toggleDropdown"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
      :class="[
        'w-full h-10 px-3.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs md:text-sm flex items-center justify-between transition-all duration-200 cursor-pointer select-none',
        isOpen
          ? 'border-[#066C2A] ring-2 ring-[#066C2A]/20'
          : error
          ? 'border-rose-400 ring-1 ring-rose-400'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
        disabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' : '',
      ]"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <Calendar class="w-4 h-4 text-slate-400 shrink-0" />
        <span v-if="modelValue" class="font-medium truncate font-mono">
          {{ modelValue }}
        </span>
        <span v-else class="text-slate-400 truncate">
          {{ placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button
          v-if="modelValue && !disabled"
          type="button"
          @click="clearYear"
          title="Hapus"
          class="p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-xs text-rose-600 mt-0.5 font-apple-caption">
      {{ error }}
    </p>

    <!-- Year Picker Dropdown Grid -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      :enter-from-class="dropUp ? 'transform scale-95 opacity-0 translate-y-1' : 'transform scale-95 opacity-0 -translate-y-1'"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      :leave-to-class="dropUp ? 'transform scale-95 opacity-0 translate-y-1' : 'transform scale-95 opacity-0 -translate-y-1'"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute left-0 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 flex flex-col gap-2.5 font-apple-body',
          dropUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        ]"
      >
        <!-- Header Navigation -->
        <div class="flex items-center justify-between px-1 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="prevWindow"
            :disabled="!canPrev"
            :class="[
              'p-1.5 rounded-lg border text-slate-600 dark:text-slate-300 transition-colors',
              canPrev
                ? 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95'
                : 'opacity-30 border-transparent cursor-not-allowed',
            ]"
            title="12 Tahun Sebelumnya"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <span class="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-wide font-mono">
            {{ windowStartYear }} – {{ windowEndYear }}
          </span>

          <button
            type="button"
            @click="nextWindow"
            :disabled="!canNext"
            :class="[
              'p-1.5 rounded-lg border text-slate-600 dark:text-slate-300 transition-colors',
              canNext
                ? 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95'
                : 'opacity-30 border-transparent cursor-not-allowed',
            ]"
            title="12 Tahun Berikutnya"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- 3x4 Years Grid (12 Years) -->
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="year in windowYears"
            :key="year"
            type="button"
            @click="selectYear(year)"
            :disabled="year < minYear || year > maxYear"
            :class="[
              'h-10 rounded-xl text-xs font-semibold font-mono flex items-center justify-center transition-all duration-150',
              currentYearNum === year
                ? 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 font-bold ring-1 ring-slate-300 dark:ring-slate-700 shadow-xs'
                : year >= minYear && year <= maxYear
                ? 'text-slate-700 dark:text-slate-200 hover:bg-[#066C2A]/10 hover:text-[#066C2A] dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 active:scale-95 cursor-pointer'
                : 'text-slate-300 dark:text-slate-700 bg-transparent cursor-not-allowed',
            ]"
          >
            {{ year }}
          </button>
        </div>

        <!-- Footer Shortcuts -->
        <div class="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <span class="text-slate-400 dark:text-slate-500 font-apple-caption">
            Rentang: {{ minYear }} – {{ maxYear }}
          </span>
          <button
            type="button"
            @click="selectCurrentYear"
            class="text-[#066C2A] dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
          >
            Tahun Ini ({{ maxYear }})
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
