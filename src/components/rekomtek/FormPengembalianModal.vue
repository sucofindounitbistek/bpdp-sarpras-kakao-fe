<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { LOCALIZATION } from '@/config/localization';
import { X, AlertTriangle } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    isEnable?: boolean;
    showNotes?: boolean;
    disabled?: boolean;
  }>(),
  {
    isEnable: true,
    showNotes: true,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { tujuan: 'PERBAIKAN_DINAS_KAB' | 'PERBAIKAN_DINAS_PROV'; alasan: string }): void;
}>();

const tujuan = ref<'PERBAIKAN_DINAS_KAB' | 'PERBAIKAN_DINAS_PROV'>('PERBAIKAN_DINAS_KAB');
const alasan = ref('');
const errorVal = ref('');

const isNotesEnabled = computed(() => props.isEnable !== false && props.showNotes !== false);

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      tujuan.value = 'PERBAIKAN_DINAS_KAB';
      alasan.value = '';
      errorVal.value = '';
    }
  }
);

const handleSubmit = () => {
  if (isNotesEnabled.value) {
    if (!alasan.value || alasan.value.trim().length < 10) {
      errorVal.value = LOCALIZATION.formPengembalianModal.validationMinChars;
      return;
    }
  }
  emit('submit', {
    tujuan: tujuan.value,
    alasan: alasan.value.trim(),
  });
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop Overlay -->
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" @click="emit('close')" />

      <!-- Modal Body -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl w-full max-w-lg shadow-xl relative z-10 overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-amber-500 shrink-0" />
            <h3 class="font-semibold text-[15px] text-slate-900 dark:text-white">
              {{ LOCALIZATION.formPengembalianModal.title }}
            </h3>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-5 flex flex-col gap-4">
          <!-- Dropdown Dinas Tujuan -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {{ LOCALIZATION.formPengembalianModal.dinasLabel }}
            </label>
            <select
              v-model="tujuan"
              class="w-full h-10 px-3 border border-slate-200/80 dark:border-slate-700 rounded-lg text-[13px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]"
            >
              <option value="PERBAIKAN_DINAS_KAB">{{ LOCALIZATION.formPengembalianModal.dinasKab }}</option>
              <option value="PERBAIKAN_DINAS_PROV">{{ LOCALIZATION.formPengembalianModal.dinasProv }}</option>
            </select>
            <span class="text-[11px] text-slate-400">
              {{ LOCALIZATION.formPengembalianModal.dinasHelper }}
            </span>
          </div>

          <!-- Textarea Alasan (Controlled by isNotesEnabled) -->
          <div v-if="isNotesEnabled" class="flex flex-col gap-1.5">
            <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              {{ LOCALIZATION.formPengembalianModal.alasanLabel }}
            </label>
            <textarea
              v-model="alasan"
              rows="4"
              :placeholder="LOCALIZATION.formPengembalianModal.alasanPlaceholder"
              class="w-full p-3 border border-slate-200/80 dark:border-slate-700 rounded-lg text-[13px] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] resize-none"
            />
            <span v-if="errorVal" class="text-[11px] text-red-500 font-semibold">
              {{ errorVal }}
            </span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            type="button"
            @click="emit('close')"
            class="h-9 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            {{ LOCALIZATION.formPengembalianModal.buttons.cancel }}
          </button>
          
          <button
            type="button"
            @click="handleSubmit"
            :disabled="disabled"
            :class="[
              'h-9 px-4 text-xs font-semibold text-white rounded-lg transition-all duration-200 shadow-sm',
              disabled
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer'
            ]"
          >
            {{ LOCALIZATION.formPengembalianModal.buttons.submit }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
