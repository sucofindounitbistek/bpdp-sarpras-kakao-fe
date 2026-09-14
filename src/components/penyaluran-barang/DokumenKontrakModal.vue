<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PermohonanPenyaluranBarang, DokumenKontrakA } from '@/types/penyaluranBarang';
import { X, FileSignature, Upload, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  permohonan: PermohonanPenyaluranBarang | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: DokumenKontrakA): void;
}>();

const nomorKontrak = ref('');
const namaPenyedia = ref('');
const jenisBarang = ref('');
const jumlahBarang = ref<number>(0);
const satuanBarang = ref('Batang');
const hargaSatuan = ref<number>(0);
const totalNilaiKontrak = ref<number>(0);
const terminPembayaran = ref('Termin 1: 30% Uang Muka, Termin 2: 70% BASTP Pengiriman Penuh');
const terminPenyaluran = ref('Tahap 1: 50% di Gudang Pekebun, Tahap 2: 50% Distribusi Lapangan');
const jangkaWaktuHari = ref<number>(60);
const tanggalMulai = ref(new Date().toISOString().split('T')[0]);
const tanggalSelesai = ref('');
const fileNameKontrak = ref('Dokumen_Kontrak_Pengadaan_Kelapa.pdf');

watch(
  () => props.permohonan,
  (p) => {
    if (p) {
      nomorKontrak.value = `KTRK/BPDP-SARPRAS/${p.kategoriPaket === 'Ekstensifikasi' ? 'EKS' : 'INT'}/${new Date().getFullYear()}/${p.id}`;
      namaPenyedia.value = p.pemenangVendor || 'PT Agro Sarana Nusantara';

      const primaryItem = p.itemsRAB[0];
      if (primaryItem) {
        jenisBarang.value = `${primaryItem.jenisBarang} (${primaryItem.namaBarangVarietas})`;
        jumlahBarang.value = primaryItem.jumlah;
        satuanBarang.value = primaryItem.satuan;
        hargaSatuan.value = primaryItem.estimasiHargaSatuan;
      }

      totalNilaiKontrak.value = p.nilaiPemenangTender || p.itemsRAB.reduce((sum, it) => sum + it.estimasiTotal, 0);

      // Hitung tanggal selesai 60 hari
      const d = new Date();
      d.setDate(d.getDate() + 60);
      tanggalSelesai.value = d.toISOString().split('T')[0];
    }
  },
  { immediate: true }
);

function handleCalculateTotal() {
  if (hargaSatuan.value && jumlahBarang.value) {
    totalNilaiKontrak.value = hargaSatuan.value * jumlahBarang.value;
  }
}

function handleSubmit() {
  emit('submit', {
    nomorKontrak: nomorKontrak.value,
    dokumenKontrakNamaFile: fileNameKontrak.value,
    dokumenKontrakUrl: `mock-${fileNameKontrak.value}`,
    namaPenyedia: namaPenyedia.value,
    jenisBarang: jenisBarang.value,
    jumlahBarang: jumlahBarang.value,
    satuanBarang: satuanBarang.value,
    hargaSatuan: hargaSatuan.value,
    totalNilaiKontrak: totalNilaiKontrak.value,
    terminPembayaran: terminPembayaran.value,
    terminPenyaluran: terminPenyaluran.value,
    jangkaWaktuHari: jangkaWaktuHari.value,
    tanggalMulai: tanggalMulai.value,
    tanggalSelesai: tanggalSelesai.value,
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
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileSignature class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                Input & Unggah Data Kontrak Pengadaan (Dokumen "A")
              </h3>
              <p class="text-xs text-slate-500">Pencatatan legalitas kontrak kerja sama dengan Vendor pemenang tender</p>
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

        <!-- Form Grid 10 Required Items -->
        <div class="space-y-4 text-xs">
          <!-- 1. Nomor Kontrak & 3. Nama Penyedia -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">1. Nomor Kontrak SPK <span class="text-rose-500">*</span></label>
              <input
                v-model="nomorKontrak"
                type="text"
                placeholder="Contoh: KTRK/BPDP-SARPRAS/2026/001"
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">3. Nama Penyedia / Vendor Rekanan <span class="text-rose-500">*</span></label>
              <input
                v-model="namaPenyedia"
                type="text"
                placeholder="Contoh: PT Agro Nusantara Perkasa"
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <!-- 4. Jenis Barang & 5. Jumlah & Satuan (Auto from Permohonan) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div class="space-y-1 sm:col-span-2">
              <label class="font-semibold text-slate-500 dark:text-slate-400">4. Jenis & Komoditas Barang (Data Permohonan)</label>
              <input
                v-model="jenisBarang"
                type="text"
                class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-semibold text-slate-500 dark:text-slate-400">5. Jumlah Volume</label>
              <div class="flex items-center gap-1.5">
                <input
                  v-model.number="jumlahBarang"
                  type="number"
                  @input="handleCalculateTotal"
                  class="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none text-right"
                />
                <span class="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">{{ satuanBarang }}</span>
              </div>
            </div>
          </div>

          <!-- 6. Harga Satuan & 7. Total Nilai Kontrak -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">6. Harga Satuan (Rp) <span class="text-rose-500">*</span></label>
              <input
                v-model.number="hargaSatuan"
                type="number"
                @input="handleCalculateTotal"
                placeholder="Rp..."
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 outline-none text-right"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">7. Total Nilai Kontrak (Rp) <span class="text-rose-500">*</span></label>
              <input
                v-model.number="totalNilaiKontrak"
                type="number"
                placeholder="Rp..."
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/20 font-black text-emerald-800 dark:text-emerald-300 outline-none text-right"
              />
            </div>
          </div>

          <!-- 8. Termin Pembayaran & 9. Termin Penyaluran -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">8. Skema Termin Pembayaran</label>
              <input
                v-model="terminPembayaran"
                type="text"
                placeholder="Contoh: Termin 1: 30%, Termin 2: 70%"
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700 dark:text-slate-300">9. Skema Termin Penyaluran Barang</label>
              <input
                v-model="terminPenyaluran"
                type="text"
                placeholder="Contoh: Tahap 1: 50%, Tahap 2: 50%"
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
            </div>
          </div>

          <!-- 10. Jangka Waktu Pelaksanaan & Tanggal -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-700 dark:text-slate-300">10. Jangka Waktu (Hari)</label>
              <input
                v-model.number="jangkaWaktuHari"
                type="number"
                placeholder="60"
                class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none text-center"
              />
            </div>
            <div class="space-y-1">
              <label class="font-semibold text-slate-500 dark:text-slate-400">Tanggal Mulai</label>
              <input
                v-model="tanggalMulai"
                type="date"
                class="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
            </div>
            <div class="space-y-1">
              <label class="font-semibold text-slate-500 dark:text-slate-400">Tanggal Selesai</label>
              <input
                v-model="tanggalSelesai"
                type="date"
                class="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
              />
            </div>
          </div>

          <!-- 2. Upload Dokumen Kontrak -->
          <div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label class="font-bold text-slate-700 dark:text-slate-300">2. Unggah Dokumen Kontrak Kerjasama (PDF)</label>
            <div class="border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-4 text-center cursor-pointer hover:bg-emerald-50 transition-colors">
              <Upload class="w-6 h-6 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <p class="font-bold text-emerald-950 dark:text-emerald-200 text-xs">{{ fileNameKontrak }}</p>
              <p class="text-[10px] text-slate-400">Format PDF, maks. 10 MB (Surat Perjanjian Kerja Sama & Syarat Ketentuan)</p>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="emit('close')"
            class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSubmit"
            class="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            Simpan Dokumen Kontrak "A"
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
