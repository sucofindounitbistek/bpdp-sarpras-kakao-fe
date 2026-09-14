<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePenyaluranBarangStore } from '@/stores/penyaluranBarang';
import { usePengusulanStore } from '@/stores/pengusulan';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import ItemRabFormTable from '@/components/penyaluran-barang/ItemRabFormTable.vue';
import PenyaluranTimelineTracker from '@/components/penyaluran-barang/PenyaluranTimelineTracker.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useToast } from '@/composables/useToast';
import { downloadSuratPermohonanPdf } from '@/utils/permohonanPdfGenerator';
import {
  Eye,
  Search,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  FileSignature,
  Compass,
  Send,
  CheckCircle2,
  PackageCheck,
  Plus,
  Sparkles,
  Trash2,
  Download,
  Upload,
  FileCheck,
} from 'lucide-vue-next';

const store = usePenyaluranBarangStore();
const pengusulanStore = usePengusulanStore();
const toast = useToast();

const searchQuery = ref('');
const filterKategori = ref<string>('ALL');
const selectedPermohonanDetail = ref<PermohonanPenyaluranBarang | null>(null);

// Modal Tambah Permohonan
const showCreateModal = ref(false);
const createForm = ref({
  namaLembagaPekebun: '',
  namaKetua: '',
  kontak: '',
  desa: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: 'Jambi',
  kategoriPaket: 'Ekstensifikasi' as 'Ekstensifikasi' | 'Intensifikasi',
  status: 'DRAFT' as any,
  itemsRAB: [
    {
      id: 'item-1',
      jenisBarang: 'Benih',
      namaBarang: 'Benih Kelapa',
      varietas: 'Kelapa Genjah Kuning',
      namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kuning)',
      jumlahTahap1: 600,
      jumlahTahap2: 600,
      jumlah: 1200,
      satuan: 'Btg',
      estimasiHargaSatuan: 85000,
      estimasiTotal: 102000000,
    },
    {
      id: 'item-2',
      jenisBarang: 'Pupuk',
      namaBarang: 'Pupuk Organik / Kompos',
      varietas: 'Kompos Terfermentasi',
      namaBarangVarietas: 'Pupuk Kompos (Terfermentasi)',
      jumlahTahap1: 1500,
      jumlahTahap2: 1500,
      jumlah: 3000,
      satuan: 'Kg',
      estimasiHargaSatuan: 15000,
      estimasiTotal: 45000000,
    },
  ],
});

function openCreateModal() {
  autofillPreset('ekstensifikasi');
  showCreateModal.value = true;
}

function autofillPreset(type: 'ekstensifikasi' | 'intensifikasi') {
  if (type === 'ekstensifikasi') {
    createForm.value = {
      namaLembagaPekebun: 'Koperasi Produsen Kelapa Subur Makmur',
      namaKetua: 'H. Rusli Effendi',
      kontak: '0812-3456-7890',
      desa: 'Desa Karya Maju',
      kecamatan: 'Kecamatan Betara',
      kabupaten: 'Tanjung Jabung Barat',
      provinsi: 'Jambi',
      kategoriPaket: 'Ekstensifikasi',
      status: 'DRAFT',
      itemsRAB: [
        {
          id: 'item-1',
          jenisBarang: 'Benih',
          namaBarang: 'Benih Kelapa',
          varietas: 'Kelapa Genjah Kopyor',
          namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kopyor)',
          jumlahTahap1: 600,
          jumlahTahap2: 600,
          jumlah: 1200,
          satuan: 'Btg',
          estimasiHargaSatuan: 85000,
          estimasiTotal: 102000000,
        },
        {
          id: 'item-2',
          jenisBarang: 'Pupuk',
          namaBarang: 'Pupuk Organik / Kompos',
          varietas: 'Kompos Terfermentasi',
          namaBarangVarietas: 'Pupuk Kompos (Terfermentasi)',
          jumlahTahap1: 1500,
          jumlahTahap2: 1500,
          jumlah: 3000,
          satuan: 'Kg',
          estimasiHargaSatuan: 15000,
          estimasiTotal: 45000000,
        },
      ],
    };
  } else {
    createForm.value = {
      namaLembagaPekebun: 'Kelompok Tani Kelapa Lestari Mandiri',
      namaKetua: 'Drs. Suparman',
      kontak: '0813-8899-0011',
      desa: 'Desa Sungai Dualap',
      kecamatan: 'Kuala Betara',
      kabupaten: 'Tanjung Jabung Barat',
      provinsi: 'Jambi',
      kategoriPaket: 'Intensifikasi',
      status: 'DRAFT',
      itemsRAB: [
        {
          id: 'item-1',
          jenisBarang: 'Pupuk',
          namaBarang: 'Pupuk Majemuk NPK',
          varietas: 'NPK Phonska Plus',
          namaBarangVarietas: 'Pupuk NPK Phonska Plus',
          jumlahTahap1: 2000,
          jumlahTahap2: 2000,
          jumlah: 4000,
          satuan: 'Kg',
          estimasiHargaSatuan: 22000,
          estimasiTotal: 88000000,
        },
        {
          id: 'item-2',
          jenisBarang: 'Pestisida',
          namaBarang: 'Herbisida',
          varietas: 'Glifosat 480 SL',
          namaBarangVarietas: 'Herbisida Sistemik Glifosat',
          jumlahTahap1: 100,
          jumlahTahap2: 100,
          jumlah: 200,
          satuan: 'Liter',
          estimasiHargaSatuan: 125000,
          estimasiTotal: 25000000,
        },
      ],
    };
  }
}

