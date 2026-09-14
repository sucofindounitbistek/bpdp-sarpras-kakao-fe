<script setup lang="ts">
// SciMonitoringLapanganView — surat tugas & laporan monitoring E (≥70%) / G (100%) oleh Surveyor SCI.
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { laporanMonitoringSchema } from '@/schemas/penyaluranDana';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { Upload, MapPinned } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const toast = useToast();
const loading = ref(true);
setTimeout(() => (loading.value = false), 350);

const tahapMonitoring = computed(() => store.tahapList.filter((t) => t.tahap >= 2));
const form = ref<Record<string, { progress: number; laporan?: string; ba?: string; dokumentasi?: string; suratTugas?: string }>>({});
const inputs = ref<Record<string, HTMLInputElement | null>>({});

const permohonanOf = (pencairanId: string) => store.permohonanList.find((m) => m.id === pencairanId);
const mon = (tahapId: string) => store.monitoringByTahap(tahapId);

function ensure(tahapId: string) {
  form.value[tahapId] ??= { progress: mon(tahapId)?.progress ?? 0 };
  return form.value[tahapId]!;
}

function pick(e: Event, tahapId: string, field: 'suratTugas' | 'laporan' | 'ba' | 'dokumentasi') {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  ensure(tahapId)[field] = file.name;
  if (field === 'suratTugas') {
    store.uploadSuratTugas(tahapId, file.name);
    toast.success(LOCALIZATION.penyaluranDana.toast.uploadSuccess, LOCALIZATION.penyaluranDana.monitoring.suratTugas);
  } else {
    toast.success(LOCALIZATION.penyaluranDana.toast.uploadSuccess, file.name);
  }
  input.value = '';
}

function simpanLaporan(tahapId: string, tahap: 1 | 2 | 3) {
  const f = ensure(tahapId);
  const r = laporanMonitoringSchema.safeParse({ tahap, progress: f.progress });
  if (!r.success) {
    toast.error(r.error.issues[0].message);
    return;
  }
  store.uploadLaporanMonitoring(tahapId, f.progress, { laporan: f.laporan, ba: f.ba, dokumentasi: f.dokumentasi });
  toast.success(LOCALIZATION.penyaluranDana.toast.laporanMonitoringSuccess);
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.monitoringTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.monitoringSubtitle }}</p>
    </header>

    <div v-if="loading" class="flex flex-col gap-3"><Skeleton class="h-24 w-full" /><Skeleton class="h-72 w-full" /></div>

    <template v-else>
      <div v-if="tahapMonitoring.length === 0" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 text-center text-xs text-slate-400">
        {{ LOCALIZATION.penyaluranDana.common.kosong }}
      </div>

      <section v-for="t in tahapMonitoring" :key="t.id" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPinned class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ t.idPenyaluran }}
            </h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ permohonanOf(t.pencairanId)?.nomorPermohonan }} · {{ t.tahap === 2 ? LOCALIZATION.penyaluranDana.monitoring.laporanE : LOCALIZATION.penyaluranDana.monitoring.laporanG }} · gate ≥ {{ (t.gateProgress ?? 0) * 100 }}%
            </p>
          </div>
          <span v-if="mon(t.id)" class="px-2.5 py-1 rounded-full text-[10px] font-semibold" :class="mon(t.id)!.verified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'">
            {{ mon(t.id)!.verified ? 'Terverifikasi' : 'Menunggu verifikasi BPDP' }} · {{ mon(t.id)!.progress }}%
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Surat tugas -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-2">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.monitoring.suratTugas }}</p>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="self-start inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="inputs['st-' + t.id]?.click()">
                <Upload class="w-3.5 h-3.5" /> {{ (ensure(t.id).suratTugas ?? mon(t.id)?.suratTugasFile) ? 'Ganti Berkas' : LOCALIZATION.penyaluranDana.monitoring.uploadSuratTugas }}
              </button>
              <DocumentViewLink v-if="ensure(t.id).suratTugas ?? mon(t.id)?.suratTugasFile" :file-name="ensure(t.id).suratTugas ?? mon(t.id)!.suratTugasFile!" :context="{ judul: LOCALIZATION.penyaluranDana.monitoring.suratTugas, aktor: 'SURVEYOR_SCI' }" />
            </div>
            <input :ref="(el) => (inputs['st-' + t.id] = el as HTMLInputElement)" type="file" class="hidden" accept=".pdf" @change="pick($event, t.id, 'suratTugas')" />
          </div>

          <!-- Laporan -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col gap-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex flex-col gap-1">
              {{ LOCALIZATION.penyaluranDana.monitoring.progress }} (syarat {{ t.tahap === 2 ? '≥ 70' : '100' }}%)
              <input type="range" min="0" max="100" step="5" v-model.number="ensure(t.id).progress" class="accent-[#066C2A]" />
              <span class="text-[11px] font-mono text-slate-500">{{ ensure(t.id).progress }}%</span>
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" @click="inputs['lp-' + t.id]?.click()">{{ LOCALIZATION.penyaluranDana.common.laporan }}</button>
              <button type="button" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" @click="inputs['ba-' + t.id]?.click()">{{ LOCALIZATION.penyaluranDana.monitoring.baMonitoring }}</button>
              <button type="button" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800" @click="inputs['dk-' + t.id]?.click()">{{ LOCALIZATION.penyaluranDana.monitoring.dokumentasi }}</button>
            </div>
            <input :ref="(el) => (inputs['lp-' + t.id] = el as HTMLInputElement)" type="file" class="hidden" accept=".pdf" @change="pick($event, t.id, 'laporan')" />
            <input :ref="(el) => (inputs['ba-' + t.id] = el as HTMLInputElement)" type="file" class="hidden" accept=".pdf" @change="pick($event, t.id, 'ba')" />
            <input :ref="(el) => (inputs['dk-' + t.id] = el as HTMLInputElement)" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.zip" @change="pick($event, t.id, 'dokumentasi')" />
            <p class="text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1 items-center">
              <DocumentViewLink v-if="ensure(t.id).laporan" compact :file-name="ensure(t.id).laporan" :context="{ judul: 'Laporan Monitoring' }" />
              <DocumentViewLink v-if="ensure(t.id).ba" compact :file-name="ensure(t.id).ba" :context="{ judul: 'Berita Acara Monitoring' }" />
              <DocumentViewLink v-if="ensure(t.id).dokumentasi" compact :file-name="ensure(t.id).dokumentasi" :context="{ judul: 'Dokumentasi Kegiatan' }" />
            </p>
            <button type="button" class="self-start inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="simpanLaporan(t.id, t.tahap)">
              Simpan Laporan Monitoring
            </button>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
