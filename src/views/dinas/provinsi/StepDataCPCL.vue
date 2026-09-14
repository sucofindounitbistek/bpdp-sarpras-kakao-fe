<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Download, Eye, CheckCircle2, FileText, ArrowLeft, ArrowRight, Users, Check, X, XCircle, Loader2, AlertTriangle } from 'lucide-vue-next';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiProvinsiDraftStore } from '@/stores/verifikasiProvinsiDraft';
import { useVerifikasiProvinsiStore } from '@/stores/verifikasiProvinsi';
import { useVerifikasiKabStore } from '@/stores/verifikasiKab';
import { useToast } from '@/composables/useToast';
import { DokumenUpload } from '@/types/pengusulan';
import FileUpload from '@/components/ui/FileUpload.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const verifikasiStore = useVerifikasiProvinsiDraftStore();
const verifikasiProvinsiStore = useVerifikasiProvinsiStore();
const verifikasiKabStore = useVerifikasiKabStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)) || null;
});

const suratPengantarValidationNotes = ref<string>('');
const isSuratPengantarRemoved = ref(false);

function findProposalDoc(docType: string): DokumenUpload | null {
  if (!pengajuan.value) return null;

  const aliases: Record<string, string[]> = {
    BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI', 'BERITA-ACARA-DOKUMEN'],
    BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN', 'BERITA-ACARA-LAPANGAN'],
    SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
    SURAT_PENGANTAR_SK_CPCL: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR'],
  };

  const allowed = (aliases[docType.toUpperCase()] || [docType.toUpperCase()]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));

  if (pengajuan.value.documents && Array.isArray(pengajuan.value.documents)) {
    const d = pengajuan.value.documents.find((doc: any) => {
      const t = (doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return allowed.includes(t);
    });
    if (d) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        persyaratanId: docType.toLowerCase().replace(/_/g, '-'),
        namaFile: d.file_name || 'Dokumen',
        mimeType: d.mime_type || 'application/pdf',
        ukuranBytes: typeof d.file_size === 'number' ? d.file_size : parseInt(String(d.file_size || '0'), 10),
        dataUrl: d.file_url || '/templates/spek-teknis.pdf',
        uploadedAt: d.created_at || new Date().toISOString(),
        uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
        uploaded_at_formatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
        uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
      };
    }
  }
  if (pengajuan.value.dokumen && Array.isArray(pengajuan.value.dokumen)) {
    const d = pengajuan.value.dokumen.find((doc: any) => {
      const t = (doc.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return allowed.includes(t);
    });
    if (d) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        persyaratanId: docType.toLowerCase().replace(/_/g, '-'),
        namaFile: d.namaFile || 'Dokumen',
        mimeType: 'application/pdf',
        ukuranBytes: d.ukuranBytes || 0,
        dataUrl: d.urlFile || '/templates/spek-teknis.pdf',
        uploadedAt: d.uploadedAt || new Date().toISOString(),
        uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
        uploaded_at_formatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at || (d as any).uploadedAt),
        uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at || (d as any).uploadedAt),
      };
    }
  }
  return null;
}

async function loadProposalDocumentValidations() {
  const proposalIdNum = Number(String(id).replace(/[^\d]/g, '')) || id;
  try {
    let detail = pengajuan.value;
    if (!detail || !detail.documents || detail.documents.length === 0) {
      detail = await pengusulanStore.getProposalDetail(id);
    }

    const res = await pengusulanStore.getProposalDocumentValidations({
      proposal_id: proposalIdNum,
    });

    const validationList = Array.isArray(res) ? res : (res as any)?.data || [];
    if (!validationList || validationList.length === 0) return;

    const docs = detail?.documents || pengajuan.value?.documents || pengajuan.value?.dokumen || [];
    verifikasiStore.syncProposalValidations(validationList, docs);

    // Check validation notes for SURAT_PENGANTAR_SK_CPCL (e.g. from Ditjenbun verifier)
    const suratDoc = findProposalDoc('SURAT_PENGANTAR_SK_CPCL') || findProposalDoc('SURAT_PENGANTAR');
    const suratDocIdNum = suratDoc?.id ? Number(String(suratDoc.id).replace(/[^\d]/g, '')) || 0 : 0;
    const suratAliases = ['SURATPENGANTARSKCPCL', 'SURATPENGANTAR'];

    const matchedSurat = validationList.filter((v: any) => {
      const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.dokumen_id || 0);
      const vDocType = (v.document_type || v.tipe_dokumen || '').toUpperCase().replace(/[-_]/g, '');
      const matchId = suratDocIdNum > 0 && vDocId === suratDocIdNum;
      const matchType = vDocType && suratAliases.includes(vDocType);
      return matchId || matchType;
    });

    if (matchedSurat.length > 0) {
      const latestSuratVal = matchedSurat.slice().sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.id || 0) - Number(a.id || 0);
      })[0];

      const isValid = latestSuratVal.is_valid === true || latestSuratVal.is_valid === 1 || String(latestSuratVal.is_valid).toLowerCase() === 'true';
      if (!isValid && latestSuratVal.notes) {
        suratPengantarValidationNotes.value = latestSuratVal.notes;
      } else {
        suratPengantarValidationNotes.value = '';
      }
    }
  } catch (err) {
    console.error('Gagal memuat riwayat validasi dokumen proposal:', err);
  }
}

