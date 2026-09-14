<script setup lang="ts">
// PemohonPencairanView — landing KP: kartu PKS + komparisi A.1 (US1) → statistik & daftar permohonan (US2/US8).
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import PksStatusCard from '@/components/penyaluran-dana/PksStatusCard.vue';
import KomparisiPanel from '@/components/penyaluran-dana/KomparisiPanel.vue';
import { formatRupiah } from '@/utils/exportProposal';
import { FileText, Clock, AlertCircle, Wallet, Plus, Eye, Bell } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const store = usePenyaluranDanaStore();
const router = useRouter();
const loading = ref(true);
setTimeout(() => (loading.value = false), 350);

const proposals = computed(() => store.proposals);
const notifikasiKp = computed(() => store.notifikasiByRole('KELEMBAGAAN_PEKEBUN').slice(0, 5));
const statistik = computed(() => store.statistikPermohonan);
const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.pemohonTitle }}</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.pemohonSubtitle }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#066C2A] hover:bg-[#055722] text-white shadow-sm transition-all active:scale-95"
        @click="router.push('/penyaluran-dana/pemohon/tambah')"
      >
        <Plus class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.page.wizardTitle }}
      </button>
    </header>

    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton class="h-24 w-full" /><Skeleton class="h-24 w-full" /><Skeleton class="h-64 w-full" />
    </div>

    <template v-else>
      <!-- Notifikasi terbaru -->
      <section v-if="notifikasiKp.length" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4">
        <h2 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
          <Bell class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Notifikasi
        </h2>
        <div class="flex flex-col gap-1.5">
          <div v-for="n in notifikasiKp" :key="n.id" class="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <span class="mt-1 w-1.5 h-1.5 rounded-full bg-[#066C2A] dark:bg-emerald-400 shrink-0" />
            <span><span class="font-semibold">{{ n.judul }}</span> — {{ n.pesan }} <span class="text-slate-400">({{ new Date(n.createdAt).toLocaleString('id-ID') }})</span></span>
          </div>
        </div>
      </section>

      <!-- Statistik (US2) -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0"><FileText class="w-5 h-5" /></div>
          <div><p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.stats.total }}</p><p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ statistik.total }}</p></div>
        </div>
        <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0"><Clock class="w-5 h-5" /></div>
          <div><p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.stats.dalamProses }}</p><p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ statistik.dalamProses }}</p></div>
        </div>
        <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0"><AlertCircle class="w-5 h-5" /></div>
          <div><p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.stats.perluPerbaikan }}</p><p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ statistik.perluPerbaikan }}</p></div>
        </div>
        <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0"><Wallet class="w-5 h-5" /></div>
          <div><p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.stats.danaMasuk }}</p><p class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ formatRupiah(statistik.danaMasuk) }}</p></div>
        </div>
      </section>

      <!-- Kartu PKS + Komparisi A.1 per proposal -->
      <section v-for="p in proposals" :key="p.id" class="flex flex-col gap-3">
        <PksStatusCard :proposal-id="p.id" />
        <KomparisiPanel v-if="store.pksByProposal(p.id) && store.pksByProposal(p.id)!.status !== 'AKTIF'" :pks-id="store.pksByProposal(p.id)!.id" pihak="A1_KP" />
      </section>

      <!-- Daftar permohonan (US2) -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white mb-3">{{ LOCALIZATION.penyaluranDana.page.pemohonTitle }}</h2>
        <div v-if="store.permohonanList.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th class="py-2 pr-3 font-semibold">{{ LOCALIZATION.penyaluranDana.common.nomor }}</th>
                <th class="py-2 pr-3 font-semibold">{{ LOCALIZATION.penyaluranDana.common.proposal }}</th>
                <th class="py-2 pr-3 font-semibold">{{ LOCALIZATION.penyaluranDana.common.total }}</th>
                <th class="py-2 pr-3 font-semibold">{{ LOCALIZATION.penyaluranDana.common.status }}</th>
                <th class="py-2 font-semibold text-right">{{ LOCALIZATION.penyaluranDana.common.aksi }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in store.permohonanList" :key="m.id" class="border-b border-slate-100 dark:border-slate-800/60">
                <td class="py-2.5 pr-3 font-medium text-slate-800 dark:text-slate-100">{{ m.nomorPermohonan }}</td>
                <td class="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{{ m.dataGenerated.dataA.namaKp }}</td>
                <td class="py-2.5 pr-3 text-slate-600 dark:text-slate-300">{{ formatRupiah(store.totalPermohonanById(m.id)) }}</td>
                <td class="py-2.5 pr-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{{ statusLabel(m.status) }}</span>
                </td>
                <td class="py-2.5 text-right">
                  <button type="button" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#066C2A] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors" @click="router.push(`/penyaluran-dana/pemohon/${m.id}`)">
                    <Eye class="w-3.5 h-3.5" /> {{ LOCALIZATION.penyaluranDana.common.lihatDetail }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>
