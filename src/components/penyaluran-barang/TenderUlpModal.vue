<script setup lang="ts">
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import { X, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  permohonan: PermohonanPenyaluranBarang | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();
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
            <div class="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <ShoppingCart class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Konfirmasi Penyelesaian Pemilihan Penyedia</h3>
              <p class="text-[11px] text-slate-500">Tender & Pemilihan Vendor e-Catalog Selesai (Konektor 4)</p>
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

        <!-- Info Box Permohonan -->
        <div class="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Nomor Permohonan:</span>
            <strong class="text-purple-700 dark:text-purple-400 font-mono">{{ permohonan.nomorPermohonan }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Lembaga Pekebun:</span>
            <strong class="text-slate-800 dark:text-slate-200">{{ permohonan.namaLembagaPekebun }}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Paket Bantuan:</span>
            <strong class="text-slate-800 dark:text-slate-200">{{ permohonan.kategoriPaket }} Kelapa</strong>
          </div>
        </div>

        <!-- Notice Box SOP -->
        <div class="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <AlertCircle class="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-bold text-purple-900 dark:text-purple-200">
              Proses Pemilihan Penyedia di e-Catalog Telah Selesai
            </p>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Apakah Anda yakin proses tender/pemilihan dan penetapan pemenang di sistem e-catalog telah selesai dilaksanakan di luar aplikasi?
            </p>
            <p class="text-[11px] text-purple-800 dark:text-purple-300 font-medium">
              Tiket permohonan akan dialirkan ke <strong>BPDP Teknis</strong> untuk pembuatan dan penginputan <strong>Dokumen Kontrak "A"</strong>.
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
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
            @click="emit('confirm')"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>Ya, Selesaikan & Teruskan ke Teknis</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
