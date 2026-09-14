<script setup lang="ts">
// WizardStep1DataPembelian — pilih proposal (A/B generate), jenis pembelian, divisi+nilai, rekening & skema.
import { computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import DivisiNilaiTable from '@/components/penyaluran-dana/DivisiNilaiTable.vue';
import { wizardPermohonanSchema } from '@/schemas/penyaluranDana';
import { BANK_MITRA_SEED } from '@/types/penyaluranDana';
import { formatRupiah } from '@/utils/exportProposal';
import { Building2 } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const draft = computed(() => store.wizardDraft!);

const eligible = computed(() => store.eligibleProposals);
const proposal = computed(() => store.proposals.find((p) => p.id === draft.value.proposalId));

const sisaSaldo = computed(() => {
  if (!proposal.value) return 0;
  const terpakai = store.permohonanList
    .filter((m) => m.proposalId === proposal.value!.id)
    .reduce((s, m) => s + m.divisiItems.reduce((a, d) => a + d.nilaiPermohonan, 0), 0);
  return Math.max(proposal.value.saldoPernyataan - terpakai, 0);
});

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {};
  const r = wizardPermohonanSchema.safeParse({ ...draft.value, sisaSaldo: sisaSaldo.value });
  if (!r.success) for (const i of r.error.issues) e[i.path.join('.')] ??= i.message;
  return e;
});

const err = (k: string) => errors.value[k];
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Pilih proposal -->
    <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      {{ LOCALIZATION.penyaluranDana.wizard.pilihProposal }} *
      <select
        v-model="draft.proposalId"
        class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
        :class="err('proposalId') ? 'border-red-400' : ''"
      >
        <option value="" disabled>—</option>
        <option v-for="p in eligible" :key="p.id" :value="p.id">{{ p.nomorProposal }} — {{ p.namaKp }}</option>
      </select>
      <span v-if="err('proposalId')" class="text-red-500 text-[11px]">{{ err('proposalId') }}</span>
    </label>

    <!-- Data A & B (auto-generate preview) -->
    <div v-if="proposal" class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <Building2 class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.wizard.dataA }} & {{ LOCALIZATION.penyaluranDana.wizard.dataB }} (auto-generate)
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">Pagu</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ formatRupiah(proposal.pagu) }}</p></div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">Luas</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ proposal.luasHektar }} ha</p></div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">Pekebun / KK</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ proposal.jumlahPekebun }} / {{ proposal.jumlahKK }}</p></div>
        <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.sisaSaldo }}</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ formatRupiah(sisaSaldo) }}</p></div>
      </div>
    </div>

    <!-- Jenis pembelian & peruntukan -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.jenisPembelian }} *
        <select v-model="draft.jenisPembelian" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40">
          <option value="PEMBELIAN">{{ LOCALIZATION.penyaluranDana.status.PEMBELIAN }}</option>
          <option value="REIMBURSEMENT">{{ LOCALIZATION.penyaluranDana.status.REIMBURSEMENT }}</option>
          <option value="UMK">{{ LOCALIZATION.penyaluranDana.status.UMK }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.peruntukan }} *
        <select v-model="draft.peruntukan" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40">
          <option value="BENEFICIER">{{ LOCALIZATION.penyaluranDana.status.BENEFICIER }}</option>
          <option value="OPERASIONAL_KP">{{ LOCALIZATION.penyaluranDana.status.OPERASIONAL_KP }}</option>
        </select>
      </label>
    </div>

    <!-- Divisi + nilai per divisi -->
    <div class="flex flex-col gap-1.5">
      <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.wizard.divisi }}</p>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.divisiHint }}</p>
      <DivisiNilaiTable v-model="draft.divisiItems" :sisa-saldo="sisaSaldo" />
      <span v-if="err('divisiItems')" class="text-red-500 text-[11px]">{{ err('divisiItems') }}</span>
    </div>

    <!-- Rekening tujuan -->
    <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.wizard.rekeningTujuan }}</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.namaRekening }} *
        <input v-model="draft.rekeningTujuan.namaRekening" type="text" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.namaRekening') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.namaRekening')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.namaRekening') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.nomorRekening }} *
        <input v-model="draft.rekeningTujuan.nomorRekening" type="text" inputmode="numeric" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.nomorRekening') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.nomorRekening')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.nomorRekening') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.bankTujuan }} *
        <select v-model="draft.rekeningTujuan.bankTujuan" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40">
          <option value="" disabled>—</option>
          <option v-for="b in BANK_MITRA_SEED" :key="b" :value="b">{{ b }}</option>
        </select>
        <span v-if="err('rekeningTujuan.bankTujuan')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.bankTujuan') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.skemaTransfer }} *
        <select v-model="draft.rekeningTujuan.skema" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40">
          <option value="ONLINE_EKSTERNAL">{{ LOCALIZATION.penyaluranDana.status.ONLINE_EKSTERNAL }}</option>
          <option value="SKN_EKSTERNAL">{{ LOCALIZATION.penyaluranDana.status.SKN_EKSTERNAL }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
        {{ LOCALIZATION.penyaluranDana.wizard.alamatTujuan }} *
        <input v-model="draft.rekeningTujuan.alamat" type="text" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.alamat') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.alamat')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.alamat') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.kota }} *
        <input v-model="draft.rekeningTujuan.kota" type="text" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.kota') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.kota')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.kota') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.wizard.kodepos }} *
        <input v-model="draft.rekeningTujuan.kodepos" type="text" inputmode="numeric" maxlength="5" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.kodepos') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.kodepos')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.kodepos') }}</span>
      </label>
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
        {{ LOCALIZATION.penyaluranDana.wizard.email }} *
        <input v-model="draft.rekeningTujuan.email" type="email" class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" :class="err('rekeningTujuan.email') ? 'border-red-400' : ''" />
        <span v-if="err('rekeningTujuan.email')" class="text-red-500 text-[11px]">{{ err('rekeningTujuan.email') }}</span>
      </label>
    </div>
  </div>
</template>
