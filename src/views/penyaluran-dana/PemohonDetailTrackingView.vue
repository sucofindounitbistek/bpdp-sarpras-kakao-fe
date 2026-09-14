<script setup lang="ts">
// PemohonDetailTrackingView — satu halaman per permohonan: header, tahap 1–3 (checklist, gate, escrow),
// rantai verifikasi & riwayat perbaikan (US4), timeline & progress (US8), pengembalian/penutupan (US6/US7).
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import DokumenChecklistTahap from '@/components/penyaluran-dana/DokumenChecklistTahap.vue';
import EscrowSaldoCard from '@/components/penyaluran-dana/EscrowSaldoCard.vue';
import VerifikasiRantaiPanel from '@/components/penyaluran-dana/VerifikasiRantaiPanel.vue';
import RiwayatPerbaikanList from '@/components/penyaluran-dana/RiwayatPerbaikanList.vue';
import PencairanTimelineTracker from '@/components/penyaluran-dana/PencairanTimelineTracker.vue';
import TahapProgressBar from '@/components/penyaluran-dana/TahapProgressBar.vue';
import PengembalianDanaSection from '@/components/penyaluran-dana/PengembalianDanaSection.vue';
import PenutupanRekeningSection from '@/components/penyaluran-dana/PenutupanRekeningSection.vue';
import { formatRupiah } from '@/utils/exportProposal';
import { Lock, Send, RefreshCw, ArrowLeft } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = usePenyaluranDanaStore();
const toast = useToast();
const loading = ref(true);
const tahapAktif = ref<1 | 2 | 3>(1);
setTimeout(() => (loading.value = false), 350);

const permohonan = computed(() => store.permohonanList.find((m) => m.id === route.params.id));
const tahapList = computed(() => (permohonan.value ? store.tahapByPermohonan(permohonan.value.id) : []));
const tahap = computed(() => tahapList.value.find((t) => t.tahap === tahapAktif.value));
const gate = computed(() => (permohonan.value ? store.isTahapUnlocked(permohonan.value.id, tahapAktif.value) : { unlocked: false }));

function ajukan(n: 1 | 2 | 3) {
  if (!permohonan.value) return;
  try {
    store.ajukanTahap(permohonan.value.id, n);
    toast.success(`${LOCALIZATION.penyaluranDana.toast.tahapDiajukan} — .T${n}`);
  } catch (e) {
    toast.error((e as Error).message);
  }
}

function resubmit(n: 1 | 2 | 3) {
  if (!permohonan.value) return;
  try {
    store.resubmitTahap(permohonan.value.id, n);
    toast.success(LOCALIZATION.penyaluranDana.toast.tahapDiajukan);
  } catch (e) {
    toast.error((e as Error).message);
  }
}

