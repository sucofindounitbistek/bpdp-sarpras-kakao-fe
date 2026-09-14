<script setup lang="ts">
// DivisiNilaiTable — pilih divisi pekerjaan (10) + input nilai per divisi; total computed read-only (revisi FINAL).
import { computed } from 'vue';
import { DIVISI_PEKERJAAN } from '@/types/penyaluranDana';
import type { PencairanDivisiItem } from '@/types/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { formatRupiah } from '@/utils/exportProposal';

const props = defineProps<{ modelValue: PencairanDivisiItem[]; sisaSaldo: number }>();
const emit = defineEmits<{ 'update:modelValue': [items: PencairanDivisiItem[]] }>();

const label = (id: string) => (LOCALIZATION.penyaluranDana.divisi as Record<string, string>)[id] ?? id;

const checked = computed<Record<string, boolean>>(() => {
  const m: Record<string, boolean> = {};
  for (const d of DIVISI_PEKERJAAN) m[d] = props.modelValue.some((it) => it.divisiId === d);
  return m;
});

const nilaiOf = (id: string) => props.modelValue.find((it) => it.divisiId === id)?.nilaiPermohonan ?? 0;

const total = computed(() => props.modelValue.reduce((s, d) => s + (Number.isFinite(d.nilaiPermohonan) ? d.nilaiPermohonan : 0), 0));
const melebihi = computed(() => total.value > props.sisaSaldo);

function toggle(id: string, on: boolean) {
  if (on) {
    emit('update:modelValue', [...props.modelValue, { divisiId: id as PencairanDivisiItem['divisiId'], nilaiPermohonan: 0 }]);
  } else {
    emit('update:modelValue', props.modelValue.filter((it) => it.divisiId !== id));
  }
}

function setNilai(id: string, raw: string) {
  const val = Number(raw.replace(/\D/g, ''));
  const items = props.modelValue.map((it) => (it.divisiId === id ? { ...it, nilaiPermohonan: Number.isFinite(val) ? val : 0 } : it));
  emit('update:modelValue', items);
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <table class="w-full text-xs">
      <thead>
        <tr class="text-left text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60">
          <th class="p-2.5 w-10 font-semibold">✓</th>
          <th class="p-2.5 font-semibold">Divisi</th>
          <th class="p-2.5 font-semibold text-right w-48">Nilai Permohonan (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="id in DIVISI_PEKERJAAN" :key="id" class="border-t border-slate-100 dark:border-slate-800/60">
          <td class="p-2.5">
            <input type="checkbox" class="w-4 h-4 accent-[#066C2A] cursor-pointer" :checked="checked[id]" @change="toggle(id, ($event.target as HTMLInputElement).checked)" />
          </td>
          <td class="p-2.5 text-slate-700 dark:text-slate-200" :class="checked[id] ? '' : 'text-slate-400 dark:text-slate-500'">{{ label(id) }}</td>
          <td class="p-2.5">
            <input
              v-if="checked[id]"
              type="text"
              inputmode="numeric"
              :value="nilaiOf(id) ? nilaiOf(id).toLocaleString('id-ID') : ''"
              placeholder="0"
              class="w-full h-9 rounded-lg border px-3 text-right font-medium bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
              @input="setNilai(id, ($event.target as HTMLInputElement).value)"
            />
            <span v-else class="block text-right text-slate-300 dark:text-slate-600">—</span>
          </td>
        </tr>
        <tr class="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-semibold">
          <td colspan="2" class="p-2.5 text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.wizard.totalPermohonan }}</td>
          <td class="p-2.5 text-right" :class="melebihi ? 'text-red-500' : 'text-[#066C2A] dark:text-emerald-400'">{{ formatRupiah(total) }}</td>
        </tr>
      </tbody>
    </table>
    <p class="px-3 py-2 text-[11px] border-t border-slate-100 dark:border-slate-800/60" :class="melebihi ? 'text-red-500 font-medium' : 'text-slate-500 dark:text-slate-400'">
      {{ LOCALIZATION.penyaluranDana.wizard.sisaSaldo }}: {{ formatRupiah(sisaSaldo) }}
      <span v-if="melebihi"> — {{ LOCALIZATION.penyaluranDana.toast.saldoKurang }}</span>
    </p>
  </div>
</template>
