<script setup lang="ts">
// VerifikasiRantaiPanel — rantai verifikasi Pendok→Verdok→QC→Pusat(+VPD)→Staff→Kadiv; catatan wajib saat Tidak Sesuai.
import { computed, ref } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { catatanVerifikasiSchema } from '@/schemas/penyaluranDana';
import { URUTAN_VERIFIKASI } from '@/types/penyaluranDana';
import type { TingkatVerifikasi } from '@/types/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { ShieldCheck, Lock, CheckCircle2, XCircle, Upload } from 'lucide-vue-next';

const props = defineProps<{ tahapId: string; readonly?: boolean; allowedTingkat?: TingkatVerifikasi[] }>();
const store = usePenyaluranDanaStore();
const toast = useToast();

const form = ref({ hasil: 'SESUAI' as 'SESUAI' | 'TIDAK_SESUAI', catatan: '' });
const vpdInput = ref<HTMLInputElement | null>(null);

const records = computed(() => store.verifikasiByTahap(props.tahapId));

function statusTingkat(t: TingkatVerifikasi): 'done' | 'active' | 'locked' {
  const idx = URUTAN_VERIFIKASI.indexOf(t);
  const has = records.value.filter((r) => r.tingkat === t);
  const last = has[has.length - 1];
  if (last && last.hasil === 'SESUAI') return 'done';
  if (last && last.hasil === 'TIDAK_SESUAI') return 'active';
  if (idx === 0) return 'active';
  const prev = URUTAN_VERIFIKASI[idx - 1];
  const prevDone = records.value.some((r) => r.tingkat === prev && r.hasil === 'SESUAI');
  return prevDone ? 'active' : 'locked';
}

const tingkatAktif = computed<TingkatVerifikasi | null>(() => {
  for (const t of URUTAN_VERIFIKASI) if (statusTingkat(t) === 'active') return t;
  return null;
});

const bolehAksi = computed(() => {
  if (props.readonly) return false;
  if (!tingkatAktif.value) return false;
  if (props.allowedTingkat && !props.allowedTingkat.includes(tingkatAktif.value)) return false;
  return true;
});

const tingkatLabel = (t: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[t] ?? t;

function submit() {
  if (!tingkatAktif.value) return;
  const r = catatanVerifikasiSchema.safeParse(form.value);
  if (!r.success) {
    toast.error(r.error.issues[0].message);
    return;
  }
  try {
    store.verifikasiDokumen(props.tahapId, tingkatAktif.value, form.value.hasil, form.value.catatan || undefined);
    toast.success(LOCALIZATION.penyaluranDana.toast.verifikasiSuccess, tingkatLabel(tingkatAktif.value));
    form.value = { hasil: 'SESUAI', catatan: '' };
  } catch (e) {
    toast.error((e as Error).message);
  }
}

function uploadVpd(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  store.uploadVpd(props.tahapId, file.name);
  toast.success(LOCALIZATION.penyaluranDana.toast.vpdSuccess, file.name);
  input.value = '';
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 shadow-sm">
    <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
      <ShieldCheck class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.verifikasi.tingkat }}
    </h4>
    <div class="flex flex-col gap-1.5">
      <div v-for="t in URUTAN_VERIFIKASI" :key="t" class="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
        :class="{
          'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20': statusTingkat(t) === 'done',
          'border-[#066C2A]/40 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10': statusTingkat(t) === 'active',
          'border-slate-200 dark:border-slate-800 opacity-60': statusTingkat(t) === 'locked',
        }"
      >
        <span class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
          <CheckCircle2 v-if="statusTingkat(t) === 'done'" class="w-4 h-4 text-emerald-500" />
          <XCircle v-else-if="records.some((r) => r.tingkat === t && r.hasil === 'TIDAK_SESUAI')" class="w-4 h-4 text-red-400" />
          <Lock v-else-if="statusTingkat(t) === 'locked'" class="w-4 h-4 text-slate-400" />
          <ShieldCheck v-else class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" />
          {{ tingkatLabel(t) }}
        </span>
        <span v-if="records.some((r) => r.tingkat === t)" class="text-[10px] text-slate-400">
          {{ new Date(records.filter((r) => r.tingkat === t).slice(-1)[0].actedAt).toLocaleString('id-ID') }}
        </span>
      </div>
    </div>

    <!-- Catatan terakhir per tingkat -->
    <div v-for="r in records.filter((x) => x.catatan)" :key="r.id" class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
      <span class="font-semibold">{{ tingkatLabel(r.tingkat) }}:</span> {{ r.catatan }}
    </div>
    <p v-if="records.some((r) => r.vpdFile)" class="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex flex-wrap items-center gap-1">
      {{ LOCALIZATION.penyaluranDana.verifikasi.vpd }}:
      <DocumentViewLink
        :file-name="records.find((r) => r.vpdFile)!.vpdFile"
        :context="{ judul: LOCALIZATION.penyaluranDana.verifikasi.vpd, aktor: records.find((r) => r.vpdFile)!.actor, waktu: records.find((r) => r.vpdFile)!.actedAt }"
      />
    </p>

    <!-- Form aksi -->
    <div v-if="bolehAksi" class="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-2">
      <p class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{{ tingkatLabel(tingkatAktif!) }} — {{ LOCALIZATION.penyaluranDana.verifikasi.hasil }}</p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors" :class="form.hasil === 'SESUAI' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'border-slate-300 dark:border-slate-700'" @click="form.hasil = 'SESUAI'">{{ LOCALIZATION.penyaluranDana.status.SESUAI }}</button>
        <button type="button" class="px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors" :class="form.hasil === 'TIDAK_SESUAI' ? 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-500' : 'border-slate-300 dark:border-slate-700'" @click="form.hasil = 'TIDAK_SESUAI'">{{ LOCALIZATION.penyaluranDana.status.TIDAK_SESUAI }}</button>
      </div>
      <textarea v-model="form.catatan" rows="2" :placeholder="form.hasil === 'TIDAK_SESUAI' ? LOCALIZATION.penyaluranDana.verifikasi.catatanWajib : LOCALIZATION.penyaluranDana.verifikasi.catatan + ' (opsional)'" class="rounded-lg border px-3 py-2 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" />
      <div class="flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="submit">
          {{ LOCALIZATION.penyaluranDana.verifikasi.hasil }}
        </button>
        <button v-if="tingkatAktif === 'SCI_PUSAT'" type="button" class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="vpdInput?.click()">
          <Upload class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.verifikasi.uploadVpd }}
        </button>
        <input ref="vpdInput" type="file" class="hidden" accept=".pdf" @change="uploadVpd" />
      </div>
    </div>
  </div>
</template>