const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <div class="flex items-center gap-2">
        <button type="button" class="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" @click="router.push('/penyaluran-dana/pemohon')">
          <ArrowLeft class="w-4 h-4 text-slate-500" />
        </button>
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.detailTitle }}</h1>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.detailSubtitle }}</p>
    </header>

    <div v-if="loading" class="flex flex-col gap-3"><Skeleton class="h-28 w-full" /><Skeleton class="h-72 w-full" /></div>

    <div v-else-if="!permohonan" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 text-center text-xs text-slate-400">
      {{ LOCALIZATION.penyaluranDana.common.kosong }}
    </div>

    <template v-else>
      <!-- Ringkasan permohonan -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
          <div>
            <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ permohonan.nomorPermohonan }}</h2>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ permohonan.dataGenerated.dataA.namaKp }} · {{ LOCALIZATION.penyaluranDana.common.diajukanPada }} {{ new Date(permohonan.createdAt).toLocaleDateString('id-ID') }}
            </p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ statusLabel(permohonan.status) }}</span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
          <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.common.total }}</p><p class="font-semibold text-[#066C2A] dark:text-emerald-400">{{ formatRupiah(store.totalPermohonanById(permohonan.id)) }}</p></div>
          <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.sisaSaldo }}</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ formatRupiah(permohonan.dataGenerated.sisaSaldo) }}</p></div>
          <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.common.escrowInfo }}</p><p class="font-semibold text-slate-700 dark:text-slate-200">{{ permohonan.dataGenerated.escrowNoRekening }}</p></div>
          <div class="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5"><p class="text-slate-400">{{ LOCALIZATION.penyaluranDana.wizard.rekeningTujuan }}</p><p class="font-semibold text-slate-700 dark:text-slate-200 truncate">{{ permohonan.rekeningTujuan.nomorRekening }} ({{ permohonan.rekeningTujuan.bankTujuan }})</p></div>
        </div>
      </section>

      <!-- Progress 40/30/30 (US8) -->
      <TahapProgressBar :tahap-list="tahapList" :total="store.totalPermohonanById(permohonan.id)" @select="(n) => (tahapAktif = n)" />

      <!-- Panel per tahap -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.tahap.title }} {{ tahapAktif }}</h3>
            <span v-if="tahap" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ tahap.idPenyaluran }}</span>
            <span v-if="tahap" class="px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="tahap.status.includes('DITOLAK') ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'">{{ statusLabel(tahap.status) }}</span>
          </div>
          <!-- Tombol ajukan / perbaiki -->
          <button
            v-if="tahap"
            type="button"
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95"
            :class="tahap.status === 'DITOLAK_PERBAIKAN'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : gate.unlocked && tahap.status === 'TERKUNCI'
                ? 'bg-[#066C2A] hover:bg-[#055722] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'"
            :disabled="!(tahap.status === 'DITOLAK_PERBAIKAN' || (gate.unlocked && tahap.status === 'TERKUNCI'))"
            @click="tahap.status === 'DITOLAK_PERBAIKAN' ? resubmit(tahapAktif) : ajukan(tahapAktif)"
          >
            <RefreshCw v-if="tahap.status === 'DITOLAK_PERBAIKAN'" class="w-4 h-4" />
            <Send v-else-if="gate.unlocked" class="w-4 h-4" />
            <Lock v-else class="w-4 h-4" />
            {{ tahap.status === 'DITOLAK_PERBAIKAN' ? 'Ajukan Ulang (Perbaikan)' : `${LOCALIZATION.penyaluranDana.tahap.ajukanTahap} ${tahapAktif}` }}
          </button>
        </div>
        <p v-if="tahap && tahap.status === 'TERKUNCI' && !gate.unlocked && gate.alasan" class="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <Lock class="w-3.5 h-3.5" /> {{ gate.alasan }}
        </p>
        <p v-if="tahap && tahap.gateProgress" class="text-[11px] text-slate-500 dark:text-slate-400">
          {{ LOCALIZATION.penyaluranDana.tahap.progressMonitoring }}: <span class="font-semibold">{{ Math.round(tahap.progressMonitoring * 100) }}%</span> (syarat ≥ {{ tahap.gateProgress * 100 }}%)
        </p>
        <p v-if="tahap && tahap.gateProgress && tahap.status !== 'DITRANSFER' && !(store.monitoringByTahap(tahap.id)?.verified && store.checklistLengkap(tahap.id))" class="text-[11px] text-amber-600 dark:text-amber-400">
          {{ LOCALIZATION.penyaluranDana.tahap.gateDanaNote }}
        </p>

        <div v-if="tahap" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.tahap.checklist }}</h4>
            <DokumenChecklistTahap :tahap-id="tahap.id" :editable="tahap.status === 'TERKUNCI' || tahap.status === 'DITOLAK_PERBAIKAN'" />
          </div>
          <div class="flex flex-col gap-3">
            <EscrowSaldoCard :tahap="tahap" />
            <VerifikasiRantaiPanel v-if="tahap.status !== 'TERKUNCI'" :tahap-id="tahap.id" readonly />
          </div>
        </div>
      </section>

      <!-- Riwayat perbaikan (US4) -->
      <RiwayatPerbaikanList :items="store.riwayatByPermohonan(permohonan.id)" />

      <!-- Timeline (US8) -->
      <PencairanTimelineTracker :events="store.timelineByPermohonan(permohonan.id)" />

      <!-- Pengembalian dana (US6) & Penutupan rekening (US7) -->
      <PengembalianDanaSection :proposal-id="permohonan.proposalId" />
      <PenutupanRekeningSection :proposal-id="permohonan.proposalId" />
    </template>
  </div>
</template>
