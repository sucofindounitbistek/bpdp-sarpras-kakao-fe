<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useMetricsStore } from '@/stores/metrics';
import { ROLE_DETAILS_MAP } from '@/types/role';
import { LOCALIZATION } from '@/config/localization';


import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import WorkflowPipeline from '@/components/dashboard/WorkflowPipeline.vue';
import PengusulanReminderCard from '@/components/dashboard/PengusulanReminderCard.vue';
import { ClipboardList, UserCheck, FileText, DollarSign } from 'lucide-vue-next';

const authStore = useAuthStore();
const metricsStore = useMetricsStore();

const currentRoleInfo = computed(() => {
  const role = authStore.activeRole;
  return ROLE_DETAILS_MAP[role] || ROLE_DETAILS_MAP.KELEMBAGAAN_PEKEBUN || ROLE_DETAILS_MAP.PEMOHON;
});

// const isDinas = computed(() => {
//   const role = authStore.activeRole;
//   return role === 'DINAS_KAB' || role === 'DINAS_PROV';
// });

const metrics = computed(() => metricsStore.activeMetrics);

// Custom icon resolver for card variants
const getCardIcon = (idx: number) => {
  if (idx === 0) return ClipboardList;
  if (idx === 1) return FileText;
  if (idx === 2) return UserCheck;
  return DollarSign;
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Bar -->
    <header class="flex flex-col md:flex-row md:items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 gap-3">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-body-strong flex items-center gap-2">
          {{ LOCALIZATION.dashboard.page.title }} <span class="text-[#066C2A] font-bold">{{ currentRoleInfo.name }}</span>
        </h1>
      </div>

    </header>
 <!-- Role Information Banner --

    <!-- Reminder: unfinished pengusulan (KP / PEMOHON only, self-hiding when complete) -->
    <PengusulanReminderCard
      v-if="authStore.activeRole === 'KELEMBAGAAN_PEKEBUN' || authStore.activeRole === 'PEMOHON'"
    />

    <!-- Stats Cards Grid (For KELEMBAGAAN_PEKEBUN / PEMOHON role) -->
    <section v-if="authStore.activeRole === 'KELEMBAGAAN_PEKEBUN' || authStore.activeRole === 'PEMOHON'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(card, idx) in metrics.cards"
        :key="idx"
        class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-3"
      >
        <div class="flex items-start justify-between">
          <span class="text-xs font-semibold text-slate-500 leading-tight">
            {{ card.label }}
          </span>
          <div class="w-8 h-8 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
            <component :is="getCardIcon(idx)" class="w-4 h-4" />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-xl md:text-2xl font-semibold text-slate-800 tracking-tight leading-none font-apple-body-strong">
            {{ card.value }}
          </span>
        </div>
      </div>
    </section>

    <!-- Workflow Pipeline Section (For all non-PEMOHON roles) -->
    <WorkflowPipeline v-else />
  </div>
</template>
