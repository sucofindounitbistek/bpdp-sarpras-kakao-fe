<script setup lang="ts">
import { computed } from 'vue';
import type { ItemPreferensiRAB } from '@/types/penyaluranBarang';
import { Trash2, Plus, Sparkles } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';

const props = withDefaults(
  defineProps<{
    modelValue: ItemPreferensiRAB[];
    disabled?: boolean;
    readonly?: boolean;
  }>(),
  {
    disabled: false,
    readonly: false,
  }
);

const isReadonly = computed(() => props.disabled || props.readonly);

const emit = defineEmits<{
  (e: 'update:modelValue', val: ItemPreferensiRAB[]): void;
}>();

const JENIS_OPTIONS = computed(() => {
  return (
    LOCALIZATION.rabDropdowns?.jenisOptions || [
      { value: 'Benih', label: 'Benih' },
      { value: 'Pupuk', label: 'Pupuk' },
      { value: 'Pestisida', label: 'Pestisida' },
      { value: 'Peralatan', label: 'Peralatan' },
      { value: 'Lainnya', label: 'Lainnya' },
    ]
  );
});

const BARANG_OPTIONS: Record<string, string[]> = {
  Benih: ['Benih Kelapa', 'Bibit Kelapa Siap Tanam', 'Kecambah Kelapa'],
  Pupuk: ['Pupuk Organik / Kompos', 'Pupuk Anorganik Tunggal', 'Pupuk Majemuk NPK', 'Pembenah Tanah'],
  Pestisida: ['Herbisida', 'Insektisida', 'Fungisida', 'Rodentisida'],
  Peralatan: ['Peralatan Pascapanen', 'Alat Semprot / Sprayer', 'Mesin Pengupas Sabut'],
  Lainnya: ['Barang Penunjang Lainnya'],
};

const VARIETAS_OPTIONS: Record<string, string[]> = {
  'Benih Kelapa': ['Kelapa Genjah Kuning', 'Kelapa Genjah Kopyor', 'Kelapa Dalam Sri Gemilang', 'Kelapa Dalam Babalan', 'Kelapa Hibrida KHINA-1', 'Kelapa Genjah Salak'],
  'Bibit Kelapa Siap Tanam': ['Kelapa Genjah Kuning', 'Kelapa Genjah Kopyor', 'Kelapa Dalam Sri Gemilang', 'Kelapa Hibrida KHINA-1'],
  'Kecambah Kelapa': ['Kelapa Genjah Kuning', 'Kelapa Genjah Kopyor', 'Kelapa Dalam'],
  'Pupuk Majemuk NPK': ['NPK 15-15-15', 'NPK 12-12-17-2', 'NPK Phonska Plus'],
  'Pupuk Anorganik Tunggal': ['Urea', 'Rock Phosphate', 'KCL', 'Kieserite', 'Boron'],
  'Pupuk Organik / Kompos': ['Kompos Terfermentasi', 'Pupuk Kandang Matang', 'Granul Organik'],
  'Herbisida': ['Glifosat 480 SL', 'Parakuat Diklorida', 'Isopropilamina Glifosat'],
  'Insektisida': ['Karbofuran 3GR', 'Deltametrin', 'Klorantraniliprol'],
  'Fungisida': ['Mankozeb 80 WP', 'Karbendazim'],
  'Rodentisida': ['Klerat 0.005 BB', 'Brodifakum', 'Zinc Phosphide'],
};

function getSatuanOptions(jenis?: string): string[] {
  if (jenis && (LOCALIZATION.rabDropdowns as any)?.satuanByJenis?.[jenis]) {
    return (LOCALIZATION.rabDropdowns as any).satuanByJenis[jenis];
  }
  return LOCALIZATION.rabDropdowns?.satuanOptions ? [...LOCALIZATION.rabDropdowns.satuanOptions] : ['Batang', 'Kg', 'Liter', 'Buah', 'Sachet', 'Unit', 'Paket', 'Sak'];
}

const totalKebutuhan = computed(() => {
  return props.modelValue.reduce((sum, item) => sum + (item.estimasiTotal || 0), 0);
});

function addRow() {
  const newItem: ItemPreferensiRAB = {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    jenisBarang: 'Benih',
    namaBarang: 'Benih Kelapa',
    varietas: 'Kelapa Genjah Kuning',
    namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kuning)',
    jumlahTahap1: null,
    jumlahTahap2: null,
    jumlah: 0,
    satuan: 'Batang',
    estimasiHargaSatuan: 0,
    estimasiTotal: 0,
  };
  emit('update:modelValue', [...props.modelValue, newItem]);
}

