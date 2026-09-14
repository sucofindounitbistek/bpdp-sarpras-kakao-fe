<script setup lang="ts">
import { computed } from 'vue';
import { Trash2, Plus } from 'lucide-vue-next';
import type { RabItem } from '@/types/rab';
import { getRabTahapCount } from '@/types/rab';
import { LOCALIZATION } from '@/config/localization';

const props = defineProps<{
  items: RabItem[];
  readonly?: boolean;
  paket?: string | null;
  tahapCount?: number;
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'update', id: string, patch: Partial<RabItem>): void;
  (e: 'remove', id: string): void;
}>();

const effectiveTahapCount = computed<number>(() => {
  if (props.tahapCount && props.tahapCount > 0) return props.tahapCount;
  if (props.paket) return getRabTahapCount(props.paket);
  // Auto-detect from items
  const hasTahap3Or4 = props.items.some(
    (it) =>
      (it.jumlahTahap3 != null && it.jumlahTahap3 > 0) ||
      (it.jumlahTahap4 != null && it.jumlahTahap4 > 0) ||
      it.details?.jumlahTahap3 != null ||
      it.details?.jumlahTahap4 != null,
  );
  if (hasTahap3Or4) return 4;
  const hasTahap2 = props.items.some(
    (it) => (it.jumlahTahap2 != null && it.jumlahTahap2 > 0) || it.details?.jumlahTahap2 != null,
  );
  if (hasTahap2) return 2;
  return 1;
});

function onTahapChange(item: RabItem, field: 'jumlahTahap1' | 'jumlahTahap2' | 'jumlahTahap3' | 'jumlahTahap4', val: number | null) {
  const q1 = field === 'jumlahTahap1' ? (val ?? 0) : (item.jumlahTahap1 ?? 0);
  const q2 = field === 'jumlahTahap2' ? (val ?? 0) : (item.jumlahTahap2 ?? 0);
  const q3 = field === 'jumlahTahap3' ? (val ?? 0) : (item.jumlahTahap3 ?? 0);
  const q4 = field === 'jumlahTahap4' ? (val ?? 0) : (item.jumlahTahap4 ?? 0);

  let total = 0;
  if (effectiveTahapCount.value === 4) {
    total = q1 + q2 + q3 + q4;
  } else if (effectiveTahapCount.value === 2) {
    total = q1 + q2;
  } else {
    total = q1;
  }

  const harga = item.hargaSatuan ?? item.price_per_unit ?? 0;
  const subTotal = total * harga;

  emit('update', item.id, {
    [field]: val,
    jumlahTotal: total,
    volume: total,
    subTotal,
    total_price: subTotal,
  });
}

function onHargaChange(item: RabItem, val: number | null) {
  const harga = val ?? 0;
  const total = item.jumlahTotal ?? item.volume ?? 0;
  const subTotal = total * harga;

  emit('update', item.id, {
    hargaSatuan: val,
    price_per_unit: val,
    subTotal,
    total_price: subTotal,
  });
}

function getSatuanOptions(jenis?: string): string[] {
  if (jenis && (LOCALIZATION.rabDropdowns as any).satuanByJenis?.[jenis]) {
    return (LOCALIZATION.rabDropdowns as any).satuanByJenis[jenis];
  }
  return [...LOCALIZATION.rabDropdowns.satuanOptions];
}

function onJenisChange(item: RabItem) {
  const allowed = getSatuanOptions(item.jenis);
  let nextSatuan = item.satuan || '';
  if (item.jenis === 'Benih') {
    nextSatuan = 'Batang';
  } else if (nextSatuan && !allowed.includes(nextSatuan)) {
    nextSatuan = '';
  }

  item.satuan = nextSatuan;
  item.unit = nextSatuan;

  emit('update', item.id, {
    jenis: item.jenis,
    satuan: nextSatuan,
    unit: nextSatuan,
    uraian: '',
    jumlahTahap1: null,
    jumlahTahap2: null,
    jumlahTahap3: null,
    jumlahTahap4: null,
    jumlahTotal: 0,
    volume: 0,
    subTotal: 0,
    total_price: 0,
  });
}
</script>