function initRegionalLetterFields() {
  if (!verifikasiStore.noSuratProvinsi && pengajuan.value?.no_surat_provinsi) {
    verifikasiStore.noSuratProvinsi = pengajuan.value.no_surat_provinsi;
  }
  if (!verifikasiStore.tglSuratProvinsi && pengajuan.value?.tgl_surat_provinsi) {
    verifikasiStore.tglSuratProvinsi = pengajuan.value.tgl_surat_provinsi;
  }
  if (!verifikasiStore.namaDinasProvinsi) {
    if (pengajuan.value?.nama_dinas_provinsi) {
      verifikasiStore.namaDinasProvinsi = pengajuan.value.nama_dinas_provinsi;
    } else if (pengajuan.value?.nama_dinas_kabupaten) {
      verifikasiStore.namaDinasProvinsi = pengajuan.value.nama_dinas_kabupaten;
    } else if ((pengajuan.value as any)?.kelembagaan?.kabupaten || (pengajuan.value as any)?.lembaga?.kabupatenKode) {
      const kab = (pengajuan.value as any)?.kelembagaan?.kabupaten || (pengajuan.value as any)?.lembaga?.kabupatenKode || '';
      verifikasiStore.namaDinasProvinsi = kab ? `Dinas Pertanian dan Perkebunan Kabupaten ${kab}` : '';
    }
  }
}

onMounted(() => {
  loadProposalDocumentValidations();
  initRegionalLetterFields();
});

watch(
  () => pengajuan.value,
  (newVal) => {
    if (newVal) {
      loadProposalDocumentValidations();
      initRegionalLetterFields();
    }
  },
);

const kabSubmission = computed(() => verifikasiKabStore.submissions.find((s) => String(s.pengajuanId) === String(id)));

const kabBaVerifikasi = computed(() => {
  const doc = findProposalDoc('BA_VERIFIKASI');
  if (doc) return doc;
  if (kabSubmission.value?.beritaAcaraDokumen) return kabSubmission.value.beritaAcaraDokumen;
  if (verifikasiStore.proposalId === id && verifikasiStore.kabBaVerifikasi) return verifikasiStore.kabBaVerifikasi;
  return null;
});

const kabBaVerifikasiLapangan = computed(() => {
  const doc = findProposalDoc('BA_VERIFIKASI_LAPANGAN');
  if (doc) return doc;
  if (kabSubmission.value?.beritaAcaraLapangan) return kabSubmission.value.beritaAcaraLapangan;
  if (verifikasiStore.proposalId === id && verifikasiStore.kabBaVerifikasiLapangan) return verifikasiStore.kabBaVerifikasiLapangan;
  return null;
});

const kabSkCpcl = computed(() => {
  const doc = findProposalDoc('SK_CPCL');
  if (doc) return doc;
  if (kabSubmission.value?.skCpcl) return kabSubmission.value.skCpcl;
  if (verifikasiStore.proposalId === id && verifikasiStore.kabSkCpcl) return verifikasiStore.kabSkCpcl;
  return null;
});

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('reject');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);
const isSubmitting = ref(false);

const confirmModalRef = ref<any>(null);

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

const isRevisionFromProv = computed(() => {
  const s = pengajuan.value?.status || pengajuan.value?.currentStatus;
  return s === 'REV_FROM_PROV';
});

