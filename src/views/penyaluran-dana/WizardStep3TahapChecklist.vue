<script setup lang="ts">
// WizardStep3TahapChecklist — ringkasan + "Cek" kelengkapan (Sesuai/Tidak Sesuai) + perbaikan ulang.
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { wizardPermohonanSchema } from '@/schemas/penyaluranDana';
import { formatRupiah } from '@/utils/exportProposal';
import { CheckCircle2, XCircle, ClipboardCheck } from 'lucide-vue-next';

const props = defineProps<{ sisaSaldo: number }>();
const emit = defineEmits<{ submit: [] }>();
const store = usePenyaluranDanaStore();
const draft = computed(() => store.wizardDraft!);
const sudahCek = ref(false);

const proposal = computed(() => store.proposals.find((p) => p.id === draft.value.proposalId));
const total = computed(() => draft.value.divisiItems.reduce((s, d) => s + d.nilaiPermohonan, 0));

const cek = computed(() => {
  const r = wizardPermohonanSchema.safeParse({ ...draft.value, sisaSaldo: props.sisaSaldo });
  const formOk = r.success;
  return {
    form: { ok: formOk, pesan: formOk ? '' : r.error.issues[0]?.message ?? '' },
    surat: { ok: !!draft.value.suratTtdFile, pesan: LOCALIZATION.penyaluranDana.wizard.uploadSuratTtd },
    dokD: { ok: draft.value.dokumenDFiles.length > 0, pesan: LOCALIZATION.penyaluranDana.wizard.dokumenD },
    ba: { ok: !!draft.value.baFile, pesan: LOCALIZATION.penyaluranDana.wizard.uploadBa },
  };
});

const semuaSesuai = computed(() => Object.values(cek.value).every((c) => c.ok));

function jalankanCek() {
  sudahCek.value = true;
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <p class="sm:col-span-2 font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
        <ClipboardCheck class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Ringkasan Permohonan
      </p>
      <p class="text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.common.proposal }}: <span class="font-medium text-slate-700 dark:text-slate-200">{{ proposal?.nomorProposal ?? '—' }}</span></p>
      <p class="text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.jenisPembelian }}: <span class="font-medium text-slate-700 dark:text-slate-200">{{ (LOCALIZATION.penyaluranDana.status as Record<string, string>)[draft.jenisPembelian] }}</span></p>
      <p class="text-slate-500 dark:text-slate-400">Divisi terpilih: <span class="font-medium text-slate-700 dark:text-slate-200">{{ draft.divisiItems.length }}</span></p>
      <p class="text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.totalPermohonan }}: <span class="font-semibold text-[#066C2A] dark:text-emerald-400">{{ formatRupiah(total) }}</span></p>
    </div>

    <button
      type="button"
      class="self-start inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
      @click="jalankanCek"
    >
      <ClipboardCheck class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.wizard.cek }}
    </button>

    <div v-if="sudahCek" class="rounded-xl border p-4 flex flex-col gap-2" :class="semuaSesuai ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-amber-300 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20'">
      <div v-for="(c, key) in cek" :key="key" class="flex items-start gap-2 text-xs">
        <component :is="c.ok ? CheckCircle2 : XCircle" class="w-4 h-4 mt-0.5 shrink-0" :class="c.ok ? 'text-emerald-500' : 'text-amber-500'" />
        <p :class="c.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'">
          <span class="font-semibold">{{ c.ok ? LOCALIZATION.penyaluranDana.wizard.sesuai : LOCALIZATION.penyaluranDana.wizard.tidakSesuai }}</span>
          <span v-if="!c.ok"> — {{ c.pesan }}</span>
        </p>
      </div>
      <p v-if="!semuaSesuai" class="text-[11px] text-amber-600 dark:text-amber-400">{{ LOCALIZATION.penyaluranDana.wizard.perbaiki }} pada langkah sebelumnya.</p>
      <button
        v-if="semuaSesuai"
        type="button"
        class="self-start mt-1 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
        @click="emit('submit')"
      >
        {{ LOCALIZATION.penyaluranDana.wizard.submit }}
      </button>
    </div>
  </div>
</template>
