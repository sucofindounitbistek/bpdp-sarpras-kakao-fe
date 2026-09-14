<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import { X, Building, Send, FileText, CheckCircle } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  permohonan: PermohonanPenyaluranBarang | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { jalur: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG'; catatan: string }): void;
}>();

const totalNilai = computed(() => {
  if (!props.permohonan) return 0;
  return props.permohonan.itemsRAB.reduce((sum, item) => sum + (item.estimasiTotal || 0), 0);
});

const isBelow200Juta = computed(() => totalNilai.value < 200000000);
const catatan = ref('');

function handleSubmit() {
  emit('submit', {
    jalur: isBelow200Juta.value ? 'PENGADAAN_LANGSUNG' : 'ULP_TENDER',
    catatan: catatan.value,
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
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 my-auto">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Disposisi Pengadaan ke BPDP ULP</h3>
              <p class="text-[11px] text-slate-500">Meneruskan paket pengadaan barang kepada Unit Layanan Pengadaan</p>
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

        <!-- Info Ringkas Permohonan -->
        <div class="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-slate-500">Nomor Permohonan:</span>
            <strong class="text-emerald-700 dark:text-emerald-400 font-mono">{{ permohonan.nomorPermohonan }}</strong>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-slate-500">Lembaga Pekebun:</span>
            <strong class="text-slate-800 dark:text-slate-200">{{ permohonan.namaLembagaPekebun }}</strong>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span class="text-slate-500">Total Estimasi Kebutuhan:</span>
            <strong class="text-emerald-700 dark:text-emerald-400 font-bold font-mono">Rp {{ totalNilai.toLocaleString('id-ID') }}</strong>
          </div>
        </div>

        <!-- Dokumen Terlampir dari BPDP Teknis -->
        <div class="space-y-2 p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/60 text-xs">
          <p class="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <CheckCircle class="w-4 h-4 text-indigo-600" />
            Dokumen Dasar Pengadaan Telah Lengkap:
          </p>
          <div class="space-y-1.5 pt-1 pl-1">
            <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <FileText class="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Surat Permohonan: <strong>{{ permohonan.suratPermohonanNamaFile || 'Surat_Permohonan_Pekebun.pdf' }}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <FileText class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Nota Dinas Teknis: <strong>{{ permohonan.notaDinasNamaFile || 'Nota_Dinas_Direktur_Teknis.pdf' }}</strong></span>
            </div>
          </div>
        </div>

        <!-- Catatan Tambahan (Opsional) -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Catatan Disposisi ke ULP (Opsional):</label>
          <textarea
            v-model="catatan"
            rows="2"
            placeholder="Contoh: Dokumen lengkap. Mohon segera diproses pemilihan penyedia melalui e-catalog."
            class="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSubmit"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
            <span>Kirim ke BPDP ULP</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
