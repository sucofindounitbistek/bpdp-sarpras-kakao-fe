<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePenyaluranBarangStore } from '@/stores/penyaluranBarang';
import type { ItemPreferensiRAB, PaketKategori } from '@/types/penyaluranBarang';
import ItemRabFormTable from '@/components/penyaluran-barang/ItemRabFormTable.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { downloadSuratPermohonanPdf } from '@/utils/permohonanPdfGenerator';
import { formatStandardFileName } from '@/utils/fileNaming';
import { useToast } from '@/composables/useToast';
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
} from 'lucide-vue-next';

const router = useRouter();
const store = usePenyaluranBarangStore();
const toast = useToast();

// Form States
const kategoriPaket = ref<PaketKategori>('Ekstensifikasi');
const namaLembaga = ref('Koperasi Produsen Kelapa Makmur Jaya');
const namaKetua = ref('H. Sudirman Santoso');
const kontak = ref('0812-9876-5432');
const desa = ref('Karya Maju');
const kecamatan = ref('Kelapa Dua');
const kabupaten = ref('Tanjung Jabung Barat');
const provinsi = ref('Jambi');

const itemsRAB = ref<ItemPreferensiRAB[]>([
  {
    id: 'item-init-1',
    jenisBarang: 'Benih',
    namaBarang: 'Benih Kelapa',
    varietas: 'Kelapa Genjah Kuning',
    namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kuning)',
    jumlahTahap1: 600,
    jumlahTahap2: 600,
    jumlah: 1200,
    satuan: 'Batang',
    estimasiHargaSatuan: 85000,
    estimasiTotal: 102000000,
  },
  {
    id: 'item-init-2',
    jenisBarang: 'Pupuk',
    namaBarang: 'Pupuk Majemuk NPK',
    varietas: 'NPK 15-15-15',
    namaBarangVarietas: 'Pupuk Majemuk NPK (NPK 15-15-15)',
    jumlahTahap1: 900,
    jumlahTahap2: 900,
    jumlah: 1800,
    satuan: 'Kg',
    estimasiHargaSatuan: 22000,
    estimasiTotal: 39600000,
  },
]);

const uploadedFile = ref<File | null>(null);
const uploadedFileName = ref<string>('');
const isSubmitting = ref(false);

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const rawFile = target.files[0];
    if (!rawFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Format berkas harus berupa dokumen PDF (.pdf)');
      return;
    }
    const { file: standardizedFile, fileName: standardizedName } = formatStandardFileName(rawFile, {
      documentLabel: 'Surat-Permohonan',
      proposalNumber: 'DRAFT',
      institutionName: namaLembaga.value || 'Kelembagaan',
    });
    uploadedFile.value = standardizedFile;
    uploadedFileName.value = standardizedName;
    toast.success('Berkas surat permohonan bertandatangan berhasil diunggah.');
  }
}

function handleDownloadPdf() {
  if (itemsRAB.value.length === 0) {
    toast.warning('Tambahkan minimal 1 item RAB sebelum mengunduh format surat');
    return;
  }

  downloadSuratPermohonanPdf({
    namaLembaga: namaLembaga.value,
    namaKetua: namaKetua.value,
    kontak: kontak.value,
    desa: desa.value,
    kecamatan: kecamatan.value,
    kabupaten: kabupaten.value,
    provinsi: provinsi.value,
    kategoriPaket: kategoriPaket.value,
    itemsRAB: itemsRAB.value,
  });

  toast.info('Dokumen format permohonan berhasil di-generate. Silakan periksa jendela cetak browser.');
}

