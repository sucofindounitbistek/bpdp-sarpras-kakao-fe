<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiBPDPStore } from '@/stores/verifikasiBPDP';
import { useRekomtekStore } from '@/stores/rekomtek';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { proposalService } from '@/services/proposal.service';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';
import LogStatusUsulan from '@/components/rekomtek/LogStatusUsulan.vue';
import PratinjauPekebunDanDokumenTab from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';
import AuthorityDocumentSectionCard from '@/components/verification/AuthorityDocumentSectionCard.vue';
import { AUTHORITY_CONFIG } from '@/lib/authoritySections';
import Skeleton from '@/components/ui/Skeleton.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import Modal from '@/components/ui/Modal.vue';
import { ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Check, X, FileText, FileCheck, CheckCircle2, AlertCircle, History, ChevronDown, UserCheck, Send, ShieldAlert, Undo2 } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import type { SpatialOverlapResponse, Proposal } from '@/types/pengusulan';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const verifikasiBPDPStore = useVerifikasiBPDPStore();
const store = useRekomtekStore();
const authStore = useAuthStore();
const toast = useToast();

const usulanId = route.params.id as string;
const pageLoading = ref(true);
const isSubmitting = ref(false);
const showAuditTrail = ref(false);
const currentStep = ref(1);

const backRoute = computed(() => {
  const from = route.query.from as string;
  if (from === 'riwayat-selesai' || from === '/bpdp/riwayat-selesai') return '/bpdp/riwayat-selesai';
  if (from === 'sk-dirut' || from === '/bpdp/sk-dirut') return '/bpdp/sk-dirut';
  return '/bpdp/antrean';
});

const backLabel = computed(() => {
  const from = route.query.from as string;
  if (from === 'riwayat-selesai' || from === '/bpdp/riwayat-selesai') return 'Kembali ke Riwayat Selesai';
  if (from === 'sk-dirut' || from === '/bpdp/sk-dirut') return 'Kembali ke SK Dirut';
  return 'Kembali ke Antrean';
});

const pengajuan = computed<Proposal | null>(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(usulanId)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(usulanId)) || null;
});

const activeUsulan = computed(() => {
  return pengajuan.value || store.activeUsulan || store.usulans.find((u) => String(u.id) === String(usulanId)) || null;
});

const isInspectMode = computed(() => {
  const st = activeUsulan.value?.status || (activeUsulan.value as any)?.currentStatus;
  if (!st) return false;
  return ['SK_DIRUT_PUBLISHED', 'SELESAI', 'SK_DIRUT_ISSUED'].includes(st);
});

const isReadonly = computed(() => {
  const st = activeUsulan.value?.status || (activeUsulan.value as any)?.currentStatus;
  if (!st) return false;
  if (isInspectMode.value) return false;
  return !['BPDP_VERIF_SUBMITTED', 'APPROVAL_BPDP'].includes(st);
});

const steps = computed(() => {
  if (isInspectMode.value) {
    return [
      { id: 1, title: 'Pratinjau Pekebun & Lahan', description: 'Tinjau Data & Lahan', icon: Eye },
      { id: 2, title: 'Inspeksi Dokumen & Pushback', description: 'Validasi & Kembalikan Dokumen', icon: FileCheck },
    ];
  }
  return [
    { id: 1, title: 'Pratinjau Pekebun & Dokumen', description: 'Tinjau Data & Lahan', icon: Eye },
    { id: 2, title: 'Persetujuan Penelitian', description: 'Keputusan Kadiv BPDP', icon: FileCheck },
  ];
});

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

const kelayakanVerif = ref<{ status: 'APPROVED' | 'REJECTED' | 'PENDING'; notes: string }>({
  status: 'PENDING',
  notes: '',
});

function toggleVerif(status: 'APPROVED' | 'REJECTED') {
  if (isReadonly.value) return;
  kelayakanVerif.value.status = kelayakanVerif.value.status === status ? 'PENDING' : status;
  if (kelayakanVerif.value.status === 'APPROVED') kelayakanVerif.value.notes = '';
}

const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openUrlPreview(url: string, title: string) {
  if (!url) return;
  previewDoc.value = { dataUrl: url, mimeType: 'application/pdf', title };
  showPreview.value = true;
}

/**
 * Resolves the "KEPUTUSAN_KELAYAKAN" document from the proposal detail.
 */
const kelayakanDoc = computed(() => {
  const p = pengajuan.value || (activeUsulan.value as any);
  if (!p) return null;
  const aliases = ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN', 'HASIL_PENELITIAN_BPDP', 'LAPORAN_PENELITIAN'];

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find((doc: any) => {
      const dt = (doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.file_url || d.file_name)) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name || d.namaFile || 'laporan_kelayakan.pdf',
        fileUrl: d.file_url || d.urlFile || '',
        documentType: d.document_type || 'KEPUTUSAN_KELAYAKAN',
        uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find((doc: any) => {
      const dt = (doc.tipeDokumen || doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.urlFile || d.namaFile)) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile || (d as any).file_name || 'laporan_kelayakan.pdf',
        fileUrl: d.urlFile || (d as any).file_url || '',
        documentType: d.tipeDokumen || d.document_type || 'KEPUTUSAN_KELAYAKAN',
        uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at),
      };
    }
  }

  if (p.kelayakan?.signedUrl || p.kelayakan?.draftUrl) {
    return {
      id: undefined,
      fileName: 'laporan_kelayakan.pdf',
      fileUrl: p.kelayakan.signedUrl || p.kelayakan.draftUrl,
      documentType: 'KEPUTUSAN_KELAYAKAN',
      uploadedBy: '',
      uploadedAtFormatted: '',
    };
  }
  return null;
});

interface DocValidationState {
  docId?: number;
  valid: boolean | null;
  note: string;
  url?: string;
  fileName?: string;
  documentType: string;
  ownerTier: 'KABUPATEN' | 'PROVINSI' | 'DITJENBUN_VERIFIKATOR' | 'BPDP_VERIFIKATOR';
  ownerLabel: string;
  uploadedBy?: string;
  uploadedAtFormatted?: string;
}

const bpdpValidations = ref<{
  rabFinal: DocValidationState;
  skCpcl: DocValidationState;
  baVerifikasi: DocValidationState;
  baVerifikasiLapangan: DocValidationState;
  suratPengantarProv: DocValidationState;
  rekomtek: DocValidationState;
  kelayakan: DocValidationState;
}>({
  rabFinal: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'RAB_FINAL', ownerTier: 'KABUPATEN', ownerLabel: 'Dinas Kabupaten/Kota', uploadedBy: '', uploadedAtFormatted: '' },
  skCpcl: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'SK_CPCL', ownerTier: 'KABUPATEN', ownerLabel: 'Dinas Kabupaten/Kota', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasi: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'BA_VERIFIKASI', ownerTier: 'KABUPATEN', ownerLabel: 'Dinas Kabupaten/Kota', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasiLapangan: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'BA_VERIFIKASI_LAPANGAN', ownerTier: 'KABUPATEN', ownerLabel: 'Dinas Kabupaten/Kota', uploadedBy: '', uploadedAtFormatted: '' },
  suratPengantarProv: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'SURAT_PENGANTAR_SK_CPCL', ownerTier: 'PROVINSI', ownerLabel: 'Dinas Provinsi', uploadedBy: '', uploadedAtFormatted: '' },
  rekomtek: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'REKOMTEK', ownerTier: 'DITJENBUN_VERIFIKATOR', ownerLabel: 'Ditjenbun Verifikator', uploadedBy: '', uploadedAtFormatted: '' },
  kelayakan: { docId: undefined, valid: true, note: '', url: '', fileName: '', documentType: 'KEPUTUSAN_KELAYAKAN', ownerTier: 'BPDP_VERIFIKATOR', ownerLabel: 'BPDP Verifikator', uploadedBy: '', uploadedAtFormatted: '' },
});

