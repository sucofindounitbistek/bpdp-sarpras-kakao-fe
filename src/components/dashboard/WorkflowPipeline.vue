<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMetricsStore } from '@/stores/metrics';
import { LOCALIZATION } from '@/config/localization';
import PipelineCard from './PipelineCard.vue';
import { ChevronRight, ChevronLeft, ChevronDown } from 'lucide-vue-next';

const authStore = useAuthStore();
const metricsStore = useMetricsStore();

// Define target routes per stage
const STAGE_ROUTE_MAP: Record<string, string> = {
  '1': '/pengusulan/pengajuan-proposal',
  '2': '/dinas/verifikasi/kabupaten',
  '3': '/dinas/verifikasi/kabupaten',
  '4': '/dinas/verifikasi/provinsi',
  '5': '/ditjenbun/rekomtek',
  '6': '/ditjenbun/rekomtek',
  '7': '/ditjenbun/rekomtek',
  '8': '/bpdp/antrean',
  '9': '/bpdp/antrean',
  '10': '/bpdp/antrean'
};

// Check if a stage is active for the current active role
const isStageActiveForRole = (stageId: string): boolean => {
  const role = authStore.activeRole;
  
  if (role === 'DINAS_KAB') {
    return stageId === '2' || stageId === '3';
  }
  if (role === 'DINAS_PROV') {
    return stageId === '4';
  }
  if (role === 'DITJENBUN_VERIFIKATOR') {
    return stageId === '5' || stageId === '6';
  }
  if (role === 'DITJENBUN_APPROVAL') {
    return stageId === '7';
  }
  if (role === 'BPDP_VERIFIKATOR') {
    return stageId === '8' || stageId === '10';
  }
  if (role === 'BPDP_APPROVAL') {
    return stageId === '9';
  }
  return false;
};

// Load stage localized names
const getStageLabel = (stageId: string): string => {
  const keys: Record<string, string> = {
    '1': LOCALIZATION.pipeline.stages.pengajuanProposal,
    '2': LOCALIZATION.pipeline.stages.verifikasiKab,
    '3': LOCALIZATION.pipeline.stages.approvalSkCpcl,
    '4': LOCALIZATION.pipeline.stages.asistensiProv,
    '5': LOCALIZATION.pipeline.stages.asistensiDitjenbun,
    '6': LOCALIZATION.pipeline.stages.penerbitanRekomtek,
    '7': LOCALIZATION.pipeline.stages.approvalRekomtek,
    '8': LOCALIZATION.pipeline.stages.penelitianBpdp,
    '9': LOCALIZATION.pipeline.stages.approvalBpdp,
    '10': LOCALIZATION.pipeline.stages.penerbitanSkDirut
  };
  return keys[stageId] || '';
};

// Combine configs, metrics and active states
const stagesList = computed(() => {
  const metrics = metricsStore.activePipelineData;
  return Array.from({ length: 10 }, (_, idx) => {
    const id = String(idx + 1);
    const metric = metrics.find(m => m.stageId === id) || { pekebun: 0, lahan: 0, proposal: 0, pengembalian: 0 };
    return {
      stageId: id,
      label: getStageLabel(id),
      targetUrl: STAGE_ROUTE_MAP[id] || '',
      isActive: isStageActiveForRole(id),
      pekebun: metric.pekebun,
      lahan: metric.lahan,
      proposal: metric.proposal,
      pengembalian: metric.pengembalian
    };
  });
});
</script>

