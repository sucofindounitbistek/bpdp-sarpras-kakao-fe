<script setup lang="ts">
// SciVerifikasiDokumenView — antrean verifikasi per sub-peran (Pendok/Verdok/QC/Kantor Pusat) + VPD.
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import VerifikasiRantaiPanel from '@/components/penyaluran-dana/VerifikasiRantaiPanel.vue';
import DokumenChecklistTahap from '@/components/penyaluran-dana/DokumenChecklistTahap.vue';
import RoleNotifikasiPanel from '@/components/penyaluran-dana/RoleNotifikasiPanel.vue';
import { formatRupiah } from '@/utils/exportProposal';
import type { TingkatVerifikasi } from '@/types/penyaluranDana';
import { ShieldCheck, FileSearch } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const loading = ref(true);
setTimeout(() => (loading.value = false), 350);

// Simulasi sub-peran SCI (data pengguna sub-peran akan datang dari IAM — CLIENT-SIMULATED)
const subPeran = ref<TingkatVerifikasi>('PENDOK');
const SUB_PERAN: { key: TingkatVerifikasi; label: string }[] = [
  { key: 'PENDOK', label: LOCALIZATION.penyaluranDana.status.PENDOK },
  { key: 'VERDOK', label: LOCALIZATION.penyaluranDana.status.VERDOK },
  { key: 'QC', label: LOCALIZATION.penyaluranDana.status.QC },
  { key: 'SCI_PUSAT', label: LOCALIZATION.penyaluranDana.status.SCI_PUSAT },
];

const antrean = computed(() => store.tahapList.filter((t) => ['DIAJUKAN', 'VERIF_SCI', 'DITOLAK_PERBAIKAN'].includes(t.status)));
const selectedId = ref<string | null>(null);
const selected = computed(() => store.tahapList.find((t) => t.id === selectedId.value));
const permohonanOf = (pencairanId: string) => store.permohonanList.find((m) => m.id === pencairanId);

const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.sciTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.sciSubtitle }}</p>
    </header>

    <!-- Pemilih sub-peran (simulasi) -->
    <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-3 flex flex-wrap items-center gap-2">
      <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.common.subPeranAktif }}:</span>
      <button
        v-for="s in SUB_PERAN"
        :key="s.key"
        type="button"
        class="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors"
        :class="subPeran === s.key ? 'border-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400' : 'border-slate-300 dark:border-slate-700 text-slate-500'"
        @click="subPeran = s.key"
      >
        {{ s.label }}
      </button>
    </div>

    <RoleNotifikasiPanel target-role="SURVEYOR_SCI" :limit="4" />

    <div v-if="loading" class="flex flex-col gap-3"><Skeleton class="h-24 w-full" /><Skeleton class="h-72 w-full" /></div>

    <template v-else>
      <section class="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <!-- Antrean -->
        <div class="xl:col-span-2 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-2">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <FileSearch class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Antrean Dokumen Pencairan
          </h2>
          <div v-if="antrean.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
          <button
            v-for="t in antrean"
            :key="t.id"
            type="button"
            class="text-left rounded-xl border p-3 transition-colors"
            :class="selectedId === t.id ? 'border-[#066C2A] bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'"
            @click="selectedId = t.id"
          >
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-100">{{ t.idPenyaluran }}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {{ permohonanOf(t.pencairanId)?.nomorPermohonan }} · {{ formatRupiah(t.nominal) }} · {{ statusLabel(t.status) }}
            </p>
          </button>
        </div>

        <!-- Detail verifikasi -->
        <div class="xl:col-span-3">
          <div v-if="selected && permohonanOf(selected.pencairanId)" class="flex flex-col gap-4">
            <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <ShieldCheck class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ selected.idPenyaluran }}
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                {{ permohonanOf(selected.pencairanId)!.dataGenerated.dataA.namaKp }} · {{ permohonanOf(selected.pencairanId)!.nomorPermohonan }} · {{ formatRupiah(selected.nominal) }}
              </p>
              <DokumenChecklistTahap :tahap-id="selected.id" />
            </div>
            <VerifikasiRantaiPanel :tahap-id="selected.id" :allowed-tingkat="[subPeran]" />
          </div>
          <div v-else class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex items-center justify-center text-xs text-slate-400">
            {{ LOCALIZATION.penyaluranDana.common.pilihBerkas }}
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
