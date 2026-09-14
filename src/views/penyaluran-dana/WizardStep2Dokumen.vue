<script setup lang="ts">
// WizardStep2Dokumen — unduh/unggah surat permohonan (PDF & Word), dokumen D, unduh/unggah BA.
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { generateSuratPermohonanHtml, generateBeritaAcaraHtml, downloadPdf, downloadDoc } from '@/utils/pencairanDocsGenerator';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import type { Pencairan } from '@/types/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { Download, Upload, FileText, FileStack } from 'lucide-vue-next';

const props = defineProps<{ previewPermohonan: Pencairan }>();
const store = usePenyaluranDanaStore();
const toast = useToast();
const draft = computed(() => store.wizardDraft!);
const suratInput = ref<HTMLInputElement | null>(null);
const dokDInput = ref<HTMLInputElement | null>(null);
const baInput = ref<HTMLInputElement | null>(null);

function unduhSurat(mode: 'pdf' | 'word') {
  if (mode === 'pdf') downloadPdf('Surat Permohonan', generateSuratPermohonanHtml(props.previewPermohonan));
  else downloadDoc('Surat Permohonan', generateSuratPermohonanHtml(props.previewPermohonan), 'Surat_Permohonan');
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted);
}

function unduhBa() {
  downloadDoc('Surat Berita Acara', generateBeritaAcaraHtml(props.previewPermohonan), 'Surat_Berita_Acara');
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted);
}

function pick(e: Event, target: 'surat' | 'dokD' | 'ba') {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  if (target === 'surat') draft.value.suratTtdFile = file.name;
  if (target === 'ba') draft.value.baFile = file.name;
  if (target === 'dokD') draft.value.dokumenDFiles = [...draft.value.dokumenDFiles, file.name];
  toast.success(LOCALIZATION.penyaluranDana.toast.uploadSuccess, file.name);
  input.value = '';
}

function hapusDokD(i: number) {
  draft.value.dokumenDFiles = draft.value.dokumenDFiles.filter((_, idx) => idx !== i);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Surat permohonan -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
      <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <FileText class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.wizard.unduhSuratPdf.split('(')[0] }}(PDF & Word)
      </h4>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="unduhSurat('pdf')">
          <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.wizard.unduhSuratPdf }}
        </button>
        <button type="button" class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="unduhSurat('word')">
          <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.wizard.unduhSuratWord }}
        </button>
        <button type="button" class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="suratInput?.click()">
          <Upload class="w-4 h-4" /> {{ draft.suratTtdFile ? 'Ganti Berkas' : LOCALIZATION.penyaluranDana.wizard.uploadSuratTtd }}
        </button>
        <DocumentViewLink v-if="draft.suratTtdFile" :file-name="draft.suratTtdFile" :context="{ judul: 'Surat Permohonan (sudah ditandatangani & bermeterai)', aktor: 'KELEMBAGAAN_PEKEBUN' }" />
        <input ref="suratInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="pick($event, 'surat')" />
      </div>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.common.meterai }}</p>
    </div>

    <!-- Dokumen D -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
      <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <FileStack class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.wizard.dokumenD }}
      </h4>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">Bukti tagihan kontraktor; kwitansi/invoice/nota; perjanjian kontraktor/supplier; daftar upah; foto kegiatan.</p>
      <div class="flex flex-wrap gap-1.5">
        <span v-for="(f, i) in draft.dokumenDFiles" :key="f + i" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <DocumentViewLink compact :file-name="f" :context="{ judul: 'Dokumen D — Bukti Tagihan' }" />
          <button type="button" class="text-red-400 hover:text-red-500" @click="hapusDokD(i)">✕</button>
        </span>
      </div>
      <button type="button" class="self-start inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="dokDInput?.click()">
        <Upload class="w-4 h-4" /> Tambah Berkas Dokumen D
      </button>
      <input ref="dokDInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="pick($event, 'dokD')" />
    </div>

    <!-- Berita Acara -->
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
      <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <FileText class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.wizard.unduhBa }}
      </h4>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="unduhBa">
          <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.wizard.unduhBa }}
        </button>
        <button type="button" class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="baInput?.click()">
          <Upload class="w-4 h-4" /> {{ draft.baFile ? 'Ganti Berkas' : LOCALIZATION.penyaluranDana.wizard.uploadBa }}
        </button>
        <DocumentViewLink v-if="draft.baFile" :file-name="draft.baFile" :context="{ judul: 'Surat Berita Acara (sudah ditandatangani)', aktor: 'KELEMBAGAAN_PEKEBUN' }" />
        <input ref="baInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="pick($event, 'ba')" />
      </div>
    </div>
  </div>
</template>