function syncProposalDocuments() {
  const p = pengajuan.value || (activeUsulan.value as any);
  if (!p) return;

  const findDoc = (docType: string) => {
    const target = docType.toUpperCase().replace(/[-_]/g, '');

    const aliases: Record<string, string[]> = {
      RAB_FINAL: ['RAB_FINAL', 'RAB', 'RABFINAL', 'DOKUMEN_RAB', 'DOKUMEN_RAB_FINAL', 'RAB_FINAL_KABUPATEN', 'FINAL_RAB'],
      REKOMTEK: ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'],
      BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI', 'BERITA-ACARA-DOKUMEN'],
      BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BA_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BERITA_ACARA_VERIFIKASI_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN'],
      SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
      SURAT_PENGANTAR_SK_CPCL: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV', 'SURAT_PENGANTAR_PROVINSI'],
      KEPUTUSAN_KELAYAKAN: ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN', 'HASIL_PENELITIAN_BPDP', 'LAPORAN_PENELITIAN'],
    };
    const allowed = (aliases[docType] || [docType]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));

    if (p.documents && Array.isArray(p.documents)) {
      const d = p.documents.find((doc: any) => {
        const dt = (doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
        return allowed.includes(dt) || dt === target;
      });
      if (d && (d.file_url || d.urlFile || d.file_name)) {
        return {
          id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
          fileName: d.file_name || d.namaFile || 'Dokumen',
          fileUrl: d.file_url || d.urlFile || '',
          uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
          uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
        };
      }
    }

    if (p.dokumen && Array.isArray(p.dokumen)) {
      const d = p.dokumen.find((doc: any) => {
        const dt = (doc.tipeDokumen || doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
        return allowed.includes(dt) || dt === target;
      });
      if (d && (d.urlFile || d.file_url || d.namaFile)) {
        return {
          id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
          fileName: d.namaFile || (d as any).file_name || 'Dokumen',
          fileUrl: d.urlFile || (d as any).file_url || '',
          uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
          uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at),
        };
      }
    }

    if (docType === 'KEPUTUSAN_KELAYAKAN' && (p.kelayakan?.signedUrl || p.kelayakan?.draftUrl)) {
      return {
        id: undefined,
        fileName: 'laporan_kelayakan.pdf',
        fileUrl: p.kelayakan.signedUrl || p.kelayakan.draftUrl,
        uploadedBy: '',
        uploadedAtFormatted: '',
      };
    }
    if (docType === 'REKOMTEK' && (p.rekomtek?.signedUrl || p.rekomtek?.draftUrl)) {
      return {
        id: undefined,
        fileName: 'rekomtek.pdf',
        fileUrl: p.rekomtek.signedUrl || p.rekomtek.draftUrl,
        uploadedBy: '',
        uploadedAtFormatted: '',
      };
    }
    return null;
  };

  const rabDoc = findDoc('RAB_FINAL');
  bpdpValidations.value.rabFinal.docId = rabDoc?.id;
  bpdpValidations.value.rabFinal.url = rabDoc?.fileUrl || '';
  bpdpValidations.value.rabFinal.fileName = rabDoc?.fileName || 'RAB_Final.pdf';
  bpdpValidations.value.rabFinal.uploadedBy = rabDoc?.uploadedBy || '';
  bpdpValidations.value.rabFinal.uploadedAtFormatted = rabDoc?.uploadedAtFormatted || '';

  const skDoc = findDoc('SK_CPCL');
  bpdpValidations.value.skCpcl.docId = skDoc?.id;
  bpdpValidations.value.skCpcl.url = skDoc?.fileUrl || '';
  bpdpValidations.value.skCpcl.fileName = skDoc?.fileName || 'SK_CPCL.pdf';
  bpdpValidations.value.skCpcl.uploadedBy = skDoc?.uploadedBy || '';
  bpdpValidations.value.skCpcl.uploadedAtFormatted = skDoc?.uploadedAtFormatted || '';

  const baDoc = findDoc('BA_VERIFIKASI');
  bpdpValidations.value.baVerifikasi.docId = baDoc?.id;
  bpdpValidations.value.baVerifikasi.url = baDoc?.fileUrl || '';
  bpdpValidations.value.baVerifikasi.fileName = baDoc?.fileName || 'BA_Verifikasi.pdf';
  bpdpValidations.value.baVerifikasi.uploadedBy = baDoc?.uploadedBy || '';
  bpdpValidations.value.baVerifikasi.uploadedAtFormatted = baDoc?.uploadedAtFormatted || '';

  const baLapDoc = findDoc('BA_VERIFIKASI_LAPANGAN');
  bpdpValidations.value.baVerifikasiLapangan.docId = baLapDoc?.id;
  bpdpValidations.value.baVerifikasiLapangan.url = baLapDoc?.fileUrl || '';
  bpdpValidations.value.baVerifikasiLapangan.fileName = baLapDoc?.fileName || 'BA_Lapangan.pdf';
  bpdpValidations.value.baVerifikasiLapangan.uploadedBy = baLapDoc?.uploadedBy || '';
  bpdpValidations.value.baVerifikasiLapangan.uploadedAtFormatted = baLapDoc?.uploadedAtFormatted || '';

  const suratDoc = findDoc('SURAT_PENGANTAR_SK_CPCL');
  bpdpValidations.value.suratPengantarProv.docId = suratDoc?.id;
  bpdpValidations.value.suratPengantarProv.url = suratDoc?.fileUrl || '';
  bpdpValidations.value.suratPengantarProv.fileName = suratDoc?.fileName || 'Surat_Pengantar_Provinsi.pdf';
  bpdpValidations.value.suratPengantarProv.uploadedBy = suratDoc?.uploadedBy || '';
  bpdpValidations.value.suratPengantarProv.uploadedAtFormatted = suratDoc?.uploadedAtFormatted || '';

  const rekomtek = findDoc('REKOMTEK');
  bpdpValidations.value.rekomtek.docId = rekomtek?.id;
  bpdpValidations.value.rekomtek.url = rekomtek?.fileUrl || (activeUsulan.value as any)?.rekomtek?.signedUrl || '';
  bpdpValidations.value.rekomtek.fileName = rekomtek?.fileName || 'Rekomendasi_Teknis.pdf';
  bpdpValidations.value.rekomtek.uploadedBy = rekomtek?.uploadedBy || '';
  bpdpValidations.value.rekomtek.uploadedAtFormatted = rekomtek?.uploadedAtFormatted || '';

  const kelayakan = findDoc('KEPUTUSAN_KELAYAKAN') || kelayakanDoc.value;
  bpdpValidations.value.kelayakan.docId = kelayakan?.id;
  bpdpValidations.value.kelayakan.url = kelayakan?.fileUrl || '';
  bpdpValidations.value.kelayakan.fileName = kelayakan?.fileName || 'Laporan_Kelayakan.pdf';
  bpdpValidations.value.kelayakan.uploadedBy = kelayakan?.uploadedBy || '';
  bpdpValidations.value.kelayakan.uploadedAtFormatted = kelayakan?.uploadedAtFormatted || '';
}

async function loadSpatialOverlap(proposalId: string | number) {
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

async function loadProposalDocumentValidations() {
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;
  try {
    const res = await pengusulanStore.getProposalDocumentValidations({
      proposal_id: proposalIdNum,
    });

    const validationList = Array.isArray(res) ? res : (res as any)?.data || [];
    if (!validationList || validationList.length === 0) return;

    const bpdpVerifList = validationList.filter((v: any) => {
      const role = String(v.validated_by_role || v.role || '').toUpperCase();
      return role === 'BPDP_VERIFIKATOR' || role === 'BPDP' || role === 'BPDP_APPROVAL';
    });

    const docAliases: Record<string, string[]> = {
      rabFinal: ['RABFINAL', 'RAB', 'DOKUMENRAB', 'DOKUMENRABFINAL', 'RABFINALKABUPATEN', 'FINALRAB'],
      rekomtek: ['REKOMTEK', 'DRAFREKOMTEK', 'REKOMTEKDITJENBUN'],
      baVerifikasi: ['BAVERIFIKASI', 'BERITAACARADOKUMEN', 'BERITAACARAVERIFIKASI', 'BERITAACARA', 'BADOKUMEN'],
      baVerifikasiLapangan: ['BAVERIFIKASILAPANGAN', 'BALAPANGAN', 'BERITAACARALAPANGAN', 'BERITAACARAVERIFIKASILAPANGAN'],
      skCpcl: ['SKCPCL', 'SKCPCLKABUPATEN'],
      suratPengantarProv: ['SURATPENGANTARSKCPCL', 'SURATPENGANTAR', 'SURATPENGANTARPROV', 'SURATPENGANTARPROVINSI'],
      kelayakan: ['KEPUTUSANKELAYAKAN', 'KELAYAKAN', 'LAPORANKELAYAKAN', 'HASILPENELITIANBPDP'],
    };

    const applyVal = (key: 'rabFinal' | 'rekomtek' | 'baVerifikasi' | 'baVerifikasiLapangan' | 'skCpcl' | 'suratPengantarProv' | 'kelayakan') => {
      const docId = bpdpValidations.value[key].docId;
      const matched = bpdpVerifList.filter((v: any) => {
        const vDocType = (v.document_type || '').toUpperCase().replace(/[-_]/g, '');
        const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.document_id || v.dokumen_id);
        if (docId && vDocId && vDocId === Number(docId)) return true;
        if (docAliases[key].includes(vDocType)) return true;
        return false;
      });

      if (matched.length > 0) {
        const latest = matched.slice().sort((a: any, b: any) => {
          const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
          if (timeA !== timeB) return timeB - timeA;
          return Number(b.id) - Number(a.id);
        })[0];

        if (!isInspectMode.value) {
          bpdpValidations.value[key].valid = latest.is_valid === true;
          bpdpValidations.value[key].note = latest.notes || '';
        }
      }
    };

    applyVal('rabFinal');
    applyVal('rekomtek');
    applyVal('baVerifikasi');
    applyVal('baVerifikasiLapangan');
    applyVal('skCpcl');
    applyVal('suratPengantarProv');
    applyVal('kelayakan');

    if (!isInspectMode.value) {
      const bpdpApprovalList = validationList.filter((v: any) => {
        const role = String(v.validated_by_role || v.role || '').toUpperCase();
        return role === 'BPDP_APPROVAL';
      });

      const kelayakanMatched = bpdpApprovalList.filter((v: any) => {
        const vDocType = (v.document_type || '').toUpperCase().replace(/[-_]/g, '');
        if (['KEPUTUSANKELAYAKAN', 'KELAYAKAN', 'LAPORANKELAYAKAN'].includes(vDocType)) return true;
        if (kelayakanDoc.value?.id && Number(v.dokumen_proposal_id || v.proposal_document_id) === Number(kelayakanDoc.value.id)) return true;
        return false;
      });

      if (kelayakanMatched.length > 0) {
        const latest = kelayakanMatched.slice().sort((a: any, b: any) => {
          const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
          if (timeA !== timeB) return timeB - timeA;
          return Number(b.id) - Number(a.id);
        })[0];

        kelayakanVerif.value.status = latest.is_valid ? 'APPROVED' : 'REJECTED';
        kelayakanVerif.value.notes = latest.notes || '';
      }
    }
  } catch (err) {
    console.error('Gagal memuat validasi dokumen BPDP Approval:', err);
  }
}

