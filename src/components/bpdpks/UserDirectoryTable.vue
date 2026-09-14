<script setup lang="ts">
import { ref, computed } from 'vue';
import { SimulatedUser } from '@/types/penyaluran';
import { LOCALIZATION } from '@/config/localization';
import { Users, Search } from 'lucide-vue-next';

const selectedFilterRole = ref<string>('ALL');
const searchQuery = ref<string>('');

const usersList = ref<SimulatedUser[]>([
  { id: '1', name: 'Budi Santoso (Koperasi)', email: 'budi@koperasiKelapa.id', role: 'PEMOHON', status: 'ACTIVE', createdAt: '2026-01-15' },
  { id: '2', name: 'Drs. Supriyadi', email: 'supriyadi@luwu.dinas.go.id', role: 'DINAS_KAB', status: 'ACTIVE', createdAt: '2026-01-20' },
  { id: '3', name: 'Hj. Ratna Sarumpaet', email: 'ratna@sulsel.dinas.go.id', role: 'DINAS_PROV', status: 'ACTIVE', createdAt: '2026-02-01' },
  { id: '4', name: 'Dr. Ir. Hendra', email: 'hendra@ditjenbun.pertanian.go.id', role: 'DITJENBUN', status: 'ACTIVE', createdAt: '2026-02-10' },
  { id: '5', name: 'Budi Raharjo', email: 'raharjo@bpdp.go.id', role: 'BPDPKS', status: 'ACTIVE', createdAt: '2026-02-15' },
]);

const filteredUsers = computed(() => {
  return usersList.value.filter(user => {
    const matchRole = selectedFilterRole.value === 'ALL' || user.role === selectedFilterRole.value;
    const matchSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchRole && matchSearch;
  });
});
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <Users class="w-5 h-5 text-[#066C2A]" /> {{ LOCALIZATION.userDirectory.title }}
      </h3>

      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="LOCALIZATION.userDirectory.searchPlaceholder"
            class="h-9 pl-9 pr-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#066C2A]"
          />
        </div>

        <!-- Filter Role -->
        <select
          v-model="selectedFilterRole"
          class="h-9 px-3 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold focus:outline-none focus:border-[#066C2A]"
        >
          <option value="ALL">{{ LOCALIZATION.userDirectory.filterRoles.all }}</option>
          <option value="PEMOHON">{{ LOCALIZATION.userDirectory.filterRoles.pemohon }}</option>
          <option value="DINAS_KAB">{{ LOCALIZATION.userDirectory.filterRoles.dinasKab }}</option>
          <option value="DINAS_PROV">{{ LOCALIZATION.userDirectory.filterRoles.dinasProv }}</option>
          <option value="DITJENBUN">{{ LOCALIZATION.userDirectory.filterRoles.ditjenbun }}</option>
          <option value="BPDPKS">{{ LOCALIZATION.userDirectory.filterRoles.bpdpks }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto border border-slate-200 rounded-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
            <th class="py-3 px-4">{{ LOCALIZATION.userDirectory.table.headers.nama }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.userDirectory.table.headers.email }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.userDirectory.table.headers.role }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.userDirectory.table.headers.status }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.userDirectory.table.headers.tglRegistrasi }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
          <tr v-for="u in filteredUsers" :key="u.id" class="hover:bg-slate-50/60">
            <td class="py-3 px-4 font-semibold text-slate-900">{{ u.name }}</td>
            <td class="py-3 px-4 text-slate-500 font-mono">{{ u.email }}</td>
            <td class="py-3 px-4">
              <span class="bg-emerald-50 text-[#066C2A] border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                {{ u.role }}
              </span>
            </td>
            <td class="py-3 px-4">
              <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                {{ u.status }}
              </span>
            </td>
            <td class="py-3 px-4 text-slate-400 font-mono">{{ u.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

