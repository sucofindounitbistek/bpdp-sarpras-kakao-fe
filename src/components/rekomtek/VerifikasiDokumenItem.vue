<script setup lang="ts">
import { Check, X, Download, FileCheck, Eye } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    badgeType?: 'emerald' | 'blue' | 'amber' | 'slate';
    valid: boolean | null;
    note: string;
    fileUrl?: string;
    downloadLabel?: string;
    readonly?: boolean;
    buttonVariant?: 'icon' | 'text';
    uploadedBy?: string;
    uploadedAtFormatted?: string;
  }>(),
  {
    badgeType: 'emerald',
    downloadLabel: LOCALIZATION.verifikasiDokumenItem.downloadLabelDefault,
    readonly: false,
    buttonVariant: 'text',
  }
);

const emit = defineEmits<{
  (e: 'update:valid', value: boolean | null): void;
  (e: 'update:note', value: string): void;
  (e: 'preview'): void;
}>();

const handleToggle = (targetValue: boolean) => {
  if (props.readonly) return;
  const newValue = props.valid === targetValue ? null : targetValue;
  emit('update:valid', newValue);
  if (newValue !== false) {
    emit('update:note', '');
  }
};

const handleNoteInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:note', target.value);
};

const badgeClasses: Record<string, { bg: string; icon: string }> = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/50',
    icon: 'text-[#066C2A] dark:text-emerald-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200/50',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200/50',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200/50',
    icon: 'text-slate-600 dark:text-slate-400',
  },
};
</script>

<template>
  <div class="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-white dark:bg-slate-950">
    <!-- Header: Document Title & Actions -->
    <div class="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80 gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div :class="['w-9 h-9 rounded-lg border flex items-center justify-center shrink-0', badgeClasses[badgeType]?.bg]">
          <FileCheck :class="['w-4.5 h-4.5', badgeClasses[badgeType]?.icon]" />
        </div>
        <div class="flex flex-col min-w-0">
          <p class="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">{{ title }}</p>
          <p v-if="subtitle" class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ subtitle }}</p>
        </div>
      </div>

      <!-- Action Buttons (Editable) -->
      <div v-if="!readonly" class="flex items-center gap-2 shrink-0">
        <!-- Text Button Variant (Matching Approval Ditjenbun Screenshot) -->
        <template v-if="buttonVariant === 'text'">
          <button
            type="button"
            @click="handleToggle(true)"
            :class="[
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95',
              valid === true
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 hover:border-emerald-300',
            ]"
          >
            <Check class="w-3.5 h-3.5" />
            <span>{{ LOCALIZATION.verifikasiDokumenItem.btnAgree }}</span>
          </button>
          <button
            type="button"
            @click="handleToggle(false)"
            :class="[
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95',
              valid === false
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 hover:border-rose-300',
            ]"
          >
            <X class="w-3.5 h-3.5" />
            <span>{{ LOCALIZATION.verifikasiDokumenItem.btnReject }}</span>
          </button>
        </template>

        <!-- Icon Only Button Variant -->
        <template v-else>
          <button
            type="button"
            @click="handleToggle(true)"
            :class="[
              'w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all active:scale-95',
              valid === true
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-emerald-300 hover:text-emerald-500',
            ]"
            :title="LOCALIZATION.verifikasiDokumenItem.tooltipAgree"
          >
            <Check class="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            @click="handleToggle(false)"
            :class="[
              'w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all active:scale-95',
              valid === false
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-rose-300 hover:text-rose-500',
            ]"
            :title="LOCALIZATION.verifikasiDokumenItem.tooltipReject"
          >
            <X class="w-4.5 h-4.5" />
          </button>
        </template>
      </div>

      <!-- Readonly Badges -->
      <div v-else class="flex items-center gap-2 shrink-0">
        <div v-if="valid === true" class="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50">
          <Check class="w-3.5 h-3.5" /> {{ LOCALIZATION.verifikasiDokumenItem.badgeAgree }}
        </div>
        <div v-else-if="valid === false" class="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200/50">
          <X class="w-3.5 h-3.5" /> {{ LOCALIZATION.verifikasiDokumenItem.badgeReject }}
        </div>
        <div v-else class="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
          {{ LOCALIZATION.verifikasiDokumenItem.badgeUnchecked }}
        </div>
      </div>
    </div>

    <!-- Content: Download Link & Note Textarea -->
    <div class="p-4 flex flex-col gap-3">
      <div v-if="fileUrl" class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <a
            :href="fileUrl"
            download
            class="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <Download class="w-4 h-4 text-slate-500" />
            <span>{{ downloadLabel }}</span>
          </a>
          <button
            type="button"
            :title="LOCALIZATION.verifikasiDokumenItem.previewTooltip"
            class="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center shrink-0 transition-colors"
            @click="emit('preview')"
          >
            <Eye class="w-4 h-4" />
          </button>
        </div>
        <div v-if="uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400">
          Diunggah oleh {{ uploadedBy }}<span v-if="uploadedAtFormatted && !uploadedBy.includes(uploadedAtFormatted)"> &bull; {{ uploadedAtFormatted }}</span>
        </div>
      </div>
      <div v-else class="text-xs text-rose-500 dark:text-rose-400 font-medium italic">
        Dokumen belum diunggah
      </div>

      <div v-if="valid === false" class="flex flex-col gap-1.5">
        <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.verifikasiDokumenItem.rejectNoteLabel }}</label>
        <textarea
          :value="note"
          :disabled="readonly"
          @input="handleNoteInput"
          rows="2"
          :placeholder="LOCALIZATION.verifikasiDokumenItem.rejectNotePlaceholder"
          class="w-full px-3 py-2 border border-rose-200 dark:border-rose-900/50 rounded-lg text-[12px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
        ></textarea>
      </div>
    </div>
  </div>
</template>
