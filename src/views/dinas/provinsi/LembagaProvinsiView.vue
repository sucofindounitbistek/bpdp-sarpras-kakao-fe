<script setup lang="ts">
import { ref, computed } from 'vue';
import { Building2, Search, Users, Phone, Mail, Eye, ShieldCheck, Layers } from 'lucide-vue-next';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Modal from '@/components/ui/Modal.vue';
import { LOCALIZATION } from '@/config/localization';

export interface LembagaAccount {
  id: string;
  namaLembaga: string;
  jenisLembaga: 'Kelompok Tani' | 'Gapoktan' | 'Koperasi Pekebun' | 'Kelembagaan Pekebun Lainnya';
  nomorLegalitas: string;
  ketuaNama: string;
  ketuaNik: string;
  email: string;
  telepon: string;
  provinsiKode: string;
  provinsiNama: string;
  kabupatenKode: string;
  kabupatenNama: string;
  kecamatanNama: string;
  desaNama: string;
  alamatLengkap: string;
  jumlahAnggota: number;
  totalLuasLahanHa: number;
  statusAkun: 'Aktif' | 'Terverifikasi' | 'Menunggu Verifikasi';
  registeredAt: string;
}

// Initial mock data for Provincial Farmer Organizations
const mockLembagaList = ref<LembagaAccount[]>([
  {
    id: 'LMB-001',
    namaLembaga: 'Kelompok Tani Tunas Sawit Mandiri',
    jenisLembaga: 'Kelompok Tani',
    nomorLegalitas: 'AHU-0012345.AH.01.07.2023',
    ketuaNama: 'Budi Santoso',
    ketuaNik: '7312011508820001',
    email: 'tunassawit@gmail.com',
    telepon: '081234567890',
    provinsiKode: '73',
    provinsiNama: 'SULAWESI SELATAN',
    kabupatenKode: '7324',
    kabupatenNama: 'KABUPATEN LUWU TIMUR',
    kecamatanNama: 'Towuti',
    desaNama: 'Asuli',
    alamatLengkap: 'Jl. Poros Towuti No. 45, Desa Asuli',
    jumlahAnggota: 24,
    totalLuasLahanHa: 48.5,
    statusAkun: 'Terverifikasi',
    registeredAt: '2024-01-15',
  },
  {
    id: 'LMB-002',
    namaLembaga: 'Gapoktan Sawit Sejahtera Bersama',
    jenisLembaga: 'Gapoktan',
    nomorLegalitas: 'SK-520/KPT/DISBUN/2022',
    ketuaNama: 'H. Ahmad Subardjo',
    ketuaNik: '7312021004750003',
    email: 'gapoktan.sawitsejahtera@yahoo.com',
    telepon: '082198765432',
    provinsiKode: '73',
    provinsiNama: 'SULAWESI SELATAN',
    kabupatenKode: '7324',
    kabupatenNama: 'KABUPATEN LUWU TIMUR',
    kecamatanNama: 'Malili',
    desaNama: 'Puncak Indah',
    alamatLengkap: 'Jl. Trans Sulawesi Km 5, Malili',
    jumlahAnggota: 65,
    totalLuasLahanHa: 132.0,
    statusAkun: 'Aktif',
    registeredAt: '2023-11-20',
  },
  {
    id: 'LMB-003',
    namaLembaga: 'Koperasi Produsen Perkebunan Kelapa Makmur',
    jenisLembaga: 'Koperasi Pekebun',
    nomorLegalitas: 'AHU-0098761.AH.01.02.2024',
    ketuaNama: 'Drs. Supriyadi',
    ketuaNik: '7317032211800004',
    email: 'koperasikelapamakmur@gmail.com',
    telepon: '085341122334',
    provinsiKode: '73',
    provinsiNama: 'SULAWESI SELATAN',
    kabupatenKode: '7317',
    kabupatenNama: 'KABUPATEN LUWU',
    kecamatanNama: 'Belopa',
    desaNama: 'Senga',
    alamatLengkap: 'Jl. Pahlawan No. 12, Belopa',
    jumlahAnggota: 110,
    totalLuasLahanHa: 215.8,
    statusAkun: 'Terverifikasi',
    registeredAt: '2024-02-10',
  },
  {
    id: 'LMB-004',
    namaLembaga: 'Kelompok Tani Subur Makmur',
    jenisLembaga: 'Kelompok Tani',
    nomorLegalitas: 'SK-112/KT/2023',
    ketuaNama: 'I Wayan Sudiarta',
    ketuaNik: '7322051203850002',
    email: 'suburmakmur.luwu@gmail.com',
    telepon: '081399887766',
    provinsiKode: '73',
    provinsiNama: 'SULAWESI SELATAN',
    kabupatenKode: '7322',
    kabupatenNama: 'KABUPATEN LUWU UTARA',
    kecamatanNama: 'Masamba',
    desaNama: 'Baliase',
    alamatLengkap: 'Dusun Baliase RT 02/RW 01',
    jumlahAnggota: 18,
    totalLuasLahanHa: 36.2,
    statusAkun: 'Aktif',
    registeredAt: '2024-03-01',
  },
  {
    id: 'LMB-005',
    namaLembaga: 'Gapoktan Harapan Jaya Mandiri',
    jenisLembaga: 'Gapoktan',
    nomorLegalitas: 'AHU-0034112.AH.01.07.2023',
    ketuaNama: 'Siti Rahmawati, S.P.',
    ketuaNik: '7317046009880001',
    email: 'harapanjaya.gapoktan@gmail.com',
    telepon: '082311445566',
    provinsiKode: '73',
    provinsiNama: 'SULAWESI SELATAN',
    kabupatenKode: '7317',
    kabupatenNama: 'KABUPATEN LUWU',
    kecamatanNama: 'Bua',
    desaNama: 'Tanjae',
    alamatLengkap: 'Jl. Poros Bua - Palopo Km 3',
    jumlahAnggota: 42,
    totalLuasLahanHa: 89.4,
    statusAkun: 'Terverifikasi',
    registeredAt: '2023-09-14',
  },
]);

