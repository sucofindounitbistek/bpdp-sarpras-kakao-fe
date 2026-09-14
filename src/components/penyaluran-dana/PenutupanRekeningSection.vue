<script setup lang="ts">
// PenutupanRekeningSection — gerbang bukti sisa dana → form penutupan (sisi KP, US7; klarifikasi Q3: gerbang status).
import { computed, ref } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { Lock, LockOpen, Upload } from 'lucide-vue-next';

const props = defineProps<{ proposalId: string }>();
const store = usePenyaluranDanaStore();
const toast = useToast();
const buktiInput = ref<HTMLInputElement | null>(null);
const suratInput = ref<HTMLInputElement | null>(null);

const penutupan = computed(() => store.penutupanByProposal(props.proposalId));
const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;

function pickBukti(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  store.uploadBuktiSisaDana(props.proposalId, file.name);
  toast.success(LOCALIZATION.penyaluranDana.toast.gerbangSuccess);
  input.value = '';
}

function pickSurat(e: Event) {
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
    store.ajukanPenutupan(props.proposalId, file.name);
    toast.success(LOCALIZATION.penyaluranDana.toast.penutupanSuccess);
  } catch (e2) {
    toast.error((e2 as Error).message);
  }
  input.value = '';
}
</script>

<template>
  <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
    <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
      <component :is="penutupan?.gerbangSisaDanaSelesai ? LockOpen : Lock" class="w-4 h-4" :class="penutupan?.gerbangSisaDanaSelesai ? 'text-emerald-500' : 'text-slate-400'" />
      {{ LOCALIZATION.penyaluranDana.penutupan.title }}
    </h4>

    <template v-if="!penutupan || !penutupan.gerbangSisaDanaSelesai">
      <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-2">{{ LOCALIZATION.penyaluranDana.penutupan.gerbangHint }}</p>
      <button type="button" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="buktiInput?.click()">
        <Upload class="w-4 h-4" /> {{ penutupan?.buktiPencairanSisaDanaFile ?? LOCALIZATION.penyaluranDana.penutupan.gerbang }}
      </button>
      <input ref="buktiInput" type="file" class="hidden" accept=".pdf" @change="pickBukti" />
    </template>

    <template v-else>
      <div class="flex flex-col gap-2 text-[11px]">
        <p class="text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-1.5">✓
          <DocumentViewLink :file-name="penutupan.buktiPencairanSisaDanaFile" :context="{ judul: 'Bukti Pencairan Sisa Dana', aktor: 'KELEMBAGAAN_PEKEBUN', waktu: penutupan.createdAt }" />
          — gerbang selesai
        </p>
        <p v-if="penutupan.status !== 'SELESAI'" class="text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.penutupan.gerbangHint }}</p>
        <p v-if="penutupan.suratPenutupanFile" class="text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-1.5">
          <span class="font-semibold">{{ statusLabel(penutupan.status) }}</span> —
          <DocumentViewLink :file-name="penutupan.suratPenutupanFile" :context="{ judul: 'Surat Permohonan Penutupan Rekening', aktor: 'KELEMBAGAAN_PEKEBUN' }" />
        </p>
        <p v-if="penutupan.status === 'SELESAI'" class="font-semibold text-emerald-600 dark:text-emerald-400">Rekening escrow ditutup — siklus selesai.</p>
        <button
          v-if="!penutupan.suratPenutupanFile"
          type="button"
          class="self-start inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
          @click="suratInput?.click()"
        >
          <Upload class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.penutupan.uploadSuratPenutupan }}
        </button>
        <input ref="suratInput" type="file" class="hidden" accept=".pdf" @change="pickSurat" />
      </div>
    </template>
  </section>
</template>