async function handleSubmit() {
  if (itemsRAB.value.length === 0) {
    toast.error('Mohon lengkapi rincian item preferensi kebutuhan barang (RAB)');
    return;
  }

  if (!uploadedFileName.value) {
    toast.error('Mohon unggah berkas surat permohonan bertandatangan basah (PDF)');
    return;
  }

  isSubmitting.value = true;

  try {
    const newPermohonan = await store.createPermohonan({
      namaLembagaPekebun: namaLembaga.value,
      namaKetua: namaKetua.value,
      kontak: kontak.value,
      desa: desa.value,
      kecamatan: kecamatan.value,
      kabupaten: kabupaten.value,
      provinsi: provinsi.value,
      kategoriPaket: kategoriPaket.value,
      itemsRAB: [...itemsRAB.value],
      suratPermohonanUrl: `mock-${uploadedFileName.value}`,
      suratPermohonanNamaFile: uploadedFileName.value,
      tanggalPengajuan: new Date().toISOString().split('T')[0],
    });

    toast.success(`Permohonan ${newPermohonan.nomorPermohonan} berhasil diajukan dan diteruskan ke Tim Teknis BPDP!`);
    router.push('/penyaluran-barang/pemohon');
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengajukan permohonan');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header with Back Button (Floating Card Aligned with Navbar) -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="router.push('/penyaluran-barang/pemohon')"
          class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
          title="Kembali ke Daftar Permohonan"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div class="flex flex-col gap-1">
          <Breadcrumb />
          <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Form Permohonan Penyaluran Barang
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Lengkapi data kelembagaan, spesifikasi kebutuhan komoditas, dan unggah surat permohonan
          </p>
        </div>
      </div>
    </header>

    <!-- Main Form Container -->
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-7">
      <!-- Step 1: Identitas Lembaga -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Data Kelembagaan Pekebun Pemohon</h3>
            <p class="text-xs text-slate-400">Pastikan data legalitas kelembagaan sesuai data CPCL</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lembaga Pekebun</label>
            <input v-model="namaLembaga" class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none font-medium" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Ketua Lembaga</label>
            <input v-model="namaKetua" class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none font-medium" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kontak Telepon / WA</label>
            <input v-model="kontak" class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none font-medium" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Paket Sarpras</label>
            <select
              v-model="kategoriPaket"
              class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer"
            >
              <option value="Ekstensifikasi">Ekstensifikasi Kelapa (Perluasan Lahan)</option>
              <option value="Intensifikasi">Intensifikasi Kelapa (Peningkatan Produktivitas)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 2: RAB Table -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Rencana Kebutuhan Barang (RAB)</h3>
            <p class="text-xs text-slate-400">Lengkapi rincian preferensi jenis barang, spesifikasi varietas, dan kuantitas</p>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tabel RAB</span>
          </div>
          <div class="p-4">
            <ItemRabFormTable v-model="itemsRAB" />
          </div>
        </div>
      </div>

      <!-- Step 3: PDF Generator & Upload Dropzone -->
      <div class="space-y-4 pt-2">
        <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Download Dokumen & Unggah Berkas Bertandatangan</h3>
            <p class="text-xs text-slate-400">Unduh format surat permohonan, bubuhkan tanda tangan ketua lembaga, lalu upload berkas PDF</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Box Download Template -->
          <div class="bg-gradient-to-br from-slate-50 to-emerald-50/20 dark:from-slate-950/60 dark:to-emerald-950/10 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Langkah 3A: Download Template
              </span>
              <p class="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2">Download Surat Permohonan Resmi</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Format surat resmi tersusun otomatis dengan kop lembaga, rincian tabel RAB, dan kolom tanda tangan.
              </p>
            </div>

            <button
              type="button"
              @click="handleDownloadPdf"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.99]"
            >
              <Download class="w-4 h-4" />
              Download Surat Permohonan (PDF)
            </button>
          </div>

          <!-- Box Upload Surat -->
          <div class="bg-gradient-to-br from-slate-50 to-emerald-50/20 dark:from-slate-950/60 dark:to-emerald-950/10 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Langkah 3B: Upload Berkas
              </span>
              <p class="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2">Upload Surat Permohonan Bertandatangan</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Unggah berkas PDF yang telah ditandatangani basah dan dicap resmi oleh ketua lembaga.
              </p>
            </div>

            <div class="relative">
              <input
                type="file"
                accept=".pdf"
                @change="handleFileUpload"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-3.5 text-center transition-all bg-white dark:bg-slate-900 flex items-center justify-center gap-2.5 shadow-2xs">
                <Upload class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">
                  {{ uploadedFileName || 'Klik atau Drag Berkas PDF Surat Permohonan' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Toolbar -->
      <div class="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="router.push('/penyaluran-barang/pemohon')"
          class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          <CheckCircle2 class="w-4 h-4" />
          Kirim Permohonan ke BPDP
        </button>
      </div>
    </div>
  </div>
</template>
