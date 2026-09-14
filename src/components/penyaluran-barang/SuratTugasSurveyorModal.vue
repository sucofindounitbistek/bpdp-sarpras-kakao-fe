<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PermohonanPenyaluranBarang, SuratTugasSurveyor } from '@/types/penyaluranBarang';
import { X, Compass, Send } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  permohonan: PermohonanPenyaluranBarang | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: SuratTugasSurveyor): void;
}>();

const nomorSurat = ref('');
const namaLembagaSurveyor = ref('PT Surveyor Indonesia (Persero) / PT SUCOFINDO');
const lingkupTugas = ref('Pelaksanaan Sampling Mutu Spesifikasi Bibit Kelapa & Pengawasan Penyaluran Fisik');
const tanggalTerbit = ref(new Date().toISOString().split('T')[0]);

watch(
  () => props.permohonan,
  (p) => {
    if (p) {
      nomorSurat.value = `ST-SURVEYOR/BPDP-TEKNIS/${new Date().getFullYear()}/${p.id}`;
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit('submit', {
    nomorSurat: nomorSurat.value,
    namaLembagaSurveyor: namaLembagaSurveyor.value,
    lingkupTugas: lingkupTugas.value,
    tanggalTerbit: tanggalTerbit.value,
    dokumenSuratUrl: `mock-surat-tugas-${nomorSurat.value}.pdf`,
    status: 'DITERBITKAN',
  });
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && permohonan"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
      @click.self="emit('close')"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
              <Compass class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Surat Tugas Sampling & Monitoring Surveyor</h3>
              <p class="text-[11px] text-slate-500">Penerbitan surat penugasan surveyor untuk verifikasi fisik barang</p>
            </div>
          </div>
          <button
            type="button"
            @click="emit('close')"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Surat Penugasan</label>
            <input
              v-model="nomorSurat"
              class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-emerald-800 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lembaga Surveyor Independen</label>
            <input
              v-model="namaLembagaSurveyor"
              class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-medium focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lingkup Tugas Penugasan</label>
            <textarea
              v-model="lingkupTugas"
              rows="3"
              class="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none text-xs focus:ring-2 focus:ring-emerald-500/20"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Efektif Terbit</label>
            <input
              v-model="tanggalTerbit"
              type="date"
              class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSubmit"
            class="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
            Terbitkan Surat Tugas
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