/** 7 Official Documents for Inspect Mode & BPDP Validation */
const inspectDocumentList = computed(() => [
  {
    key: 'rabFinal' as const,
    title: 'Rencana Anggaran Biaya (RAB) Final',
    subtitle: 'Dinas Kabupaten/Kota',
    state: bpdpValidations.value.rabFinal,
  },
  {
    key: 'skCpcl' as const,
    title: 'Surat Keputusan Penetapan CPCL',
    subtitle: 'Dinas Kabupaten/Kota',
    state: bpdpValidations.value.skCpcl,
  },
  {
    key: 'baVerifikasi' as const,
    title: 'Berita Acara Hasil Penelitian Dokumen',
    subtitle: 'Dinas Kabupaten/Kota',
    state: bpdpValidations.value.baVerifikasi,
  },
  {
    key: 'baVerifikasiLapangan' as const,
    title: 'Berita Acara Verifikasi Lapangan',
    subtitle: 'Dinas Kabupaten/Kota',
    state: bpdpValidations.value.baVerifikasiLapangan,
  },
  {
    key: 'suratPengantarProv' as const,
    title: 'Surat Pengantar SK CPCL',
    subtitle: 'Dinas Provinsi',
    state: bpdpValidations.value.suratPengantarProv,
  },
  {
    key: 'rekomtek' as const,
    title: 'Rekomendasi Teknis (REKOMTEK)',
    subtitle: 'Ditjenbun Verifikator',
    state: bpdpValidations.value.rekomtek,
  },
  {
    key: 'kelayakan' as const,
    title: 'Laporan Keputusan Hasil Penelitian',
    subtitle: 'BPDP Verifikator',
    state: bpdpValidations.value.kelayakan,
  },
]);

function toggleRejectInspectDoc(key: 'rabFinal' | 'skCpcl' | 'baVerifikasi' | 'baVerifikasiLapangan' | 'suratPengantarProv' | 'rekomtek' | 'kelayakan') {
  const doc = bpdpValidations.value[key];
  if (doc.valid === false) {
    doc.valid = true;
    doc.note = '';
  } else {
    doc.valid = false;
  }
}

const rejectedInspectDocs = computed(() => {
  return inspectDocumentList.value.filter((d) => d.state.valid === false);
});

const inspectDocumentsByAuthority = computed(() => [
  {
    tier: AUTHORITY_CONFIG.KABUPATEN,
    docs: inspectDocumentList.value.filter((d) => ['rabFinal', 'skCpcl', 'baVerifikasi', 'baVerifikasiLapangan'].includes(d.key)),
    rejectedCount: inspectDocumentList.value.filter((d) => ['rabFinal', 'skCpcl', 'baVerifikasi', 'baVerifikasiLapangan'].includes(d.key) && d.state.valid === false).length,
  },
  {
    tier: AUTHORITY_CONFIG.PROVINSI,
    docs: inspectDocumentList.value.filter((d) => d.key === 'suratPengantarProv'),
    rejectedCount: inspectDocumentList.value.filter((d) => d.key === 'suratPengantarProv' && d.state.valid === false).length,
  },
  {
    tier: AUTHORITY_CONFIG.DITJENBUN,
    docs: inspectDocumentList.value.filter((d) => d.key === 'rekomtek'),
    rejectedCount: inspectDocumentList.value.filter((d) => d.key === 'rekomtek' && d.state.valid === false).length,
  },
  {
    tier: AUTHORITY_CONFIG.BPDP,
    docs: inspectDocumentList.value.filter((d) => d.key === 'kelayakan'),
    rejectedCount: inspectDocumentList.value.filter((d) => d.key === 'kelayakan' && d.state.valid === false).length,
  },
]);

const isKabupatenRejected = computed(() => {
  return bpdpValidations.value.rabFinal.valid === false || bpdpValidations.value.skCpcl.valid === false || bpdpValidations.value.baVerifikasi.valid === false || bpdpValidations.value.baVerifikasiLapangan.valid === false;
});

const isProvinsiRejected = computed(() => {
  return bpdpValidations.value.suratPengantarProv.valid === false;
});

const isDitjenbunVerifRejected = computed(() => {
  return bpdpValidations.value.rekomtek.valid === false;
});

const isBpdpVerifRejected = computed(() => {
  return bpdpValidations.value.kelayakan.valid === false;
});

const canPushback = computed(() => {
  if (rejectedInspectDocs.value.length === 0) return false;
  return rejectedInspectDocs.value.every((d) => d.state.note && d.state.note.trim().length > 0);
});

const showMultiTierPushbackModal = ref(false);
const selectedPushbackTier = ref<'KABUPATEN' | 'PROVINSI' | 'DITJENBUN_VERIFIKATOR' | 'BPDP_VERIFIKATOR'>('KABUPATEN');

const pushbackTiers = computed(() => [
  {
    id: 'KABUPATEN' as const,
    label: 'Dinas Kabupaten/Kota',
    subLabel: 'Revisi berkas Kabupaten (RAB Final, SK CPCL, BA Verifikasi, BA Lapangan)',
    targetStatus: 'REV_FROM_PROV' as const,
    isEnabled: isKabupatenRejected.value,
    disabledReason: 'Tidak ada dokumen Kabupaten yang ditolak',
  },
  {
    id: 'PROVINSI' as const,
    label: 'Dinas Provinsi',
    subLabel: 'Revisi berkas Provinsi (Surat Pengantar SK CPCL)',
    targetStatus: 'REV_FROM_DITJEN_VERIF' as const,
    isEnabled: isProvinsiRejected.value,
    disabledReason: 'Surat Pengantar Provinsi tidak ditolak',
  },
  {
    id: 'DITJENBUN_VERIFIKATOR' as const,
    label: 'Ditjenbun Verifikator',
    subLabel: 'Revisi berkas Ditjenbun (Rekomendasi Teknis / REKOMTEK)',
    targetStatus: 'REV_FROM_DITJEN_APPR' as const,
    isEnabled: isDitjenbunVerifRejected.value,
    disabledReason: 'Rekomtek Ditjenbun tidak ditolak',
  },
  {
    id: 'BPDP_VERIFIKATOR' as const,
    label: 'BPDP Verifikator',
    subLabel: 'Revisi berkas BPDP (Laporan Keputusan Penelitian)',
    targetStatus: 'REV_FROM_BPDP_APPR' as const,
    isEnabled: isBpdpVerifRejected.value,
    disabledReason: 'Keputusan Penelitian BPDP tidak ditolak',
  },
]);

function openPushbackModal() {
  if (rejectedInspectDocs.value.length === 0) {
    toast.error('Tandai minimal satu dokumen yang ditolak untuk melakukan pengembalian usulan.', 'Validasi Gagal');
    return;
  }
  const emptyNotes = rejectedInspectDocs.value.filter((d) => !d.state.note || !d.state.note.trim());
  if (emptyNotes.length > 0) {
    toast.error(`Mohon isi catatan alasan penolakan pada dokumen: ${emptyNotes.map((d) => d.title).join(', ')}`, 'Catatan Wajib Diisi');
    return;
  }

  const firstEnabled = pushbackTiers.value.find((t) => t.isEnabled);
  if (firstEnabled) {
    selectedPushbackTier.value = firstEnabled.id;
  }
  showMultiTierPushbackModal.value = true;
}

