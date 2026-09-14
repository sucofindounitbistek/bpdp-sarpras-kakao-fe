<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePenyaluranBarangStore } from '@/stores/penyaluranBarang';
import type { PermohonanPenyaluranBarang, DokumenKontrakA, SuratTugasSurveyor } from '@/types/penyaluranBarang';
import PenyaluranTimelineTracker from '@/components/penyaluran-barang/PenyaluranTimelineTracker.vue';
import ItemRabFormTable from '@/components/penyaluran-barang/ItemRabFormTable.vue';
import SuratTugasSurveyorModal from '@/components/penyaluran-barang/SuratTugasSurveyorModal.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useToast } from '@/composables/useToast';
import {
  FileSignature,
  Compass,
  FileText,
  Eye,
  Search,
  Clock,
  ShieldCheck,
  Layers,
  Award,
  X,
  CheckCircle,
  XCircle,
  UploadCloud,
  AlertCircle,
  Send,
  FileCheck,
} from 'lucide-vue-next';

const store = usePenyaluranBarangStore();
const toast = useToast();

const searchQuery = ref('');
const filterStatus = ref<string>('ALL');
const selectedItemForReview = ref<PermohonanPenyaluranBarang | null>(null);

// Embedded Verification Form State
const verifKeputusan = ref<'YA' | 'TIDAK'>('YA');
const verifCatatan = ref('');
const verifNotaDinasFile = ref<File | null>(null);
const verifNotaDinasNamaFile = ref<string>('Nota_Dinas_Direktur_Teknis_Pengadaan.pdf');

// Embedded Dokumen Kontrak Form State (10 Atribut Wajib)
const kontrakNomor = ref('');
const kontrakNamaPenyedia = ref('');
const kontrakJenisBarang = ref('');
const kontrakJumlahBarang = ref<number>(0);
const kontrakSatuanBarang = ref('Batang');
const kontrakHargaSatuan = ref<number>(0);
const kontrakTotalNilai = ref<number>(0);
const kontrakTerminBayar = ref('Termin 1: 30% Uang Muka, Termin 2: 70% BASTP Pengiriman Penuh');
const kontrakTerminSalur = ref('Tahap 1: 50% di Gudang Pekebun, Tahap 2: 50% Distribusi Lapangan');
const kontrakJangkaWaktuHari = ref<number>(60);
const kontrakTanggalMulai = ref(new Date().toISOString().split('T')[0]);
const kontrakTanggalSelesai = ref('');
const kontrakNamaFile = ref('Dokumen_Kontrak_Pengadaan_Kelapa.pdf');

// Modal states for next phases
const isSurveyorModalOpen = ref(false);
const activeModalPermohonan = ref<PermohonanPenyaluranBarang | null>(null);

onMounted(() => {
  store.fetchPermohonanList().catch(() => {});
});

// KPI Stats
const totalAntrean = computed(() => store.permohonanVerifikator.length);
const totalMenungguVerif = computed(() => store.permohonanVerifikator.filter((p) => p.status === 'MENUNGGU_VERIFIKASI_TEKNIS').length);
const totalSiapKontrak = computed(() => store.permohonanVerifikator.filter((p) => p.status === 'PENETAPAN_PEMENANG').length);
const totalPelaksanaan = computed(() => store.permohonanVerifikator.filter((p) => p.status === 'PROSES_PELAKSANAAN_KONTRAK' || p.status === 'SURVEYOR_DITUGASKAN').length);

