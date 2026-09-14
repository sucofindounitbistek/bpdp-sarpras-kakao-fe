<script setup lang="ts">
// KomparisiPanel — form Komparisi A.1 (KP) / A.2 (BPDP) / A.3 (Bank Mitra), role-aware.
import { ref, computed, watch } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { komparisiA1Schema, komparisiA2Schema, komparisiA3Schema } from '@/schemas/penyaluranDana';
import type { PihakKomparisi } from '@/types/penyaluranDana';
import { FileCheck2 } from 'lucide-vue-next';

const props = defineProps<{ pksId: string; pihak: PihakKomparisi }>();
const emit = defineEmits<{ submitted: [] }>();

const store = usePenyaluranDanaStore();
const toast = useToast();

const existing = computed(() => store.komparisiList.find((k) => k.pksId === props.pksId && k.pihak === props.pihak));

const form = ref({
  noPks: '',
  narasiBadanHukum: '',
  noRekeningKp: '',
  penunjukkanKetua: '',
});
const touched = ref<Record<string, boolean>>({});

watch(existing, (v) => {
  if (v) {
    form.value.noPks = v.payload.noPks ?? '';
    form.value.narasiBadanHukum = v.payload.narasiBadanHukum ?? '';
    form.value.noRekeningKp = v.payload.noRekeningKp ?? '';
    form.value.penunjukkanKetua = v.payload.penunjukkanKetua ?? '';
  }
}, { immediate: true });

const judul = computed(() => ({
  A1_KP: LOCALIZATION.penyaluranDana.pks.komparisiA1,
  A2_BPDP: LOCALIZATION.penyaluranDana.pks.komparisiA2,
  A3_BANK: LOCALIZATION.penyaluranDana.pks.komparisiA3,
}[props.pihak]));

const errors = computed<Record<string, string>>(() => {
  const e: Record<string, string> = {};
  if (props.pihak === 'A1_KP') {
    const r = komparisiA1Schema.safeParse(form.value);
    if (!r.success) for (const i of r.error.issues) e[i.path[0] as string] ??= i.message;
  } else if (props.pihak === 'A2_BPDP') {
    const r = komparisiA2Schema.safeParse(form.value);
    if (!r.success) for (const i of r.error.issues) e[i.path[0] as string] ??= i.message;
  } else {
    const r = komparisiA3Schema.safeParse(form.value);
    if (!r.success) for (const i of r.error.issues) e[i.path[0] as string] ??= i.message;
  }
  return e;
});

const legalitas = computed(() => store.komparisiList.find((k) => k.pksId === props.pksId && k.pihak === 'A1_KP')?.payload.legalitas);

function showErr(key: string): string | undefined {
  return touched.value[key] ? errors.value[key] : undefined;
}

function submit() {
  touched.value = { noPks: true, narasiBadanHukum: true, noRekeningKp: true, penunjukkanKetua: true };
  if (Object.keys(errors.value).length > 0) {
    toast.error(LOCALIZATION.penyaluranDana.toast.formInvalid);
    return;
  }
  store.submitKomparisi(props.pksId, props.pihak, {
    noPks: form.value.noPks,
    narasiBadanHukum: form.value.narasiBadanHukum || undefined,
    noRekeningKp: form.value.noRekeningKp || undefined,
    penunjukkanKetua: form.value.penunjukkanKetua || undefined,
    ...(props.pihak === 'A1_KP' && legalitas.value ? { legalitas: legalitas.value } : {}),
  });
  toast.success(LOCALIZATION.penyaluranDana.toast.komparisiSuccess, judul.value);
  emit('submitted');
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4">
    <div class="flex items-center justify-between gap-2 mb-3">
      <h4 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
        <FileCheck2 class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" />
        {{ judul }}
      </h4>
      <span v-if="existing" class="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        {{ LOCALIZATION.penyaluranDana.pks.submittedAt }}: {{ new Date(existing.submittedAt).toLocaleString('id-ID') }}
      </span>
      <span v-else class="text-[11px] font-medium text-amber-600 dark:text-amber-400">{{ LOCALIZATION.penyaluranDana.pks.belumSubmit }}</span>
    </div>

    <!-- A.1: legalitas KP (read-only dari profil) -->
    <div v-if="pihak === 'A1_KP' && legalitas" class="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
      <div class="col-span-1 sm:col-span-2 font-semibold text-slate-600 dark:text-slate-300">{{ LOCALIZATION.penyaluranDana.wizard.dataA }}</div>
      <p class="sm:col-span-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 leading-relaxed text-slate-700 dark:text-slate-300">
        {{ legalitas.namaKp }} · {{ legalitas.aktaAtauSk }} ({{ legalitas.instansiPengesahan }}) · NPWP {{ legalitas.npwp }} ·
        Ketua: {{ legalitas.ketuaNama }} (NIK {{ legalitas.ketuaNik }}) · {{ legalitas.alamat }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.pks.noPks }} *
        <input
          v-model="form.noPks"
          type="text"
          class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
          :class="showErr('noPks') ? 'border-red-400 dark:border-red-500' : ''"
          @blur="touched.noPks = true"
        />
        <span v-if="showErr('noPks')" class="text-red-500 text-[11px]">{{ showErr('noPks') }}</span>
      </label>

      <label v-if="pihak === 'A1_KP'" class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        Penunjukkan Ketua KP *
        <input
          v-model="form.penunjukkanKetua"
          type="text"
          class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
          :class="showErr('penunjukkanKetua') ? 'border-red-400 dark:border-red-500' : ''"
          @blur="touched.penunjukkanKetua = true"
        />
        <span v-if="showErr('penunjukkanKetua')" class="text-red-500 text-[11px]">{{ showErr('penunjukkanKetua') }}</span>
      </label>

      <label v-if="pihak === 'A3_BANK'" class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {{ LOCALIZATION.penyaluranDana.pks.noRekeningKp }} *
        <input
          v-model="form.noRekeningKp"
          type="text"
          inputmode="numeric"
          class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
          :class="showErr('noRekeningKp') ? 'border-red-400 dark:border-red-500' : ''"
          @blur="touched.noRekeningKp = true"
        />
        <span v-if="showErr('noRekeningKp')" class="text-red-500 text-[11px]">{{ showErr('noRekeningKp') }}</span>
      </label>

      <label v-if="pihak !== 'A1_KP'" class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 sm:col-span-2">
        {{ LOCALIZATION.penyaluranDana.pks.narasiBadanHukum }} *
        <textarea
          v-model="form.narasiBadanHukum"
          rows="3"
          class="rounded-lg border px-3 py-2 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
          :class="showErr('narasiBadanHukum') ? 'border-red-400 dark:border-red-500' : ''"
          @blur="touched.narasiBadanHukum = true"
        />
        <span v-if="showErr('narasiBadanHukum')" class="text-red-500 text-[11px]">{{ showErr('narasiBadanHukum') }}</span>
      </label>
    </div>

    <div class="mt-3 flex justify-end">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
        @click="submit"
      >
        <FileCheck2 class="w-4 h-4" />
        Submit Komparisi
      </button>
    </div>
  </div>
</template>
