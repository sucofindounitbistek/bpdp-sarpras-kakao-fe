<script setup lang="ts">
// RoleNotifikasiPanel — badge notifikasi in-app per peran (integrasi NotifikasiEvent, US8).
import { computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import type { TargetRoleNotifikasi } from '@/types/penyaluranDana';
import { Bell } from 'lucide-vue-next';

const props = defineProps<{ targetRole: TargetRoleNotifikasi; limit?: number }>();
const store = usePenyaluranDanaStore();
const items = computed(() => store.notifikasiByRole(props.targetRole).slice(0, props.limit ?? 6));
</script>

<template>
  <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4">
    <h2 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-2">
      <Bell class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Notifikasi
      <span v-if="items.length" class="ml-auto px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-500 text-[10px] font-bold">{{ items.length }}</span>
    </h2>
    <div v-if="items.length === 0" class="text-xs text-slate-400 py-2">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
    <div v-else class="flex flex-col gap-1.5">
      <div v-for="n in items" :key="n.id" class="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <span class="mt-1 w-1.5 h-1.5 rounded-full bg-[#066C2A] dark:bg-emerald-400 shrink-0" />
        <span><span class="font-semibold">{{ n.judul }}</span> — {{ n.pesan }} <span class="text-slate-400">({{ new Date(n.createdAt).toLocaleString('id-ID') }})</span></span>
      </div>
    </div>
  </section>
</template>