function toggleBaVerifikasiVerification(status: 'APPROVED' | 'REJECTED') {
  if (isRevisionFromProv.value) return;
  const v = verifikasiStore.getVerification('baVerifikasiDoc');
  const newStatus = v.status === status ? 'PENDING' : status;
  verifikasiStore.setVerificationStatus('baVerifikasiDoc', newStatus);
}

function toggleBaVerifikasiLapanganVerification(status: 'APPROVED' | 'REJECTED') {
  if (isRevisionFromProv.value) return;
  const v = verifikasiStore.getVerification('baVerifikasiLapanganDoc');
  const newStatus = v.status === status ? 'PENDING' : status;
  verifikasiStore.setVerificationStatus('baVerifikasiLapanganDoc', newStatus);
}

function toggleSkCpclVerification(status: 'APPROVED' | 'REJECTED') {
  if (isRevisionFromProv.value) return;
  const v = verifikasiStore.getVerification('skCpclDoc');
  const newStatus = v.status === status ? 'PENDING' : status;
  verifikasiStore.setVerificationStatus('skCpclDoc', newStatus);
}

const activeDocs = computed(() => {
  const list: Array<{ key: string; verification: any }> = [];
  if (kabBaVerifikasi.value) list.push({ key: 'baVerifikasiDoc', verification: verifikasiStore.getVerification('baVerifikasiDoc') });
  if (kabBaVerifikasiLapangan.value) list.push({ key: 'baVerifikasiLapanganDoc', verification: verifikasiStore.getVerification('baVerifikasiLapanganDoc') });
  if (kabSkCpcl.value) list.push({ key: 'skCpclDoc', verification: verifikasiStore.getVerification('skCpclDoc') });
  return list;
});

const hasRejection = computed(() => {
  return activeDocs.value.some((item) => item.verification.status === 'REJECTED');
});

const allConfirmed = computed(() => {
  if (activeDocs.value.length === 0) return true;
  return activeDocs.value.every((item) => {
    if (item.verification.status === 'PENDING') return false;
    if (item.verification.status === 'REJECTED') {
      return item.verification.notes && item.verification.notes.trim().length > 0;
    }
    return true;
  });
});

const canProceed = computed(() => {
  if (isRevisionFromProv.value) return false;
  const hasMetadata =
    !!verifikasiStore.noSuratProvinsi?.trim() &&
    !!verifikasiStore.tglSuratProvinsi?.trim() &&
    !!verifikasiStore.namaDinasProvinsi?.trim();
  return !hasRejection.value && allConfirmed.value && !!currentSuratPengantar.value && hasMetadata;
});

const canSubmitRevision = computed(() => {
  if (isRevisionFromProv.value) return false;
  return hasRejection.value && allConfirmed.value;
});

function buildProposalValidationPayloads() {
  const payloads: any[] = [];
  const pengajuanIdNum = Number(String(id).replace(/[^\d]/g, '')) || 0;

  const checkDoc = (type: string, key: string) => {
    const d = findProposalDoc(type);
    const docId = d?.id ? Number(String(d.id).replace(/[^\d]/g, '')) || 0 : 0;
    const v = verifikasiStore.getVerification(key);
    if (v && v.status !== 'PENDING') {
      payloads.push({
        dokumen_proposal_id: docId,
        proposal_document_id: docId,
        pengajuan_id: pengajuanIdNum,
        proposal_id: pengajuanIdNum,
        document_type: type,
        is_valid: v.status === 'APPROVED',
        notes: v.notes || '',
        validated_by_role: 'PROVINSI',
      });
    }
  };

  if (kabBaVerifikasi.value) checkDoc('BA_VERIFIKASI', 'baVerifikasiDoc');
  if (kabBaVerifikasiLapangan.value) checkDoc('BA_VERIFIKASI_LAPANGAN', 'baVerifikasiLapanganDoc');
  if (kabSkCpcl.value) checkDoc('SK_CPCL', 'skCpclDoc');

  return payloads;
}