<template>
  <section class="flex flex-col gap-5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 md:p-7 shadow-sm border border-slate-200/80 dark:border-slate-800">
    <div class="flex flex-col gap-1.5">
      <h3 class="text-sm md:text-[15px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
        {{ LOCALIZATION.pipeline.title }}
      </h3>
      <span class="text-xs md:text-sm text-slate-500 dark:text-slate-400">
        Klik kartu alur di bawah untuk langsung menuju berkas yang memerlukan tindakan.
      </span>
    </div>

    <!-- Desktop Looped Workflow View (>= 1024px) -->
    <div class="hidden lg:flex flex-col gap-10 relative py-4">

      <!-- Row 1: Stages 1 -> 2 -> 3 (LTR) -->
      <div class="grid grid-cols-3 gap-10 relative items-center">
        <template v-for="(stage, idx) in stagesList.slice(0, 3)" :key="stage.stageId">
          <div class="relative flex items-center w-full">
            <PipelineCard
              v-bind="stage"
              class="w-full"
            />
            <!-- Horizontal connection arrow -->
            <div
              v-if="idx < 2"
              class="absolute left-full top-1/2 -translate-y-1/2 w-10 h-0 z-20 pointer-events-none"
            >
              <div class="absolute left-0 right-1.5 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronRight class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>

            <!-- Downward edge arrow from Card 3 (idx 2) to Row 2 Card 4 below -->
            <div
              v-if="idx === 2"
              class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-10 z-20 pointer-events-none"
            >
              <div class="absolute top-0 bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-gradient-to-b from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronDown class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>
          </div>
        </template>
      </div>

      <!-- Row 2: Stages 6 <- 5 <- 4 (RTL) -->
      <div class="grid grid-cols-3 gap-10 relative items-center">
        <!-- Render in visual order: 6, 5, 4 (Stage 6 on left, 5 in center, 4 on right) -->
        <template v-for="(stage, idx) in [stagesList[5], stagesList[4], stagesList[3]]" :key="stage.stageId">
          <div class="relative flex items-center w-full">
            <PipelineCard
              v-bind="stage"
              class="w-full"
            />
            <!-- Horizontal left connection arrow: between col 1 & 2, and col 2 & 3 -->
            <div
              v-if="idx < 2"
              class="absolute left-full top-1/2 -translate-y-1/2 w-10 h-0 z-20 pointer-events-none"
            >
              <div class="absolute left-1.5 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-l from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronLeft class="absolute -left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>

            <!-- Downward edge arrow from Card 6 (idx 0) to Row 3 Card 7 below -->
            <div
              v-if="idx === 0"
              class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-10 z-20 pointer-events-none"
            >
              <div class="absolute top-0 bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-gradient-to-b from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronDown class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>
          </div>
        </template>
      </div>

      <!-- Row 3: Stages 7 -> 8 -> 9 (LTR) -->
      <div class="grid grid-cols-3 gap-10 relative items-center">
        <template v-for="(stage, idx) in stagesList.slice(6, 9)" :key="stage.stageId">
          <div class="relative flex items-center w-full">
            <PipelineCard
              v-bind="stage"
              class="w-full"
            />
            <!-- Horizontal right connection arrow -->
            <div
              v-if="idx < 2"
              class="absolute left-full top-1/2 -translate-y-1/2 w-10 h-0 z-20 pointer-events-none"
            >
              <div class="absolute left-0 right-1.5 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronRight class="absolute -right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>

            <!-- Downward edge arrow from Card 9 (idx 2) to Row 4 Card 10 below -->
            <div
              v-if="idx === 2"
              class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-10 z-20 pointer-events-none"
            >
              <div class="absolute top-0 bottom-1.5 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-gradient-to-b from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
              <ChevronDown class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
            </div>
          </div>
        </template>
      </div>

      <!-- Row 4: Stage 10 (Aligned under Card 9 in Column 3) -->
      <div class="grid grid-cols-3 gap-10 relative items-center">
        <div class="col-span-2" />
        <div class="relative flex items-center w-full">
          <PipelineCard
            v-bind="stagesList[9]"
            class="w-full"
          />
        </div>
      </div>

    </div>

    <!-- Mobile Vertical Step View (< 1024px) -->
    <div class="flex lg:hidden flex-col gap-3">
      <template v-for="(stage, idx) in stagesList" :key="stage.stageId">
        <div class="flex flex-col items-center">
          <PipelineCard
            v-bind="stage"
            class="w-full"
          />
          <!-- Flow connector -->
          <div
            v-if="idx < 9"
            class="relative w-0 h-9 mt-1.5 mb-0.5"
          >
            <div class="absolute top-0 bottom-1 left-1/2 -translate-x-1/2 w-[3px] rounded-full bg-gradient-to-b from-[#066C2A]/20 via-[#066C2A]/70 to-[#066C2A] shadow-[0_0_8px_rgba(6,108,42,0.35)]" />
            <ChevronDown class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 text-[#066C2A] fill-[#066C2A] drop-shadow-[0_0_5px_rgba(6,108,42,0.55)]" />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

