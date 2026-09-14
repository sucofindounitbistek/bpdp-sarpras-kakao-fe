<script setup lang="ts">
// BpdpApprovalPencairanView — Staff review → Kadiv approve → Surat Persetujuan → proses escrow;
// tab Pengembalian Dana (penelitian), tab Monitoring (verifikasi laporan), tab Penutupan (terima BPDP).
import { ref, computed } from 'vue';
import { usePenyaluranDanaStore } from '@/stores/penyaluranDana';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import VerifikasiRantaiPanel from '@/components/penyaluran-dana/VerifikasiRantaiPanel.vue';
import DokumenChecklistTahap from '@/components/penyaluran-dana/DokumenChecklistTahap.vue';
import DocumentViewLink from '@/components/ui/DocumentViewLink.vue';
import RoleNotifikasiPanel from '@/components/penyaluran-dana/RoleNotifikasiPanel.vue';
import { generateSuratPersetujuanHtml, downloadDoc } from '@/utils/pencairanDocsGenerator';
import { formatRupiah } from '@/utils/exportProposal';
import { validateUploadFile } from '@/schemas/penyaluranDana';
import { BadgeCheck, Upload, Download, Landmark, RotateCcw, MapPinned, Lock } from 'lucide-vue-next';

const store = usePenyaluranDanaStore();
const toast = useToast();
const loading = ref(true);
setTimeout(() => (loading.value = false), 350);

const tab = ref<'approval' | 'pengembalian' | 'monitoring' | 'penutupan'>('approval');
const TABS = [
  { key: 'approval', label: 'Approval Pencairan' },
  { key: 'pengembalian', label: LOCALIZATION.penyaluranDana.pengembalian.title },
  { key: 'monitoring', label: LOCALIZATION.penyaluranDana.monitoring.laporanE.split(' (')[0] },
  { key: 'penutupan', label: LOCALIZATION.penyaluranDana.penutupan.title },
] as const;

// DIAGRAM: penyaluran ke escrow diproses setelah dokumen diajukan (tidak menunggu rantai verifikasi);
// rantai verifikasi + Surat Persetujuan mengatur pencairan (transfer Bank ke rekening tujuan).
const STATUS_AKTIF = ['DIAJUKAN', 'VERIF_SCI', 'VERIF_BPDP', 'DISETUJUI'] as const;
const antreanApproval = computed(() => store.tahapList.filter((t) => (STATUS_AKTIF as readonly string[]).includes(t.status)));
const selectedId = ref<string | null>(null);
const selected = computed(() => store.tahapList.find((t) => t.id === selectedId.value));
const permohonanOf = (pencairanId: string) => store.permohonanList.find((m) => m.id === pencairanId);
const surat = computed(() => (selected.value ? store.suratPersetujuanByTahap(selected.value.id) : undefined));

const nominalInput = ref<number | null>(null);
const konfirmasiDeviasi = ref(false);
const spInput = ref<HTMLInputElement | null>(null);

const nominalEfektif = computed(() => nominalInput.value ?? selected.value?.nominal ?? 0);
const deviasiPersen = computed(() => {
  if (!selected.value) return 0;
  const baku = store.totalPermohonanById(selected.value.pencairanId) * selected.value.persen;
  return Math.abs((nominalEfektif.value - baku) / (baku || 1)) * 100;
});
const escrowPanelVisible = computed(() => !!selected.value && !selected.value.escrow && (STATUS_AKTIF as readonly string[]).includes(selected.value.status));
const bolehProses = computed(() => {
  if (!selected.value || !escrowPanelVisible.value) return false;
  return deviasiPersen.value <= 0.01 || konfirmasiDeviasi.value;
});
const gateDanaInfo = computed(() => {
  const t = selected.value;
  if (!t || t.tahap < 2 || t.escrow) return null;
  const mon = store.monitoringByTahap(t.id);
  if (!mon || !mon.verified) return t.gateProgress === 0.7 ? LOCALIZATION.penyaluranDana.tahap.gate70 : LOCALIZATION.penyaluranDana.tahap.gate100;
  if (!store.checklistLengkap(t.id)) return LOCALIZATION.penyaluranDana.toast.checklistIncomplete;
  return null;
});

function pilih(t: any) {
  selectedId.value = t.id;
  nominalInput.value = t.nominal;
  konfirmasiDeviasi.value = false;
}

