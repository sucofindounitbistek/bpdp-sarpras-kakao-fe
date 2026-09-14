<script setup lang="ts">
// PengembalianDanaSection — sisi KP: unggah permohonan pengembalian + pantau status (US6).
import { computed, ref } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { RotateCcw, Upload } from 'lucide-vue-next';

const props = defineProps<{ proposalId: string }>();
const store = usePenyaluranDanaStore();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

const pengembalian = computed(() => store.pengembalianList.find((p) => p.proposalId === props.proposalId));
const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;

function pick(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  try {
    if (pengembalian.value && pengembalian.value.status === 'DIKEMBALIKAN') store.resubmitPengembalian(props.proposalId, file.name);
    else store.ajukanPengembalian(props.proposalId, file.name);
    toast.success(LOCALIZATION.penyaluranDana.toast.pengembalianSuccess);
  } catch (e2) {
    toast.error((e2 as Error).message);
  }
  input.value = '';
}
</script>

<template>
  <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
    <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
      <RotateCcw class="w-4 h-4 text-red-400" /> {{ LOCALIZATION.penyaluranDana.pengembalian.title }}
    </h4>
    <div v-if="!pengembalian" class="flex flex-col gap-2">
      <p class="text-[11px] text-slate-500 dark:text-slate-400">Ajukan pengembalian dana bila penerimaan dana dibatalkan.</p>
      <button type="button" class="self-start inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-red-300 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95" @click="fileInput?.click()">
        <Upload class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.pengembalian.uploadPermohonan }}
      </button>
      <input ref="fileInput" type="file" class="hidden" accept=".pdf" @change="pick" />
    </div>
    <div v-else class="flex flex-col gap-1.5 text-[11px]">
      <p class="text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
        <span class="font-semibold">{{ statusLabel(pengembalian.status) }}</span> —
        <DocumentViewLink :file-name="pengembalian.suratPermohonanFile" :context="{ judul: LOCALIZATION.penyaluranDana.pengembalian.title, aktor: 'KELEMBAGAAN_PEKEBUN', waktu: pengembalian.createdAt }" />
      </p>
      <p v-if="pengembalian.hasilPenelitian" class="text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-2">{{ pengembalian.hasilPenelitian }}</p>
      <p v-if="pengembalian.suratPemberitahuanFile" class="text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-1">
        {{ LOCALIZATION.penyaluranDana.pengembalian.suratPemberitahuan }}:
        <DocumentViewLink :file-name="pengembalian.suratPemberitahuanFile" :context="{ judul: LOCALIZATION.penyaluranDana.pengembalian.suratPemberitahuan, aktor: 'BPDP' }" />
      </p>
      <p v-if="pengembalian.skPembatalanFile" class="text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-1">
        {{ LOCALIZATION.penyaluranDana.pengembalian.skPembatalan }}:
        <DocumentViewLink :file-name="pengembalian.skPembatalanFile" :context="{ judul: LOCALIZATION.penyaluranDana.pengembalian.skPembatalan, aktor: 'BPDP' }" />
      </p>
      <button v-if="pengembalian.status === 'DIKEMBALIKAN'" type="button" class="self-start mt-1 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95" @click="fileInput?.click()">
        <Upload class="w-3.5 h-3.5" /> {{ LOCALIZATION.penyaluranDana.pengembalian.uploadPermohonan }} (ulang)
      </button>
    </div>
  </section>
</template>
