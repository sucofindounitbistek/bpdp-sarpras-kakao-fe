<script setup lang="ts">
import type { StatusLog } from '@/types/rekomtek';
import { LOCALIZATION } from '@/config/localization';
import { History, User } from 'lucide-vue-next';

defineProps<{
  logs?: StatusLog[];
}>();

const formatRole = (role: string) => {
  return role.replace(/_/g, ' ');
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const isReturnLog = (log: StatusLog) => {
  const returnStatuses = ['PERBAIKAN_DINAS_KAB', 'PERBAIKAN_DINAS_PROV', 'VERIFIKASI_DITJENBUN'];
  if (returnStatuses.includes(log.toStatus)) return true;
  if (log.note) {
    const lowerNote = log.note.toLowerCase();
    if (lowerNote.includes('dikembalikan') || lowerNote.includes('revisi') || lowerNote.includes('pushback') || lowerNote.includes('ditolak')) {
      return true;
    }
  }
  return false;
};
</script>

<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
      <History class="w-4.5 h-4.5 text-[#066C2A] dark:text-emerald-400" />
      <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">
        {{ LOCALIZATION.logStatusUsulan.title }}
      </h3>
    </div>

    <!-- Timeline Scroll Container with Seamless Connected Line -->
    <div v-if="logs && logs.length > 0" class="flex flex-col gap-6 my-2">
      <div v-for="(log, index) in logs" :key="log.id" class="relative flex gap-3.5 items-start">
        <!-- Left Column: Node Dot & Connecting Line -->
        <div class="relative flex flex-col items-center shrink-0 w-5 pt-0.5 self-stretch">
          <!-- Connected Vertical Track Line to Next Item -->
          <div
            v-if="index !== logs.length - 1"
            class="absolute top-4 -bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700/80"
          />

          <!-- Node Circle Indicator -->
          <div
            :class="[
              'w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 z-10 transition-all shadow-xs shrink-0',
              isReturnLog(log)
                ? 'bg-amber-500 ring-2 ring-amber-100 dark:ring-amber-950/40'
                : 'bg-[#066C2A] dark:bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-950/40',
            ]"
          />
        </div>

        <!-- Right Column: Log Content -->
        <div class="flex flex-col gap-1.5 flex-1 min-w-0">
          <!-- Role Badge and Timestamp -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{{ formatRole(log.actorRole) }}</span>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <span class="text-slate-700 dark:text-slate-300 font-bold normal-case font-apple-body">{{ log.actorName }}</span>
            </div>
            <span class="text-[11px] text-slate-400 dark:text-slate-500">
              {{ formatDate(log.createdAt) }}
            </span>
          </div>

          <!-- Transition Info -->
          <div class="flex items-center gap-1.5 flex-wrap text-[12px] font-bold">
            <span class="text-slate-400">{{ formatStatus(log.fromStatus) }}</span>
            <span class="text-slate-300">→</span>
            <span
              :class="[
                isReturnLog(log)
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[#066C2A] dark:text-emerald-400',
              ]"
            >
              {{ formatStatus(log.toStatus) }}
            </span>
          </div>

          <!-- Note/Reason Block -->
          <div v-if="log.note" class="bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-[12px] text-slate-600 dark:text-slate-300 font-apple-body leading-relaxed">
            {{ log.note }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6 text-slate-400 dark:text-slate-500 text-[13px]">
      {{ LOCALIZATION.logStatusUsulan.emptyState }}
    </div>
  </div>
</template>
