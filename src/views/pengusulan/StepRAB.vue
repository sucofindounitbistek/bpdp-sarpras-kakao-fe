<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Download, Eye, Trash2, CheckCircle2, AlertCircle, Lock, Printer, FileText, Loader2, Users, Save } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useToast } from '@/composables/useToast';
import { DokumenUpload } from '@/types/pengusulan';
import { getRabTahapCount } from '@/types/rab';
import RabTable from '@/components/pengusulan/RabTable.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import ProposalPreviewModal from '@/components/pengusulan/ProposalPreviewModal.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import { LOCALIZATION } from '@/config/localization';
import { PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { useAuthStore } from '@/stores/auth';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { PAKET_OPTIONS } from '@/lib/pengusulan-persyaratan.config';

const store = usePengusulanDraftStore();
const pengusulanStore = usePengusulanStore();
const masterStore = useMasterSarprasStore();
const toast = useToast();
const authStore = useAuthStore();
const router = useRouter();

async function handleSaveDraft() {
  try {
    const res = await store.saveDraft();
    toast.success(`Draft berhasil disimpan (${res.nomor_proposal})`);
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menyimpan draft');
  }
}

onMounted(async () => {
  await masterStore.fetchMasterData(true);
});

const activePaket = computed(() => {
  if (!store.selectedPaket) return null;
  const code = String(store.selectedPaket).toUpperCase().trim();
  return (
    masterStore.paketMap[code] ||
    masterStore.paketMap[store.selectedPaket] ||
    masterStore.paketList?.find(
      (p) =>
        p.code?.toUpperCase() === code ||
        p.name?.toUpperCase() === code ||
        (p.label && p.label.toUpperCase() === code) ||
        String(p.id) === String(store.selectedPaket)
    ) ||
    null
  );
});

const activeTahapCount = computed(() => {
  return getRabTahapCount(store.selectedPaket, activePaket.value?.jumlah_tahap);
});

const docLabelMap = computed(() => {
  const map: Record<string, string> = {
    RAB_PROPOSAL: 'RAB Bertandatangan',
    SPTJM: 'RAB Bertandatangan (SPTJM)',
    RAB_SIGNED: 'RAB Bertandatangan',
    'rab-signed': 'RAB Bertandatangan',
  };
  if (!store.selectedPaket) return map;
  const persyaratan = PAKET_PERSYARATAN_CONFIG[store.selectedPaket] ?? [];
  persyaratan.forEach((p) => {
    map[p.id] = p.nama;
  });
  return map;
});

function getDocLabel(doc: { persyaratanId: string; namaFile: string }) {
  return docLabelMap.value[doc.persyaratanId] || doc.namaFile;
}

// ─── RAB Table Handlers ────────────────────────────────────────────────────────
function onAddRow() {
  store.addRabItem();
}
function onUpdateRow(id: string, patch: Parameters<typeof store.updateRabItem>[1]) {
  store.updateRabItem(id, patch);
}
function onRemoveRow(id: string) {
  store.removeRabItem(id);
}

// ─── Stepper State ─────────────────────────────────────────────────────────────
const rabDownloaded = ref(false);
const showDownloadConfirm = ref(false);

// ponytail: computed step unlock states
const step2Unlocked = computed(() => store.rabItems.length > 0);
const step3Unlocked = computed(() => rabDownloaded.value);
const step4Visible = computed(() => rabDownloaded.value);

// ─── T014: Download RAB (PDF) with confirmation ──────────────────────────────────
function formatDecimal(val: number | null | undefined, decimals = 2) {
  if (val === null || val === undefined) return '';
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function requestDownloadRAB() {
  if (store.rabItems.length === 0) {
    toast.error(LOCALIZATION.rabTable.downloadWarning);
    return;
  }
  showDownloadConfirm.value = true;
}

function confirmDownloadRAB() {
  showDownloadConfirm.value = false;

  let kelompokTaniName =
    authStore.user?.kelembagaan_name ||
    authStore.user?.kelembagaanName ||
    authStore.user?.name ||
    '';
  if (!kelompokTaniName || kelompokTaniName === 'Administrator Sarpras') {
    kelompokTaniName = 'Kelompok Tani Bukan Karyawan Baru';
  }
  const kelompokTaniAddress = store.gudangSerahTerima?.alamat || 'Sleman Semabda';
  const ketuaName =
    (authStore.user as any)?.nama_ketua ||
    (authStore.user as any)?.namaKetua ||
    (authStore.user as any)?.kelembagaan?.nama_ketua ||
    (authStore.user as any)?.kelembagaan?.namaKetua ||
    'Budi Santoso';

  const activePaket = PAKET_OPTIONS.find((p) => p.id === store.selectedPaket);
  const paketLabel = activePaket ? activePaket.label : store.selectedPaket || '';
  const tahapCount = activeTahapCount.value;

  let headersHTML = '';
  let rowsHTML = '';
  let summaryHTML = '';
  let colspan = 8;

  let headers: string[] = [];
  if (tahapCount === 4) {
    colspan = 11;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.varietasLabel || 'Varietas',
      LOCALIZATION.rabTable.jumlahTahap1Label,
      LOCALIZATION.rabTable.jumlahTahap2Label,
      LOCALIZATION.rabTable.jumlahTahap3Label,
      LOCALIZATION.rabTable.jumlahTahap4Label,
      LOCALIZATION.rabTable.jumlahTotalLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  } else if (tahapCount === 2) {
    colspan = 9;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.varietasLabel || 'Varietas',
      LOCALIZATION.rabTable.jumlahTahap1Label,
      LOCALIZATION.rabTable.jumlahTahap2Label,
      LOCALIZATION.rabTable.jumlahTotalLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  } else {
    colspan = 7;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.varietasLabel || 'Varietas',
      LOCALIZATION.rabTable.volumeLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  }
  headersHTML = headers.map((h) => `<th>${h}</th>`).join('');

  rowsHTML = store.rabItems
    .map((r) => {
      let stageCols = '';
      if (tahapCount === 4) {
        stageCols = `
          <td class="right-align">${formatDecimal(r.jumlahTahap1, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap2, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap3, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap4, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTotal, 2)}</td>
        `;
      } else if (tahapCount === 2) {
        stageCols = `
          <td class="right-align">${formatDecimal(r.jumlahTahap1, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap2, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTotal, 2)}</td>
        `;
      } else {
        stageCols = `
          <td class="right-align">${formatDecimal(r.volume || r.jumlahTotal || r.jumlahTahap1, 2)}</td>
        `;
      }

      const displayVarietas = r.varietas === 'Kelapa Varietas Lainnya'
        ? (r.varietasCustom ? `${r.varietas} (${r.varietasCustom})` : r.varietas)
        : (r.varietas || '-');

      return `
        <tr>
          <td>${r.jenis || ''}</td>
          <td>${r.uraian || ''}</td>
          <td>${displayVarietas}</td>
          ${stageCols}
          <td>${r.satuan || ''}</td>
          <td class="right-align">${formatDecimal(r.hargaSatuan, 2)}</td>
          <td class="right-align">${formatDecimal(r.subTotal, 1)}</td>
        </tr>
      `;
    })
    .join('');

  summaryHTML = `
    <tr class="total-row">
      <td colspan="${colspan - 1}" class="right-align font-semibold">Total Harga</td>
      <td class="right-align font-semibold">${formatDecimal(store.rabTotal, 1)}</td>
    </tr>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rancangan Anggaran Biaya</title>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1e293b;
          margin: 0;
          padding: 10px;
          font-size: 11px;
          line-height: 1.5;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
        }
        .header h1 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #0f172a;
        }
        .header h2 {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
          color: #334155;
        }
        .info {
          font-size: 11px;
          margin-top: 15px;
          margin-bottom: 15px;
          color: #334155;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 10px;
          text-align: left;
        }
        th {
          background-color: #f8fafc !important;
          font-weight: 600;
          color: #334155;
        }
        .package-header {
          background-color: #f8fafc !important;
          font-weight: 600;
          text-align: center;
          color: #0f172a;
        }
        .right-align {
          text-align: right;
        }
        .center-align {
          text-align: center;
        }
        .font-semibold {
          font-weight: 600;
        }
        .font-bold {
          font-weight: 700;
        }
        .signature-container {
          float: right;
          margin-top: 40px;
          text-align: right;
          width: 240px;
          page-break-inside: avoid;
        }
        .signature-container p {
          margin: 0 0 4px 0;
        }
        .signature-space {
          height: 60px;
        }
        .signature-name {
          font-weight: 700;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rancangan Anggaran Biaya</h1>
        <h2>${kelompokTaniName}</h2>
      </div>
      <div class="info">
        Alamat : ${kelompokTaniAddress}
      </div>

      <table>
        <thead>
          <tr>
            <th colspan="${colspan}" class="package-header">
              ${paketLabel}
            </th>
          </tr>
          <tr>
            ${headersHTML}
          </tr>
        </thead>
        <tbody>
          ${rowsHTML}
          ${summaryHTML}
        </tbody>
      </table>

      <div style="clear: both;"></div>

      <div class="signature-container">
        <p>Mengetahui,</p>
        <p style="font-weight: 600;">${kelompokTaniName}</p>
        <div class="signature-space"></div>
        <p class="signature-name">${ketuaName}</p>
        <p>Ketua</p>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
  }

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);

  rabDownloaded.value = true;
  toast.success(LOCALIZATION.rabTable.downloadSuccess);
}

function cancelDownloadRAB() {
  showDownloadConfirm.value = false;
}

// ─── T015: Upload RAB Bertandatangan ──────────────────────────────────────────
const MAX_RAB_SIZE = 10 * 1024 * 1024; // 10 MB

async function handleRabUpload(file: File) {
  if (file.type !== 'application/pdf') {
    toast.error('RAB bertandatangan harus berformat PDF.');
    return;
  }
  if (file.size > MAX_RAB_SIZE) {
    toast.error('Ukuran file melebihi 10 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const doc: DokumenUpload = {
      persyaratanId: 'RAB_PROPOSAL',
      namaFile: file.name,
      mimeType: file.type,
      ukuranBytes: file.size,
      dataUrl: e.target?.result as string,
      uploadedAt: new Date().toISOString(),
      file,
    };
    store.setRabDitandatangani(doc);
    toast.success(`RAB bertandatangan "${doc.namaFile}" berhasil diunggah.`);
  };
  reader.readAsDataURL(file);
}

function removeRabSigned() {
  store.setRabDitandatangani(null);
}

// ─── T016: Preview signed RAB ─────────────────────────────────────────────────
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openPreview(doc: DokumenUpload) {
  previewDoc.value = { dataUrl: doc.dataUrl, mimeType: doc.mimeType, title: doc.namaFile };
  showPreview.value = true;
}

// ─── T017: Step 3 Submission & Preview ───────────────────────────────────────
const showProposalPreview = ref(false);
const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject' | 'submit'>('submit');
const confirmDestination = ref('');
const confirmNotes = ref('');
const confirmModalRef = ref<any>(null);
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

async function executePendingAction() {
  if (!pendingConfirmAction.value) return;
  try {
    await pendingConfirmAction.value();
  } catch {
    if (confirmModalRef.value) {
      confirmModalRef.value.resetConfirming();
    }
  }
}

function handleSubmit() {
  if (store.selectedPekebunIds.length === 0 || store.selectedLahanIds.length === 0) {
    toast.error('Data pekebun dan lahan belum lengkap. Silakan kembali ke Step 2.');
    return;
  }
  if (store.rabItems.length === 0) {
    toast.error('Lengkapi RAB: minimal 1 baris harus diisi.');
    return;
  }
  const allRowsFilled = store.rabItems.every(
    (r) => r.jenis?.trim() && r.uraian?.trim() && r.satuan?.trim() && r.hargaSatuan !== null && r.hargaSatuan > 0 && (r.jumlahTotal ?? 0) > 0
  );
  if (!allRowsFilled) {
    toast.error(LOCALIZATION.rabTable.validationError);
    return;
  }

  const count = activeTahapCount.value;
  if (count >= 1) {
    const hasT1 = store.rabItems.some(
      (it) => (it.jumlahTahap1 != null && it.jumlahTahap1 > 0) || (it.volume != null && it.volume > 0)
    );
    if (!hasT1) {
      toast.error('Tahap 1 wajib memiliki sekurang-kurangnya 1 item biaya.');
      return;
    }
  }
  if (count >= 2) {
    const hasT2 = store.rabItems.some((it) => it.jumlahTahap2 != null && it.jumlahTahap2 > 0);
    if (!hasT2) {
      toast.error('Tahap 2 wajib memiliki sekurang-kurangnya 1 item biaya.');
      return;
    }
  }
  if (count >= 3) {
    const hasT3 = store.rabItems.some((it) => it.jumlahTahap3 != null && it.jumlahTahap3 > 0);
    if (!hasT3) {
      toast.error('Tahap 3 wajib memiliki sekurang-kurangnya 1 item biaya.');
      return;
    }
  }
  if (count >= 4) {
    const hasT4 = store.rabItems.some((it) => it.jumlahTahap4 != null && it.jumlahTahap4 > 0);
    if (!hasT4) {
      toast.error('Tahap 4 wajib memiliki sekurang-kurangnya 1 item biaya.');
      return;
    }
  }

  if (!store.rabDitandatangani) {
    toast.error('RAB bertandatangan harus diunggah sebelum submit proposal.');
    return;
  }

  confirmActionType.value = 'submit';
  confirmDestination.value = 'Dinas Kabupaten/Kota';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    try {
      const kelembagaanId =
        authStore.user?.kelembagaan_id
          ? Number(authStore.user.kelembagaan_id)
          : (authStore.user as any)?.kelembagaanId
          ? Number((authStore.user as any).kelembagaanId)
          : 1;

      let nomorProposal = '';
      if (store.draftProposalId) {
        nomorProposal = await store.submitProposal(kelembagaanId);
      } else {
        // 1. Collect payload from wizard input state
        const payload = store.getSubmissionPayload(kelembagaanId);
        // 2. Sequential 3-step creation via pengusulanStore.createProposal
        const created = await pengusulanStore.createProposal(payload);
        nomorProposal = created.nomor_proposal;
      }

      toast.success(`Pengajuan berhasil dikirimkan! Nomor Proposal: ${nomorProposal}`);
      store.resetDraft();
      showConfirmModal.value = false;
      router.push('/pengusulan/pengajuan-proposal');
    } catch (err: any) {
      const errMsg = err?.message || 'Terjadi kesalahan saat mengirimkan proposal. Coba lagi.';
      toast.error(errMsg);
      if (confirmModalRef.value) {
        confirmModalRef.value.setError(errMsg);
      }
    }
  };
  showConfirmModal.value = true;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Step Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-slate-900">Step 3: RAB &amp; Submit</h2>
      <p class="text-xs text-slate-500">Isi detail anggaran, unduh RAB, tandatangani, lalu unggah kembali sebelum mengirimkan proposal.</p>
    </div>

    <!-- Summary of Step 2 Pekebun & Lahan -->
    <div v-if="store.selectedPekebunIds.length > 0" class="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
      <Users class="w-3.5 h-3.5 text-[#066C2A]" />
      <span>Pekebun terpilih: <strong class="text-slate-800">{{ store.step2TotalPekebun }}</strong></span>
      <span class="text-slate-300">|</span>
      <span>Total luas lahan: <strong class="text-[#066C2A]">{{ store.step2TotalLuasHa.toFixed(1) }} Ha</strong></span>
    </div>

    <!-- Vertical Stepper -->
    <div class="flex flex-col gap-0">
      <!-- Step 2.1: RAB Content -->
      <div class="flex gap-4 w-full max-w-full">
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#066C2A] text-white shrink-0">1</div>
          <div class="w-0.5 flex-1 bg-[#066C2A]/30 mt-1 mb-1" />
        </div>
        <div class="flex-1 min-w-0 max-w-full pb-5">
          <p class="text-sm font-bold text-slate-800">Isi RAB</p>
          <p class="text-xs text-slate-500 mb-3">Lengkapi tabel rencana anggaran biaya kegiatan.</p>

          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden w-full max-w-full shadow-sm">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tabel RAB</span>
            </div>
            <div class="p-4 w-full max-w-full overflow-hidden">
              <RabTable :items="store.rabItems" :paket="store.selectedPaket" :tahap-count="activeTahapCount" @add="onAddRow" @update="onUpdateRow" @remove="onRemoveRow" />
              <div v-if="store.rabItems.length > 0" class="flex justify-end items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Anggaran</span>
                <span class="text-sm font-bold font-mono text-[#066C2A]">Rp {{ store.rabTotal.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>

          <!-- Download Confirmation Popup below the table -->
          <Transition name="fade">
            <div v-if="showDownloadConfirm" class="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
              <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div class="flex-1 text-xs text-amber-800"><span class="font-semibold">Konfirmasi:</span> Sistem akan meng-generate dan mengunduh dokumen RAB. Lanjutkan?</div>
              <div class="flex gap-2 shrink-0">
                <button @click="confirmDownloadRAB" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">Ya, Generate</button>
                <button @click="cancelDownloadRAB" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors">Batal</button>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Step 2.2: Generate & Download RAB -->
      <div class="flex gap-4">
        <div class="flex flex-col items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', step2Unlocked ? 'bg-[#066C2A] text-white' : 'bg-slate-200 text-slate-400']">2</div>
          <div class="w-0.5 flex-1 mt-1 mb-1" :class="step2Unlocked ? 'bg-[#066C2A]/30' : 'bg-slate-200'" />
        </div>
        <div class="flex-1 pb-5">
          <div class="flex items-center gap-2 mb-1">
            <p :class="['text-sm font-bold', step2Unlocked ? 'text-slate-800' : 'text-slate-400']">Generate &amp; Unduh RAB</p>
            <Lock v-if="!step2Unlocked" class="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p class="text-xs text-slate-500 mb-3">Sistem akan meng-generate dokumen RAB berdasarkan data yang diisi.</p>

          <button
            type="button"
            @click="requestDownloadRAB"
            :disabled="!step2Unlocked"
            class="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :class="step2Unlocked ? 'bg-[#066C2A] text-white border-[#066C2A] hover:bg-emerald-800' : 'bg-white text-slate-400 border-slate-200'"
          >
            <Download class="w-3.5 h-3.5" /> Generate &amp; Unduh RAB
          </button>
        </div>
      </div>

      <!-- Step 2.3: Print & Sign -->
      <div class="flex gap-4">
        <div class="flex flex-col items-center">
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', step3Unlocked ? 'bg-[#066C2A] text-white' : 'bg-slate-200 text-slate-400']">3</div>
          <div class="w-0.5 flex-1 mt-1 mb-1" :class="step3Unlocked ? 'bg-[#066C2A]/30' : 'bg-slate-200'" />
        </div>
        <div class="flex-1 pb-5">
          <div class="flex items-center gap-2 mb-1">
            <p :class="['text-sm font-bold', step3Unlocked ? 'text-slate-800' : 'text-slate-400']">Cetak &amp; Tandatangani</p>
            <Lock v-if="!step3Unlocked" class="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p class="text-xs text-slate-500 mb-3">Cetak dokumen RAB yang telah diunduh, lalu tandatangani oleh pihak berwenang.</p>

          <div v-if="step3Unlocked" class="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Printer class="w-4 h-4 text-slate-500" />
            <span class="text-xs text-slate-600">Dokumen RAB telah di-generate. Silakan cetak dan tandatangani.</span>
          </div>
        </div>
      </div>

      <!-- Step 2.4: Upload Signed RAB -->
      <Transition name="fade">
        <div v-if="step4Visible" class="flex gap-4">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#066C2A] text-white shrink-0">4</div>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-slate-800 mb-1">Upload RAB dan file detail masing masing pekebun yang bertada tangan</p>
            <p class="text-xs text-slate-500 mb-3">Unggah dokumen RAB yang sudah ditandatangani dalam format PDF (maks. 10 MB).</p>

            <div class="bg-white rounded-xl border border-slate-200 p-4">
              <div v-if="!store.rabDitandatangani">
                <FileUpload
                  id="rab-signed"
                  accept=".pdf"
                  document-label="RAB-Usulan"
                  :proposal-number="(store as any).proposalNumber || 'DRAFT'"
                  :institution-name="authStore.user?.kelembagaan_name || authStore.user?.name || 'Kelembagaan'"
                  placeholder="Upload RAB bertandatangan (PDF maks. 10 MB)"
                  :required="true"
                  @file-selected="handleRabUpload"
                />
              </div>
              <div v-else class="flex items-center justify-between gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div class="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-semibold text-slate-800 truncate">{{ store.rabDitandatangani.namaFile }}</span>
                    <span class="text-[10px] text-slate-400">{{ (store.rabDitandatangani.ukuranBytes / 1024).toFixed(0) }} KB &bull; RAB Bertandatangan</span>
                  </div>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" @click="openPreview(store.rabDitandatangani)" class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    <Eye class="w-3 h-3" /> Pratinjau
                  </button>
                  <button type="button" @click="removeRabSigned" class="flex items-center gap-1 text-[10px] font-semibold text-rose-500 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 class="w-3 h-3" /> Hapus</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Dokumen Persyaratan Terunggah -->
    <div v-if="store.dokumenUploads.length > 0" class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <FileText class="w-3.5 h-3.5 text-slate-500" />
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Persyaratan Terunggah</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div v-for="doc in store.dokumenUploads" :key="doc.persyaratanId" class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-700 truncate">{{ getDocLabel(doc) }}</span>
          <button @click="openPreview(doc)" class="text-xs text-[#066C2A] font-semibold hover:underline ml-2 shrink-0">Pratinjau</button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex flex-col sm:flex-row justify-between gap-3 pt-2">
      <button type="button" @click="store.currentStep = 2" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
        <span class="text-lg leading-none">&larr;</span> Kembali
      </button>

      <div class="flex gap-2">
        <button
          type="button"
          @click="handleSaveDraft"
          :disabled="store.isSavingDraft"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save class="w-4 h-4 text-slate-500" />
          <span>{{ store.isSavingDraft ? 'Menyimpan...' : 'Simpan Draft' }}</span>
        </button>

        <button type="button" @click="showProposalPreview = true" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border-2 border-[#066C2A] text-[#066C2A] hover:bg-emerald-50 transition-colors">
          Pratinjau Proposal
        </button>

        <button
          type="button"
          @click="handleSubmit"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50"
          :disabled="store.isSubmitting"
        >
          <Loader2 v-if="store.isSubmitting" class="w-4 h-4 animate-spin" />
          <span v-else>Submit Proposal</span>
        </button>
      </div>
    </div>

    <!-- T016: Document Preview Modal -->
    <DocumentPreviewModal :isOpen="showPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showPreview = false" />

    <!-- Proposal Preview Modal -->
    <ProposalPreviewModal v-if="showProposalPreview" @close="showProposalPreview = false" />

    <!-- Submit Confirmation Modal -->
    <ApprovalConfirmationModal
      ref="confirmModalRef"
      :is-open="showConfirmModal"
      :action-type="confirmActionType"
      :destination-stage="confirmDestination"
      :notes="confirmNotes"
      @close="showConfirmModal = false"
      @confirm="executePendingAction"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