const createFormTotalRAB = computed(() => {
  return createForm.value.itemsRAB.reduce((sum, it) => {
    const totalQty = (Number(it.jumlahTahap1) || 0) + (Number(it.jumlahTahap2) || 0);
    return sum + totalQty * (Number(it.estimasiHargaSatuan) || 0);
  }, 0);
});

function addRabItem() {
  createForm.value.itemsRAB.push({
    id: `item-${Date.now()}`,
    jenisBarang: 'Pupuk',
    namaBarang: 'Pupuk Majemuk NPK',
    varietas: 'NPK 15-15-15',
    namaBarangVarietas: 'Pupuk Majemuk NPK',
    jumlahTahap1: 100,
    jumlahTahap2: 100,
    jumlah: 200,
    satuan: 'Kg',
    estimasiHargaSatuan: 20000,
    estimasiTotal: 4000000,
  });
}

function removeRabItem(idx: number) {
  createForm.value.itemsRAB.splice(idx, 1);
}

async function handleSaveCreate() {
  if (!createForm.value.namaLembagaPekebun.trim()) {
    toast.error('Nama lembaga pekebun wajib diisi.');
    return;
  }
  if (!createForm.value.namaKetua.trim()) {
    toast.error('Nama ketua lembaga wajib diisi.');
    return;
  }
  if (!createForm.value.kabupaten.trim()) {
    toast.error('Kabupaten wajib diisi.');
    return;
  }

  // Recalculate item totals
  createForm.value.itemsRAB.forEach((it) => {
    it.jumlah = (it.jumlahTahap1 || 0) + (it.jumlahTahap2 || 0);
    it.estimasiTotal = it.jumlah * (it.estimasiHargaSatuan || 0);
  });

  const created = await store.createPermohonan({
    ...createForm.value,
    tanggalPengajuan: createForm.value.status === 'DRAFT' ? '' : new Date().toISOString().split('T')[0],
  });

  showCreateModal.value = false;
  toast.success(`Permohonan penyaluran baru (${created.nomorPermohonan}) berhasil ditambahkan ke daftar!`);
}

onMounted(() => {
  store.fetchPermohonanList().catch(() => {});
  const completedProposals = pengusulanStore.listPengajuan.filter(
    (p) => p.status === 'SELESAI' || (p.currentStatus as string) === 'SELESAI' || p.status === 'SK_DIRUT_PUBLISHED'
  );
  if (completedProposals.length > 0) {
    store.syncCompletedProposals(completedProposals);
  }
});

// KPI Stats
const totalPengajuan = computed(() => store.permohonanPekebun.length);
const totalProses = computed(() => store.permohonanPekebun.filter((p) => p.status !== 'PERLU_REVISI' && p.status !== 'SELESAI' && p.status !== 'DRAFT').length);
const totalRevisi = computed(() => store.permohonanPekebun.filter((p) => p.status === 'PERLU_REVISI').length);
const totalSelesai = computed(() => store.permohonanPekebun.filter((p) => p.status === 'SURVEYOR_DITUGASKAN' || p.status === 'SELESAI').length);