async function handleConfirmMultiTierPushback() {
  const chosenTier = pushbackTiers.value.find((t) => t.id === selectedPushbackTier.value);
  if (!chosenTier || !chosenTier.isEnabled) {
    toast.error('Tujuan pengembalian yang dipilih tidak valid atau dinonaktifkan.', 'Aksi Ditolak');
    return;
  }

  isSubmitting.value = true;
  try {
    const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;

    const notesSummary = ['[Catatan Penolakan Hasil Audit BPDP]:', ...rejectedInspectDocs.value.map((d) => `- ${d.title} (${d.subtitle}): ${d.state.note.trim()}`)].join('\n');

    const pDocs = (pengajuan.value as any)?.documents || (pengajuan.value as any)?.dokumen || [];
    const validationPayloads = rejectedInspectDocs.value
      .map((d) => {
        let docIdNum = Number(d.state.docId) || 0;
        if (!docIdNum && Array.isArray(pDocs)) {
          const found = pDocs.find((docItem: any) => {
            const dt = String(docItem.document_type || docItem.tipeDokumen || '')
              .toUpperCase()
              .replace(/[-_]/g, '');
            const target = String(d.state.documentType || '')
              .toUpperCase()
              .replace(/[-_]/g, '');
            return dt === target;
          });
          if (found && found.id !== undefined) {
            docIdNum = Number(String(found.id).replace(/[^\d]/g, '')) || 0;
          }
        }

        return {
          dokumen_proposal_id: docIdNum || undefined,
          proposal_document_id: docIdNum || undefined,
          pengajuan_id: proposalIdNum,
          proposal_id: proposalIdNum,
          document_type: d.state.documentType,
          is_valid: false,
          notes: d.state.note.trim(),
          validated_by_role: authStore.activeRole || 'BPDP_APPROVAL',
        };
      })
      .filter((payload) => payload.dokumen_proposal_id && payload.dokumen_proposal_id > 0);

    if (validationPayloads.length > 0) {
      try {
        await proposalService.bulkProposalValidations(validationPayloads);
      } catch (valErr) {
        console.warn('Gagal menyimpan catatan validasi bulk:', valErr);
      }
    }

    await proposalService.update(proposalIdNum, {
      status: chosenTier.targetStatus,
      notes: notesSummary,
    });

    toast.warning(`Usulan berhasil dikembalikan ke ${chosenTier.label} dengan status ${chosenTier.targetStatus}.`, 'Usulan Dikembalikan');
    showMultiTierPushbackModal.value = false;

    if (authStore.activeRole === 'BPDP_VERIFIKATOR' || route.query.from === 'sk-dirut') {
      router.push('/bpdp/sk-dirut');
    } else {
      router.push('/bpdp/riwayat-selesai');
    }
  } catch (err: any) {
    toast.error(err.message || 'Gagal mengembalikan usulan', 'Terjadi Kesalahan');
  } finally {
    isSubmitting.value = false;
  }
}

/** Standard BPDP Approval workflow computed logic (for pending approval) */
const bpdpDocumentList = computed(() => [
  {
    key: 'rekomtek',
    title: 'Rekomendasi Teknis Ditjenbun',
    subtitle: (activeUsulan.value as any)?.rekomtek?.nomorRekomtek || (activeUsulan.value as any)?.no_rekomtek ? `Nomor: ${(activeUsulan.value as any)?.rekomtek?.nomorRekomtek || (activeUsulan as any)?.no_rekomtek}` : undefined,
    state: bpdpValidations.value.rekomtek,
  },
  {
    key: 'baVerifikasi',
    title: 'Berita Acara Hasil Penelitian Dokumen',
    subtitle: 'Dokumen Berita Acara',
    state: bpdpValidations.value.baVerifikasi,
  },
  {
    key: 'baVerifikasiLapangan',
    title: 'Berita Acara Verifikasi Lapangan',
    subtitle: 'Dokumen BA Lapangan',
    state: bpdpValidations.value.baVerifikasiLapangan,
  },
  {
    key: 'skCpcl',
    title: 'Surat Keputusan CPCL',
    subtitle: 'Dari Dinas Kabupaten',
    state: bpdpValidations.value.skCpcl,
  },
  {
    key: 'suratPengantarProv',
    title: 'Surat Pengantar SK CPCL',
    subtitle: 'Dari Dinas Provinsi',
    state: bpdpValidations.value.suratPengantarProv,
  },
]);

const rejectedBpdpDocs = computed(() => {
  return bpdpDocumentList.value.filter((d) => d.state.valid === false);
});

const bpdpDocumentsByAuthority = computed(() => [
  {
    tier: AUTHORITY_CONFIG.KABUPATEN,
    docs: bpdpDocumentList.value.filter((d) => ['skCpcl', 'baVerifikasi', 'baVerifikasiLapangan'].includes(d.key)),
  },
  {
    tier: AUTHORITY_CONFIG.PROVINSI,
    docs: bpdpDocumentList.value.filter((d) => d.key === 'suratPengantarProv'),
  },
  {
    tier: AUTHORITY_CONFIG.DITJENBUN,
    docs: bpdpDocumentList.value.filter((d) => d.key === 'rekomtek'),
  },
]);

const isAllProposalDocsApproved = computed(() => {
  return rejectedBpdpDocs.value.length === 0;
});

const hasProposalDocRejections = computed(() => {
  return rejectedBpdpDocs.value.length > 0;
});

const isKelayakanApproved = computed(() => kelayakanVerif.value.status === 'APPROVED');
const isKelayakanRejected = computed(() => kelayakanVerif.value.status === 'REJECTED');

const showApproveButton = computed(() => {
  return isKelayakanApproved.value && isAllProposalDocsApproved.value;
});

const showRevisionButton = computed(() => {
  if (isReadonly.value) return false;
  return isKelayakanRejected.value || (isKelayakanApproved.value && hasProposalDocRejections.value);
});

const canReturnToBpdpVerifikator = computed(() => isKelayakanRejected.value);
const canReturnToDitjenbunApproval = computed(() => hasProposalDocRejections.value);

const isAllBpdpDocsApproved = computed(() => isAllProposalDocsApproved.value);
const hasBpdpDocValidationIssues = computed(() => hasProposalDocRejections.value);
const canApprove = computed(() => showApproveButton.value);

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parsePolygonCoords(raw: string): Array<[number, number]> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .map((p: any) => {
          if (Array.isArray(p) && p.length >= 2) return [Number(p[0]), Number(p[1])] as [number, number];
          if (typeof p === 'object' && p !== null && 'lat' in p && 'lng' in p) return [Number(p.lat), Number(p.lng)] as [number, number];
          return null;
        })
        .filter((item): item is [number, number] => item !== null && Number.isFinite(item[0]) && Number.isFinite(item[1]));
    }
  } catch {
    /* fall through */
  }
  const lines = raw
    .split(/[\n;]/)
    .map((l) => l.trim())
    .filter(Boolean);
  const coords = lines
    .map((line) => {
      const [latStr, lngStr] = line.split(',').map((s) => s.trim());
      const lat = Number(latStr);
      const lng = Number(lngStr);
      return [lat, lng] as [number, number];
    })
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  if (coords.length >= 3) return coords;
  const points = parseCoordinatePolygon(raw);
  return points.filter((pt) => pt.lat !== null && pt.lng !== null).map((pt) => [pt.lat!, pt.lng!] as [number, number]);
}

function extractLahanCoords(lahan?: any): Array<[number, number]> {
  if (!lahan) return [];
  if (Array.isArray(lahan.coordinates)) {
    return lahan.coordinates.filter((c: any) => c && typeof c.lat === 'number' && typeof c.lng === 'number').map((c: any) => [c.lat, c.lng] as [number, number]);
  }
  if (typeof lahan.koordinatPoligon === 'string') {
    return parsePolygonCoords(lahan.koordinatPoligon);
  }
  return [];
}

const activePolygons = computed(() => {
  if (currentSpatialOverlap.value?.active_polygons?.length) {
    return currentSpatialOverlap.value.active_polygons.map((poly: any) => ({
      coordinates: (poly.coordinates || []).map((c: any) => (Array.isArray(c) ? [Number(c[0]), Number(c[1])] : [Number(c.lat), Number(c.lng)])) as [number, number][],
      label: poly.label || poly.nama_pekebun || 'Lahan Pekebun',
    }));
  }

  const u = activeUsulan.value as any;
  if (u?.lahans && u.lahans.length > 0) {
    return u.lahans.flatMap((lahan: any, idx: number) => {
      const coords = extractLahanCoords(lahan);
      if (coords.length < 3) return [];
      const pekebunFromProp = (u?.pekebuns ?? []).find((p: any) => p.id === lahan.pekebun_id || String(p.id) === String(lahan.pekebun_id));
      return [{ coordinates: coords, label: pekebunFromProp?.name || pekebunFromProp?.nama || `Lahan Pekebun ${idx + 1}` }];
    });
  }

  if (u?.pekebunList) {
    return u.pekebunList.flatMap((p: any) => {
      const coords = extractLahanCoords(p.lahan);
      if (coords.length < 3) return [];
      return [{ coordinates: coords, label: p.nama || 'Lahan Pekebun' }];
    });
  }
  return [];
});

