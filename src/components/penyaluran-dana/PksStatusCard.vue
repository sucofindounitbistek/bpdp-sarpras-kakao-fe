<script setup lang="ts">
// PksStatusCard — status pipeline PKS 3 Pihak + aksi surat kuasa & unduhan dokumen (sisi KP).
import { computed, ref } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { generateTemplateSuratKuasaHtml, generatePks3PihakHtml, downloadDoc } from '@/utils/pencairanDocsGenerator';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import type { StatusPks3Pihak } from '@/types/penyaluranDana';
import { Download, Upload, Handshake, CalendarClock, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{ proposalId: string }>();
const store = usePenyaluranDanaStore();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);

const pks = computed(() => store.pksByProposal(props.proposalId));
const proposal = computed(() => store.proposals.find((p) => p.id === props.proposalId));

const STEPS: { key: StatusPks3Pihak; label: string }[] = [
  { key: 'DIPROSES', label: LOCALIZATION.penyaluranDana.status.PKS_DIPROSES },
  { key: 'KOMPARISI', label: LOCALIZATION.penyaluranDana.status.PKS_KOMPARISI },
  { key: 'PENJADWALAN', label: LOCALIZATION.penyaluranDana.status.PKS_PENJADWALAN },
  { key: 'DITANDATANGANI', label: LOCALIZATION.penyaluranDana.status.PKS_DITANDATANGANI },
  { key: 'AKTIF', label: LOCALIZATION.penyaluranDana.status.PKS_AKTIF },
];

const statusIndex = computed(() => (pks.value ? STEPS.findIndex((s) => s.key === pks.value!.status) : -1));

function unduhTemplate() {
  if (!pks.value) return;
  downloadDoc('Template Surat Kuasa', generateTemplateSuratKuasaHtml(pks.value.kopSuratB), 'Template_Surat_Kuasa');
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted, LOCALIZATION.penyaluranDana.pks.suratKuasa);
}

function unduhDokumenPks() {
  if (!pks.value) return;
  downloadDoc('PKS 3 Pihak', generatePks3PihakHtml(pks.value.kopSuratB, { kp: pks.value.noPksKp, bpdp: pks.value.noPksBpdp, bank: pks.value.noPksBank }), `PKS_3Pihak_${proposal.value?.nomorProposal ?? ''}`);
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted, LOCALIZATION.penyaluranDana.pks.downloadDokumenPks);
}

function onPickSuratKuasa(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !pks.value) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  store.uploadSuratKuasa(pks.value.id, file.name);
  toast.success(LOCALIZATION.penyaluranDana.toast.uploadSuccess, LOCALIZATION.penyaluranDana.pks.suratKuasa);
  input.value = '';
}
</script>

<template>
  <div v-if="pks && proposal" class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 md:p-5 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
      <div class="flex items-center gap-2">
        <Handshake class="w-5 h-5 text-[#066C2A] dark:text-emerald-400" />
        <div>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.pksTitle }}</h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ proposal.nomorProposal }} — {{ proposal.namaKp }}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
        <CalendarClock class="w-3.5 h-3.5" />
        {{ LOCALIZATION.penyaluranDana.pks.jadwalTtd }}:
        <span class="text-slate-700 dark:text-slate-200 font-semibold">{{ pks.jadwalTtd ? new Date(pks.jadwalTtd).toLocaleString('id-ID') : '—' }}</span>
      </div>
    </div>

    <!-- Pipeline mini -->
    <div class="flex flex-wrap items-center gap-1.5 mb-4">
      <template v-for="(s, i) in STEPS" :key="s.key">
        <span
          class="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
          :class="i <= statusIndex
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'"
        >{{ s.label }}</span>
        <ChevronRight v-if="i < STEPS.length - 1" class="hidden sm:block w-3 h-3 text-slate-300 dark:text-slate-600" />
      </template>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
        @click="unduhTemplate"
      >
        <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.pks.downloadTemplate }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
        @click="unduhDokumenPks"
      >
        <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.pks.downloadDokumenPks }}
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
        @click="fileInput?.click()"
      >
        <Upload class="w-4 h-4" /> {{ pks.suratKuasaFile ?? LOCALIZATION.penyaluranDana.pks.uploadSuratKuasa }}
      </button>
      <input ref="fileInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="onPickSuratKuasa" />
    </div>

    <p v-if="pks.suratKuasaFile" class="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
      ✓ <DocumentViewLink :file-name="pks.suratKuasaFile" :context="{ judul: LOCALIZATION.penyaluranDana.pks.suratKuasa, aktor: 'KELEMBAGAAN_PEKEBUN' }" />
    </p>
  </div>
</template>