function handleKembalikanRevisi() {
  if (!canSubmitRevision.value) {
    if (!allConfirmed.value) {
      toast.error('Harap konfirmasi semua dokumen dan berikan catatan alasan penolakan pada dokumen yang ditolak.');
    }
    return;
  }

  const notesArray: string[] = [];
  if (verifikasiStore.getVerification('baVerifikasiDoc').status === 'REJECTED') {
    notesArray.push(`Berita Acara Verifikasi Dokumen: ${verifikasiStore.getVerification('baVerifikasiDoc').notes}`);
  }
  if (verifikasiStore.getVerification('baVerifikasiLapanganDoc').status === 'REJECTED') {
    notesArray.push(`Berita Acara Verifikasi Lapangan: ${verifikasiStore.getVerification('baVerifikasiLapanganDoc').notes}`);
  }
  if (verifikasiStore.getVerification('skCpclDoc').status === 'REJECTED') {
    notesArray.push(`SK CPCL Dinas Kabupaten: ${verifikasiStore.getVerification('skCpclDoc').notes}`);
  }

  confirmActionType.value = 'reject';
  confirmDestination.value = 'Dinas Kabupaten/Kota (Revisi)';
  confirmNotes.value = notesArray.join('\n');

  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const validationsPayload = buildProposalValidationPayloads();
      await verifikasiProvinsiStore.sendBackForRevision(pengajuan.value!.id, validationsPayload, confirmNotes.value);
      toast.warning('Proposal dikembalikan ke Dinas Kabupaten untuk perbaikan berkas.', 'Revisi Dikirim');
      showConfirmModal.value = false;
      router.push('/dinas/verifikasi/provinsi');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengembalikan proposal. Coba lagi.');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
}

function fileToUpload(file: File): Promise<DokumenUpload> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        persyaratanId: 'SURAT_PENGANTAR_SK_CPCL',
        namaFile: file.name,
        mimeType: file.type,
        ukuranBytes: file.size,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        file: file,
      });
    };
    reader.readAsDataURL(file);
  });
}

const currentSuratPengantar = computed<DokumenUpload | null>(() => {
  if (isSuratPengantarRemoved.value) return null;
  if (verifikasiStore.skCpcl) return verifikasiStore.skCpcl;
  return findProposalDoc('SURAT_PENGANTAR_SK_CPCL') || findProposalDoc('SURAT_PENGANTAR');
});

async function handleSkCpclUpload(file: File) {
  if (isRevisionFromProv.value) return;
  isSuratPengantarRemoved.value = false;
  const doc = await fileToUpload(file);
  verifikasiStore.skCpcl = doc;
  toast.success('Dokumen Surat Pengantar SK CPCL berhasil diunggah.');
}

function handleFileChange(event: Event) {
  if (isRevisionFromProv.value) return;
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    handleSkCpclUpload(target.files[0]);
  }
}

function handleRemoveSkCpcl() {
  if (isRevisionFromProv.value) return;
  isSuratPengantarRemoved.value = true;
  verifikasiStore.skCpcl = null;
  toast.info('Dokumen Surat Pengantar SK CPCL dihapus.');
}

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openDocPreview(doc: DokumenUpload | null | undefined, title = 'Pratinjau Dokumen') {
  if (!doc) return;
  previewDoc.value = {
    dataUrl: doc.dataUrl,
    mimeType: doc.mimeType || 'application/pdf',
    title: doc.namaFile || title,
  };
  showPreview.value = true;
}