function setNominal() {
  if (!selected.value || nominalInput.value == null) return;
  store.setNominalTahap(selected.value.id, nominalInput.value);
  toast.success(LOCALIZATION.penyaluranDana.toast.nominalConfirmed);
}

function prosesEscrow() {
  if (!selected.value) return;
  try {
    store.prosesPenyaluranEscrow(selected.value.id);
    toast.success(LOCALIZATION.penyaluranDana.toast.transferProcessed);
  } catch (e) {
    toast.error((e as Error).message);
  }
}

function unduhSurat() {
  if (!selected.value || !surat.value || !permohonanOf(selected.value.pencairanId)) return;
  downloadDoc('Surat Persetujuan', generateSuratPersetujuanHtml(permohonanOf(selected.value.pencairanId)!, selected.value, surat.value.nomor), `Surat_Persetujuan_${selected.value.idPenyaluran}`);
  toast.success(LOCALIZATION.penyaluranDana.toast.downloadStarted);
}

function uploadSurat(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !selected.value) return;
  const err = validateUploadFile(file);
  if (err) {
    toast.error(err, LOCALIZATION.penyaluranDana.toast.uploadInvalid);
    input.value = '';
    return;
  }
  store.uploadSuratPersetujuan(selected.value.id, file.name);
  toast.success(LOCALIZATION.penyaluranDana.toast.suratPersetujuanSuccess, file.name);
  input.value = '';
}

// Pengembalian
const telitiForm = ref<{ [k: string]: { sesuai: boolean; catatan: string } }>({});
function teliti(proposalId: string) {
  const f = telitiForm.value[proposalId];
  if (!f || (!f.sesuai && f.catatan.trim().length < 5)) {
    toast.error(LOCALIZATION.penyaluranDana.verifikasi.catatanWajib);
    return;
  }
  store.telitiPengembalian(proposalId, f.sesuai, f.catatan);
  toast.success(LOCALIZATION.penyaluranDana.toast.penelitianSuccess);
}

// Monitoring
function verifikasiMon(tahapId: string, ya: boolean) {
  store.verifikasiMonitoring(tahapId, ya, ya ? '' : 'Laporan belum memadai — mohon lengkapi.');
  toast.success(LOCALIZATION.penyaluranDana.toast.verifikasiSuccess);
}

// Penutupan
function terimaPenutupan(proposalId: string) {
  store.terimaPenutupanBpdp(proposalId);
  toast.success(LOCALIZATION.penyaluranDana.toast.penutupanSuccess);
}