// Search & Filter state
const searchQuery = ref('');
const selectedKabupaten = ref('');
const selectedDetailLembaga = ref<LembagaAccount | null>(null);
const showDetailModal = ref(false);

// Unique list of Kabupaten for dropdown filter
const kabupatenOptions = computed(() => {
  const list = mockLembagaList.value.map((l) => l.kabupatenNama);
  return Array.from(new Set(list));
});

// Real-time filtered list
const filteredLembaga = computed(() => {
  return mockLembagaList.value.filter((item) => {
    const query = searchQuery.value.toLowerCase().trim();
    const matchSearch = !query || item.namaLembaga.toLowerCase().includes(query) || item.nomorLegalitas.toLowerCase().includes(query) || item.ketuaNama.toLowerCase().includes(query) || item.jenisLembaga.toLowerCase().includes(query);

    const matchKab = !selectedKabupaten.value || item.kabupatenNama === selectedKabupaten.value;

    return matchSearch && matchKab;
  });
});

// Summary metrics
const totalLembagaCount = computed(() => mockLembagaList.value.length);
const totalAnggotaCount = computed(() => mockLembagaList.value.reduce((acc, curr) => acc + curr.jumlahAnggota, 0));
const totalLuasLahanHa = computed(() => mockLembagaList.value.reduce((acc, curr) => acc + curr.totalLuasLahanHa, 0));

function openDetail(item: LembagaAccount) {
  selectedDetailLembaga.value = item;
  showDetailModal.value = true;
}

