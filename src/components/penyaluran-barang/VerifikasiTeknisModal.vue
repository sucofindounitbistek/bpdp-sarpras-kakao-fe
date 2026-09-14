<script setup lang="ts">
import { ref } from 'vue';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import { X, CheckCircle, XCircle, Send, FileText, UploadCloud, AlertCircle } from 'lucide-vue-next';
import { useToast } from '@/composables/useToast';

const toast = useToast();

defineProps<{
  isOpen: boolean;
  permohonan: PermohonanPenyaluranBarang | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (
    e: 'submit',
    payload: {
      isApproved: boolean;
      catatan: string;
      fileNotaDinas?: { namaFile: string; url: string };
    }
  ): void;
}>();

const keputusan = ref<'YA' | 'TIDAK'>('YA');
const catatan = ref('');
const notaDinasFile = ref<File | null>(null);
const notaDinasNamaFile = ref<string>('Nota_Dinas_Direktur_Teknis_Pengadaan.pdf');

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Format berkas harus PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi 5 MB.');
      return;
    }
    notaDinasFile.value = file;
    notaDinasNamaFile.value = file.name;
    toast.success(`Berkas Nota Dinas "${file.name}" siap diunggah.`);
  }
}

function handleSubmit() {
  if (keputusan.value === 'YA') {
    if (!notaDinasNamaFile.value) {
      toast.error('Wajib mengunggah berkas Nota Dinas Direktur Teknis.');
      return;
    }
    emit('submit', {
      isApproved: true,
      catatan: catatan.value || 'Permohonan memenuhi syarat teknis. Nota Dinas diterbitkan ke PPK.',
      fileNotaDinas: {
        namaFile: notaDinasNamaFile.value,
        url: 'mock-nota-dinas-direktur-teknis.pdf',
      },
    });
  } else {
    if (!catatan.value.trim()) {
      toast.error('Wajib mencantumkan alasan penolakan/perbaikan.');
      return;
    }
    emit('submit', {
      isApproved: false,
      catatan: catatan.value,
    });
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && permohonan"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
      @click.self="emit('close')"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 my-auto">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Verifikasi Teknis & Nota Dinas</h3>
              <p class="text-[11px] text-slate-500">Pemeriksaan Surat Permohonan Pengadaan Barang</p>
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
            <span class="text-slate-500">Paket Bantuan:</span>
            <strong class="text-slate-800 dark:text-slate-200">{{ permohonan.kategoriPaket }} Kelapa ({{ permohonan.itemsRAB?.length || 0 }} Item Barang)</strong>
          </div>
          <div v-if="permohonan.suratPermohonanNamaFile" class="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span class="text-slate-500 flex items-center gap-1.5">
              <FileText class="w-3.5 h-3.5 text-blue-600" />
              Surat Permohonan Pekebun:
            </span>
            <span class="font-semibold text-blue-700 dark:text-blue-400 truncate max-w-48 sm:max-w-xs text-[11px]">
              {{ permohonan.suratPermohonanNamaFile }}
            </span>
          </div>
        </div>

        <!-- Pilihan Cek: Iya vs Tidak -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Hasil Pengecekan Permohonan (Cek):
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="keputusan = 'YA'"
              :class="[
                'p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                keputusan === 'YA'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50',
              ]"
            >
              <CheckCircle class="w-4 h-4 text-emerald-600" />
              <span>Iya (Setujui & Buat Nota Dinas)</span>
            </button>
            <button
              type="button"
              @click="keputusan = 'TIDAK'"
              :class="[
                'p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                keputusan === 'TIDAK'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50',
              ]"
            >
              <XCircle class="w-4 h-4 text-rose-600" />
              <span>Tidak (Kembalikan ke Draft)</span>
            </button>
          </div>
        </div>

        <!-- JIKA IYA: Form Upload Nota Dinas Direktur Teknis ke PPK -->
        <div v-if="keputusan === 'YA'" class="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60">
          <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <UploadCloud class="w-4 h-4 text-emerald-600" />
            <span>Upload Berkas Nota Dinas Direktur Teknis ke PPK</span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Direktur Teknis mengirimkan Nota Dinas ke PPK sebagai dasar pelaksanaan proses pengadaan barang/jasa.
          </p>

          <div class="relative border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 rounded-2xl p-4 text-center hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
            <input
              type="file"
              accept=".pdf"
              @change="handleFileChange"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div class="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
              <UploadCloud class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                {{ notaDinasNamaFile ? notaDinasNamaFile : 'Pilih atau Tarik Berkas PDF Nota Dinas' }}
              </p>
              <p class="text-[11px] text-slate-500">Format PDF (Maksimal 5 MB)</p>
            </div>
          </div>
        </div>

        <!-- JIKA TIDAK: Form Catatan Revisi/Alasan Penolakan -->
        <div v-else class="space-y-2 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/60">
          <div class="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
            <AlertCircle class="w-4 h-4 text-rose-600" />
            <span>Alasan / Catatan Perbaikan ke Pekebun</span>
          </div>
          <textarea
            v-model="catatan"
            rows="3"
            placeholder="Contoh: Rincian spesifikasi varietas dan surat permohonan belum lengkap. Mohon perbaiki dan ajukan ulang."
            class="w-full text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500/20"
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
            :class="[
              'inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md active:scale-95 transition-all cursor-pointer',
              keputusan === 'YA'
                ? 'bg-[#066C2A] hover:bg-[#055722] shadow-[#066C2A]/25 ring-2 ring-emerald-500/20'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25',
            ]"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ keputusan === 'YA' ? 'Kirim ke BPDP PPK' : 'Kembalikan ke Draft Pekebun' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