function updateRow(id: string, patch: Partial<ItemPreferensiRAB>) {
  const updated = props.modelValue.map((item) => {
    if (item.id !== id) return item;
    const merged = { ...item, ...patch };

    // When changing jenis, reset namaBarang & varietas if not compatible
    if (patch.jenisBarang !== undefined && patch.jenisBarang !== item.jenisBarang) {
      merged.namaBarang = (BARANG_OPTIONS[merged.jenisBarang] && BARANG_OPTIONS[merged.jenisBarang][0]) || '';
      merged.varietas = (VARIETAS_OPTIONS[merged.namaBarang] && VARIETAS_OPTIONS[merged.namaBarang][0]) || '';
      const allowed = getSatuanOptions(merged.jenisBarang);
      if (merged.jenisBarang === 'Benih') {
        merged.satuan = 'Batang';
      } else if (merged.satuan && !allowed.includes(merged.satuan)) {
        merged.satuan = '';
      }
    }

    // When changing namaBarang, adjust varietas if available
    if (patch.namaBarang !== undefined && patch.namaBarang !== item.namaBarang) {
      if (VARIETAS_OPTIONS[merged.namaBarang] && VARIETAS_OPTIONS[merged.namaBarang].length > 0) {
        merged.varietas = VARIETAS_OPTIONS[merged.namaBarang][0];
      }
    }

    const q1 = merged.jumlahTahap1 ?? 0;
    const q2 = merged.jumlahTahap2 ?? 0;
    merged.jumlah = q1 + q2 > 0 ? q1 + q2 : merged.jumlah || 0;

    const harga = merged.estimasiHargaSatuan || 0;
    merged.estimasiTotal = merged.jumlah * harga;

    merged.namaBarangVarietas = merged.varietas ? `${merged.namaBarang || ''} (${merged.varietas})` : (merged.namaBarang || '');

    return merged;
  });

  emit('update:modelValue', updated);
}

function removeRow(id: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((item) => item.id !== id)
  );
}