function getStatusBadgeVariant(status: string) {
  if (status === 'Terverifikasi' || status === 'Aktif') return 'success';
  if (status === 'Menunggu Verifikasi') return 'warning';
  return 'secondary';
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
    <!-- Header Title Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Building2 class="w-6 h-6 text-[#066C2A]" />
        </div>
        <div class="flex flex-col gap-0.5">
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">
            {{ LOCALIZATION.lembagaProvinsi.title }}
          </h1>
          <p class="text-xs text-slate-500 max-w-2xl">
            {{ LOCALIZATION.lembagaProvinsi.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Summary Metric KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card class="p-4 border-l-4 border-l-[#066C2A] flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500">Total Kelembagaan</span>
          <span class="text-2xl font-bold text-slate-800">{{ totalLembagaCount }}</span>
          <span class="text-[10px] text-emerald-700 font-medium">Terdaftar di Provinsi</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#066C2A] flex items-center justify-center">
          <Building2 class="w-5 h-5" />
        </div>
      </Card>

      <Card class="p-4 border-l-4 border-l-sky-600 flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500">Total Anggota Pekebun</span>
          <span class="text-2xl font-bold text-slate-800">{{ totalAnggotaCount }}</span>
          <span class="text-[10px] text-sky-700 font-medium">Petani Terdata</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <Users class="w-5 h-5" />
        </div>
      </Card>

      <Card class="p-4 border-l-4 border-l-amber-500 flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500">Total Luas Lahan</span>
          <span class="text-2xl font-bold text-slate-800">{{ totalLuasLahanHa.toLocaleString('id-ID') }} <span class="text-xs font-semibold">Ha</span></span>
          <span class="text-[10px] text-amber-700 font-medium">Lahan Terverifikasi</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Layers class="w-5 h-5" />
        </div>
      </Card>

      <Card class="p-4 border-l-4 border-l-indigo-600 flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-slate-500">Status Akun</span>
          <span class="text-2xl font-bold text-slate-800">100%</span>
          <span class="text-[10px] text-indigo-700 font-medium">Aktif & Terverifikasi</span>
        </div>
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <ShieldCheck class="w-5 h-5" />
        </div>
      </Card>
    </div>

    <!-- Filter & Table Card -->
    <Card class="p-5 flex flex-col gap-4">
      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="LOCALIZATION.lembagaProvinsi.searchPlaceholder"
            class="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#066C2A] bg-slate-50/50"
          />
        </div>

        <!-- District Filter Dropdown -->
        <div class="flex items-center gap-2">
          <select v-model="selectedKabupaten" class="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-[#066C2A]">
            <option value="">{{ LOCALIZATION.lembagaProvinsi.filterKabupaten }}</option>
            <option v-for="kab in kabupatenOptions" :key="kab" :value="kab">
              {{ kab }}
            </option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <th class="py-3 px-4">Nama Kelembagaan & Legalitas</th>
              <th class="py-3 px-4">Jenis</th>
              <th class="py-3 px-4">Kabupaten / Kota</th>
              <th class="py-3 px-4">Ketua / Penanggung Jawab</th>
              <th class="py-3 px-4 text-center">Anggota & Lahan</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="filteredLembaga.length > 0">
              <tr v-for="item in filteredLembaga" :key="item.id" class="hover:bg-slate-50/80 transition-colors">
                <!-- Nama & Legalitas -->
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-0.5 max-w-xs">
                    <span class="font-bold text-slate-800 text-xs">{{ item.namaLembaga }}</span>
                    <!-- <span class="text-[10px] text-slate-500 font-mono">SK/NIB: {{ item.nomorLegalitas }}</span> -->
                  </div>
                </td>

                <!-- Jenis -->
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {{ item.jenisLembaga }}
                  </span>
                </td>

                <!-- Kabupaten -->
                <td class="py-3 px-4 text-slate-700 font-medium">
                  <div class="flex flex-col gap-0.5">
                    <span>{{ item.kabupatenNama }}</span>
                    <span class="text-[10px] text-slate-400">Kec. {{ item.kecamatanNama }}</span>
                  </div>
                </td>

                <!-- Ketua & Kontak -->
                <td class="py-3 px-4">
                  <div class="flex flex-col gap-0.5">
                    <span class="font-semibold text-slate-800">{{ item.ketuaNama }}</span>
                    <span class="text-[10px] text-slate-500 font-mono">{{ item.telepon }}</span>
                  </div>
                </td>

                <!-- Anggota & Lahan -->
                <td class="py-3 px-4 text-center">
                  <div class="flex flex-col items-center gap-0.5">
                    <span class="font-bold text-slate-800">{{ item.jumlahAnggota }} <span class="text-[10px] font-normal text-slate-500">Anggota</span></span>
                    <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{{ item.totalLuasLahanHa }} Ha</span>
                  </div>
                </td>

                <!-- Action -->
                <td class="py-3 px-4 text-center">
                  <Button size="sm" variant="outline" class="p-2 border-slate-200 text-slate-700 hover:bg-slate-50 mx-auto" title="Detail Akun Kelembagaan" @click="openDetail(item)">
                    <Eye class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="6" class="py-8 text-center text-slate-400 text-xs italic">
                  {{ LOCALIZATION.lembagaProvinsi.emptyText }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Detail Account Modal -->
    <Modal :isOpen="showDetailModal" :title="LOCALIZATION.lembagaProvinsi.detailTitle" @close="showDetailModal = false" :closeOnOverlay="true">
      <div v-if="selectedDetailLembaga" class="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
        <!-- Header Banner -->
        <div class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#066C2A] text-white flex items-center justify-center shrink-0">
              <Building2 class="w-5 h-5" />
            </div>
            <div class="flex flex-col gap-0.5">
              <h3 class="text-sm font-bold text-slate-900">{{ selectedDetailLembaga.namaLembaga }}</h3>
              <p class="text-xs font-semibold text-[#066C2A]">{{ selectedDetailLembaga.jenisLembaga }}</p>
            </div>
          </div>
          <Badge :variant="getStatusBadgeVariant(selectedDetailLembaga.statusAkun)">
            {{ selectedDetailLembaga.statusAkun }}
          </Badge>
        </div>

        <!-- Section 1: Legalitas & Registrasi -->
        <div class="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Legalitas & Registrasi</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <div>
              <span class="text-slate-500">Nomor Legalitas/NIB:</span> <strong class="font-mono text-slate-800">{{ selectedDetailLembaga.nomorLegalitas }}</strong>
            </div>
            <div>
              <span class="text-slate-500">Tanggal Terdaftar:</span> <strong class="text-slate-800">{{ selectedDetailLembaga.registeredAt }}</strong>
            </div>
          </div>
        </div>

        <!-- Section 2: Penanggung Jawab / Ketua -->
        <div class="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Penanggung Jawab / Ketua</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <div>
              <span class="text-slate-500">Nama Ketua:</span> <strong class="text-slate-800">{{ selectedDetailLembaga.ketuaNama }}</strong>
            </div>
            <div>
              <span class="text-slate-500">NIK Ketua:</span> <strong class="font-mono text-slate-800">{{ selectedDetailLembaga.ketuaNik }}</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <Phone class="w-3.5 h-3.5 text-slate-400" /><span class="font-mono text-slate-800">{{ selectedDetailLembaga.telepon }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <Mail class="w-3.5 h-3.5 text-slate-400" /><span class="font-mono text-slate-800">{{ selectedDetailLembaga.email }}</span>
            </div>
          </div>
        </div>

        <!-- Section 3: Domisili & Wilayah -->
        <div class="flex flex-col gap-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Wilayah / Alamat Lengkap</span>
          <div class="flex flex-col gap-1 mt-1">
            <div>
              <span class="text-slate-500">Kabupaten/Kota:</span> <strong class="text-slate-800">{{ selectedDetailLembaga.kabupatenNama }}</strong>
            </div>
            <div>
              <span class="text-slate-500">Kecamatan & Desa:</span> <strong class="text-slate-800">Kec. {{ selectedDetailLembaga.kecamatanNama }}, Desa {{ selectedDetailLembaga.desaNama }}</strong>
            </div>
            <div>
              <span class="text-slate-500">Alamat Lengkap:</span> <span class="text-slate-800">{{ selectedDetailLembaga.alamatLengkap }}</span>
            </div>
          </div>
        </div>

        <!-- Section 4: Anggota & Portofolio Lahan -->
        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col gap-1 items-center text-center">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Total Anggota</span>
            <span class="text-lg font-bold text-[#066C2A]">{{ selectedDetailLembaga.jumlahAnggota }} Petani</span>
          </div>
          <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex flex-col gap-1 items-center text-center">
            <span class="text-[10px] text-slate-500 font-semibold uppercase">Total Luas Lahan</span>
            <span class="text-lg font-bold text-amber-700">{{ selectedDetailLembaga.totalLuasLahanHa }} Ha</span>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
