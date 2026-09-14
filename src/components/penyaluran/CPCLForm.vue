<script setup lang="ts">
import { ref } from 'vue';
import { CPCLPekebunLahan } from '@/types/penyaluran';
import { LOCALIZATION } from '@/config/localization';
import { User, Plus, Trash2 } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'save-cpcl', data: CPCLPekebunLahan[]): void;
}>();

const listCPCL = ref<CPCLPekebunLahan[]>([
  {
    id: '1',
    namaPekebun: 'Budi Santoso',
    nik: '3201123456780001',
    noHp: '081298765432',
    luasLahanHa: 2.5,
    statusSertifikat: 'SHM',
    noSertifikat: 'SHM-12938/2020',
    kabupaten: 'Kab. Luwu Utara',
    kecamatan: 'Kec. Mangkutana',
    desa: 'Desa Wonorejo',
    polygonCoordinates: [[-2.54, 120.93], [-2.55, 120.94]],
  },
  {
    id: '2',
    namaPekebun: 'Ahmad Subagyo',
    nik: '3201123456780002',
    noHp: '081345678901',
    luasLahanHa: 1.8,
    statusSertifikat: 'SKT',
    noSertifikat: 'SKT-998/2021',
    kabupaten: 'Kab. Luwu Utara',
    kecamatan: 'Kec. Mangkutana',
    desa: 'Desa Wonorejo',
    polygonCoordinates: [[-2.52, 120.91], [-2.53, 120.92]],
  },
]);

const newForm = ref({
  namaPekebun: '',
  nik: '',
  noHp: '',
  luasLahanHa: 1.0,
  statusSertifikat: 'SHM' as const,
  noSertifikat: '',
  kabupaten: 'Kab. Luwu Utara',
  kecamatan: 'Kec. Mangkutana',
  desa: 'Desa Wonorejo',
});

const isFormOpen = ref(false);

const handleAddPekebun = () => {
  if (!newForm.value.namaPekebun || !newForm.value.nik) return;
  listCPCL.value.push({
    id: Date.now().toString(),
    ...newForm.value,
    polygonCoordinates: [[-2.5, 120.9]],
  });
  newForm.value.namaPekebun = '';
  newForm.value.nik = '';
  newForm.value.noSertifikat = '';
  isFormOpen.value = false;
  emit('save-cpcl', listCPCL.value);
};

const handleRemove = (id: string) => {
  listCPCL.value = listCPCL.value.filter(item => item.id !== id);
  emit('save-cpcl', listCPCL.value);
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 shadow-xs">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <User class="w-5 h-5 text-[#066C2A]" /> {{ LOCALIZATION.penyaluranCpclForm.title }}
        </h3>
        <p class="text-xs text-slate-500 mt-1">{{ LOCALIZATION.penyaluranCpclForm.subtitle }}</p>
      </div>

      <button
        type="button"
        @click="isFormOpen = !isFormOpen"
        class="bg-[#066C2A] hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
      >
        <Plus class="w-4 h-4" /> {{ LOCALIZATION.penyaluranCpclForm.btnAdd }}
      </button>
    </div>

    <!-- Modal Form Tambah Pekebun -->
    <div v-if="isFormOpen" class="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex flex-col gap-4">
      <h4 class="text-xs font-bold text-emerald-950 uppercase tracking-wider">{{ LOCALIZATION.penyaluranCpclForm.modalTitle }}</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.nama }}</label>
          <input v-model="newForm.namaPekebun" type="text" :placeholder="LOCALIZATION.penyaluranCpclForm.fields.namaPlaceholder" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1" />
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.nik }}</label>
          <input v-model="newForm.nik" type="text" :placeholder="LOCALIZATION.penyaluranCpclForm.fields.nikPlaceholder" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1" />
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.noHp }}</label>
          <input v-model="newForm.noHp" type="text" :placeholder="LOCALIZATION.penyaluranCpclForm.fields.noHpPlaceholder" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1" />
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.luasLahan }}</label>
          <input v-model.number="newForm.luasLahanHa" type="number" step="0.1" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1" />
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.legalitas }}</label>
          <select v-model="newForm.statusSertifikat" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1">
            <option value="SHM">{{ LOCALIZATION.penyaluranCpclForm.legalitasOptions.SHM }}</option>
            <option value="SKT">{{ LOCALIZATION.penyaluranCpclForm.legalitasOptions.SKT }}</option>
            <option value="Alas Hak">{{ LOCALIZATION.penyaluranCpclForm.legalitasOptions.ALAS_HAK }}</option>
            <option value="Girik">{{ LOCALIZATION.penyaluranCpclForm.legalitasOptions.GIRIK }}</option>
          </select>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-slate-600">{{ LOCALIZATION.penyaluranCpclForm.fields.noLegalitas }}</label>
          <input v-model="newForm.noSertifikat" type="text" :placeholder="LOCALIZATION.penyaluranCpclForm.fields.noLegalitasPlaceholder" class="w-full h-9 px-3 text-xs border rounded-lg bg-white mt-1" />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-2">
        <button type="button" @click="isFormOpen = false" class="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg">{{ LOCALIZATION.penyaluranCpclForm.buttons.cancel }}</button>
        <button type="button" @click="handleAddPekebun" class="px-4 py-1.5 text-xs bg-[#066C2A] text-white font-bold rounded-lg hover:bg-emerald-800">{{ LOCALIZATION.penyaluranCpclForm.buttons.save }}</button>
      </div>
    </div>

    <!-- Table CPCL List -->
    <div class="overflow-x-auto border border-slate-200 rounded-xl">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
            <th class="py-3 px-4">{{ LOCALIZATION.penyaluranCpclForm.table.headers.nama }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.penyaluranCpclForm.table.headers.nik }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.penyaluranCpclForm.table.headers.luas }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.penyaluranCpclForm.table.headers.legalitas }}</th>
            <th class="py-3 px-4">{{ LOCALIZATION.penyaluranCpclForm.table.headers.desa }}</th>
            <th class="py-3 px-4 text-center">{{ LOCALIZATION.penyaluranCpclForm.table.headers.aksi }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
          <tr v-for="item in listCPCL" :key="item.id" class="hover:bg-slate-50/60">
            <td class="py-3 px-4 font-semibold text-slate-900">{{ item.namaPekebun }}</td>
            <td class="py-3 px-4 font-mono text-slate-500">{{ item.nik }}</td>
            <td class="py-3 px-4 font-bold text-[#066C2A]">{{ item.luasLahanHa }} Ha</td>
            <td class="py-3 px-4">
              <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                {{ item.statusSertifikat }} ({{ item.noSertifikat }})
              </span>
            </td>
            <td class="py-3 px-4">{{ item.desa }}, {{ item.kecamatan }}</td>
            <td class="py-3 px-4 text-center">
              <button @click="handleRemove(item.id)" class="text-rose-600 hover:text-rose-800 p-1">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
