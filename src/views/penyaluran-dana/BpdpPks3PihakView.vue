<script setup lang="ts">
// BpdpPks3PihakView — antrean proposal SK Dirut Terbit → proses dokumen → komparisi A.2 → penjadwalan TTD → hasil ttd.
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import KomparisiPanel from '@/components/penyaluran-dana/KomparisiPanel.vue';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import { generatePks3PihakHtml, downloadDoc } from '@/utils/pencairanDocsGenerator';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import { jadwalTtdSchema } from '@/schemas/penyaluranDana';
import type { PKS3Pihak } from '@/types/penyaluranDana';
import { FileSignature, CalendarClock, Upload, Download, Inbox, Handshake } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const toast = useToast();
const loading = ref(true);
const selectedPks = ref<PKS3Pihak | null>(null);
const jadwalForm = ref({ jadwalTtd: '' });
const ttdInput = ref<HTMLInputElement | null>(null);

setTimeout(() => (loading.value = false), 400);

const antrean = computed(() => store.proposalAntreanPks);
const pksList = computed(() => store.pksList);
const komparisiDone = (pksId: string) => {
  const list = store.komparisiList.filter((k) => k.pksId === pksId);
  return { a1: list.some((k) => k.pihak === 'A1_KP'), a2: list.some((k) => k.pihak === 'A2_BPDP'), a3: list.some((k) => k.pihak === 'A3_BANK') };
};
const selectedPksFresh = computed(() => (selectedPks.value ? store.pksList.find((k) => k.id === selectedPks.value!.id) ?? null : null));
const selectedProposal = computed(() => (selectedPksFresh.value ? store.proposals.find((p) => p.id === selectedPksFresh.value!.proposalId) : null));

function proses(proposalId: string) {
  const pks = store.prosesDokumenPks(proposalId);
  toast.success(LOCALIZATION.penyaluranDana.toast.prosesPksSuccess, LOCALIZATION.penyaluranDana.page.pksTitle);
  selectedPks.value = pks;
}

function unduhPks(pks: PKS3Pihak) {
  downloadDoc('PKS 3 Pihak', generatePks3PihakHtml(pks.kopSuratB, { kp: pks.noPksKp, bpdp: pks.noPksBpdp, bank: pks.noPksBank }), `PKS_3Pihak_${pks.proposalId}`);
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted);
}

function simpanJadwal() {
  if (!selectedPksFresh.value) return;
  const r = jadwalTtdSchema.safeParse(jadwalForm.value);
  if (!r.success) {
    toast.error(r.error.issues[0].message);
    return;
  }
  store.setJadwalTtd(selectedPksFresh.value.id, new Date(jadwalForm.value.jadwalTtd).toISOString());
  toast.success(LOCALIZATION.penyaluranDana.toast.jadwalSuccess);
}

function onPickTtd(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !selectedPksFresh.value) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  store.uploadHasilTtd(selectedPksFresh.value.id, file.name);
  toast.success(LOCALIZATION.penyaluranDana.pks.uploadHasilTtd + ': ' + file.name);
  input.value = '';
}

function konfirmasiAktif() {
  if (!selectedPksFresh.value) return;
  store.konfirmasiPksAktif(selectedPksFresh.value.id);
  toast.success(LOCALIZATION.penyaluranDana.toast.hasilTtdSuccess);
}

