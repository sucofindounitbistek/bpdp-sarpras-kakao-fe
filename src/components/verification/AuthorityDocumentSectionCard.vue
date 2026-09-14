<script setup lang="ts">
import { computed } from 'vue';
import { Building2, Compass, Award, FileCheck2, CheckCircle2, AlertCircle } from 'lucide-vue-next';
import type { AuthoritySectionMeta } from '@/lib/authoritySections';

const props = withDefaults(
  defineProps<{
    tier: AuthoritySectionMeta;
    totalDocs?: number;
    rejectedCount?: number;
    statusText?: string;
  }>(),
  {
    totalDocs: 0,
    rejectedCount: 0,
  }
);

const iconComponent = computed(() => {
  switch (props.tier.iconName) {
    case 'Building2':
      return Building2;
    case 'Compass':
      return Compass;
    case 'Award':
      return Award;
    case 'FileCheck2':
    default:
      return FileCheck2;
  }
});

const isRejected = computed(() => props.rejectedCount > 0);
</script>

<template>
  <div
    :class="[
      'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden flex flex-col',
      isRejected
        ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-400/20'
        : 'border-slate-200/80 dark:border-slate-800/80'
    ]"
  >
    <!-- Section Header with Authority Visual Identity -->
    <div
      :class="[
        'p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b bg-slate-50/50 dark:bg-slate-950/40',
        tier.headerBorderClass,
        isRejected ? 'border-b-rose-200 dark:border-b-rose-900/40' : 'border-b-slate-100 dark:border-b-slate-800/80'
      ]"
    >
      <div class="flex items-start gap-3 min-w-0">
        <div
          :class="[
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5',
            tier.badgeClass
          ]"
        >
          <component :is="iconComponent" class="w-4.5 h-4.5" />
        </div>

        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {{ tier.title }}
            </h4>
            <span
              :class="[
                'text-[10px] font-semibold px-2 py-0.5 rounded-md border',
                tier.badgeClass
              ]"
            >
              {{ tier.roleLabel }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
            {{ tier.description }}
          </p>
        </div>
      </div>

      <!-- Right Side Status Badge -->
      <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <slot name="header-right">
          <span
            v-if="isRejected"
            class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 shadow-2xs"
          >
            <AlertCircle class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>{{ rejectedCount }} Dokumen Ditolak</span>
          </span>
          <span
            v-else-if="statusText"
            class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#066C2A] dark:text-emerald-400 border border-emerald-250 dark:border-emerald-800 shadow-2xs"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-[#066C2A] dark:text-emerald-400" />
            <span>{{ statusText }}</span>
          </span>
          <span
            v-else-if="totalDocs > 0"
            class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            {{ totalDocs }} Dokumen
          </span>
        </slot>
      </div>
    </div>

    <!-- Section Body: Documents List -->
    <div class="p-4 sm:p-5 flex flex-col gap-3.5">
      <slot />
    </div>
  </div>
</template>