const nearbyProposals = computed(() => {
  if (currentSpatialOverlap.value?.other_proposals?.length) {
    return currentSpatialOverlap.value.other_proposals.map((np: any) => ({
      proposalId: String(np.proposalId || np.proposal_id || np.id),
      proposalNumber: np.proposalNumber || np.proposal_number || '',
      proposalName: np.proposalName || np.proposal_name || '',
      polygons: (np.polygons || []).map((p: any) => ({
        coordinates: p.coordinates || [],
        label: p.label || 'Lahan',
      })),
      distance: np.distance,
    }));
  }

  if (activePolygons.value.length === 0) return [];
  const activeCentroid = activePolygons.value[0].coordinates
    .reduce((acc: [number, number], [lat, lng]: [number, number]) => [acc[0] + lat, acc[1] + lng] as [number, number], [0, 0])
    .map((v: number) => v / activePolygons.value[0].coordinates.length) as [number, number];

  return store.usulans
    .filter((u) => String(u.id) !== String(usulanId))
    .filter((u) => {
      if (!u.pekebunList || u.pekebunList.length === 0) return false;
      return u.pekebunList.some((p) => {
        const coords = extractLahanCoords(p.lahan);
        if (coords.length < 3) return false;
        const centroid = coords.reduce((acc: [number, number], [lat, lng]: [number, number]) => [acc[0] + lat, acc[1] + lng] as [number, number], [0, 0]).map((v: number) => v / coords.length) as [number, number];
        return haversineDistance(activeCentroid[0], activeCentroid[1], centroid[0], centroid[1]) <= 50;
      });
    })
    .map((u) => ({
      proposalId: String(u.id),
      proposalNumber: u.nomorUsulan,
      proposalName: u.namaKelompokTani,
      polygons: u.pekebunList!.flatMap((p) => {
        const coords = extractLahanCoords(p.lahan);
        if (coords.length < 3) return [];
        return [{ coordinates: coords, label: p.nama }];
      }),
    }))
    .filter((p) => p.polygons.length > 0);
});

onMounted(async () => {
  const allowedRoles = ['BPDP_APPROVAL', 'BPDP_VERIFIKATOR', 'SUPERADMIN', 'ADMIN'];
  if (!allowedRoles.includes(authStore.activeRole || '')) {
    toast.error('Akses ditolak: Anda tidak memiliki otoritas untuk mengakses halaman ini', 'Forbidden');
    router.push('/access-denied');
    return;
  }

  pageLoading.value = true;
  try {
    await Promise.allSettled([pengusulanStore.getProposalDetail(usulanId), loadSpatialOverlap(usulanId)]);

    if (!pengajuan.value) {
      const item = await store.fetchUsulanById(usulanId);
      if (!item) {
        toast.error('Usulan tidak ditemukan', 'Error');
        router.push(backRoute.value);
        return;
      }
    }

    syncProposalDocuments();
    await loadProposalDocumentValidations();
  } catch (err: any) {
    console.error('Gagal memuat usulan BPDP Approval:', err);
    toast.error(err.message || 'Gagal memuat usulan', 'Error');
  } finally {
    pageLoading.value = false;
  }
});

watch(
  () => usulanId,
  async (newId) => {
    if (newId) {
      pageLoading.value = true;
      try {
        await Promise.allSettled([pengusulanStore.getProposalDetail(newId), loadSpatialOverlap(newId)]);

        if (!pengajuan.value) {
          await store.fetchUsulanById(newId);
        }

        syncProposalDocuments();
        await loadProposalDocumentValidations();
      } finally {
        pageLoading.value = false;
      }
    }
  },
);

watch(
  () => pengajuan.value,
  () => {
    syncProposalDocuments();
  },
  { deep: true },
);

const handleApprove = () => {
  if (isReadonly.value) return;
  if (!canApprove.value || hasBpdpDocValidationIssues.value) {
    toast.error('Tidak dapat menyetujui usulan: masih terdapat dokumen proposal yang ditolak pada Hasil Penelitian Dokumen Usulan.', 'Validasi Belum Sesuai');
    return;
  }
  confirmActionType.value = 'approve';
  confirmDestination.value = 'Penerbitan SK Dirut';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;
      const validationPayloads: any[] = [];
      if (kelayakanDoc.value?.id) {
        validationPayloads.push({
          dokumen_proposal_id: Number(kelayakanDoc.value.id),
          proposal_document_id: Number(kelayakanDoc.value.id),
          pengajuan_id: proposalIdNum,
          proposal_id: proposalIdNum,
          document_type: 'KEPUTUSAN_KELAYAKAN',
          is_valid: true,
          notes: 'Laporan penelitian usulan disetujui Kadiv BPDP.',
          validated_by_role: 'BPDP_APPROVAL',
        });
      }

      await verifikasiBPDPStore.approveByKadiv(usulanId, {
        validations: validationPayloads,
        kelayakanDocId: kelayakanDoc.value?.id,
        notes: 'Laporan penelitian usulan disetujui Kadiv BPDP.',
      });

      await store.approveBpdpKadiv(usulanId, 'Laporan penelitian usulan disetujui Kadiv BPDP.', authStore.user?.name || 'Kadiv BPDP');
      toast.success('Penelitian rekomtek disetujui, siap diterbitkan SK Dirut.', 'Disetujui');
      showConfirmModal.value = false;
      router.push(backRoute.value);
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyetujui Laporan Penelitian');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
};

const showRevisionDropdown = ref(false);

const handleReturnForRevision = (target: 'BPDP_VERIFIKATOR' | 'DITJENBUN_APPROVAL') => {
  showRevisionDropdown.value = false;

  if (target === 'BPDP_VERIFIKATOR' && !canReturnToBpdpVerifikator.value) {
    toast.error('Pengembalian ke Verifikator BPDP tidak diizinkan karena dokumen penelitian telah disetujui.', 'Aksi Tidak Diizinkan');
    return;
  }
  if (target === 'DITJENBUN_APPROVAL' && !canReturnToDitjenbunApproval.value) {
    toast.error('Pengembalian ke Ditjenbun Approval tidak diizinkan karena seluruh dokumen usulan telah disetujui.', 'Aksi Tidak Diizinkan');
    return;
  }

  const autoNotes = rejectedBpdpDocs.value.length > 0 ? `Terdapat dokumen usulan yang belum sesuai: ${rejectedBpdpDocs.value.map((d) => `${d.title}${d.state.note ? ` (${d.state.note})` : ''}`).join('; ')}` : '';
  const effectiveNotes = kelayakanVerif.value.notes.trim() || autoNotes;

  if (!effectiveNotes.trim()) {
    toast.error('Mohon berikan catatan alasan pengembalian usulan.', 'Validasi Gagal');
    return;
  }

  const isDitjenbun = target === 'DITJENBUN_APPROVAL';
  const targetStatus = isDitjenbun ? 'REV_FROM_BPDP_VERIF' : 'REV_FROM_BPDP_APPR';
  const destinationLabel = isDitjenbun ? 'Ditjenbun Approval (Revisi)' : 'Verifikator BPDP (Revisi Internal)';

  confirmActionType.value = 'reject';
  confirmDestination.value = destinationLabel;
  confirmNotes.value = effectiveNotes;

  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;
      const validationPayloads: any[] = [];
      if (kelayakanDoc.value?.id) {
        validationPayloads.push({
          dokumen_proposal_id: Number(kelayakanDoc.value.id),
          proposal_document_id: Number(kelayakanDoc.value.id),
          pengajuan_id: proposalIdNum,
          proposal_id: proposalIdNum,
          document_type: 'KEPUTUSAN_KELAYAKAN',
          is_valid: isKelayakanApproved.value ? true : false,
          notes: effectiveNotes,
          validated_by_role: 'BPDP_APPROVAL',
        });
      }

      await verifikasiBPDPStore.submitForRevision(usulanId, {
        validations: validationPayloads,
        kelayakanDocId: kelayakanDoc.value?.id,
        notes: effectiveNotes,
        status: targetStatus,
      });

      if (isDitjenbun) {
        await store.returnRekomtekToDitjenbun(usulanId, `Laporan Penelitian: ${effectiveNotes}`, authStore.user?.name || 'Kadiv BPDP');
        toast.warning('Usulan dikembalikan ke Ditjenbun untuk perbaikan rekomendasi teknis.', 'Kembali untuk Revisi');
      } else {
        toast.warning('Usulan dikembalikan ke Verifikator BPDP untuk perbaikan telaah penelitian.', 'Kembali untuk Revisi');
      }

      showConfirmModal.value = false;
      router.push(backRoute.value);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengembalikan usulan');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
};

