<script setup lang="ts">
import { ref } from 'vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useToast } from '@/composables/useToast';
import { Send, FileCheck } from 'lucide-vue-next';

const toast = useToast();

const listRekomtekProv = ref([
  { id: '1', noRekomtek: 'REKOMTEK-KAB/LU/2026/042', lembaga: 'Koperasi Tani Harapan Maju', kab: 'Kab. Luwu Utara', luas: '67.5 Ha', status: 'Menunggu Validasi' },
  { id: '2', noRekomtek: 'REKOMTEK-KAB/TW/2026/018', lembaga: 'GAPOKTAN Mamberamo Kelapa', kab: 'Kab. Luwu Timur', luas: '120.0 Ha', status: 'Validasi Provinsi' },
]);

const handleValidate = (id: string) => {
  const item = listRekomtekProv.value.find(i => i.id === id);
  if (item) {
    item.status = 'Disetujui Provinsi & Teruskan Ditjenbun';
    toast.success(`Proposal ${item.lembaga} berhasil divalidasi dan diteruskan ke Ditjenbun!`, 'Validasi Provinsi');
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-2">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 flex items-center gap-2">
        <FileCheck class="w-5 h-5 text-[#066C2A]" /> Validasi & Rekomendasi Dinas Provinsi
      </h1>
      <p class="text-xs text-slate-500">Pemeriksaan dan kaji ulang Rekomtek Kabupaten/Kota tingkat Provinsi Sulawesi Selatan.</p>
    </header>

    <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
      <h3 class="text-base font-bold text-slate-900">Daftar Rekomtek Kabupaten Masuk</h3>

      <div class="overflow-x-auto border border-slate-200 rounded-xl">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
              <th class="py-3 px-4">No. Rekomtek Kab</th>
              <th class="py-3 px-4">Lembaga Pekebun</th>
              <th class="py-3 px-4">Kabupaten/Kota</th>
              <th class="py-3 px-4">Luas Total</th>
              <th class="py-3 px-4">Status Validasi</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
            <tr v-for="item in listRekomtekProv" :key="item.id">
              <td class="py-3 px-4 font-mono font-bold text-slate-900">{{ item.noRekomtek }}</td>
              <td class="py-3 px-4 font-semibold text-slate-800">{{ item.lembaga }}</td>
              <td class="py-3 px-4">{{ item.kab }}</td>
              <td class="py-3 px-4 font-bold text-[#066C2A]">{{ item.luas }}</td>
              <td class="py-3 px-4">
                <span class="bg-emerald-50 text-[#066C2A] border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <button
                  @click="handleValidate(item.id)"
                  class="bg-[#066C2A] hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 mx-auto"
                >
                  <Send class="w-3.5 h-3.5" /> Validasi & Teruskan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

