<script setup lang="ts">
// BankMitraView — komparisi A.3 + notifikasi jadwal/Surat Persetujuan + konfirmasi transfer + penutupan (US1/US4/US7).
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import KomparisiPanel from '@/components/penyaluran-dana/KomparisiPanel.vue';
import { formatRupiah } from '@/utils/exportProposal';
import { Landmark, Bell, ArrowRightLeft, Lock, CheckCircle2 } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const toast = useToast();
const loading = ref(true);
setTimeout(() => (loading.value = false), 350);

const notifikasi = computed(() => store.notifikasiByRole('BANK_MITRA'));
const pksList = computed(() => store.pksList.filter((k) => !store.komparisiList.some((c) => c.pksId === k.id && c.pihak === 'A3_BANK')));
const tahapSiapTransfer = computed(() => store.tahapList.filter((t) => t.status === 'DISETUJUI'));
const tahapTerkirim = computed(() => store.tahapList.filter((t) => t.status === 'DITRANSFER'));
const penutupanSiap = computed(() => store.penutupanList.filter((p) => p.status === 'DITERIMA_BPDP'));
const penutupanSelesai = computed(() => store.penutupanList.filter((p) => p.status === 'SELESAI'));

function permohonanOf(pencairanId: string) {
  return store.permohonanList.find((m) => m.id === pencairanId);
}

function konfirmasiTransfer(tahapId: string) {
  store.konfirmasiTransferBank(tahapId);
  toast.success(LOCALIZATION.penyaluranDana.toast.transferBankSuccess);
}

function prosesPenutupan(proposalId: string) {
  store.prosesPenutupanBank(proposalId);
  toast.success(LOCALIZATION.penyaluranDana.toast.penutupanSuccess);
}

const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.bankTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.bankSubtitle }}</p>
    </header>

    <div v-if="loading" class="flex flex-col gap-3"><Skeleton class="h-24 w-full" /><Skeleton class="h-64 w-full" /></div>

    <template v-else>
      <!-- Notifikasi Bank -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4">
        <h2 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
          <Bell class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Notifikasi Bank Mitra
        </h2>
        <div v-if="notifikasi.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-3">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-else class="flex flex-col gap-1.5">
          <div v-for="n in notifikasi.slice(0, 6)" :key="n.id" class="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span class="mt-1 w-1.5 h-1.5 rounded-full bg-[#066C2A] dark:bg-emerald-400 shrink-0" />
            <span><span class="font-semibold">{{ n.judul }}</span> — {{ n.pesan }} <span class="text-slate-400">({{ new Date(n.createdAt).toLocaleString('id-ID') }})</span></span>
          </div>
        </div>
      </section>

      <!-- Komparisi A.3 -->
      <section class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.pks.komparisiTitle }}
        </h2>
        <div v-if="pksList.length === 0" class="text-xs text-slate-500 dark:text-slate-400 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4">
          {{ LOCALIZATION.penyaluranDana.common.kosong }}
        </div>
        <div v-for="k in pksList" :key="k.id" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4">
          <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1">{{ k.kopSuratB.namaKp }} ({{ k.proposalId }})</p>
          <KomparisiPanel :pks-id="k.id" pihak="A3_BANK" />
        </div>
      </section>

      <!-- Konfirmasi transfer -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <ArrowRightLeft class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.verifikasi.konfirmasiTransfer }}
        </h2>
        <div v-if="tahapSiapTransfer.length === 0 && tahapTerkirim.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-3">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div class="flex flex-col gap-2">
          <div v-for="t in tahapSiapTransfer" :key="t.id" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3">
            <div class="text-xs">
              <p class="font-semibold text-slate-800 dark:text-slate-100">{{ t.idPenyaluran }} — {{ permohonanOf(t.pencairanId)?.nomorPermohonan }}</p>
              <p class="text-slate-500 dark:text-slate-400">
                {{ formatRupiah(t.nominal) }} → {{ permohonanOf(t.pencairanId)?.rekeningTujuan.nomorRekening }} ({{ permohonanOf(t.pencairanId)?.rekeningTujuan.bankTujuan }})
              </p>
            </div>
            <button type="button" class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="konfirmasiTransfer(t.id)">
              <CheckCircle2 class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.verifikasi.konfirmasiTransfer }}
            </button>
          </div>
          <div v-for="t in tahapTerkirim" :key="t.id" class="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs">
            <p class="font-semibold text-emerald-700 dark:text-emerald-300">{{ t.idPenyaluran }} — {{ statusLabel(t.status) }}</p>
          </div>
        </div>
      </section>

      <!-- Penutupan rekening -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Lock class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.penutupan.title }}
        </h2>
        <div v-if="penutupanSiap.length === 0 && penutupanSelesai.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-3">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div class="flex flex-col gap-2">
          <div v-for="p in penutupanSiap" :key="p.proposalId" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
            <p class="text-xs text-slate-700 dark:text-slate-200">{{ p.proposalId }} — {{ statusLabel(p.status) }}</p>
            <button type="button" class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="prosesPenutupan(p.proposalId)">
              <Lock class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.penutupan.prosesBank }}
            </button>
          </div>
          <div v-for="p in penutupanSelesai" :key="p.proposalId" class="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {{ p.proposalId }} — {{ statusLabel(p.status) }}
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
