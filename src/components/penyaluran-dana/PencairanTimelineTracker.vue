<script setup lang="ts">
// PencairanTimelineTracker — timeline gabungan lintas aktor (KP→SCI→BPDP→Bank) dari event log.
import { LOCALIZATION } from '@/config/localization';
import type { TimelineEvent } from '@/types/penyaluranDana';
import { History } from 'lucide-vue-next';

defineProps<{ events: TimelineEvent[] }>();

const aktorColor: Record<string, string> = {
  KP: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  SCI: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  BPDP: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  BANK: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
};
</script>

<template>
  <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
    <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
      <History class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.page.detailTitle }}
    </h4>
    <div v-if="events.length === 0" class="text-xs text-slate-400 py-3">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
    <ol v-else class="relative border-l border-slate-200 dark:border-slate-700 ml-2">
      <li v-for="e in events" :key="e.id" class="mb-4 ml-4 last:mb-0">
        <span class="absolute -left-[7px] mt-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900" :class="aktorColor[e.aktor] ? 'bg-current ' + aktorColor[e.aktor] : 'bg-slate-300'" />
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="aktorColor[e.aktor] ?? 'bg-slate-100 text-slate-500'">{{ e.aktor }}</span>
          <p class="text-xs text-slate-700 dark:text-slate-200">{{ e.kejadian }}</p>
        </div>
        <p class="text-[10px] text-slate-400 mt-0.5">{{ new Date(e.waktu).toLocaleString('id-ID') }}</p>
      </li>
    </ol>
  </section>
</template>