<template>
  <div class="overflow-x-auto w-full max-w-full pb-2 rab-table-scroll">
    <div v-if="items.length === 0" class="text-center py-8 text-xs text-slate-400">
      {{ LOCALIZATION.rabTable.belumAdaBaris }}
    </div>

    <table v-else class="w-full text-xs border-collapse min-w-[950px]">
      <thead>
        <tr>
          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[130px] align-middle">
            {{ LOCALIZATION.rabTable.jenisLabel }}
          </th>
          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[160px] align-middle">
            {{ LOCALIZATION.rabTable.barangLabel }}
          </th>
          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[160px] align-middle">
            {{ LOCALIZATION.rabTable.varietasLabel || 'Varietas' }}
          </th>

          <!-- 4 Tahap (Intensifikasi) -->
          <template v-if="effectiveTahapCount === 4">
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[100px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap1Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[100px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap2Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[100px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap3Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[100px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap4Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[90px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTotalLabel }}
            </th>
          </template>

          <!-- 2 Tahap (Ekstensifikasi) -->
          <template v-else-if="effectiveTahapCount === 2">
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[105px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap1Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[105px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTahap2Label }}
            </th>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[90px] align-middle">
              {{ LOCALIZATION.rabTable.jumlahTotalLabel }}
            </th>
          </template>

          <!-- 1 Tahap (Lainnya) -->
          <template v-else>
            <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[105px] align-middle">
              {{ LOCALIZATION.rabTable.volumeLabel }}
            </th>
          </template>

          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[120px] align-middle">
            {{ LOCALIZATION.rabTable.satuanLabel }}
          </th>
          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[130px] align-middle">
            {{ LOCALIZATION.rabTable.hargaLabel }}
          </th>
          <th class="p-2.5 text-left text-slate-600 font-semibold bg-slate-50 border-b border-slate-200 min-w-[120px] align-middle">
            {{ LOCALIZATION.rabTable.biayaLabel }}
          </th>
          <th v-if="!props.readonly" class="p-2.5 w-10 text-center bg-slate-50 border-b border-slate-200 align-middle"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in props.items" :key="item.id" class="border-b border-slate-100 hover:bg-slate-50/50">
          <!-- Jenis -->
          <td class="p-2.5 min-w-[130px] text-left align-middle">
            <select
              v-if="!props.readonly"
              v-model="item.jenis"
              @change="onJenisChange(item)"
              class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#066C2A] bg-white text-left"
            >
              <option value="" disabled selected>Pilih Jenis</option>
              <option v-for="opt in LOCALIZATION.rabDropdowns.jenisOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <span v-else class="text-slate-800 font-medium">{{ item.jenis || '-' }}</span>
          </td>

          <!-- Uraian -->
          <td class="p-2.5 min-w-[160px] text-left align-middle">
            <select
              v-if="!props.readonly"
              v-model="item.uraian"
              @change="emit('update', item.id, { uraian: item.uraian })"
              class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#066C2A] bg-white disabled:bg-slate-50 text-left"
              :disabled="!item.jenis"
            >
              <option value="" disabled selected>Pilih Uraian</option>
              <option v-for="opt in LOCALIZATION.rabDropdowns.barangOptions[item.jenis || ''] || []" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <span v-else class="text-slate-800 font-medium">{{ item.uraian || '-' }}</span>
          </td>

          <!-- Varietas -->
          <td class="p-2.5 min-w-[160px] text-left align-middle">
            <div v-if="!props.readonly" class="flex flex-col gap-1.5">
              <select
                :value="item.varietas || item.details?.varietas || ''"
                @change="
                  (e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    item.varietas = val;
                    if (item.varietas !== 'Kelapa Varietas Lainnya') {
                      item.varietasCustom = '';
                    }
                    emit('update', item.id, { varietas: item.varietas, varietasCustom: item.varietasCustom });
                  }
                "
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#066C2A] bg-white text-left"
              >
                <option value="">Pilih Varietas</option>
                <option v-for="opt in LOCALIZATION.rabDropdowns.varietasOptions" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>

              <input
                v-if="(item.varietas || item.details?.varietas) === 'Kelapa Varietas Lainnya'"
                type="text"
                :value="item.varietasCustom || item.details?.varietasCustom || ''"
                @input="(e) => {
                  item.varietasCustom = (e.target as HTMLInputElement).value;
                  emit('update', item.id, { varietasCustom: item.varietasCustom });
                }"
                placeholder="Nama varietas..."
                class="h-8 w-full px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#066C2A] bg-white placeholder:text-slate-400"
              />
            </div>
            <span v-else class="text-slate-800 font-medium">
              {{
                (item.varietas || item.details?.varietas) === 'Kelapa Varietas Lainnya'
                  ? ((item.varietasCustom || item.details?.varietasCustom)
                    ? `${item.varietas || item.details?.varietas} (${item.varietasCustom || item.details?.varietasCustom})`
                    : (item.varietas || item.details?.varietas))
                  : (item.varietas || item.details?.varietas || '-')
              }}
            </span>
          </td>

          <!-- 4 Tahap Inputs (Intensifikasi) -->
          <template v-if="effectiveTahapCount === 4">
            <!-- Tahap 1 -->
            <td class="p-2.5 min-w-[100px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap1 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap1', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap1 ?? 0 }}</span>
            </td>
            <!-- Tahap 2 -->
            <td class="p-2.5 min-w-[100px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap2 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap2', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap2 ?? 0 }}</span>
            </td>
            <!-- Tahap 3 -->
            <td class="p-2.5 min-w-[100px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap3 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap3', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap3 ?? 0 }}</span>
            </td>
            <!-- Tahap 4 -->
            <td class="p-2.5 min-w-[100px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap4 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap4', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap4 ?? 0 }}</span>
            </td>
            <!-- Jumlah Total -->
            <td class="p-2.5 text-left min-w-[90px] align-middle">
              <span class="font-semibold text-slate-700 px-1 text-xs">
                {{ item.jumlahTotal ?? item.volume ?? 0 }}
              </span>
            </td>
          </template>

          <!-- 2 Tahap Inputs (Ekstensifikasi) -->
          <template v-else-if="effectiveTahapCount === 2">
            <!-- Tahap 1 -->
            <td class="p-2.5 min-w-[105px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap1 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap1', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap1 ?? 0 }}</span>
            </td>
            <!-- Tahap 2 -->
            <td class="p-2.5 min-w-[105px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap2 ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap2', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTahap2 ?? 0 }}</span>
            </td>
            <!-- Jumlah Total -->
            <td class="p-2.5 text-left min-w-[90px] align-middle">
              <span class="font-semibold text-slate-700 px-1 text-xs">
                {{ item.jumlahTotal ?? item.volume ?? 0 }}
              </span>
            </td>
          </template>

          <!-- 1 Tahap Input (Lainnya) -->
          <template v-else>
            <td class="p-2.5 min-w-[105px] text-left align-middle">
              <input
                v-if="!props.readonly"
                type="number"
                min="0"
                :value="item.jumlahTahap1 ?? item.jumlahTotal ?? item.volume ?? ''"
                @input="(e) => onTahapChange(item, 'jumlahTahap1', parseFloat((e.target as HTMLInputElement).value) || null)"
                class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
              />
              <span v-else class="block text-left">{{ item.jumlahTotal ?? item.volume ?? item.jumlahTahap1 ?? 0 }}</span>
            </td>
          </template>

          <!-- Satuan -->
          <td class="p-2.5 min-w-[120px] text-left align-middle">
            <select
              v-if="!props.readonly"
              v-model="item.satuan"
              @change="
                () => {
                  item.unit = item.satuan;
                  emit('update', item.id, { satuan: item.satuan, unit: item.satuan });
                }
              "
              class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#066C2A] bg-white text-left"
            >
              <option value="" disabled selected>Pilih Satuan</option>
              <option v-for="opt in getSatuanOptions(item.jenis)" :key="opt" :value="opt">
                {{ opt }}
              </option>
            </select>
            <span v-else class="text-slate-700">{{ item.satuan || item.unit || '-' }}</span>
          </td>

          <!-- Harga Satuan -->
          <td class="p-2.5 min-w-[130px] text-left align-middle">
            <input
              v-if="!props.readonly"
              type="number"
              min="0"
              :value="item.hargaSatuan ?? item.price_per_unit ?? ''"
              @input="(e) => onHargaChange(item, parseFloat((e.target as HTMLInputElement).value) || null)"
              class="h-9 w-full px-2.5 rounded-lg border border-slate-200 text-xs text-left focus:outline-none focus:border-[#066C2A] bg-white"
            />
            <span v-else class="block text-left font-mono">
              Rp {{ (item.hargaSatuan ?? item.price_per_unit ?? 0).toLocaleString('id-ID') }}
            </span>
          </td>

          <!-- Sub Total -->
          <td class="p-2.5 text-left min-w-[120px] align-middle">
            <span class="font-mono text-xs text-[#066C2A] font-semibold">
              Rp {{ (item.subTotal || item.total_price || ((item.volume || item.jumlahTotal || 0) * (item.hargaSatuan || item.price_per_unit || 0))).toLocaleString('id-ID') }}
            </span>
          </td>

          <!-- Actions -->
          <td v-if="!props.readonly" class="p-2.5 w-10 text-center align-middle">
            <button
              type="button"
              @click="emit('remove', item.id)"
              class="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button
      v-if="!props.readonly"
      type="button"
      @click="emit('add')"
      class="mt-3 flex items-center gap-1.5 text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer"
    >
      <Plus class="w-3.5 h-3.5" /> {{ LOCALIZATION.rabTable.tambahBaris }}
    </button>
  </div>
</template>

<style scoped>
.rab-table-scroll::-webkit-scrollbar {
  height: 6px;
}
.rab-table-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}
.rab-table-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.rab-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