const filteredPermohonan = computed(() => {
  return store.permohonanPekebun.filter((item) => {
    const matchSearch =
      item.nomorPermohonan.toLowerCase().includes(searchQuery.value.toLowerCase()) || item.namaLembagaPekebun.toLowerCase().includes(searchQuery.value.toLowerCase()) || item.kabupaten.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchKat = filterKategori.value === 'ALL' || item.kategoriPaket === filterKategori.value;
    return matchSearch && matchKat;
  });
});

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

function getStatusBadge(status: PermohonanPenyaluranBarang['status']) {
  switch (status) {
    case 'DRAFT':
      return { label: 'Draft', class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300' };
    case 'MENUNGGU_VERIFIKASI_TEKNIS':
      return { label: 'Verifikasi Teknis', class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' };
    case 'PERLU_REVISI':
      return { label: 'Perlu Revisi', class: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' };
    case 'DISPOSISI_PPK':
      return { label: 'Disposisi PPK', class: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200' };
    case 'DISPOSISI_ULP':
    case 'PROSES_PEMILIHAN_PENYEDIA':
      return { label: 'Proses Tender ULP', class: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' };
    case 'PENETAPAN_PEMENANG':
      return { label: 'Pemenang Ditetapkan', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' };
    case 'PROSES_PELAKSANAAN_KONTRAK':
      return { label: 'Pelaksanaan Kontrak', class: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300' };
    case 'SURVEYOR_DITUGASKAN':
    case 'SELESAI':
      return { label: 'Surveyor Aktif / Selesai', class: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400' };
    default:
      return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

function handleDownloadSurat(item: PermohonanPenyaluranBarang) {
  downloadSuratPermohonanPdf({
    nomorPermohonan: item.nomorPermohonan,
    namaLembaga: item.namaLembagaPekebun,
    namaKetua: item.namaKetua,
    kontak: item.kontak,
    desa: item.desa,
    kecamatan: item.kecamatan,
    kabupaten: item.kabupaten,
    provinsi: item.provinsi,
    kategoriPaket: item.kategoriPaket,
    itemsRAB: item.itemsRAB,
    tanggalSurat: item.tanggalPengajuan || undefined,
  });
  toast.success('Draft Surat Permohonan Pengadaan Barang berhasil di-generate. Silakan cetak & tandatangani.');
}

function handleUploadSuratFile(event: Event, item: PermohonanPenyaluranBarang) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('File surat permohonan harus berformat PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file PDF tidak boleh melebihi 5 MB.');
      return;
    }
    const fakeUrl = URL.createObjectURL(file);
    store.simpanSuratPermohonan(item.id, file.name, fakeUrl);
    if (selectedPermohonanDetail.value && selectedPermohonanDetail.value.id === item.id) {
      selectedPermohonanDetail.value.suratPermohonanNamaFile = file.name;
      selectedPermohonanDetail.value.suratPermohonanUrl = fakeUrl;
    }
    toast.success(`Surat Permohonan bertandatangan (${file.name}) berhasil diunggah.`);
  }
}

function handleAjukanPenyaluran(item: PermohonanPenyaluranBarang) {
  if (!item.suratPermohonanNamaFile) {
    toast.warning('Surat Permohonan bertandatangan belum diunggah. Silakan unduh draft template & unggah file PDF surat terlebih dahulu.');
    return;
  }
  store.ajukanPenyaluran(item.id);
  if (selectedPermohonanDetail.value && selectedPermohonanDetail.value.id === item.id) {
    selectedPermohonanDetail.value = {
      ...item,
      status: 'MENUNGGU_VERIFIKASI_TEKNIS',
      tanggalPengajuan: new Date().toISOString().split('T')[0],
    };
  }
  toast.success(`Permohonan penyaluran untuk ${item.nomorPermohonan} berhasil diajukan ke Tim Teknis BPDP!`);
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Bar Floating Card (Aligned with Navbar) -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">Penyaluran Barang <span class="text-[#066C2A] font-bold">(Ekstensifikasi & Intensifikasi)</span></h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">Monitoring dan pelaksanaan penyaluran bantuan barang dari proposal sarpras kelapa yang telah selesai diverifikasi</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="openCreateModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#066C2A] hover:bg-[#055722] text-white shadow-sm transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Input Permohonan Penyaluran Barang/Jasa</span>
        </button>
      </div>
    </header>

    <!-- KPI Metric Cards Banner -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <FileText class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Pengajuan</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ totalPengajuan }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Dalam Proses</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-400">{{ totalProses }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <AlertCircle class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Perlu Revisi</p>
          <p class="text-lg font-bold text-amber-700 dark:text-amber-400">{{ totalRevisi }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Kontrak & Pelaksanaan</p>
          <p class="text-lg font-bold text-teal-700 dark:text-teal-400">{{ totalSelesai }}</p>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar Card -->
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          placeholder="Cari no permohonan, lembaga, kabupaten..."
          class="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <span class="text-xs font-semibold text-slate-500 hidden sm:inline">Kategori:</span>
        <select v-model="filterKategori" class="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer">
          <option value="ALL">Semua Kategori Paket</option>
          <option value="Ekstensifikasi">Ekstensifikasi Kelapa</option>
          <option value="Intensifikasi">Intensifikasi Kelapa</option>
        </select>
      </div>
    </div>

    <!-- Main List Table Card -->
    <div class="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10.5px]">
            <tr>
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4 min-w-[170px]">Nomor Permohonan</th>
              <th class="py-3.5 px-4 min-w-[220px]">Lembaga & Lokasi</th>
              <th class="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Kategori Paket</th>
              <th class="py-3.5 px-4 min-w-[110px]">Tgl Pengajuan</th>
              <th class="py-3.5 px-4 text-right min-w-[140px]">Total Estimasi RAB</th>
              <th class="py-3.5 px-4 min-w-[170px]">Status Progres</th>
              <th class="py-3.5 px-4 min-w-[140px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            <tr v-if="filteredPermohonan.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <PackageCheck class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">Belum Ada Usulan Penyaluran Barang</p>
                <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Data penyaluran barang akan otomatis muncul di sini setelah proposal pengusulan sarpras Anda disetujui (Status Selesai).</p>
              </td>
            </tr>
            <tr v-for="(item, idx) in filteredPermohonan" :key="item.id" class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
              <td class="py-3.5 px-4 text-center font-semibold text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-emerald-800 dark:text-emerald-300 block">
                  {{ item.nomorPermohonan }}
                </span>
                <span class="text-[11px] text-slate-400">Ketua: {{ item.namaKetua }}</span>
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ item.namaLembagaPekebun }}</p>
                <p class="text-[11px] text-slate-500">{{ item.desa }}, {{ item.kabupaten }}</p>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap',
                    item.kategoriPaket === 'Ekstensifikasi'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
                  ]"
                >
                  {{ item.kategoriPaket }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                {{ item.tanggalPengajuan || '-' }}
              </td>
              <td class="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {{ formatRupiah(item.itemsRAB.reduce((sum, it) => sum + it.estimasiTotal, 0)) }}
              </td>
              <td class="py-3.5 px-4">
                <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border', getStatusBadge(item.status).class]">
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ getStatusBadge(item.status).label }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center gap-1.5">
                  <!-- Tombol Ajukan / Perbaiki Permohonan (Buka Modal Review, Download & Upload) -->
                  <button
                    v-if="item.status === 'DRAFT' || item.status === 'PERLU_REVISI'"
                    type="button"
                    @click="selectedPermohonanDetail = item"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                    :title="item.status === 'PERLU_REVISI' ? 'Perbaiki dan unggah ulang surat permohonan' : 'Buka form permohonan & unduh/unggah surat'"
                  >
                    <Send class="w-3.5 h-3.5" />
                    <span>{{ item.status === 'PERLU_REVISI' ? 'Perbaiki' : 'Ajukan Penyaluran' }}</span>
                  </button>

                  <!-- Tombol Lihat Detail / Tracking jika sudah diajukan -->
                  <button
                    v-else
                    type="button"
                    @click="selectedPermohonanDetail = item"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Detail & Tracking</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Comprehensive Detail & Process Modal -->
    <Teleport to="body">
      <div v-if="selectedPermohonanDetail" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto" @click.self="selectedPermohonanDetail = null">
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {{ selectedPermohonanDetail.nomorPermohonan }}
                </span>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"> Paket {{ selectedPermohonanDetail.kategoriPaket }} </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                {{ selectedPermohonanDetail.namaLembagaPekebun }}
              </h3>
              <p class="text-xs text-slate-500">Ketua: {{ selectedPermohonanDetail.namaKetua }} • Lokasi: {{ selectedPermohonanDetail.desa }}, {{ selectedPermohonanDetail.kabupaten }}, {{ selectedPermohonanDetail.provinsi }}</p>
            </div>

            <button type="button" @click="selectedPermohonanDetail = null" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Banner jika berstatus DRAFT -->
          <div
            v-if="selectedPermohonanDetail.status === 'DRAFT'"
            class="bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div class="flex items-start gap-2.5">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div class="text-xs space-y-0.5">
                <p class="font-bold text-emerald-900 dark:text-emerald-200">Proposal Disetujui (Tahap Usulan Penyaluran Barang)</p>
                <p class="text-emerald-800 dark:text-emerald-300">Unduh draft surat resmi, bubuhkan tanda tangan Ketua Lembaga, dan unggah kembali sebelum mengajukan ke Tim Teknis BPDP.</p>
              </div>
            </div>
          </div>

          <!-- Warning Box if Perlu Revisi -->
          <div
            v-if="selectedPermohonanDetail.status === 'PERLU_REVISI'"
            class="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-300 dark:border-amber-900 rounded-2xl p-4 flex items-start gap-3"
          >
            <AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div class="text-xs space-y-1">
              <p class="font-bold text-amber-900 dark:text-amber-200">Catatan Perbaikan dari Tim Teknis BPDP:</p>
              <p class="text-amber-800 dark:text-amber-300">{{ selectedPermohonanDetail.catatanVerifikasiTeknis || 'Terdapat ketidaksesuaian berkas atau kuantitas barang. Silakan perbaiki dan unggah ulang surat permohonan.' }}</p>
            </div>
          </div>

          <!-- Timeline Tracker (Tampil untuk permohonan yang sedang/telah diproses) -->
          <PenyaluranTimelineTracker
            v-if="selectedPermohonanDetail.status !== 'DRAFT'"
            :status="selectedPermohonanDetail.status"
            :proposal-id="selectedPermohonanDetail.proposalId || (selectedPermohonanDetail as any).proposal_id"
          />

          <!-- LANGKAH 1 (FLOWCHART): Review Preferensi RAB Barang -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <div>
                  <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Rincian Preferensi Kebutuhan Barang (RAB)
                  </h4>
                  <p class="text-[10.5px] text-slate-400">Rincian jenis komoditas, varietas benih, volume, dan estimasi biaya permohonan</p>
                </div>
              </div>
              <span class="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                Total: {{ formatRupiah(selectedPermohonanDetail.itemsRAB.reduce((sum, it) => sum + it.estimasiTotal, 0)) }}
              </span>
            </div>
            <div class="p-4">
              <ItemRabFormTable :model-value="selectedPermohonanDetail.itemsRAB" :disabled="true" />
            </div>
          </div>

          <!-- LANGKAH 2 & 3 (FLOWCHART): Download Format Surat & Upload Berkas Bertandatangan -->
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Dokumen Surat Permohonan Pengadaan Barang
                  </h4>
                  <p class="text-[10.5px] text-slate-400">Unduh format surat resmi, bubuhkan tanda tangan basah & cap ketua lembaga, lalu upload berkas PDF</p>
                </div>
              </div>
              <span v-if="selectedPermohonanDetail.suratPermohonanNamaFile" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 class="w-3.5 h-3.5" />
                Surat Terlampir
              </span>
              <span v-else class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                <AlertCircle class="w-3.5 h-3.5" />
                Belum Diunggah
              </span>
            </div>

            <!-- 2-Step Download & Upload Action for Draft / Revisi -->
            <div v-if="selectedPermohonanDetail.status === 'DRAFT' || selectedPermohonanDetail.status === 'PERLU_REVISI'" class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <!-- Step A: Download Template Surat -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
                <div class="space-y-1">
                  <p class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Download class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Download Format Surat Permohonan
                  </p>
                  <p class="text-[11px] text-slate-500">Format surat resmi pengadaan barang langsung tersusun rapi dengan kop lembaga & tabel preferensi RAB.</p>
                </div>
                <button
                  type="button"
                  @click="handleDownloadSurat(selectedPermohonanDetail)"
                  class="inline-flex items-center justify-center gap-2 w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <Download class="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Surat Permohonan (PDF)</span>
                </button>
              </div>

              <!-- Step B: Upload Signed PDF -->
              <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs">
                <div class="space-y-1">
                  <p class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Upload class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Upload Surat Permohonan Pengadaan Barang
                  </p>
                  <p class="text-[11px] text-slate-500">
                    {{ selectedPermohonanDetail.suratPermohonanNamaFile ? selectedPermohonanDetail.suratPermohonanNamaFile : 'Upload file PDF surat yang telah ditandatangani Ketua Lembaga (Maks. 5 MB).' }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <label class="inline-flex items-center justify-center gap-2 flex-1 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer shadow-2xs">
                    <Upload class="w-3.5 h-3.5 text-blue-600" />
                    <span>{{ selectedPermohonanDetail.suratPermohonanNamaFile ? 'Ganti File Surat (PDF)' : 'Pilih & Upload File PDF' }}</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      class="hidden"
                      @change="(e) => handleUploadSuratFile(e, selectedPermohonanDetail!)"
                    />
                  </label>
                  <button
                    v-if="selectedPermohonanDetail.suratPermohonanNamaFile"
                    type="button"
                    @click="handleDownloadSurat(selectedPermohonanDetail)"
                    class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    title="Lihat Pratinjau Surat"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Readonly Document Info if already submitted -->
            <div v-else class="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs">
              <div class="flex items-center gap-2.5">
                <FileCheck class="w-4 h-4 text-emerald-600" />
                <div>
                  <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedPermohonanDetail.suratPermohonanNamaFile || 'Surat_Permohonan_Pengadaan_Kelapa.pdf' }}</p>
                  <p class="text-[10px] text-slate-400">Surat permohonan resmi pengadaan barang yang diajukan ke BPDP-Teknis</p>
                </div>
              </div>
              <button
                type="button"
                @click="handleDownloadSurat(selectedPermohonanDetail)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                <Download class="w-3.5 h-3.5" />
                <span>Unduh Surat</span>
              </button>
            </div>

            <!-- LANGKAH 4 (Konektor 1): Submit Action for Draft / Revisi di dalam Modal yang Sama -->
            <div v-if="selectedPermohonanDetail.status === 'DRAFT' || selectedPermohonanDetail.status === 'PERLU_REVISI'" class="pt-3 border-t border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div class="text-xs text-slate-500 flex items-center gap-1.5">
                <AlertCircle class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pastikan berkas surat telah diunggah sebelum mengirim permohonan.</span>
              </div>
              <button
                type="button"
                @click="handleAjukanPenyaluran(selectedPermohonanDetail)"
                class="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl text-white shadow-md active:scale-95 transition-all cursor-pointer bg-[#066C2A] hover:bg-[#055722] shadow-[#066C2A]/20 ring-2 ring-emerald-500/20"
              >
                <Send class="w-3.5 h-3.5" />
                <span>{{ selectedPermohonanDetail.status === 'PERLU_REVISI' ? 'Kirim Ulang Permohonan Perbaikan' : 'Kirim Permohonan ke BPDP' }}</span>
              </button>
            </div>
          </div>

          <!-- Info Kontrak A jika ada -->
          <div v-if="selectedPermohonanDetail.dokumenKontrak" class="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-xs space-y-3">
            <p class="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-sm">
              <FileSignature class="w-4 h-4 text-emerald-600" />
              Dokumen Kontrak "A" (Kerja Sama Vendor):
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span class="text-slate-500">Nomor Kontrak:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedPermohonanDetail.dokumenKontrak.nomorKontrak }}</p>
              </div>
              <div>
                <span class="text-slate-500">Penyedia / Rekanan:</span>
                <p class="font-bold text-emerald-800 dark:text-emerald-300">{{ selectedPermohonanDetail.dokumenKontrak.namaPenyedia }}</p>
              </div>
              <div>
                <span class="text-slate-500">Total Nilai Kontrak:</span>
                <p class="font-black text-emerald-700 dark:text-emerald-400">Rp {{ selectedPermohonanDetail.dokumenKontrak.totalNilaiKontrak.toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-slate-500">Harga Satuan:</span>
                <p class="font-medium">Rp {{ selectedPermohonanDetail.dokumenKontrak.hargaSatuan.toLocaleString('id-ID') }} / {{ selectedPermohonanDetail.dokumenKontrak.satuanBarang }}</p>
              </div>
              <div>
                <span class="text-slate-500">Jangka Waktu:</span>
                <p class="font-semibold">{{ selectedPermohonanDetail.dokumenKontrak.jangkaWaktuHari }} Hari Kalender</p>
              </div>
              <div>
                <span class="text-slate-500">Termin Pembayaran:</span>
                <p class="font-medium truncate">{{ selectedPermohonanDetail.dokumenKontrak.terminPembayaran }}</p>
              </div>
            </div>
          </div>

          <!-- Info Surveyor jika ada -->
          <div v-if="selectedPermohonanDetail.suratTugasSurveyor" class="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 text-xs space-y-2">
            <p class="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2 text-sm">
              <Compass class="w-4 h-4 text-teal-600" />
              Surat Penugasan Sampling & Monitoring Surveyor:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
              <div>
                <span class="text-slate-500">Nomor Surat Tugas:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedPermohonanDetail.suratTugasSurveyor.nomorSurat }}</p>
              </div>
              <div>
                <span class="text-slate-500">Lembaga Surveyor:</span>
                <p class="font-bold text-teal-800 dark:text-teal-300">{{ selectedPermohonanDetail.suratTugasSurveyor.namaLembagaSurveyor }}</p>
              </div>
              <div>
                <span class="text-slate-500">Status Monitoring:</span>
                <p class="font-bold text-emerald-600">{{ selectedPermohonanDetail.suratTugasSurveyor.status }}</p>
              </div>
            </div>
          </div>

          <!-- Footer Close -->
          <div class="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" @click="selectedPermohonanDetail = null" class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
              Tutup Rincian
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Tambah Usulan Penyaluran Baru (Testing / Mockup Mode) -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto" @click.self="showCreateModal = false">
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-[#066C2A] dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <PackageCheck class="w-5 h-5" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Probis Tahap 1
                  </span>
                  <span class="text-xs text-slate-400">• Kelembagaan Pekebun</span>
                </div>
                <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">Input Data Permohonan Penyaluran Barang/Jasa</h3>
                <p class="text-[11px] text-slate-500">Pengisian preferensi kebutuhan barang (RAB: jenis barang, varietas, jumlah per item, dan satuan)</p>
              </div>
            </div>
            <button type="button" @click="showCreateModal = false" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Scrollable Modal Body -->
          <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            <!-- Preset Quick Fill Banner -->
            <div class="bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div class="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200">
                <div class="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles class="w-3.5 h-3.5" />
                </div>
                <div>
                  <p class="font-bold text-xs">Isi Cepat dengan Data Contoh</p>
                  <p class="text-[11px] text-emerald-700 dark:text-emerald-400">Pilih preset paket untuk mengisi otomatis seluruh formulir & rincian barang</p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="autofillPreset('ekstensifikasi')"
                  class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  Preset Ekstensifikasi
                </button>
                <button
                  type="button"
                  @click="autofillPreset('intensifikasi')"
                  class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  Preset Intensifikasi
                </button>
              </div>
            </div>

            <form id="create-permohonan-form" @submit.prevent="handleSaveCreate" class="space-y-6">
              <!-- Section 1: Informasi Lembaga & Kontak -->
              <div class="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <FileText class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">1. Informasi Kelembagaan Pekebun</h4>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Nama Lembaga Pekebun <span class="text-rose-500">*</span></label>
                    <input
                      v-model="createForm.namaLembagaPekebun"
                      required
                      placeholder="Contoh: Koperasi Tani Makmur Bersama"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#066C2A] transition-all"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Nama Ketua Lembaga <span class="text-rose-500">*</span></label>
                    <input
                      v-model="createForm.namaKetua"
                      required
                      placeholder="Contoh: H. Ahmad Supriyadi"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#066C2A] transition-all"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Nomor Telepon / Kontak WhatsApp</label>
                    <input
                      v-model="createForm.kontak"
                      placeholder="Contoh: 0812-3456-7890"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#066C2A] transition-all"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Kategori Paket Bantuan <span class="text-rose-500">*</span></label>
                    <select
                      v-model="createForm.kategoriPaket"
                      class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#066C2A] cursor-pointer"
                    >
                      <option value="Ekstensifikasi">Ekstensifikasi Kelapa</option>
                      <option value="Intensifikasi">Intensifikasi Kelapa</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Section 2: Lokasi Administrasi -->
              <div class="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div class="flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <Compass class="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">2. Lokasi Wilayah Penyaluran</h4>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Desa / Kelurahan</label>
                    <input
                      v-model="createForm.desa"
                      placeholder="Desa"
                      class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#066C2A]"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Kecamatan</label>
                    <input
                      v-model="createForm.kecamatan"
                      placeholder="Kecamatan"
                      class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#066C2A]"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Kabupaten <span class="text-rose-500">*</span></label>
                    <input
                      v-model="createForm.kabupaten"
                      required
                      placeholder="Kabupaten"
                      class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#066C2A]"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="font-semibold text-slate-700 dark:text-slate-300">Provinsi</label>
                    <input
                      v-model="createForm.provinsi"
                      placeholder="Provinsi"
                      class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-[#066C2A]"
                    />
                  </div>
                </div>
              </div>

              <!-- Section 3: Status Awal Tahapan -->
              <div class="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div class="flex items-center gap-2">
                    <Clock class="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">3. Status Awal Pengajuan</h4>
                  </div>
                  <span class="text-[11px] text-slate-400">Pilih tahapan alur yang ingin disimulasikan</span>
                </div>

                <select
                  v-model="createForm.status"
                  class="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#066C2A] cursor-pointer"
                >
                  <option value="DRAFT">DRAFT (Pekebun dapat klik tombol "Ajukan Penyaluran")</option>
                  <option value="MENUNGGU_VERIFIKASI_TEKNIS">MENUNGGU VERIFIKASI TEKNIS (Langsung masuk antrean Verifikator BPDP)</option>
                  <option value="DISPOSISI_PPK">DISPOSISI PPK (Langsung masuk antrean PPK)</option>
                  <option value="DISPOSISI_ULP">TENDER ULP (Langsung masuk antrean ULP)</option>
                  <option value="SELESAI">SELESAI (Status penyaluran telah tuntas)</option>
                </select>
              </div>

              <!-- Section 4: Rincian Item Barang (RAB) -->
              <div class="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div class="flex items-center gap-2">
                    <ShieldCheck class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">4. Rincian Barang Bantuan (RAB)</h4>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Total: <span class="text-[#066C2A] dark:text-emerald-400 font-black text-sm">{{ formatRupiah(createFormTotalRAB) }}</span>
                    </span>
                    <button
                      type="button"
                      @click="addRabItem"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus class="w-3.5 h-3.5" />
                      <span>Tambah Baris</span>
                    </button>
                  </div>
                </div>

                <div class="border border-slate-200/90 dark:border-slate-700/80 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th class="py-2.5 px-3 w-28">Jenis</th>
                        <th class="py-2.5 px-3">Nama Barang</th>
                        <th class="py-2.5 px-3">Varietas</th>
                        <th class="py-2.5 px-3 text-center w-20">Tahap 1</th>
                        <th class="py-2.5 px-3 text-center w-20">Tahap 2</th>
                        <th class="py-2.5 px-3 text-center w-20">Satuan</th>
                        <th class="py-2.5 px-3 text-right w-32">Harga Satuan</th>
                        <th class="py-2.5 px-3 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr v-for="(item, idx) in createForm.itemsRAB" :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td class="p-2">
                          <input
                            v-model="item.jenisBarang"
                            placeholder="Jenis"
                            class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            v-model="item.namaBarang"
                            placeholder="Nama barang"
                            class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            v-model="item.varietas"
                            placeholder="Varietas / spesifikasi"
                            class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            type="number"
                            v-model.number="item.jumlahTahap1"
                            placeholder="0"
                            class="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-semibold outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            type="number"
                            v-model.number="item.jumlahTahap2"
                            placeholder="0"
                            class="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-semibold outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            v-model="item.satuan"
                            placeholder="Btg/Kg"
                            class="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-center outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2">
                          <input
                            type="number"
                            v-model.number="item.estimasiHargaSatuan"
                            placeholder="Rp..."
                            class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-semibold outline-none focus:border-[#066C2A]"
                          />
                        </td>
                        <td class="p-2 text-center">
                          <button
                            type="button"
                            @click="removeRabItem(idx)"
                            :disabled="createForm.itemsRAB.length <= 1"
                            class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            title="Hapus Baris"
                          >
                            <Trash2 class="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </div>

          <!-- Sticky Modal Footer -->
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-5 py-2.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="create-permohonan-form"
              class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#066C2A] hover:bg-[#055722] text-white shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus class="w-4 h-4" />
              <span>Simpan & Tambahkan Usulan</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
