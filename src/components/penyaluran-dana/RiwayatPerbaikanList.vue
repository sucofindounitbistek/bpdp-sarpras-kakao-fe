<script setup lang="ts">
// RiwayatPerbaikanList — daftar "Dikembalikan untuk Perbaikan" beserta catatan.
import { LOCALIZATION } from '@/config/localization';
import type { RiwayatPerbaikan } from '@/types/penyaluranDana';
import { RotateCcw } from 'lucide-vue-next';

defineProps<{ items: RiwayatPerbaikan[] }>();
</script>

<template>
  <section v-if="items.length > 0" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
    <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
      <RotateCcw class="w-4 h-4 text-amber-500" /> {{ LOCALIZATION.penyaluranDana.verifikasi.riwayatPerbaikan }}
    </h4>
    <div class="flex flex-col gap-1.5">
      <div v-for="r in items" :key="r.id" class="text-[11px] rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2">
        <p class="text-amber-700 dark:text-amber-300"><span class="font-semibold">{{ r.gerbang }}</span> — {{ r.catatan }}</p>
        <p class="text-slate-400 mt-0.5">{{ r.aktor }} · {{ new Date(r.createdAt).toLocaleString('id-ID') }}</p>
      </div>
    </div>
  </section>
</template>
