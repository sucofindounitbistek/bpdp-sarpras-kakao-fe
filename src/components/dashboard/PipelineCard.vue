<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Layers, FileText, Undo2 } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';

interface Props {
  stageId: string;
  label: string;
  pekebun: number;
  lahan: number;
  proposal: number;
  pengembalian: number;
  isActive: boolean;
  targetUrl: string;
  isFirst?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isFirst: false
});

const router = useRouter();

// Format metrics value or display standard placeholder if loading/unavailable
const displayPekebun = computed(() => {
  if (props.pekebun === undefined) return '--';
  return `${props.pekebun} Orang`;
});

const displayLahan = computed(() => {
  if (props.lahan === undefined) return '--';
  return `${props.lahan} Ha`;
});

const displayProposal = computed(() => {
  if (props.proposal === undefined) return '--';
  return `${props.proposal} Proposal`;
});

const displayPengembalian = computed(() => {
  if (props.pengembalian === undefined) return '--';
  return `${props.pengembalian} Proposal`;
});

const handleNavigate = () => {
  if (props.targetUrl) {
    router.push(props.targetUrl);
  }
};
</script>

<template>
  <div
    @click="handleNavigate"
    class="relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none group bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
    :class="[
      isActive 
        ? 'border-[#066C2A]/60 shadow-md shadow-[#066C2A]/5 dark:shadow-none ring-2 ring-[#066C2A]/15' 
        : 'border-slate-200 dark:border-slate-800 shadow-xs'
    ]"
  >
    <!-- Background overlay highlight on hover -->
    <div 
      class="absolute inset-0 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    />

    <div class="relative z-10 flex flex-col gap-3.5">
      <!-- Header Row: Step Number & Title -->
      <div class="flex items-start gap-3">
        <div 
          class="flex items-center justify-center w-8 h-8 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-colors duration-300"
          :class="[
            isActive
              ? 'bg-[#066C2A] text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          ]"
        >
          {{ stageId }}
        </div>
        
        <h4 
          class="text-[15px] sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2"
          :class="{ 'text-[#066C2A] dark:text-[#066C2A]': isActive }"
        >
          {{ label }}
        </h4>
      </div>

      <!-- Metrics Row -->
      <div class="flex flex-col gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        <!-- Pekebun -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Users class="w-3.5 h-3.5" />
            </div>
            <span class="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ LOCALIZATION.pipeline.pekebunLabel }}</span>
          </div>
          <span class="text-[13px] sm:text-sm font-extrabold font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">{{ displayPekebun }}</span>
        </div>

        <!-- Lahan -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Layers class="w-3.5 h-3.5" />
            </div>
            <span class="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ LOCALIZATION.pipeline.lahanLabel }}</span>
          </div>
          <span class="text-[13px] sm:text-sm font-extrabold font-mono text-teal-700 dark:text-teal-400 whitespace-nowrap">{{ displayLahan }}</span>
        </div>

        <!-- Proposal -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-lg bg-[#066C2A]/10 dark:bg-emerald-500/10 text-[#066C2A] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText class="w-3.5 h-3.5" />
            </div>
            <span class="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ LOCALIZATION.pipeline.proposalLabel }}</span>
          </div>
          <span class="text-[13px] sm:text-sm font-extrabold font-mono text-[#066C2A] dark:text-emerald-400 whitespace-nowrap">{{ displayProposal }}</span>
        </div>

        <!-- Pengembalian Proposal -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors"
              :class="pengembalian > 0 ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500/70 dark:text-amber-500/50'"
            >
              <Undo2 class="w-3.5 h-3.5" />
            </div>
            <span class="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{{ LOCALIZATION.pipeline.pengembalianLabel }}</span>
          </div>
          <span
            class="text-[13px] sm:text-sm font-extrabold font-mono whitespace-nowrap"
            :class="pengembalian > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-slate-800 dark:text-slate-200'"
          >
            {{ displayPengembalian }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* High-performance hover translation and scale */
div.group {
  will-change: transform, box-shadow, border-color;
}
@media (min-width: 1024px) {
  div.group:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: rgba(6, 108, 42, 0.4);
    box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(6, 108, 42, 0.15);
  }
}
</style>