const filteredList = computed(() => {
  return store.permohonanVerifikator.filter((item) => {
    const matchQuery =
      item.nomorPermohonan.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.namaLembagaPekebun.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchStatus = filterStatus.value === 'ALL' || item.status === filterStatus.value;
    return matchQuery && matchStatus;
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
    case 'MENUNGGU_VERIFIKASI_TEKNIS':
      return { label: 'Menunggu Verifikasi', class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200' };
    case 'DISPOSISI_PPK':
      return { label: 'Diteruskan ke PPK', class: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200' };
    case 'PENETAPAN_PEMENANG':
      return { label: 'Pemenang Ditetapkan (Input Kontrak)', class: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300' };
    case 'PROSES_PELAKSANAAN_KONTRAK':
      return { label: 'Pelaksanaan Kontrak SPK', class: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300' };
    case 'SURVEYOR_DITUGASKAN':
    case 'SELESAI':
      return { label: 'Surveyor Aktif', class: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400' };
    default:
      return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

function openReviewItem(item: PermohonanPenyaluranBarang) {
  selectedItemForReview.value = item;
  verifKeputusan.value = 'YA';
  verifCatatan.value = '';
  verifNotaDinasFile.value = null;
  verifNotaDinasNamaFile.value = 'Nota_Dinas_Direktur_Teknis_Pengadaan.pdf';

  // Initialize Dokumen Kontrak fields
  kontrakNomor.value = item.dokumenKontrak?.nomorKontrak || `KTRK/BPDP-SARPRAS/${item.kategoriPaket === 'Ekstensifikasi' ? 'EKS' : 'INT'}/${new Date().getFullYear()}/${item.id}`;
  kontrakNamaPenyedia.value = item.dokumenKontrak?.namaPenyedia || item.pemenangVendor || 'PT Agro Sarana Nusantara';

  const primaryItem = item.itemsRAB[0];
  if (primaryItem) {
    kontrakJenisBarang.value = item.dokumenKontrak?.jenisBarang || `${primaryItem.jenisBarang} (${primaryItem.namaBarangVarietas})`;
    kontrakJumlahBarang.value = item.dokumenKontrak?.jumlahBarang || primaryItem.jumlah;
    kontrakSatuanBarang.value = item.dokumenKontrak?.satuanBarang || primaryItem.satuan;
    kontrakHargaSatuan.value = item.dokumenKontrak?.hargaSatuan || primaryItem.estimasiHargaSatuan;
  }

  kontrakTotalNilai.value = item.dokumenKontrak?.totalNilaiKontrak || item.nilaiPemenangTender || item.itemsRAB.reduce((sum, it) => sum + it.estimasiTotal, 0);
  kontrakTerminBayar.value = item.dokumenKontrak?.terminPembayaran || 'Termin 1: 30% Uang Muka, Termin 2: 70% BASTP Pengiriman Penuh';
  kontrakTerminSalur.value = item.dokumenKontrak?.terminPenyaluran || 'Tahap 1: 50% di Gudang Pekebun, Tahap 2: 50% Distribusi Lapangan';
  kontrakJangkaWaktuHari.value = item.dokumenKontrak?.jangkaWaktuHari || 60;
  kontrakTanggalMulai.value = item.dokumenKontrak?.tanggalMulai || new Date().toISOString().split('T')[0];

  const d = new Date();
  d.setDate(d.getDate() + 60);
  kontrakTanggalSelesai.value = item.dokumenKontrak?.tanggalSelesai || d.toISOString().split('T')[0];
  kontrakNamaFile.value = item.dokumenKontrak?.dokumenKontrakNamaFile || 'Dokumen_Kontrak_Pengadaan_Kelapa.pdf';
}

function handleNotaDinasFileChange(event: Event) {
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
    verifNotaDinasFile.value = file;
    verifNotaDinasNamaFile.value = file.name;
    toast.success(`Berkas Nota Dinas "${file.name}" siap diunggah.`);
  }
}

function handleCalculateKontrakTotal() {
  if (kontrakHargaSatuan.value && kontrakJumlahBarang.value) {
    kontrakTotalNilai.value = kontrakHargaSatuan.value * kontrakJumlahBarang.value;
  }
}

function handleKontrakFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.type !== 'application/pdf') {
      toast.error('Format berkas harus PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas melebihi 10 MB.');
      return;
    }
    kontrakNamaFile.value = file.name;
    toast.success(`Berkas Dokumen Kontrak "${file.name}" siap diunggah.`);
  }
}

function submitVerifikasiLangsung() {
  if (!selectedItemForReview.value) return;

  if (verifKeputusan.value === 'YA') {
    if (!verifNotaDinasNamaFile.value) {
      toast.error('Wajib mengunggah berkas Nota Dinas Direktur Teknis.');
      return;
    }
    store.verifikasiTeknis(
      selectedItemForReview.value.id,
      true,
      verifCatatan.value || 'Permohonan memenuhi syarat teknis. Nota Dinas diterbitkan ke PPK.',
      {
        namaFile: verifNotaDinasNamaFile.value,
        url: 'mock-nota-dinas-direktur-teknis.pdf',
      }
    );
    toast.success(
      `Permohonan ${selectedItemForReview.value.nomorPermohonan} disetujui. Nota Dinas berhasil diunggah dan diteruskan ke BPDP PPK.`
    );
  } else {
    if (!verifCatatan.value.trim()) {
      toast.error('Wajib mencantumkan alasan penolakan/perbaikan.');
      return;
    }
    store.verifikasiTeknis(
      selectedItemForReview.value.id,
      false,
      verifCatatan.value
    );
    toast.warning(
      `Permohonan ${selectedItemForReview.value.nomorPermohonan} ditolak dan dikembalikan ke status Draft Pekebun.`
    );
  }
  selectedItemForReview.value = null;
}

function submitProsesPelaksanaanKontrak() {
  if (!selectedItemForReview.value) return;

  if (!kontrakNomor.value.trim()) {
    toast.error('Nomor Kontrak wajib diisi.');
    return;
  }
  if (!kontrakNamaPenyedia.value.trim()) {
    toast.error('Nama Penyedia / Vendor wajib diisi.');
    return;
  }

  const payload: DokumenKontrakA = {
    nomorKontrak: kontrakNomor.value,
    dokumenKontrakNamaFile: kontrakNamaFile.value,
    dokumenKontrakUrl: `mock-${kontrakNamaFile.value}`,
    namaPenyedia: kontrakNamaPenyedia.value,
    jenisBarang: kontrakJenisBarang.value,
    jumlahBarang: kontrakJumlahBarang.value,
    satuanBarang: kontrakSatuanBarang.value,
    hargaSatuan: kontrakHargaSatuan.value,
    totalNilaiKontrak: kontrakTotalNilai.value,
    terminPembayaran: kontrakTerminBayar.value,
    terminPenyaluran: kontrakTerminSalur.value,
    jangkaWaktuHari: kontrakJangkaWaktuHari.value,
    tanggalMulai: kontrakTanggalMulai.value,
    tanggalSelesai: kontrakTanggalSelesai.value,
  };

  store.simpanDokumenKontrakA(selectedItemForReview.value.id, payload);
  toast.success(`Dokumen Kontrak ${payload.nomorKontrak} berhasil disimpan! Status: Proses Pelaksanaan Kontrak`);
  selectedItemForReview.value = null;
}

function openSurveyorModal(p: PermohonanPenyaluranBarang) {
  activeModalPermohonan.value = p;
  isSurveyorModalOpen.value = true;
}

function handleSurveyorSubmit(surveyor: SuratTugasSurveyor) {
  if (activeModalPermohonan.value) {
    store.terbitkanSuratTugasSurveyor(activeModalPermohonan.value.id, surveyor);
    toast.success(`Surat Tugas Surveyor ${surveyor.nomorSurat} berhasil diterbitkan untuk pengawasan mutu fisik barang.`);
    isSurveyorModalOpen.value = false;
    selectedItemForReview.value = null;
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Floating Card (Aligned with Navbar) -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Verifikasi Teknis & Pengelolaan Kontrak <span class="text-[#066C2A] font-bold">(BPDP Teknis)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Verifikasi permohonan pekebun, penerbitan nota dinas ke PPK, pengelolaan Dokumen Kontrak, dan surat tugas surveyor
        </p>
      </div>
    </header>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Antrean Teknis</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ totalAntrean }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Menunggu Verifikasi</p>
          <p class="text-lg font-bold text-blue-700 dark:text-blue-400">{{ totalMenungguVerif }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Award class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Siap Input Kontrak</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-400">{{ totalSiapKontrak }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
          <ShieldCheck class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pelaksanaan & Surveyor</p>
          <p class="text-lg font-bold text-teal-700 dark:text-teal-400">{{ totalPelaksanaan }}</p>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar Card -->
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          placeholder="Cari no permohonan, lembaga, lokasi..."
          class="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <span class="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
        <select
          v-model="filterStatus"
          class="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer"
        >
          <option value="ALL">Semua Tahapan</option>
          <option value="MENUNGGU_VERIFIKASI_TEKNIS">Menunggu Verifikasi</option>
          <option value="PENETAPAN_PEMENANG">Siap Input Kontrak A</option>
          <option value="PROSES_PELAKSANAAN_KONTRAK">Pelaksanaan Kontrak</option>
          <option value="SURVEYOR_DITUGASKAN">Surveyor Ditugaskan</option>
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
              <th class="py-3.5 px-4 text-right min-w-[130px]">Pagu RAB</th>
              <th class="py-3.5 px-4 min-w-[160px]">Status Tahapan</th>
              <th class="py-3.5 px-4 w-40 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            <tr v-if="filteredList.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <FileText class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak Ada Antrean Verifikasi</p>
                <p class="text-xs text-slate-400 mt-1">Seluruh permohonan telah selesai diverifikasi atau sesuaikan filter pencarian.</p>
              </td>
            </tr>
            <tr
              v-for="(item, idx) in filteredList"
              :key="item.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td class="py-3.5 px-4 text-center font-semibold text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-emerald-800 dark:text-emerald-300 block">
                  {{ item.nomorPermohonan }}
                </span>
                <span class="text-[11px] text-slate-400">Ketua: {{ item.namaKetua }}</span>
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ item.namaLembagaPekebun }}</p>
                <p class="text-[11px] text-slate-500">{{ item.kabupaten }}, {{ item.provinsi }}</p>
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
              <td class="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {{ formatRupiah(item.itemsRAB.reduce((s, it) => s + it.estimasiTotal, 0)) }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                    getStatusBadge(item.status).class,
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ getStatusBadge(item.status).label }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  @click="openReviewItem(item)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Detail & Proses
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail & Workflow Action Modal -->
    <Teleport to="body">
      <div
        v-if="selectedItemForReview"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
        @click.self="selectedItemForReview = null"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {{ selectedItemForReview.nomorPermohonan }}
                </span>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Paket {{ selectedItemForReview.kategoriPaket }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                {{ selectedItemForReview.namaLembagaPekebun }}
              </h3>
              <p class="text-xs text-slate-500">
                Ketua: {{ selectedItemForReview.namaKetua }} • Kontak: {{ selectedItemForReview.kontak }} • {{ selectedItemForReview.kabupaten }}, {{ selectedItemForReview.provinsi }}
              </p>
            </div>

            <button
              type="button"
              @click="selectedItemForReview = null"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Integrated Timeline Tracker -->
          <PenyaluranTimelineTracker
            :status="selectedItemForReview.status"
            :proposal-id="selectedItemForReview.proposalId || (selectedItemForReview as any).proposal_id"
          />

          <!-- Berkas PDF Info Box -->
          <div class="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl flex items-center justify-between text-xs border border-slate-200/80 dark:border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                PDF
              </div>
              <div>
                <p class="font-bold text-slate-800 dark:text-slate-200">Berkas Surat Permohonan Pengadaan Pekebun</p>
                <p class="text-slate-500">{{ selectedItemForReview.suratPermohonanNamaFile || 'Surat_Permohonan_Pekebun.pdf' }} (Ditandatangani basah & Berstempel)</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
              Dokumen Terlampir
            </span>
          </div>

          <!-- Rincian Item RAB -->
          <ItemRabFormTable :model-value="selectedItemForReview.itemsRAB" :disabled="true" />

          <!-- FORM VERIFIKASI TEKNIS & UPLOAD NOTA DINAS (LANGSUNG DI BAWAHNYA TANPA MODAL DALAM MODAL) -->
          <div v-if="selectedItemForReview.status === 'MENUNGGU_VERIFIKASI_TEKNIS'" class="p-5 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
            <div class="flex items-center gap-2.5 pb-3 border-b border-emerald-200/60 dark:border-emerald-900/60">
              <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                <FileCheck class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Verifikasi Teknis & Upload Berkas Nota Dinas</h4>
                <p class="text-[11px] text-slate-500">Pemeriksaan Penelitian permohonan pengadaan barang dari pekebun</p>
              </div>
            </div>

            <!-- Pilihan Cek: Iya vs Tidak -->
            <div class="space-y-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Hasil Pemeriksaan Permohonan (Cek):
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="verifKeputusan = 'YA'"
                  :class="[
                    'p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                    verifKeputusan === 'YA'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50',
                  ]"
                >
                  <CheckCircle class="w-4 h-4 text-emerald-600" />
                  <span>Iya (Setujui & Buat Nota Dinas)</span>
                </button>
                <button
                  type="button"
                  @click="verifKeputusan = 'TIDAK'"
                  :class="[
                    'p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                    verifKeputusan === 'TIDAK'
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50',
                  ]"
                >
                  <XCircle class="w-4 h-4 text-rose-600" />
                  <span>Tidak (Kembalikan ke Draft)</span>
                </button>
              </div>
            </div>

            <!-- JIKA IYA: Dropzone Upload Berkas PDF Nota Dinas -->
            <div v-if="verifKeputusan === 'YA'" class="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80">
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
                  @change="handleNotaDinasFileChange"
                  class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div class="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <UploadCloud class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {{ verifNotaDinasNamaFile ? verifNotaDinasNamaFile : 'Pilih atau Tarik Berkas PDF Nota Dinas' }}
                  </p>
                  <p class="text-[11px] text-slate-500">Format PDF (Maksimal 5 MB)</p>
                </div>
              </div>
            </div>

            <!-- JIKA TIDAK: Form Catatan Perbaikan/Penolakan -->
            <div v-else class="space-y-2 p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/80">
              <div class="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-bold">
                <AlertCircle class="w-4 h-4 text-rose-600" />
                <span>Alasan / Catatan Perbaikan ke Pekebun:</span>
              </div>
              <textarea
                v-model="verifCatatan"
                rows="3"
                placeholder="Contoh: Rincian spesifikasi varietas dan surat permohonan belum lengkap. Mohon perbaiki dan ajukan ulang."
                class="w-full text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500/20"
              ></textarea>
            </div>
          </div>

          <!-- FORM DOKUMEN KONTRAK (LANGSUNG DI PANEL DETAIL TANPA MODAL BERTUMPUK - KONEKTOR 4) -->
          <div v-if="selectedItemForReview.status === 'PENETAPAN_PEMENANG'" class="p-5 rounded-2xl border border-emerald-200/90 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-emerald-200/60 dark:border-emerald-900/60">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                  <FileSignature class="w-4 h-4" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">Dokumen Kontrak</h4>
                  <p class="text-[11px] text-slate-500">Pencatatan data legalitas kontrak pengadaan dengan Vendor terpilih</p>
                </div>
              </div>
            </div>

            <!-- Form Grid 10 Items Wajib Dokumen Kontrak -->
            <div class="space-y-4 text-xs">
              <!-- 1. Nomor Kontrak & 3. Nama Penyedia -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">1. Nomor Kontrak SPK <span class="text-rose-500">*</span></label>
                  <input
                    v-model="kontrakNomor"
                    type="text"
                    placeholder="Contoh: KTRK/BPDP-SARPRAS/2026/001"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">3. Nama Penyedia / Vendor <span class="text-rose-500">*</span></label>
                  <input
                    v-model="kontrakNamaPenyedia"
                    type="text"
                    placeholder="Contoh: PT Agro Nusantara Perkasa"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <!-- 4. Jenis Barang & 5. Jumlah & Satuan (Auto from Permohonan) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div class="space-y-1 sm:col-span-2">
                  <label class="font-semibold text-slate-500 dark:text-slate-400">4. Jenis Barang (Data Permohonan)</label>
                  <input
                    v-model="kontrakJenisBarang"
                    type="text"
                    class="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-semibold text-slate-500 dark:text-slate-400">5. Jumlah Barang</label>
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model.number="kontrakJumlahBarang"
                      type="number"
                      @input="handleCalculateKontrakTotal"
                      class="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none text-right text-slate-800 dark:text-slate-200"
                    />
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">{{ kontrakSatuanBarang }}</span>
                  </div>
                </div>
              </div>

              <!-- 6. Harga Satuan & 7. Total Nilai Kontrak -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">6. Harga Satuan (Rp) <span class="text-rose-500">*</span></label>
                  <input
                    v-model.number="kontrakHargaSatuan"
                    type="number"
                    @input="handleCalculateKontrakTotal"
                    placeholder="Rp..."
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-slate-100 outline-none text-right focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">7. Total Nilai Kontrak (Rp) <span class="text-rose-500">*</span></label>
                  <input
                    v-model.number="kontrakTotalNilai"
                    type="number"
                    placeholder="Rp..."
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/20 font-black text-emerald-800 dark:text-emerald-300 outline-none text-right focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <!-- 8. Termin Pembayaran & 9. Termin Penyaluran -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">8. Termin Pembayaran</label>
                  <input
                    v-model="kontrakTerminBayar"
                    type="text"
                    placeholder="Contoh: Termin 1: 30%, Termin 2: 70%"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="font-bold text-slate-700 dark:text-slate-300">9. Termin Penyaluran</label>
                  <input
                    v-model="kontrakTerminSalur"
                    type="text"
                    placeholder="Contoh: Tahap 1: 50%, Tahap 2: 50%"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <!-- 10. Jangka Waktu Pelaksanaan & Tanggal -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="space-y-1">
                  <label class="font-bold text-slate-700 dark:text-slate-300">10. Jangka Waktu (Hari)</label>
                  <input
                    v-model.number="kontrakJangkaWaktuHari"
                    type="number"
                    placeholder="60"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none text-center text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-semibold text-slate-500 dark:text-slate-400">Tanggal Mulai</label>
                  <input
                    v-model="kontrakTanggalMulai"
                    type="date"
                    class="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-semibold text-slate-500 dark:text-slate-400">Tanggal Selesai</label>
                  <input
                    v-model="kontrakTanggalSelesai"
                    type="date"
                    class="w-full h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <!-- 2. Upload Dokumen Kontrak -->
              <div class="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                <label class="font-bold text-slate-700 dark:text-slate-300">2. Unggah Dokumen Kontrak Kerjasama (PDF) <span class="text-rose-500">*</span></label>
                <div class="relative border-2 border-dashed border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 rounded-2xl p-4 text-center hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    @change="handleKontrakFileChange"
                    class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div class="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                    <UploadCloud class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {{ kontrakNamaFile ? kontrakNamaFile : 'Pilih atau Tarik Berkas PDF Dokumen Kontrak' }}
                    </p>
                    <p class="text-[10px] text-slate-400">Format PDF, maks. 10 MB (Surat Perjanjian Kerja Sama Vendor)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tampilan Kontrak Dokumen yang Sudah Terbit (Read-Only) -->
          <div v-if="selectedItemForReview.dokumenKontrak && selectedItemForReview.status !== 'PENETAPAN_PEMENANG'" class="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 text-xs space-y-3.5">
            <div class="flex items-center justify-between">
              <p class="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-sm">
                <FileSignature class="w-4 h-4 text-emerald-600" />
                Dokumen Kontrak (Perjanjian Kerja Sama Vendor):
              </p>
              <span class="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px]">
                Kontrak Terbit
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-slate-700 dark:text-slate-300">
              <div>
                <span class="text-slate-500 font-medium">1. Nomor Kontrak SPK:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItemForReview.dokumenKontrak.nomorKontrak }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">2. Dokumen Kontrak PDF:</span>
                <p class="font-bold text-emerald-700 dark:text-emerald-400 truncate">{{ selectedItemForReview.dokumenKontrak.dokumenKontrakNamaFile || 'Dokumen_Kontrak.pdf' }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">3. Nama Penyedia/Vendor:</span>
                <p class="font-bold text-emerald-800 dark:text-emerald-300">{{ selectedItemForReview.dokumenKontrak.namaPenyedia }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">4. Jenis Komoditas Barang:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItemForReview.dokumenKontrak.jenisBarang }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">5. Jumlah Barang:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItemForReview.dokumenKontrak.jumlahBarang.toLocaleString('id-ID') }} {{ selectedItemForReview.dokumenKontrak.satuanBarang }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">6. Harga Satuan:</span>
                <p class="font-semibold text-slate-900 dark:text-slate-100">Rp {{ selectedItemForReview.dokumenKontrak.hargaSatuan.toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">7. Total Nilai Kontrak:</span>
                <p class="font-black text-emerald-700 dark:text-emerald-400">Rp {{ selectedItemForReview.dokumenKontrak.totalNilaiKontrak.toLocaleString('id-ID') }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">8. Termin Pembayaran:</span>
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ selectedItemForReview.dokumenKontrak.terminPembayaran }}</p>
              </div>
              <div>
                <span class="text-slate-500 font-medium">9. Termin Penyaluran:</span>
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ selectedItemForReview.dokumenKontrak.terminPenyaluran }}</p>
              </div>
              <div class="sm:col-span-2 md:col-span-3">
                <span class="text-slate-500 font-medium">10. Jangka Waktu Pelaksanaan / Pemenuhan:</span>
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItemForReview.dokumenKontrak.jangkaWaktuHari }} Hari Kalender ({{ selectedItemForReview.dokumenKontrak.tanggalMulai }} s/d {{ selectedItemForReview.dokumenKontrak.tanggalSelesai }})</p>
              </div>
            </div>
          </div>

          <!-- Tampilan Surat Tugas Surveyor jika ada -->
          <div v-if="selectedItemForReview.suratTugasSurveyor" class="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 text-xs space-y-2">
            <p class="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2 text-sm">
              <Compass class="w-4 h-4 text-teal-600" />
              Surat Penugasan Sampling & Monitoring Surveyor:
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
              <div><span class="text-slate-500">Nomor Surat Tugas:</span> <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItemForReview.suratTugasSurveyor.nomorSurat }}</p></div>
              <div><span class="text-slate-500">Lembaga Surveyor:</span> <p class="font-bold text-teal-800 dark:text-teal-300">{{ selectedItemForReview.suratTugasSurveyor.namaLembagaSurveyor }}</p></div>
              <div><span class="text-slate-500">Status Monitoring:</span> <p class="font-bold text-emerald-600">{{ selectedItemForReview.suratTugasSurveyor.status }}</p></div>
            </div>
          </div>

          <!-- Modal Action Footer -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="selectedItemForReview = null"
              class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Tutup
            </button>

            <div class="flex items-center gap-2">
              <!-- Action: Verifikasi Permohonan Langsung dari Panel -->
              <button
                v-if="selectedItemForReview.status === 'MENUNGGU_VERIFIKASI_TEKNIS'"
                type="button"
                @click="submitVerifikasiLangsung"
                :class="[
                  'inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md active:scale-95 transition-all cursor-pointer',
                  verifKeputusan === 'YA'
                    ? 'bg-[#066C2A] hover:bg-[#055722] shadow-[#066C2A]/25'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25',
                ]"
              >
                <Send class="w-4 h-4" />
                <span>{{ verifKeputusan === 'YA' ? 'Kirim ke BPDP PPK' : 'Kembalikan ke Draft Pekebun' }}</span>
              </button>

              <!-- Action: Simpan Dokumen Kontrak Langsung dari Panel (Konektor 4) -->
              <button
                v-if="selectedItemForReview.status === 'PENETAPAN_PEMENANG'"
                type="button"
                @click="submitProsesPelaksanaanKontrak"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <FileSignature class="w-4 h-4" />
                <span>Proses Pelaksanaan Kontrak</span>
              </button>

              <!-- Action: Terbitkan Surat Tugas Surveyor -->
              <button
                v-if="selectedItemForReview.status === 'PROSES_PELAKSANAAN_KONTRAK'"
                type="button"
                @click="openSurveyorModal(selectedItemForReview)"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Compass class="w-4 h-4" />
                Terbitkan Surat Tugas Surveyor
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modals -->
    <SuratTugasSurveyorModal
      :is-open="isSurveyorModalOpen"
      :permohonan="activeModalPermohonan"
      @close="isSurveyorModalOpen = false"
      @submit="handleSurveyorSubmit"
    />
  </div>
</template>
