<script setup lang="ts">
// PemohonWizardPermohonanView — orkestrasi wizard 3-step (transisi in-page, draft di Pinia, tanpa nested modal).
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import StepIndicator from '@/components/ui/StepIndicator.vue';
import WizardStep1DataPembelian from './WizardStep1DataPembelian.vue';
import WizardStep2Dokumen from './WizardStep2Dokumen.vue';
import WizardStep3TahapChecklist from './WizardStep3TahapChecklist.vue';
import type { Pencairan } from '@/types/penyaluranDana';
import { wizardPermohonanSchema } from '@/schemas/penyaluranDana';
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const router = useRouter();
const toast = useToast();
const step = ref(1);
const STEPS = [LOCALIZATION.penyaluranDana.wizard.step1, LOCALIZATION.penyaluranDana.wizard.step2, LOCALIZATION.penyaluranDana.wizard.step3];

onMounted(() => {
  if (!store.wizardDraft) {
    store.setWizardDraft({
      proposalId: '',
      jenisPembelian: 'PEMBELIAN',
      peruntukan: 'BENEFICIER',
      divisiItems: [],
      rekeningTujuan: { namaRekening: '', nomorRekening: '', bankTujuan: '', skema: 'ONLINE_EKSTERNAL', alamat: '', kota: '', kodepos: '', email: '' },
      dokumenDFiles: [],
    });
  }
});

const draft = computed(() => store.wizardDraft);

const proposal = computed(() => store.proposals.find((p) => p.id === draft.value?.proposalId));
const sisaSaldo = computed(() => {
  if (!proposal.value) return 0;
  const terpakai = store.permohonanList
    .filter((m) => m.proposalId === proposal.value!.id)
    .reduce((s, m) => s + m.divisiItems.reduce((a, d) => a + d.nilaiPermohonan, 0), 0);
  return Math.max(proposal.value.saldoPernyataan - terpakai, 0);
});

// Objek pratinjau berbentuk Pencairan untuk generator dokumen (step 2).
const previewPermohonan = computed<Pencairan>(() => {
  const d = draft.value!;
  const p = proposal.value;
  const pks = p ? store.pksByProposal(p.id) : undefined;
  const kop = pks?.kopSuratB ?? store.pksList[0]?.kopSuratB;
  return {
    id: 'PREVIEW',
    nomorPermohonan: `(draft) SRPR-KLPA/DANA/${new Date().getFullYear()}/…`,
    idPenyaluranBasis: p?.nomorProposal ?? '',
    proposalId: d.proposalId,
    pksId: pks?.id ?? '',
    jenisPembelian: d.jenisPembelian,
    peruntukan: d.peruntukan,
    divisiItems: d.divisiItems,
    rekeningTujuan: d.rekeningTujuan,
    dataGenerated: {
      dataA: { namaKp: p?.namaKp ?? '-', aktaAtauSk: '-', instansiPengesahan: '-', npwp: '-', ketuaNama: kop?.namaKetua ?? '-', ketuaNik: '-', alamat: '-' },
      dataB: kop ?? { namaKp: '-', telpKantor: '-', emailKantor: '-', noSkDirut: p?.noSkDirut ?? '-', tglSkDirut: p?.tglSkDirut ?? '-', noPks: '-', tglPks: '-', namaKetua: '-', hpKetua: '-' },
      pagu: p?.pagu ?? 0,
      luasHektar: p?.luasHektar ?? 0,
      saldoPernyataan: p?.saldoPernyataan ?? 0,
      sisaSaldo: sisaSaldo.value,
      namaPemohon: kop?.namaKetua ?? '-',
      jabatanPemohon: 'Ketua KP',
      tanggalPermohonan: new Date().toISOString().slice(0, 10),
      jumlahPekebun: p?.jumlahPekebun ?? 0,
      jumlahKK: p?.jumlahKK ?? 0,
      escrowNoRekening: '-',
      escrowBank: '-',
    },
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

function validasiStep1(): boolean {
  if (!draft.value) return false;
  const r = wizardPermohonanSchema.safeParse({ ...draft.value, sisaSaldo: sisaSaldo.value });
  if (!r.success) {
    toast.error(r.error.issues[0]?.message ?? LOCALIZATION.penyaluranDana.toast.formInvalid, LOCALIZATION.penyaluranDana.toast.formInvalid);
    return false;
  }
  return true;
}

function next() {
  if (step.value === 1 && !validasiStep1()) return;
  step.value = Math.min(step.value + 1, 3);
}

function back() {
  step.value = Math.max(step.value - 1, 1);
}

function submitPermohonan() {
  if (!draft.value) return;
  try {
    const m = store.createPermohonan({
      proposalId: draft.value.proposalId,
      jenisPembelian: draft.value.jenisPembelian,
      peruntukan: draft.value.peruntukan,
      divisiItems: draft.value.divisiItems,
      rekeningTujuan: draft.value.rekeningTujuan,
    });
    toast.success(`${LOCALIZATION.penyaluranDana.toast.permohonanCreated} (${m.nomorPermohonan})`);
    store.setWizardDraft(null);
    router.push(`/penyaluran-dana/pemohon/${m.id}`);
  } catch (e) {
    toast.error((e as Error).message);
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.wizardTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.wizardSubtitle }}</p>
    </header>

    <div v-if="draft" class="flex flex-col gap-4">
      <StepIndicator :steps="STEPS" :current-step="step" />

      <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-6">
        <WizardStep1DataPembelian v-if="step === 1" />
        <WizardStep2Dokumen v-else-if="step === 2" :preview-permohonan="previewPermohonan" />
        <WizardStep3TahapChecklist v-else :sisa-saldo="sisaSaldo" @submit="submitPermohonan" />
      </div>

      <div class="flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-40"
          :disabled="step === 1"
          @click="back"
        >
          <ArrowLeft class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.wizard.sebelumnya }}
        </button>
        <button
          v-if="step < 3"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
          @click="next"
        >
          {{ LOCALIZATION.penyaluranDana.wizard.simpanLanjut }} <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>
