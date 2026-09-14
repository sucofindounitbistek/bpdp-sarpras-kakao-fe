<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { LOCALIZATION } from '@/config/localization';
import { UserCheck } from 'lucide-vue-next';

const authStore = useAuthStore();

const roles = [
  { id: 'KELEMBAGAAN_PEKEBUN', label: LOCALIZATION.roleSwitcher.roles.KELEMBAGAAN_PEKEBUN.label, shortLabel: LOCALIZATION.roleSwitcher.roles.KELEMBAGAAN_PEKEBUN.shortLabel },
  { id: 'DINAS_KAB', label: LOCALIZATION.roleSwitcher.roles.DINAS_KAB.label, shortLabel: LOCALIZATION.roleSwitcher.roles.DINAS_KAB.shortLabel },
  { id: 'DINAS_PROV', label: LOCALIZATION.roleSwitcher.roles.DINAS_PROV.label, shortLabel: LOCALIZATION.roleSwitcher.roles.DINAS_PROV.shortLabel },
  { id: 'DITJENBUN_VERIFIKATOR', label: LOCALIZATION.roleSwitcher.roles.DITJENBUN_VERIFIKATOR.label, shortLabel: LOCALIZATION.roleSwitcher.roles.DITJENBUN_VERIFIKATOR.shortLabel },
  { id: 'DITJENBUN_APPROVAL', label: LOCALIZATION.roleSwitcher.roles.DITJENBUN_APPROVAL.label, shortLabel: LOCALIZATION.roleSwitcher.roles.DITJENBUN_APPROVAL.shortLabel },
  { id: 'BPDP_VERIFIKATOR', label: LOCALIZATION.roleSwitcher.roles.BPDP_VERIFIKATOR.label, shortLabel: LOCALIZATION.roleSwitcher.roles.BPDP_VERIFIKATOR.shortLabel },
  { id: 'BPDP_APPROVAL', label: LOCALIZATION.roleSwitcher.roles.BPDP_APPROVAL.label, shortLabel: LOCALIZATION.roleSwitcher.roles.BPDP_APPROVAL.shortLabel },
  { id: 'BPDP_PPK', label: LOCALIZATION.roleSwitcher.roles.BPDP_PPK.label, shortLabel: LOCALIZATION.roleSwitcher.roles.BPDP_PPK.shortLabel },
  { id: 'BPDP_ULP', label: LOCALIZATION.roleSwitcher.roles.BPDP_ULP.label, shortLabel: LOCALIZATION.roleSwitcher.roles.BPDP_ULP.shortLabel },
  { id: 'BPDP_STAFF', label: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BPDP_STAFF.label, shortLabel: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BPDP_STAFF.shortLabel },
  { id: 'BPDP_KADIV', label: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BPDP_KADIV.label, shortLabel: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BPDP_KADIV.shortLabel },
  { id: 'SURVEYOR_SCI', label: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).SURVEYOR_SCI.label, shortLabel: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).SURVEYOR_SCI.shortLabel },
  { id: 'BANK_MITRA', label: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BANK_MITRA.label, shortLabel: (LOCALIZATION.roleSwitcher.roles as Record<string, { label: string; shortLabel: string }>).BANK_MITRA.shortLabel },
];

const selectedRole = computed({
  get: () => authStore.activeRole,
  set: (val) => {
    authStore.setRole(val as any);
  },
});
</script>

<template>
  <div class="flex items-center gap-2 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-lg px-2.5 py-1.5 transition-all">
    <UserCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
    <span class="text-xs font-semibold text-emerald-900 dark:text-emerald-300 hidden sm:inline">{{ LOCALIZATION.roleSwitcher.label }}</span>
    <select
      v-model="selectedRole"
      class="bg-transparent text-xs font-semibold text-emerald-950 dark:text-emerald-200 border-none outline-none cursor-pointer focus:ring-0 max-w-[140px] sm:max-w-none truncate"
    >
      <option
        v-for="r in roles"
        :key="r.id"
        :value="r.id"
        class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
      >
        {{ r.label }}
      </option>
    </select>
  </div>
</template>