const executePendingAction = async () => {
  if (!pendingConfirmAction.value) return;
  await pendingConfirmAction.value();
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <router-link :to="backRoute" class="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ChevronLeft class="w-5 h-5" />
        </router-link>
        <Breadcrumb />
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1" v-if="activeUsulan">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2 flex-wrap">
            <Badge :variant="getRoleAwareStatusVariant(activeUsulan.status || (activeUsulan as any).currentStatus, 'BPDP_APPROVAL')">Status: {{ getRoleAwareStatusLabel(activeUsulan.status || (activeUsulan as any).currentStatus, 'BPDP_APPROVAL') }}</Badge>
            <span
              v-if="isInspectMode"
              class="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1"
            >
              <Eye class="w-3.5 h-3.5" />
              Mode Inspeksi & Validasi Dokumen
            </span>
            <span v-else class="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 rounded-md"> Kadiv BPDP Approval </span>
            <span class="text-[11px] font-mono text-slate-400">ID: {{ activeUsulan.id }}</span>
          </div>
          <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white font-apple-display-lg mt-1">
            {{ (activeUsulan as any).lembaga?.namaLembaga || (activeUsulan as any).kelembagaan?.nama_lembaga || (activeUsulan as any).namaKelompokTani || 'Lembaga Pengusul' }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Nomor Pengusulan: <span class="font-semibold text-slate-800 dark:text-slate-200">{{ (activeUsulan as any).nomor_proposal || (activeUsulan as any).nomorProposal || (activeUsulan as any).nomorUsulan || '-' }}</span>
          </p>
        </div>
        <div>
          <Button variant="primary" size="sm" @click="showAuditTrail = !showAuditTrail">
            <History class="w-4 h-4" />
            <span>Lihat Riwayat</span>
          </Button>
        </div>
      </div>
    </header>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-20 w-full rounded-2xl" />
      <Skeleton class="h-60 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <div v-else-if="activeUsulan" class="flex flex-col gap-5">
      <!-- 2-Step Progress Indicator -->
      <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2">
          <div v-for="(st, idx) in steps" :key="st.id" class="flex items-center gap-2 flex-1">
            <!-- Step Badge Button -->
            <button
              type="button"
              @click="currentStep = st.id"
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 cursor-pointer',
                currentStep === st.id
                  ? 'bg-[#066C2A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-200 dark:ring-emerald-800 scale-110'
                  : currentStep > st.id
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-[#066C2A] dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
              ]"
            >
              <component :is="st.icon" class="w-4 h-4" />
            </button>

            <!-- Step Label -->
            <div class="flex-col min-w-0 hidden sm:flex cursor-pointer" @click="currentStep = st.id">
              <span :class="['text-xs font-bold leading-tight truncate', currentStep === st.id ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-500']">{{ st.title }}</span>
              <span class="text-[10px] text-slate-400 truncate">{{ st.description }}</span>
            </div>

            <!-- Connector Bar (not on last) -->
            <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-2 rounded-full relative overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 min-w-8">
              <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: currentStep > st.id ? '100%' : '0%' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Pratinjau Pekebun & Dokumen -->
      <div v-if="currentStep === 1" class="flex flex-col gap-5">
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <PratinjauPekebunDanDokumenTab :usulan="activeUsulan" :active-polygons="activePolygons" :other-proposals="nearbyProposals" />
        </div>

        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <router-link :to="backRoute">
            <Button variant="outline" size="sm" class="flex items-center gap-1.5 cursor-pointer">
              <ChevronLeft class="w-4 h-4" />
              <span>{{ backLabel }}</span>
            </Button>
          </router-link>
          <button type="button" @click="currentStep = 2" class="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#066C2A] hover:bg-emerald-800 text-white transition-all shadow-sm active:scale-95 cursor-pointer">
            <span>{{ isInspectMode ? 'Lanjut ke Inspeksi Dokumen' : 'Lanjut ke Persetujuan Kelayakan' }}</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Inspeksi Dokumen (Inspect Mode) ATAU Persetujuan Kelayakan (Regular Mode) -->
      <div v-else-if="currentStep === 2" class="flex flex-col gap-5">
        <!-- MODE 1: INSPECTION & MULTI-TIER PUSHBACK (SK_DIRUT_PUBLISHED / SELESAI) -->
        <div v-if="isInspectMode" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left Panel: 7 Official Documents to Inspect & Reject Grouped by Authority Tier -->
          <div class="lg:col-span-2 flex flex-col gap-5">
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck class="w-4.5 h-4.5 text-[#066C2A] dark:text-emerald-400" />
                  Inspeksi Dokumen Usulan Berdasarkan Kewenangan (4 Instansi / 7 Dokumen)
                </h3>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  Status: Selesai / SK Terbit
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dokumen dikelompokkan berdasarkan instansi penerbit. Jika ditemukan ketidaksesuaian pasca-terbit, klik tombol <strong>Tolak</strong> pada dokumen terkait dan sertakan catatan alasan penolakan untuk mengembalikan usulan
                sesuai tier instansi.
              </p>
            </div>

            <!-- 4 Authority Section Cards -->
            <div class="flex flex-col gap-5">
              <AuthorityDocumentSectionCard
                v-for="section in inspectDocumentsByAuthority"
                :key="section.tier.id"
                :tier="section.tier"
                :total-docs="section.docs.length"
                :rejected-count="section.rejectedCount"
                :status-text="section.rejectedCount === 0 ? 'Semua Berkas Sesuai' : undefined"
              >
                <div class="flex flex-col gap-3">
                  <div
                    v-for="(docItem, idx) in section.docs"
                    :key="docItem.key"
                    :class="[
                      'p-4 rounded-xl border transition-all duration-200 flex flex-col gap-3',
                      docItem.state.valid === false ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-sm' : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300',
                    ]"
                  >
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-start gap-3 min-w-0">
                        <div
                          :class="[
                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5',
                            docItem.state.valid === false
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
                          ]"
                        >
                          <component :is="docItem.state.valid === false ? X : FileText" class="w-4.5 h-4.5" />
                        </div>
                        <div class="flex flex-col min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-[13px] font-bold text-slate-900 dark:text-white">{{ idx + 1 }}. {{ docItem.title }}</span>
                            <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded border', section.tier.badgeClass]">
                              {{ section.tier.roleLabel }}
                            </span>
                          </div>
                          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Berkas: {{ docItem.state.fileName || 'Dokumen Tersedia' }}</p>
                        </div>
                      </div>

                      <!-- Action Buttons: Preview, Download, Reject Toggle -->
                      <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <!-- Preview Button -->
                        <button
                          v-if="docItem.state.url"
                          type="button"
                          title="Pratinjau Dokumen"
                          class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          @click="openUrlPreview(docItem.state.url, docItem.title)"
                        >
                          <Eye class="w-3.5 h-3.5 text-slate-500" />
                          <span>Pratinjau</span>
                        </button>

                        <!-- Exclusive Reject Toggle Button -->
                        <button
                          type="button"
                          @click="toggleRejectInspectDoc(docItem.key)"
                          :class="[
                            'h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-xs',
                            docItem.state.valid === false
                              ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-500/20'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 hover:border-rose-300',
                          ]"
                        >
                          <X class="w-3.5 h-3.5" />
                          <span>{{ docItem.state.valid === false ? 'Ditolak' : 'Tolak' }}</span>
                        </button>
                      </div>
                    </div>

                    <!-- Rejection Notes Input when Rejected -->
                    <div v-if="docItem.state.valid === false" class="pt-2 border-t border-rose-200 dark:border-rose-900/60 flex flex-col gap-1.5">
                      <label class="text-[11px] font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <AlertCircle class="w-3.5 h-3.5" />
                        Catatan Alasan Penolakan Dokumen *
                      </label>
                      <textarea
                        v-model="docItem.state.note"
                        rows="2"
                        placeholder="Tuliskan catatan alasan mengapa dokumen ini ditolak..."
                        class="w-full px-3 py-2 border border-rose-300 dark:border-rose-800 rounded-lg text-xs bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </AuthorityDocumentSectionCard>
            </div>
          </div>

          <!-- Right Panel: Summary & Pushback Action -->
          <div class="flex flex-col gap-5">
            <!-- Summary of Audit Findings -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div class="flex flex-col gap-0.5">
                  <h3 class="text-[13px] font-bold text-slate-900 dark:text-white">Ringkasan Temuan Audit</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Status dokumen yang ditolak</p>
                </div>
                <span
                  v-if="rejectedInspectDocs.length === 0"
                  class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Semua Sesuai</span>
                </span>
                <span v-else class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 shrink-0">
                  <AlertCircle class="w-3.5 h-3.5" />
                  <span>{{ rejectedInspectDocs.length }} Ditolak</span>
                </span>
              </div>

              <!-- List of Rejected Docs -->
              <div v-if="rejectedInspectDocs.length > 0" class="flex flex-col gap-2">
                <div v-for="rd in rejectedInspectDocs" :key="rd.key" class="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col gap-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-rose-900 dark:text-rose-300">{{ rd.title }}</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                      {{ rd.subtitle }}
                    </span>
                  </div>
                  <p v-if="rd.state.note" class="text-[11px] text-rose-800 dark:text-rose-400 italic">"{{ rd.state.note }}"</p>
                  <p v-else class="text-[10px] text-amber-600 dark:text-amber-400 font-medium">⚠️ Catatan penolakan belum diisi</p>
                </div>
              </div>
              <div v-else class="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center gap-1.5">
                <CheckCircle2 class="w-6 h-6 text-emerald-500" />
                <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">Belum ada dokumen yang ditolak</p>
                <p class="text-[11px] text-slate-400 leading-tight">Klik tombol "Tolak" pada dokumen di sebelah kiri jika ingin melakukan pengembalian usulan.</p>
              </div>

              <!-- Main Pushback Action Button -->
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  @click="openPushbackModal"
                  :disabled="!canPushback || isSubmitting"
                  :class="[
                    'w-full h-11 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm',
                    canPushback && !isSubmitting
                      ? 'text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] cursor-pointer ring-2 ring-rose-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700',
                  ]"
                >
                  <Undo2 class="w-4 h-4" />
                  <span>Kembalikan Usulan (Pushback)</span>
                </button>
                <p v-if="!canPushback" class="text-[10px] text-slate-400 text-center">
                  {{ rejectedInspectDocs.length === 0 ? 'Tandai minimal 1 dokumen yang ditolak untuk mengaktifkan tombol' : 'Lengkapi seluruh catatan alasan penolakan dokumen' }}
                </p>
              </div>
            </div>

            <!-- Logs timeline -->
            <LogStatusUsulan :logs="(activeUsulan as any).logs" />
          </div>
        </div>

        <!-- MODE 2: REGULAR APPROVAL PENDING WORKFLOW -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left Panel: Penelitian Laporan BPDP -->
          <div class="lg:col-span-2 flex flex-col gap-5">
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">Penelitian Laporan BPDP</h3>
                  <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/50"> Laporan Keputusan </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Penelitian berkas keputusan dari Peneliti BPDP dan tentukan persetujuan.</p>
              </div>

              <!-- Laporan Penelitian Card Container -->
              <div class="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden bg-white dark:bg-slate-950">
                <div class="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center shrink-0">
                      <FileCheck class="w-4.5 h-4.5 text-[#066C2A] dark:text-emerald-400" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <p class="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">Laporan Keputusan Hasil Penelitian Rekomtek</p>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">Dokumen: {{ kelayakanDoc?.fileName || 'laporan_kelayakan.pdf' }}</p>
                    </div>
                  </div>

                  <!-- Action Buttons (Agree / Reject) -->
                  <div v-if="!isReadonly" class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      @click="toggleVerif('APPROVED')"
                      :class="[
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 cursor-pointer',
                        kelayakanVerif.status === 'APPROVED'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 hover:border-emerald-300',
                      ]"
                    >
                      <Check class="w-3.5 h-3.5" />
                      <span>Setuju</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleVerif('REJECTED')"
                      :class="[
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 cursor-pointer',
                        kelayakanVerif.status === 'REJECTED'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 hover:border-rose-300',
                      ]"
                    >
                      <X class="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>

                  <!-- Readonly Status Badges -->
                  <div v-else class="flex items-center gap-2 shrink-0">
                    <div class="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/50"><Check class="w-3.5 h-3.5" /> Disetujui</div>
                  </div>
                </div>

                <div class="p-4 flex flex-col gap-3.5">
                  <div class="flex flex-col gap-1">
                    <span class="text-[11px] font-semibold text-slate-400 uppercase">Status Dokumen</span>
                    <span class="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                      {{ kelayakanDoc?.fileUrl ? 'Tersedia & Siap Divalidasi' : 'Belum diunggah' }}
                    </span>
                  </div>

                  <!-- Preview Button -->
                  <div v-if="kelayakanDoc?.fileUrl" class="flex flex-col gap-1.5">
                    <button
                      type="button"
                      class="w-full h-9 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/80 text-[#066C2A] dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      @click="openUrlPreview(kelayakanDoc.fileUrl, 'Pratinjau Laporan Keputusan')"
                    >
                      <Eye class="w-4 h-4" />
                      <span>Pratinjau Dokumen Laporan Keputusan</span>
                    </button>
                    <div v-if="kelayakanDoc?.uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400">
                      Diunggah oleh {{ kelayakanDoc.uploadedBy }}<template v-if="kelayakanDoc.uploadedAtFormatted"> • {{ kelayakanDoc.uploadedAtFormatted }}</template>
                    </div>
                  </div>
                  <div v-else class="flex items-center justify-center h-9 rounded-lg border border-amber-200 bg-amber-50/50 text-amber-700 text-[11px] font-semibold">Dokumen Laporan Keputusan belum diunggah oleh Peneliti BPDP</div>

                  <!-- Rejection / Revision Notes -->
                  <div v-if="showRevisionButton" class="flex flex-col gap-1.5 pt-1">
                    <label class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {{ isKelayakanApproved ? 'Catatan Pengembalian ke Ditjenbun' : 'Catatan Penolakan untuk Verifikator / Ditjenbun' }}
                    </label>
                    <textarea
                      v-model="kelayakanVerif.notes"
                      :disabled="isReadonly"
                      rows="2"
                      :placeholder="isKelayakanApproved ? 'Tuliskan catatan tambahan pengembalian ke Ditjenbun (catatan dokumen yang ditolak otomatis disertakan)...' : 'Tuliskan catatan alasan penolakan dokumen Keputusan Penelitian...'"
                      class="w-full px-3 py-2 border border-rose-200 dark:border-rose-900/50 rounded-lg text-[12px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:cursor-not-allowed"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Action Card (Setujui / Kembalikan) -->
              <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                <div v-if="isReadonly" class="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 class="w-4 h-4 text-emerald-500" />
                  <span>Status usulan sudah diproses ({{ activeUsulan.status || (activeUsulan as any).currentStatus }}). Tindakan persetujuan dikunci.</span>
                </div>

                <div v-else class="flex flex-col gap-3.5">
                  <div v-if="kelayakanVerif.status === 'PENDING'" class="flex gap-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3 rounded-xl">
                    <FileText class="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <p class="text-[12px] text-amber-700 dark:text-amber-400 leading-normal">
                      Silakan tentukan keputusan (<strong>Setuju</strong> / <strong>Tolak</strong>) pada Laporan Penelitian <strong>Laporan Keputusan</strong> di atas terlebih dahulu.
                    </p>
                  </div>

                  <div v-if="isKelayakanApproved && hasProposalDocRejections" class="flex gap-2.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl">
                    <AlertCircle class="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-bold text-amber-900 dark:text-amber-300">Dokumen Usulan Belum Sesuai</span>
                      <p class="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                        Dokumen <strong>Laporan Keputusan</strong> disetujui, namun terdapat dokumen usulan yang ditolak pada <strong>Hasil Penelitian Dokumen Usulan</strong> ({{ rejectedBpdpDocs.map((d) => d.title).join(', ') }}). Tombol
                        persetujuan dinonaktifkan dan usulan harus dikembalikan ke <strong>Ditjenbun Approval</strong> untuk perbaikan.
                      </p>
                    </div>
                  </div>

                  <div v-if="isKelayakanRejected && !hasProposalDocRejections" class="flex gap-2.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                    <AlertCircle class="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-bold text-rose-800 dark:text-rose-300">Laporan Penelitian Ditolak</span>
                      <p class="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">Dokumen <strong>Laporan Keputusan</strong> ditolak. Usulan dikembalikan ke <strong>Verifikator BPDP</strong> untuk perbaikan telaah kelayakan.</p>
                    </div>
                  </div>

                  <div v-if="isKelayakanRejected && hasProposalDocRejections" class="flex gap-2.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                    <AlertCircle class="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-bold text-rose-800 dark:text-rose-300">Laporan Penelitian & Dokumen Usulan Ditolak</span>
                      <p class="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                        Dokumen <strong>Laporan Keputusan</strong> dan dokumen usulan ({{ rejectedBpdpDocs.map((d) => d.title).join(', ') }}) ditolak. Usulan dapat dikembalikan ke <strong>Verifikator BPDP</strong> atau
                        <strong>Ditjenbun Approval</strong>.
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      @click="handleApprove"
                      :disabled="!showApproveButton || isSubmitting"
                      :class="[
                        'flex-1 w-full h-10 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm',
                        showApproveButton && !isSubmitting ? 'text-white bg-[#066C2A] hover:bg-[#065A23] active:scale-[0.98] cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed',
                      ]"
                    >
                      <CheckCircle class="w-4 h-4" />
                      <span>Setujui Penelitian (Terbitkan SK Dirut)</span>
                    </button>

                    <div v-if="showRevisionButton" class="relative w-full sm:w-auto flex-1 sm:flex-initial">
                      <button
                        type="button"
                        @click="showRevisionDropdown = !showRevisionDropdown"
                        :disabled="isSubmitting"
                        class="w-full sm:w-auto px-5 h-10 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shrink-0 text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] cursor-pointer ring-2 ring-rose-500/20"
                      >
                        <XCircle class="w-4 h-4" />
                        <span>Kembalikan untuk Perbaikan</span>
                        <ChevronDown class="w-3.5 h-3.5 transition-transform duration-200" :class="{ 'rotate-180': showRevisionDropdown }" />
                      </button>

                      <Transition
                        enter-active-class="transition duration-150 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-100 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0"
                      >
                        <div
                          v-if="showRevisionDropdown"
                          class="absolute right-0 bottom-full mb-2 sm:bottom-auto sm:top-full sm:mt-2 w-76 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 flex flex-col gap-1.5"
                        >
                          <div class="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">Pilih Tujuan Pengembalian:</div>

                          <button
                            type="button"
                            @click="canReturnToBpdpVerifikator ? handleReturnForRevision('BPDP_VERIFIKATOR') : null"
                            :disabled="!canReturnToBpdpVerifikator"
                            :class="[
                              'w-full text-left p-2.5 rounded-xl transition-colors flex flex-col gap-0.5 border',
                              canReturnToBpdpVerifikator
                                ? 'hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer group border-transparent hover:border-rose-200 dark:hover:border-rose-900/50'
                                : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800',
                            ]"
                          >
                            <div class="flex items-center justify-between">
                              <span :class="['text-xs font-bold flex items-center gap-1.5', canReturnToBpdpVerifikator ? 'text-slate-800 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-400' : 'text-slate-400']">
                                <UserCheck class="w-3.5 h-3.5" :class="canReturnToBpdpVerifikator ? 'text-rose-500' : 'text-slate-400'" />
                                Ke Verifikator BPDP
                              </span>
                            </div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Kembalikan ke Peneliti / Verifikator BPDP untuk perbaikan telaah penelitian</p>
                          </button>

                          <button
                            type="button"
                            @click="canReturnToDitjenbunApproval ? handleReturnForRevision('DITJENBUN_APPROVAL') : null"
                            :disabled="!canReturnToDitjenbunApproval"
                            :class="[
                              'w-full text-left p-2.5 rounded-xl transition-colors flex flex-col gap-0.5 border',
                              canReturnToDitjenbunApproval
                                ? 'hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer group border-transparent hover:border-rose-200 dark:hover:border-rose-900/50'
                                : 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800',
                            ]"
                          >
                            <div class="flex items-center justify-between">
                              <span :class="['text-xs font-bold flex items-center gap-1.5', canReturnToDitjenbunApproval ? 'text-slate-800 dark:text-slate-200 group-hover:text-rose-700 dark:group-hover:text-rose-400' : 'text-slate-400']">
                                <Send class="w-3.5 h-3.5" :class="canReturnToDitjenbunApproval ? 'text-rose-500' : 'text-slate-400'" />
                                Ke Ditjenbun Approval
                              </span>
                            </div>
                            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">Kembalikan ke Ditjenbun Approval untuk perbaikan rekomendasi teknis</p>
                          </button>
                        </div>
                      </Transition>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logs timeline -->
            <LogStatusUsulan :logs="(activeUsulan as any).logs" />
          </div>

          <!-- Right Panel: Compact Hasil Penelitian Dokumen Usulan -->
          <div class="flex flex-col gap-5">
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div class="flex flex-col gap-0.5">
                  <h3 class="text-[13px] font-semibold text-slate-900 dark:text-white">Hasil Penelitian Dokumen Usulan</h3>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">Catatan berkas oleh Peneliti BPDP</p>
                </div>
                <span
                  v-if="isAllBpdpDocsApproved"
                  class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>5/5 Dokumen Disetujui</span>
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 shrink-0"
                >
                  <AlertCircle class="w-3.5 h-3.5" />
                  <span>{{ 5 - rejectedBpdpDocs.length }}/5 Disetujui</span>
                </span>
              </div>

              <div class="flex flex-col gap-3.5">
                <div v-for="sec in bpdpDocumentsByAuthority" :key="sec.tier.id" class="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                  <!-- Sub-section Header -->
                  <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0', sec.tier.badgeClass]">
                        {{ sec.tier.roleLabel }}
                      </span>
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{ sec.tier.title }}</span>
                    </div>
                    <span class="text-[10px] text-slate-400 font-medium shrink-0"> {{ sec.docs.filter((d) => d.state.valid === true).length }}/{{ sec.docs.length }} Sesuai </span>
                  </div>

                  <!-- Documents under this tier -->
                  <div class="flex flex-col gap-2">
                    <div v-for="(docItem, dIdx) in sec.docs" :key="dIdx" class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/70 bg-white dark:bg-slate-950 flex flex-col gap-1.5 shadow-2xs">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                          <div
                            :class="[
                              'w-6 h-6 rounded-md flex items-center justify-center shrink-0 border text-[10px]',
                              docItem.state.valid === true
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/50'
                                : docItem.state.valid === false
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/50'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200/50',
                            ]"
                          >
                            <Check v-if="docItem.state.valid === true" class="w-3.5 h-3.5" />
                            <X v-else-if="docItem.state.valid === false" class="w-3.5 h-3.5" />
                            <span v-else>-</span>
                          </div>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[12px] font-medium text-slate-800 dark:text-slate-200 truncate">{{ docItem.title }}</span>
                            <span v-if="docItem.subtitle" class="text-[10px] text-slate-400 truncate">{{ docItem.subtitle }}</span>
                            <span v-if="docItem.state.uploadedBy" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              Diunggah oleh {{ docItem.state.uploadedBy }}<template v-if="docItem.state.uploadedAtFormatted"> • {{ docItem.state.uploadedAtFormatted }}</template>
                            </span>
                          </div>
                        </div>

                        <div class="flex items-center gap-1 shrink-0">
                          <span
                            :class="[
                              'text-[10px] font-semibold px-2 py-0.5 rounded border',
                              docItem.state.valid === true
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                                : docItem.state.valid === false
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200',
                            ]"
                          >
                            {{ docItem.state.valid === true ? 'Disetujui' : docItem.state.valid === false ? 'Ditolak' : 'Belum Dicek' }}
                          </span>

                          <button
                            v-if="docItem.state.url"
                            type="button"
                            title="Pratinjau Dokumen"
                            class="h-6 w-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
                            @click="openUrlPreview(docItem.state.url, docItem.title)"
                          >
                            <Eye class="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div
                        v-if="docItem.state.valid === false && docItem.state.note"
                        class="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-lg p-2 text-[11px] text-rose-800 dark:text-rose-300 font-apple-body"
                      >
                        <span class="font-semibold">Catatan Peneliti:</span> {{ docItem.state.note }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Navigation: Back to Step 1 -->
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <button
            type="button"
            @click="currentStep = 1"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Kembali ke Pratinjau</span>
          </button>
          <div />
        </div>
      </div>

      <!-- Audit Trail Sidebar -->
      <Teleport to="body">
        <div v-if="showAuditTrail" class="fixed inset-0 z-40 bg-black/20" @click="showAuditTrail = false" />
        <AuditTrailSidebar v-if="showAuditTrail" :proposal-id="usulanId" @close="showAuditTrail = false" />
      </Teleport>

      <!-- Modal 1: Regular Approval Confirmation Modal -->
      <ApprovalConfirmationModal :is-open="showConfirmModal" :action-type="confirmActionType" :destination-stage="confirmDestination" :notes="confirmNotes" @close="showConfirmModal = false" @confirm="executePendingAction" />

      <!-- Modal 2: Multi-Tier Pushback Selection Modal (Inspect Mode) -->
      <Modal :is-open="showMultiTierPushbackModal" title="Konfirmasi Pengembalian Usulan (Multi-Tier Pushback)" size="lg" @close="showMultiTierPushbackModal = false">
        <div class="flex flex-col gap-4">
          <div class="p-3 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5">
            <ShieldAlert class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div class="flex flex-col gap-0.5">
              <span class="text-xs font-bold text-amber-900 dark:text-amber-300">Pilih Instansi Tujuan Pengembalian</span>
              <p class="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                Sistem secara otomatis mengaktifkan hanya instansi yang memiliki berkas yang ditolak. Instansi tanpa dokumen yang ditolak dinonaktifkan untuk mencegah kesalahan pengembalian.
              </p>
            </div>
          </div>

          <!-- Radio List of 4 Tiers -->
          <div class="flex flex-col gap-2.5">
            <label
              v-for="tier in pushbackTiers"
              :key="tier.id"
              :class="[
                'p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 relative',
                tier.isEnabled
                  ? selectedPushbackTier === tier.id
                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-400 dark:border-rose-700 shadow-sm cursor-pointer'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/50 opacity-40 cursor-not-allowed',
              ]"
            >
              <input type="radio" name="pushback_tier" :value="tier.id" v-model="selectedPushbackTier" :disabled="!tier.isEnabled" class="mt-1 text-rose-600 focus:ring-rose-500 cursor-pointer disabled:cursor-not-allowed" />
              <div class="flex flex-col min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span :class="['text-xs font-bold', tier.isEnabled ? 'text-slate-900 dark:text-white' : 'text-slate-400']">
                    {{ tier.label }}
                  </span>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {{ tier.targetStatus }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ tier.subLabel }}
                </p>
                <p v-if="!tier.isEnabled" class="text-[10px] text-rose-500 font-medium mt-1">⛔ {{ tier.disabledReason }}</p>
              </div>
            </label>
          </div>

          <!-- Summary of Notes to be Sent -->
          <div class="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
            <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"> Ringkasan Catatan Penolakan yang Akan Disimpan: </span>
            <div class="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              <div v-for="rd in rejectedInspectDocs" :key="rd.key" class="text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span class="font-bold text-rose-600 dark:text-rose-400">• {{ rd.title }}:</span>
                <span class="ml-1">{{ rd.state.note }}</span>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" @click="showMultiTierPushbackModal = false" :disabled="isSubmitting"> Batal </Button>
            <Button type="button" variant="danger" size="sm" :loading="isSubmitting" @click="handleConfirmMultiTierPushback" class="flex items-center gap-1.5">
              <Undo2 v-if="!isSubmitting" class="w-4 h-4" />
              <span>Konfirmasi Pengembalian</span>
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Document Preview Modal -->
      <DocumentPreviewModal :is-open="showPreview && !!previewDoc" :title="previewDoc?.title ?? ''" :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? 'application/octet-stream'" @close="showPreview = false" />
    </div>
  </div>
</template>