const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[`PKS_${s}`] ?? s;
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.pksTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.pksSubtitle }}</p>
    </header>

    <div v-if="loading" class="flex flex-col gap-3">
      <Skeleton class="h-20 w-full" /><Skeleton class="h-64 w-full" />
    </div>

    <template v-else>
      <!-- Antrean proposal SK Dirut Terbit tanpa PKS -->
      <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Inbox class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Antrean Proposal (SK Dirut Terbit)
        </h2>
        <div v-if="antrean.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="p in antrean"
            :key="p.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3"
          >
            <div class="text-xs">
              <p class="font-semibold text-slate-800 dark:text-slate-100">{{ p.namaKp }}</p>
              <p class="text-slate-500 dark:text-slate-400">{{ p.nomorProposal }} · SK Dirut {{ p.noSkDirut }}</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95"
              @click="proses(p.id)"
            >
              <FileSignature class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.pks.prosesDokumen }}
            </button>
          </div>
        </div>
      </section>

      <!-- Daftar PKS -->
      <section class="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div class="xl:col-span-2 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-2">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Handshake class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Daftar PKS 3 Pihak
          </h2>
          <button
            v-for="k in pksList"
            :key="k.id"
            type="button"
            class="text-left rounded-xl border p-3 transition-colors"
            :class="selectedPksFresh?.id === k.id ? 'border-[#066C2A] bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'"
            @click="selectedPks = k"
          >
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-100">{{ k.kopSuratB.namaKp }}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {{ k.proposalId }} · {{ statusLabel(k.status) }}
            </p>
          </button>
        </div>

        <!-- Detail PKS terpilih -->
        <div v-if="selectedPksFresh && selectedProposal" class="xl:col-span-3 flex flex-col gap-4">
          <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ selectedPksFresh.kopSuratB.namaKp }}</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  {{ selectedProposal.nomorProposal }} · {{ statusLabel(selectedPksFresh.status) }} ·
                  PKS KP/BPDP/Bank: {{ selectedPksFresh.noPksKp ?? '—' }} / {{ selectedPksFresh.noPksBpdp ?? '—' }} / {{ selectedPksFresh.noPksBank ?? '—' }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                @click="unduhPks(selectedPksFresh)"
              >
                <Download class="w-4 h-4" /> {{ LOCALIZATION.penyaluranDana.pks.downloadDokumenPks }}
              </button>
            </div>

            <!-- Status komparisi 3 pihak -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div v-for="(done, key) in komparisiDone(selectedPksFresh.id)" :key="key" class="rounded-xl border p-2.5 text-center"
                :class="done ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800'">
                <p class="text-[11px] font-semibold" :class="done ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'">
                  {{ key === 'a1' ? 'A.1 KP' : key === 'a2' ? 'A.2 BPDP' : 'A.3 Bank' }}
                </p>
                <p class="text-[10px]" :class="done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'">
                  {{ done ? LOCALIZATION.penyaluranDana.status.SESUAI : LOCALIZATION.penyaluranDana.pks.belumSubmit }}
                </p>
              </div>
            </div>

            <!-- Komparisi A.2 (BPDP) -->
            <KomparisiPanel v-if="selectedPksFresh.status !== 'AKTIF'" :pks-id="selectedPksFresh.id" pihak="A2_BPDP" />

            <!-- Penjadwalan TTD -->
            <div v-if="selectedPksFresh.status === 'KOMPARISI' || selectedPksFresh.status === 'PENJADWALAN'" class="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <h4 class="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                <CalendarClock class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.pks.jadwalTtd }}
              </h4>
              <div class="flex flex-col sm:flex-row sm:items-end gap-2">
                <label class="flex-1 flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Tanggal & waktu
                  <input
                    v-model="jadwalForm.jadwalTtd"
                    type="datetime-local"
                    class="h-9 rounded-lg border px-3 text-[13px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40"
                  />
                </label>
                <button type="button" class="h-9 px-4 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="simpanJadwal">
                  Simpan & Kirim Notifikasi
                </button>
              </div>
            </div>

            <!-- Upload hasil ttd -->
            <div v-if="selectedPksFresh.status === 'PENJADWALAN' || selectedPksFresh.status === 'DITANDATANGANI'" class="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                @click="ttdInput?.click()"
              >
                <Upload class="w-4 h-4" /> {{ selectedPksFresh.dokumenPksFile ? 'Ganti Berkas' : LOCALIZATION.penyaluranDana.pks.uploadHasilTtd }}
              </button>
              <input ref="ttdInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" @change="onPickTtd" />
              <DocumentViewLink v-if="selectedPksFresh.dokumenPksFile" :file-name="selectedPksFresh.dokumenPksFile" :context="{ judul: 'Dokumen PKS 3 Pihak (hasil ttd)', aktor: 'BPDP' }" />
              <button
                v-if="selectedPksFresh.status === 'DITANDATANGANI'"
                type="button"
                class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95"
                @click="konfirmasiAktif"
              >
                Konfirmasi PKS Aktif
              </button>
            </div>
          </div>
        </div>
        <div v-else class="xl:col-span-3 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex items-center justify-center text-xs text-slate-400">
          {{ LOCALIZATION.penyaluranDana.common.pilihPks }}
        </div>
      </section>
    </template>
  </div>
</template>