function setPresetTemplate() {
  const presets: ItemPreferensiRAB[] = [
    {
      id: `item-${Date.now()}-1`,
      jenisBarang: 'Benih',
      namaBarang: 'Benih Kelapa',
      varietas: 'Kelapa Genjah Kopyor',
      namaBarangVarietas: 'Benih Kelapa (Kelapa Genjah Kopyor)',
      jumlahTahap1: 600,
      jumlahTahap2: 600,
      jumlah: 1200,
      satuan: 'Batang',
      estimasiHargaSatuan: 85000,
      estimasiTotal: 102000000,
    },
    {
      id: `item-${Date.now()}-2`,
      jenisBarang: 'Pupuk',
      namaBarang: 'Pupuk Majemuk NPK',
      varietas: 'NPK 15-15-15',
      namaBarangVarietas: 'Pupuk Majemuk NPK (NPK 15-15-15)',
      jumlahTahap1: 1200,
      jumlahTahap2: 1200,
      jumlah: 2400,
      satuan: 'Kg',
      estimasiHargaSatuan: 22000,
      estimasiTotal: 52800000,
    },
    {
      id: `item-${Date.now()}-3`,
      jenisBarang: 'Pupuk',
      namaBarang: 'Pupuk Organik / Kompos',
      varietas: 'Kompos Terfermentasi',
      namaBarangVarietas: 'Pupuk Organik / Kompos (Kompos Terfermentasi)',
      jumlahTahap1: 1000,
      jumlahTahap2: 1000,
      jumlah: 2000,
      satuan: 'Kg',
      estimasiHargaSatuan: 15000,
      estimasiTotal: 30000000,
    },
  ];
  emit('update:modelValue', presets);
}
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Empty State -->
    <div v-if="modelValue.length === 0" class="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
      <p>{{ LOCALIZATION.rabTable?.belumAdaBaris || 'Belum ada baris RAB. Klik "Tambah Baris" untuk memulai.' }}</p>
      <div v-if="!isReadonly" class="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          @click="addRow"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          {{ LOCALIZATION.rabTable?.tambahBaris || 'Tambah Baris' }}
        </button>
        <button
          type="button"
          @click="setPresetTemplate"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
        >
          <Sparkles class="w-3.5 h-3.5" />
          Rekomendasi Paket Standar
        </button>
      </div>
    </div>

    <!-- Data Table matching Proposal UI with Separate Nama Barang and Varietas Columns -->
    <table v-else class="w-full text-xs border-collapse">
      <thead>
        <tr>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            Jenis Barang
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            Nama Barang
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            Varietas
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            {{ LOCALIZATION.rabTable?.jumlahTahap1Label || 'Jumlah Tahap 1' }}
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            {{ LOCALIZATION.rabTable?.jumlahTahap2Label || 'Jumlah Tahap 2' }}
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-center">
            {{ LOCALIZATION.rabTable?.jumlahTotalLabel || 'Jumlah Total' }}
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            {{ LOCALIZATION.rabTable?.satuanLabel || 'Satuan' }}
          </th>
          <th class="p-2 text-left text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            {{ LOCALIZATION.rabTable?.hargaLabel || 'Harga Satuan' }}
          </th>
          <th class="p-2 text-right text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800">
            {{ LOCALIZATION.rabTable?.biayaLabel || 'Total Harga' }}
          </th>
          <th v-if="!isReadonly" class="p-2 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 w-10"></th>
        </tr>
      </thead>
      <tbody>
        <!-- Editable Mode -->
        <template v-if="!isReadonly">
          <tr v-for="item in modelValue" :key="item.id" class="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <!-- 1. Jenis Barang -->
            <td class="p-2 min-w-28">
              <select
                :value="item.jenisBarang"
                @change="(e) => updateRow(item.id, { jenisBarang: (e.target as HTMLSelectElement).value })"
                class="h-9 w-full px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A] cursor-pointer"
              >
                <option value="" disabled selected>Pilih Jenis</option>
                <option v-for="opt in JENIS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>

            <!-- 2. Nama Barang -->
            <td class="p-2 min-w-36">
              <select
                v-if="BARANG_OPTIONS[item.jenisBarang]"
                :value="item.namaBarang || item.namaBarangVarietas"
                @change="(e) => updateRow(item.id, { namaBarang: (e.target as HTMLSelectElement).value })"
                class="h-9 w-full px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A] disabled:bg-slate-50 dark:disabled:bg-slate-800 cursor-pointer"
                :disabled="!item.jenisBarang"
              >
                <option value="" disabled selected>Pilih Barang</option>
                <option v-for="opt in BARANG_OPTIONS[item.jenisBarang]" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <input
                v-else
                :value="item.namaBarang || item.namaBarangVarietas"
                @input="(e) => updateRow(item.id, { namaBarang: (e.target as HTMLInputElement).value })"
                placeholder="Ketik nama barang..."
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A] disabled:bg-slate-50 dark:disabled:bg-slate-800"
                :disabled="!item.jenisBarang"
              />
            </td>

            <!-- 3. Varietas -->
            <td class="p-2 min-w-40">
              <select
                v-if="VARIETAS_OPTIONS[item.namaBarang || '']"
                :value="item.varietas"
                @change="(e) => updateRow(item.id, { varietas: (e.target as HTMLSelectElement).value })"
                class="h-9 w-full px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A] disabled:bg-slate-50 dark:disabled:bg-slate-800 cursor-pointer"
                :disabled="!item.namaBarang"
              >
                <option value="" disabled selected>Pilih Varietas</option>
                <option v-for="opt in VARIETAS_OPTIONS[item.namaBarang || '']" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
              <input
                v-else
                :value="item.varietas"
                @input="(e) => updateRow(item.id, { varietas: (e.target as HTMLInputElement).value })"
                placeholder="Ketik varietas / spesifikasi..."
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A]"
              />
            </td>

            <!-- 4. Jumlah Tahap 1 -->
            <td class="p-2">
              <input
                type="number"
                min="0"
                :value="item.jumlahTahap1 ?? ''"
                @input="(e) => updateRow(item.id, { jumlahTahap1: parseFloat((e.target as HTMLInputElement).value) || null })"
                placeholder="0"
                class="h-9 w-16 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A]"
              />
            </td>

            <!-- 5. Jumlah Tahap 2 -->
            <td class="p-2">
              <input
                type="number"
                min="0"
                :value="item.jumlahTahap2 ?? ''"
                @input="(e) => updateRow(item.id, { jumlahTahap2: parseFloat((e.target as HTMLInputElement).value) || null })"
                placeholder="0"
                class="h-9 w-16 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A]"
              />
            </td>

            <!-- 6. Jumlah Total (Computed) -->
            <td class="p-2 text-center">
              <span class="font-semibold text-slate-800 dark:text-slate-200 px-1 text-xs">
                {{ (item.jumlah || ((item.jumlahTahap1 || 0) + (item.jumlahTahap2 || 0))).toLocaleString('id-ID') }}
              </span>
            </td>

            <!-- 7. Satuan -->
            <td class="p-2 min-w-20">
              <select
                :value="item.satuan"
                @change="(e) => updateRow(item.id, { satuan: (e.target as HTMLSelectElement).value })"
                class="h-9 w-full px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A] cursor-pointer"
              >
                <option value="" disabled selected>Pilih Satuan</option>
                <option v-for="opt in getSatuanOptions(item.jenisBarang)" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </td>

            <!-- 8. Harga Satuan -->
            <td class="p-2">
              <input
                type="number"
                min="0"
                :value="item.estimasiHargaSatuan ?? ''"
                @input="(e) => updateRow(item.id, { estimasiHargaSatuan: parseFloat((e.target as HTMLInputElement).value) || 0 })"
                placeholder="0"
                class="h-9 w-24 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-[#066C2A]"
              />
            </td>

            <!-- 9. Total Harga -->
            <td class="p-2 text-right">
              <span class="font-mono text-xs text-[#066C2A] dark:text-emerald-400 font-semibold">
                Rp {{ (item.estimasiTotal || 0).toLocaleString('id-ID') }}
              </span>
            </td>

            <!-- 10. Aksi Hapus -->
            <td class="p-2 text-center">
              <button
                type="button"
                @click="removeRow(item.id)"
                class="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Hapus baris ini"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </template>

        <!-- Readonly / Disabled Mode with Separate Columns -->
        <template v-else>
          <tr v-for="item in modelValue" :key="item.id" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="p-3 font-semibold text-slate-900 dark:text-slate-100">{{ item.jenisBarang || '-' }}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 font-medium">{{ item.namaBarang || item.namaBarangVarietas || '-' }}</td>
            <td class="p-3 text-slate-700 dark:text-slate-300 font-semibold text-emerald-800 dark:text-emerald-300">{{ item.varietas || '-' }}</td>
            <td class="p-3 text-slate-600 dark:text-slate-400 text-left font-mono">
              {{ item.jumlahTahap1 !== undefined && item.jumlahTahap1 !== null ? item.jumlahTahap1.toLocaleString('id-ID') : '-' }}
            </td>
            <td class="p-3 text-slate-600 dark:text-slate-400 text-left font-mono">
              {{ item.jumlahTahap2 !== undefined && item.jumlahTahap2 !== null ? item.jumlahTahap2.toLocaleString('id-ID') : '-' }}
            </td>
            <td class="p-3 text-center font-bold font-mono text-slate-900 dark:text-slate-100">
              {{ (item.jumlah || 0).toLocaleString('id-ID') }}
            </td>
            <td class="p-3 text-slate-600 dark:text-slate-400">{{ item.satuan || '-' }}</td>
            <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-400">
              Rp {{ (item.estimasiHargaSatuan || 0).toLocaleString('id-ID') }}
            </td>
            <td class="p-3 text-right font-mono font-bold text-[#066C2A] dark:text-emerald-400">
              Rp {{ (item.estimasiTotal || 0).toLocaleString('id-ID') }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- Actions & Footer -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
      <div v-if="!isReadonly" class="flex items-center gap-4">
        <button
          type="button"
          @click="addRow"
          class="flex items-center gap-1.5 text-xs text-[#066C2A] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          {{ LOCALIZATION.rabTable?.tambahBaris || 'Tambah Baris' }}
        </button>

        <button
          v-if="modelValue.length === 0"
          type="button"
          @click="setPresetTemplate"
          class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
        >
          <Sparkles class="w-3.5 h-3.5 text-emerald-600" />
          Isi Rekomendasi Paket Standar
        </button>
      </div>
      <div v-else></div>

      <!-- Total Anggaran Summary -->
      <div v-if="modelValue.length > 0" class="flex items-center gap-3 self-end">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Anggaran</span>
        <span class="text-sm font-bold font-mono text-[#066C2A] dark:text-emerald-400">
          Rp {{ totalKebutuhan.toLocaleString('id-ID') }}
        </span>
      </div>
    </div>
  </div>
</template>
