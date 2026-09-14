<script setup lang="ts">
// DokumenChecklistTahap — checklist dokumen persyaratan per tahap (generated vs upload).
import { computed, ref } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import type { TipeDokumen } from '@/types/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { FileCheck2, Upload, Lock, Sparkles } from 'lucide-vue-next';

const props = defineProps<{ tahapId: string; editable?: boolean }>();
const store = usePenyaluranDanaStore();
const toast = useToast();
const inputs = ref<Record<string, HTMLInputElement | null>>({});

const dokumen = computed(() => store.dokumenByTahap(props.tahapId));
const docLabel = (t: TipeDokumen) => (LOCALIZATION.penyaluranDana.docLabel as Record<string, string>)[t] ?? t;

function pick(e: Event, tipe: TipeDokumen) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  store.uploadDokumenTahap(props.tahapId, tipe, file.name);
  toast.success(LOCALIZATION.penyaluranDana.toast.uploadSuccess, docLabel(tipe));
  input.value = '';
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div
      v-for="d in dokumen"
      :key="d.tipeDokumen"
      class="flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5"
      :class="d.fileName
        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20'
        : 'border-slate-200 dark:border-slate-800'"
    >
      <div class="flex items-start gap-2 min-w-0">
        <component :is="d.fileName ? FileCheck2 : d.jenis === 'GENERATED' ? Sparkles : Upload" class="w-4 h-4 mt-0.5 shrink-0" :class="d.fileName ? 'text-emerald-500' : 'text-slate-400'" />
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{{ docLabel(d.tipeDokumen) }} <span v-if="d.required" class="text-red-400">*</span></p>
          <p class="text-[10px] text-slate-400">
            {{ d.fileName ? (d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('id-ID') : '') : (LOCALIZATION.penyaluranDana.status as Record<string, string>)[d.jenis] }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <DocumentViewLink
          v-if="d.fileName"
          :file-name="d.fileName"
          :context="{ judul: docLabel(d.tipeDokumen), subjudul: d.jenis === 'GENERATED' ? 'Dokumen generated sistem' : 'Dokumen unggahan', aktor: d.uploadedBy, waktu: d.uploadedAt }"
        />
        <span v-if="d.fileName && d.jenis === 'GENERATED'" class="text-[9px] font-semibold uppercase text-emerald-500/80">{{ LOCALIZATION.penyaluranDana.status.GENERATED }}</span>
        <button
          v-if="d.jenis === 'UPLOAD' && editable && !d.fileName"
          type="button"
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#066C2A] dark:text-emerald-400 border border-[#066C2A]/30 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors active:scale-95 shrink-0"
          @click="inputs[d.tipeDokumen]?.click()"
        >
          <Upload class="w-3.5 h-3.5" /> {{ (LOCALIZATION.penyaluranDana.status as Record<string, string>)[d.jenis] }}
        </button>
      </div>
      <span v-if="d.jenis === 'UPLOAD' && !editable && !d.fileName" class="inline-flex items-center gap-1 text-[10px] text-slate-400"><Lock class="w-3 h-3" /></span>
      <input :ref="(el) => (inputs[d.tipeDokumen] = el as HTMLInputElement)" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="pick($event, d.tipeDokumen)" />
    </div>
  </div>
</template>