const statusLabel = (s: string) => (LOCALIZATION.penyaluranDana.status as Record<string, string>)[s] ?? s;
const monitoringPending = computed(() => store.monitoringReports.filter((m) => !m.verified));
const pengembalianList = computed(() => store.pengembalianList);
const penutupanDiajukan = computed(() => store.penutupanList.filter((p) => p.status === 'DIAJUKAN'));
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-1">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">{{ LOCALIZATION.penyaluranDana.page.approvalTitle }}</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.page.approvalSubtitle }}</p>
    </header>

    <RoleNotifikasiPanel target-role="BPDP_STAFF" :limit="4" />

    <div v-if="loading" class="flex flex-col gap-3"><Skeleton class="h-24 w-full" /><Skeleton class="h-72 w-full" /></div>

    <template v-else>
      <!-- Tabs -->
      <div class="flex flex-wrap gap-2">
        <button v-for="t in TABS" :key="t.key" type="button" class="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors"
          :class="tab === t.key ? 'border-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400' : 'border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'"
          @click="tab = t.key">
          {{ t.label }}
        </button>
      </div>

      <!-- Tab: Approval -->
      <section v-if="tab === 'approval'" class="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div class="xl:col-span-2 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-2">
          <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BadgeCheck class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> Antrean Approval
          </h2>
          <div v-if="antreanApproval.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
          <button v-for="t in antreanApproval" :key="t.id" type="button" class="text-left rounded-xl border p-3 transition-colors"
            :class="selectedId === t.id ? 'border-[#066C2A] bg-emerald-50/60 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'"
            @click="pilih(t)">
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-100">{{ t.idPenyaluran }}</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ permohonanOf(t.pencairanId)?.nomorPermohonan }} · {{ statusLabel(t.status) }}</p>
          </button>
        </div>

        <div class="xl:col-span-3">
          <div v-if="selected && permohonanOf(selected.pencairanId)" class="flex flex-col gap-4">
            <div class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
              <h3 class="text-sm font-semibold text-slate-900 dark:text-white mb-1">{{ selected.idPenyaluran }}</h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                {{ permohonanOf(selected.pencairanId)!.dataGenerated.dataA.namaKp }} · {{ statusLabel(selected.status) }} ·
                {{ LOCALIZATION.penyaluranDana.common.total }}: {{ formatRupiah(store.totalPermohonanById(selected.pencairanId)) }}
              </p>
              <DokumenChecklistTahap :tahap-id="selected.id" />

              <!-- Nominal + proses escrow (tersedia sejak dokumen diajukan — sesuai diagram penyaluran) -->
              <div v-if="escrowPanelVisible" class="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
                <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Landmark class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.tahap.nominal }} & {{ LOCALIZATION.penyaluranDana.tahap.prosesPenyaluran }}
                </h4>
                <div class="flex flex-col sm:flex-row sm:items-end gap-2">
                  <label class="flex-1 flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {{ LOCALIZATION.penyaluranDana.tahap.nominal }} (Rp) — {{ LOCALIZATION.penyaluranDana.tahap.persenDefault }} {{ selected.persen * 100 }}%
                    <input :value="nominalInput ?? ''" type="text" inputmode="numeric" class="h-9 rounded-lg border px-3 text-right font-medium bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" @input="nominalInput = Number(($event.target as HTMLInputElement).value.replace(/\D/g, '')) || 0" @change="setNominal" />
                  </label>
                  <button type="button" class="h-9 px-4 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95 disabled:opacity-40" :disabled="!bolehProses" @click="prosesEscrow">
                    {{ LOCALIZATION.penyaluranDana.tahap.prosesPenyaluran }}
                  </button>
                </div>
                <p v-if="gateDanaInfo" class="text-[11px] text-amber-600 dark:text-amber-400">⚠ {{ gateDanaInfo }}</p>
                <p v-if="deviasiPersen > 0.01" class="text-[11px]" :class="konfirmasiDeviasi ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400'">
                  <label class="inline-flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" v-model="konfirmasiDeviasi" class="w-3.5 h-3.5 accent-[#066C2A]" />
                    {{ LOCALIZATION.penyaluranDana.tahap.deviasi }}: {{ deviasiPersen.toFixed(2) }}% — {{ LOCALIZATION.penyaluranDana.wizard.cek }}
                  </label>
                </p>
              </div>

              <!-- Escrow sudah diproses -->
              <div v-if="selected.escrow" class="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-[11px] text-emerald-700 dark:text-emerald-300">
                {{ selected.escrow.odooSppNo }} · {{ formatRupiah(selected.escrow.nominal) }} · {{ (LOCALIZATION.penyaluranDana.status as Record<string, string>)[selected.escrow.statusPembayaran] }} — {{ new Date(selected.escrow.waktu).toLocaleString('id-ID') }}
              </div>

              <!-- Surat Persetujuan (muncul setelah approval Kadiv) -->
              <div v-if="selected.status === 'DISETUJUI' && surat" class="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
                <span class="text-[11px] font-mono text-slate-500">{{ surat.nomor }}</span>
                <button type="button" class="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" @click="unduhSurat">
                  <Download class="w-3.5 h-3.5" /> {{ LOCALIZATION.penyaluranDana.verifikasi.suratPersetujuan }}
                </button>
                <button type="button" class="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="spInput?.click()">
                  <Upload class="w-3.5 h-3.5" /> {{ surat.fileName ? 'Ganti Berkas' : LOCALIZATION.penyaluranDana.verifikasi.suratPersetujuan }}
                </button>
                <DocumentViewLink v-if="surat.fileName" :file-name="surat.fileName" :context="{ judul: `Surat Persetujuan ${surat.nomor}`, aktor: surat.uploadedBy, waktu: surat.uploadedAt }" />
                <input ref="spInput" type="file" class="hidden" accept=".pdf" @change="uploadSurat" />
              </div>
            </div>
            <VerifikasiRantaiPanel :tahap-id="selected.id" :allowed-tingkat="['BPDP_STAFF', 'BPDP_KADIV']" />
          </div>
          <div v-else class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex items-center justify-center text-xs text-slate-400">
            {{ LOCALIZATION.penyaluranDana.common.pilihTahap }}
          </div>
        </div>
      </section>

      <!-- Tab: Pengembalian -->
      <section v-else-if="tab === 'pengembalian'" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <RotateCcw class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.pengembalian.penelitian }}
        </h2>
        <div v-if="pengembalianList.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-for="p in pengembalianList" :key="p.proposalId" class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-1.5">{{ p.proposalId }} —
              <DocumentViewLink :file-name="p.suratPermohonanFile" :context="{ judul: LOCALIZATION.penyaluranDana.pengembalian.title, aktor: 'KELEMBAGAAN_PEKEBUN', waktu: p.createdAt }" />
            </p>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{{ statusLabel(p.status) }}</span>
          </div>
          <div v-if="p.status === 'DIAJUKAN' || p.status === 'DITELITI'" class="flex flex-col sm:flex-row gap-2 items-end">
            <label class="flex-1 w-full flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              {{ LOCALIZATION.penyaluranDana.verifikasi.catatan }}
              <textarea v-model="(telitiForm[p.proposalId] ??= { sesuai: true, catatan: '' }).catatan" rows="2" class="rounded-lg border px-3 py-2 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/40" />
            </label>
            <div class="flex gap-2">
              <button type="button" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95" @click="() => { telitiForm[p.proposalId]!.sesuai = true; teliti(p.proposalId); }">
                {{ LOCALIZATION.penyaluranDana.pengembalian.lengkapSesuai }}
              </button>
              <button type="button" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95" @click="() => { telitiForm[p.proposalId]!.sesuai = false; teliti(p.proposalId); }">
                {{ LOCALIZATION.penyaluranDana.pengembalian.tidakLengkap }}
              </button>
            </div>
          </div>
          <p v-if="p.hasilPenelitian" class="text-[11px] text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-2">{{ p.hasilPenelitian }}</p>
          <p v-if="p.status === 'SELESAI'" class="text-[11px] text-emerald-600 dark:text-emerald-400">
            {{ LOCALIZATION.penyaluranDana.pengembalian.suratPemberitahuan }} + {{ LOCALIZATION.penyaluranDana.pengembalian.skPembatalan }} ✓
          </p>
        </div>
      </section>

      <!-- Tab: Monitoring -->
      <section v-else-if="tab === 'monitoring'" class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPinned class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.monitoring.laporanE.split(' (')[0] }} — Cek/Verifikasi
        </h2>
        <div v-if="monitoringPending.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-for="m in monitoringPending" :key="m.id" class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="text-xs">
            <p class="font-semibold text-slate-800 dark:text-slate-100">{{ store.tahapList.find((t) => t.id === m.tahapId)?.idPenyaluran ?? m.tahapId }}</p>
            <p class="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1">
              {{ LOCALIZATION.penyaluranDana.tahap.progressMonitoring }}: <span class="font-semibold" :class="m.progress >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'">{{ m.progress }}%</span> ·
              <DocumentViewLink compact :file-name="m.laporanFile" :context="{ judul: 'Laporan Monitoring SCI' }" />
            </p>
          </div>
          <div class="flex gap-2">
            <button type="button" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95" @click="verifikasiMon(m.tahapId, true)">{{ LOCALIZATION.penyaluranDana.verifikasi.ya }}</button>
            <button type="button" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95" @click="verifikasiMon(m.tahapId, false)">{{ LOCALIZATION.penyaluranDana.verifikasi.tidak }}</button>
          </div>
        </div>
      </section>

      <!-- Tab: Penutupan -->
      <section v-else class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5 flex flex-col gap-3">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" /> {{ LOCALIZATION.penyaluranDana.penutupan.terimaBpdp }}
        </h2>
        <div v-if="penutupanDiajukan.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-4">{{ LOCALIZATION.penyaluranDana.common.kosong }}</div>
        <div v-for="p in penutupanDiajukan" :key="p.proposalId" class="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p class="text-xs text-slate-700 dark:text-slate-200 flex flex-wrap items-center gap-1.5">{{ p.proposalId }} —
            <DocumentViewLink :file-name="p.suratPenutupanFile" :context="{ judul: 'Surat Permohonan Penutupan Rekening', aktor: 'KELEMBAGAAN_PEKEBUN' }" />
          </p>
          <button type="button" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#066C2A] hover:bg-[#055722] text-white transition-all active:scale-95" @click="terimaPenutupan(p.proposalId)">
            {{ LOCALIZATION.penyaluranDana.penutupan.terimaBpdp }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
