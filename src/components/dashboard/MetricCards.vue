<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import Skeleton from '@/components/ui/Skeleton.vue';
import { FileText, CheckCircle2, Clock, AlertTriangle, Users, MapPin, DollarSign, Award, Landmark } from 'lucide-vue-next';

const authStore = useAuthStore();
const danaStore = usePenyaluranDanaStore();
const isLoading = ref(false);

watch(
  () => authStore.activeRole,
  () => {
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 350);
  }
);

const roleMetrics = computed(() => {
  const role = authStore.activeRole;
  const m = LOCALIZATION.metricCards;

  switch (role) {
    case 'KELEMBAGAAN_PEKEBUN':
    case 'PEMOHON':
      return [
        { title: m.pemohon.totalUsulan, value: '3 Proposal', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', note: m.pemohon.totalUsulanNote },
        { title: m.pemohon.totalCpcl, value: '45 Petani', icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.pemohon.totalCpclNote },
        { title: m.pemohon.luasLahan, value: '67.5 Ha', icon: MapPin, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', note: m.pemohon.luasLahanNote },
        { title: m.pemohon.statusTerakhir, value: m.pemohon.statusTerakhirValue, icon: Clock, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60', note: m.pemohon.statusTerakhirNote },
      ];
    case 'DINAS_KAB':
      return [
        { title: m.dinasKab.menungguVerifikasi, value: '12 Usulan', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', note: m.dinasKab.menungguVerifikasiNote },
        { title: m.dinasKab.rekomtekDiterbitkan, value: '28 Usulan', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.dinasKab.rekomtekDiterbitkanNote },
        { title: m.dinasKab.dikembalikan, value: '4 Usulan', icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60', note: m.dinasKab.dikembalikanNote },
        { title: m.dinasKab.totalLuas, value: '450.8 Ha', icon: MapPin, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', note: m.dinasKab.totalLuasNote },
      ];
    case 'DINAS_PROV':
      return [
        { title: m.dinasProv.validasiMasuk, value: '28 Usulan', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', note: m.dinasProv.validasiMasukNote },
        { title: m.dinasProv.disetujuiProvinsi, value: '24 Usulan', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.dinasProv.disetujuiProvinsiNote },
        { title: m.dinasProv.sinkronisasiKuota, value: '85.7%', icon: Award, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60', note: m.dinasProv.sinkronisasiKuotaNote },
        { title: m.dinasProv.dikembalikanKab, value: '4 Usulan', icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', note: m.dinasProv.dikembalikanKabNote },
      ];
    case 'DITJENBUN_VERIFIKATOR':
    case 'DITJENBUN_APPROVAL':
      return [
        { title: m.ditjenbun.evaluasiPleno, value: '24 Usulan', icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60', note: m.ditjenbun.evaluasiPlenoNote },
        { title: m.ditjenbun.skPenetapan, value: '18 SK', icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.ditjenbun.skPenetapanNote },
        { title: m.ditjenbun.totalAnggaran, value: 'Rp 14.5 M', icon: DollarSign, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', note: m.ditjenbun.totalAnggaranNote },
        { title: m.ditjenbun.targetArea, value: '2,450 Ha', icon: MapPin, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', note: m.ditjenbun.targetAreaNote },
      ];
    case 'BPDP_VERIFIKATOR':
    case 'BPDP_APPROVAL':
    case 'BPDP_STAFF':
    case 'BPDP_KADIV':
    default:
      return [
        { title: m.bpdp.totalPengguna, value: '142 User', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60', note: m.bpdp.totalPenggunaNote },
        { title: m.bpdp.skPenyaluran, value: '18 SK', icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.bpdp.skPenyaluranNote },
        { title: m.bpdp.pksBerjalan, value: '14 PKS', icon: CheckCircle2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60', note: m.bpdp.pksBerjalanNote },
        { title: m.bpdp.pencairanDana, value: `Rp ${(danaStore.saldoEscrowTotal / 1000000000).toFixed(1)} M`, icon: Landmark, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', note: m.bpdp.pencairanDanaNote },
      ];
  }
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Skeleton Loaders during hydration -->
    <template v-if="isLoading">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4"
      >
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-2 flex-1 mr-4">
            <Skeleton height="0.75rem" width="60%" />
            <Skeleton height="1.75rem" width="80%" />
          </div>
          <Skeleton height="2.5rem" width="2.5rem" custom-class="rounded-xl shrink-0" />
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Skeleton height="0.65rem" width="50%" />
          <Skeleton height="0.65rem" width="20%" />
        </div>
      </div>
    </template>

    <!-- Actual Cards -->
    <template v-else>
      <div
        v-for="(card, index) in roleMetrics"
        :key="index"
        class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
      >
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 font-apple-caption">
              {{ card.title }}
            </span>
            <span class="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight font-apple-body-strong">
              {{ card.value }}
            </span>
          </div>
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', card.bg]">
            <component :is="card.icon" :class="['w-5 h-5', card.color]" />
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <span class="text-slate-400 dark:text-slate-500 font-medium">{{ card.note }}</span>
          <span class="text-[#066C2A] dark:text-emerald-400 font-bold">{{ LOCALIZATION.metricCards.updatedLive }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