function goToNextStep() {
  verifikasiStore.currentStep = 4;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-slate-900">Asistensi Dokumen Verifikasi & SK CPCL Kabupaten</h2>
      <p class="text-xs text-slate-500">Verifikasi dokumen Berita Acara dan SK CPCL dari Dinas Kabupaten serta asistensi Surat Pengantar SK CPCL</p>
    </div>

    <!-- Revision Banner for REV_FROM_PROV -->
    <div
      v-if="isRevisionFromProv"
      class="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 shadow-sm"
    >
      <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div class="flex flex-col gap-0.5">
        <span class="font-bold text-amber-800">Status Usulan: Perbaikan Dokumen oleh Dinas Kabupaten/Kota (REV_FROM_PROV)</span>
        <span class="text-amber-700 leading-relaxed">
          Proposal ini sedang dalam tahap perbaikan oleh Dinas Kabupaten. Fitur validasi dan perubahan berkas dinonaktifkan hingga berkas perbaikan dikirimkan kembali.
        </span>
      </div>
    </div>

    <!-- 1. BA Verifikasi Dokumen from Kabupaten -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asistensi Berita Acara Verifikasi Dokumen</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
        <div v-if="kabBaVerifikasi" class="flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-slate-800">Berita Acara Verifikasi Dokumen (Kabupaten)</span>
                <span class="text-[10px] text-slate-400">{{ kabBaVerifikasi.namaFile }} &middot; {{ (kabBaVerifikasi.ukuranBytes / 1024).toFixed(0) }} KB</span>
                <span v-if="kabBaVerifikasi.uploadedBy" class="text-[10px] text-slate-500">Diunggah oleh {{ kabBaVerifikasi.uploadedBy }}<span v-if="kabBaVerifikasi.uploadedAtFormatted"> &bull; {{ kabBaVerifikasi.uploadedAtFormatted }}</span></span>
              </div>
            </div>
            <button
              type="button"
              @click="openDocPreview(kabBaVerifikasi, 'Berita Acara Verifikasi Dokumen')"
              class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Eye class="w-3.5 h-3.5" /> Pratinjau
            </button>
          </div>

          <div class="flex items-center gap-1 self-end bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleBaVerifikasiVerification('APPROVED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('baVerifikasiDoc').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
              ]"
            >
              <Check class="w-3.5 h-3.5" /> Sesuai
            </button>
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleBaVerifikasiVerification('REJECTED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('baVerifikasiDoc').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700',
              ]"
            >
              <X class="w-3.5 h-3.5" /> Tolak
            </button>
          </div>
          <textarea
            v-if="verifikasiStore.getVerification('baVerifikasiDoc').status === 'REJECTED'"
            v-model="verifikasiStore.getVerification('baVerifikasiDoc').notes"
            :disabled="isRevisionFromProv"
            :readonly="isRevisionFromProv"
            rows="2"
            placeholder="Tuliskan catatan alasan penolakan Berita Acara Verifikasi Dokumen..."
            :class="[
              'w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none resize-none text-slate-800',
              isRevisionFromProv ? 'bg-slate-50 cursor-not-allowed text-slate-600 border-slate-200' : 'focus:border-rose-500'
            ]"
          />
        </div>
        <div v-else class="text-xs text-slate-400 italic text-center p-4">Dokumen belum diunggah</div>
      </div>
    </div>

    <!-- 2. BA Verifikasi Lapangan from Kabupaten -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asistensi Berita Acara Verifikasi Lapangan</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
        <div v-if="kabBaVerifikasiLapangan" class="flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-slate-800">Berita Acara Verifikasi Lapangan (Kabupaten)</span>
                <span class="text-[10px] text-slate-400">{{ kabBaVerifikasiLapangan.namaFile }} &middot; {{ (kabBaVerifikasiLapangan.ukuranBytes / 1024).toFixed(0) }} KB</span>
                <span v-if="kabBaVerifikasiLapangan.uploadedBy" class="text-[10px] text-slate-500">Diunggah oleh {{ kabBaVerifikasiLapangan.uploadedBy }}<span v-if="kabBaVerifikasiLapangan.uploadedAtFormatted"> &bull; {{ kabBaVerifikasiLapangan.uploadedAtFormatted }}</span></span>
              </div>
            </div>
            <button
              type="button"
              @click="openDocPreview(kabBaVerifikasiLapangan, 'Berita Acara Verifikasi Lapangan')"
              class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Eye class="w-3.5 h-3.5" /> Pratinjau
            </button>
          </div>

          <div class="flex items-center gap-1 self-end bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleBaVerifikasiLapanganVerification('APPROVED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('baVerifikasiLapanganDoc').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
              ]"
            >
              <Check class="w-3.5 h-3.5" /> Sesuai
            </button>
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleBaVerifikasiLapanganVerification('REJECTED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('baVerifikasiLapanganDoc').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700',
              ]"
            >
              <X class="w-3.5 h-3.5" /> Tolak
            </button>
          </div>
          <textarea
            v-if="verifikasiStore.getVerification('baVerifikasiLapanganDoc').status === 'REJECTED'"
            v-model="verifikasiStore.getVerification('baVerifikasiLapanganDoc').notes"
            :disabled="isRevisionFromProv"
            :readonly="isRevisionFromProv"
            rows="2"
            placeholder="Tuliskan catatan alasan penolakan Berita Acara Verifikasi Lapangan..."
            :class="[
              'w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none resize-none text-slate-800',
              isRevisionFromProv ? 'bg-slate-50 cursor-not-allowed text-slate-600 border-slate-200' : 'focus:border-rose-500'
            ]"
          />
        </div>
        <div v-else class="text-xs text-slate-400 italic text-center p-4">Dokumen belum diunggah</div>
      </div>
    </div>

    <!-- 3. SK CPCL from Kabupaten -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asistensi SK CPCL dari Dinas Kabupaten</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
        <div v-if="kabSkCpcl" class="flex flex-col gap-3 p-4 bg-white rounded-lg border border-slate-200">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-slate-800">SK CPCL dari Dinas Kabupaten</span>
                <span class="text-[10px] text-slate-400">{{ kabSkCpcl.namaFile }} &middot; {{ (kabSkCpcl.ukuranBytes / 1024).toFixed(0) }} KB</span>
                <span v-if="kabSkCpcl.uploadedBy" class="text-[10px] text-slate-500">Diunggah oleh {{ kabSkCpcl.uploadedBy }}<span v-if="kabSkCpcl.uploadedAtFormatted"> &bull; {{ kabSkCpcl.uploadedAtFormatted }}</span></span>
              </div>
            </div>
            <button
              type="button"
              @click="openDocPreview(kabSkCpcl, 'SK CPCL')"
              class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Eye class="w-3.5 h-3.5" /> Pratinjau
            </button>
          </div>

          <div class="flex items-center gap-1 self-end bg-slate-50 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleSkCpclVerification('APPROVED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('skCpclDoc').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700',
              ]"
            >
              <Check class="w-3.5 h-3.5" /> Sesuai
            </button>
            <button
              type="button"
              :disabled="isRevisionFromProv"
              @click="toggleSkCpclVerification('REJECTED')"
              :class="[
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all',
                isRevisionFromProv ? 'cursor-not-allowed opacity-75' : '',
                verifikasiStore.getVerification('skCpclDoc').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700',
              ]"
            >
              <X class="w-3.5 h-3.5" /> Tolak
            </button>
          </div>
          <textarea
            v-if="verifikasiStore.getVerification('skCpclDoc').status === 'REJECTED'"
            v-model="verifikasiStore.getVerification('skCpclDoc').notes"
            :disabled="isRevisionFromProv"
            :readonly="isRevisionFromProv"
            rows="2"
            placeholder="Tuliskan catatan alasan penolakan SK CPCL..."
            :class="[
              'w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none resize-none text-slate-800',
              isRevisionFromProv ? 'bg-slate-50 cursor-not-allowed text-slate-600 border-slate-200' : 'focus:border-rose-500'
            ]"
          />
        </div>
        <div v-else class="text-xs text-slate-400 italic text-center p-4">Dokumen belum diunggah</div>
      </div>
    </div>

    <!-- 4. CPCL Reference Table (read-only) -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <Users class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Referensi Data CPCL</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div v-if="pengajuan?.daftarCPCL?.length" class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="p-3">No</th>
              <th class="p-3">Nama Pekebun</th>
              <th class="p-3">NIK</th>
              <th class="p-3">Luas Lahan</th>
              <th class="p-3">Dokumen Lahan</th>
              <th class="p-3">Koordinat</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(item, idx) in pengajuan.daftarCPCL" :key="item.id" class="hover:bg-slate-50">
              <td class="p-3 font-mono text-slate-400">{{ idx + 1 }}</td>
              <td class="p-3 font-bold text-slate-900">{{ item.namaPekebun }}</td>
              <td class="p-3 font-mono text-xs">{{ item.nik }}</td>
              <td class="p-3 font-semibold text-[#066C2A]">{{ item.luasLahanHektar }} Ha</td>
              <td class="p-3">
                <span class="text-xs font-medium">{{ item.jenisHakLahan }}</span>
                <span class="text-[10px] text-slate-400 ml-1">{{ item.nomorSuratLahan }}</span>
              </td>
              <td class="p-3 font-mono text-[10px] text-slate-500 truncate max-w-[160px]">{{ item.coordinates?.map((c) => `${c.lat}, ${c.lng}`).join('; ') || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-6 text-center text-slate-400 italic border border-slate-200 rounded-lg bg-slate-50">Tidak ada data CPCL. Data CPCL akan ditampilkan setelah pemohon mengisi formulir pengusulan.</div>
    </div>

    <!-- 5. Surat Pengantar SK CPCL Upload (Provinsi) -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Asistensi Surat Pengantar SK CPCL</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
        <!-- Format Download -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-700">Format Dokumen Surat Pengantar SK CPCL</span>
          <a href="/templates/sk-cpcl-template.docx" download class="flex items-center gap-1 text-xs font-semibold text-[#066C2A] hover:underline"> <Download class="w-3.5 h-3.5" /> Unduh Template </a>
        </div>

        <!-- Surat Metadata Inputs -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-slate-200">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">
              Nomor Surat <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="verifikasiStore.noSuratProvinsi"
              type="text"
              placeholder="Contoh: 500/DISBUN-PROV/IX/2026"
              :disabled="isRevisionFromProv"
              class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">
              Tanggal Surat <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="verifikasiStore.tglSuratProvinsi"
              type="date"
              :disabled="isRevisionFromProv"
              class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">
              Nomenklatur Nama Dinas <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="verifikasiStore.namaDinasProvinsi"
              type="text"
              placeholder="Contoh: Dinas Pertanian dan Perkebunan Kabupaten ..."
              :disabled="isRevisionFromProv"
              class="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        <!-- Uploaded / Existing File Info -->
        <div v-if="currentSuratPengantar" class="p-4 bg-white rounded-lg border border-emerald-200 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-slate-800">{{ currentSuratPengantar.namaFile }}</span>
                <span class="text-[10px] text-slate-400">{{ (currentSuratPengantar.ukuranBytes / 1024).toFixed(0) }} KB</span>
                <span v-if="currentSuratPengantar.uploadedBy" class="text-[10px] text-slate-500">Diunggah oleh {{ currentSuratPengantar.uploadedBy }}<span v-if="currentSuratPengantar.uploadedAtFormatted"> &bull; {{ currentSuratPengantar.uploadedAtFormatted }}</span></span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openDocPreview(currentSuratPengantar, 'Surat Pengantar SK CPCL')"
                class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Eye class="w-3.5 h-3.5" /> Pratinjau
              </button>
              <template v-if="!isRevisionFromProv">
                <label class="cursor-pointer">
                  <span class="flex items-center gap-1 text-xs text-[#066C2A] font-semibold hover:bg-emerald-100 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors">
                    Ganti Berkas
                  </span>
                  <input type="file" accept=".pdf" class="hidden" @change="handleFileChange" />
                </label>
                <button type="button" @click="handleRemoveSkCpcl" class="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">Hapus</button>
              </template>
            </div>
          </div>
        </div>

        <!-- Upload Area (if no file yet) -->
        <div v-else class="p-4 bg-white rounded-lg border border-slate-200">
          <FileUpload
            id="skCpclUpload"
            label="Dokumen Surat Pengantar SK CPCL Ditandatangani"
            accept=".pdf"
            required
            :disabled="isRevisionFromProv"
            placeholder="Unggah Surat Pengantar SK CPCL yang telah ditandatangani (PDF max 5MB)"
            @file-selected="handleSkCpclUpload"
          />
        </div>

        <!-- Validation Rejection Notes below file upload container -->
        <div
          v-if="suratPengantarValidationNotes"
          class="flex gap-2.5 bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-700"
        >
          <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div class="flex flex-col gap-0.5">
            <span class="font-bold text-rose-800">Catatan Perbaikan Surat Pengantar SK CPCL:</span>
            <span class="leading-relaxed text-rose-700">{{ suratPengantarValidationNotes }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between pt-2">
      <button type="button" @click="verifikasiStore.currentStep = 1" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
        <ArrowLeft class="w-4 h-4" /> Kembali
      </button>

      <div class="flex items-center gap-3">
        <!-- If there is document rejected: show single Revisi Kembali Dokumen button -->
        <button
          v-if="hasRejection"
          type="button"
          :disabled="!canSubmitRevision || isSubmitting"
          @click="handleKembalikanRevisi"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm',
            canSubmitRevision && !isSubmitting ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ]"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <template v-else>
            <XCircle class="w-4 h-4" />
            Revisi Kembali Dokumen
          </template>
        </button>

        <!-- If no rejection: show Simpan & Lanjut ke Summary & Submit button -->
        <button
          v-else
          type="button"
          :disabled="!canProceed || isSubmitting"
          @click="goToNextStep"
          :class="[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm',
            canProceed && !isSubmitting ? 'bg-[#066C2A] text-white hover:bg-emerald-800 shadow-emerald-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ]"
        >
          Simpan & Lanjut ke Summary & Submit
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <DocumentPreviewModal :isOpen="showPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showPreview = false" />

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
