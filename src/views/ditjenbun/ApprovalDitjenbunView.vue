<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiDitjenbunStore } from '@/stores/verifikasiDitjenbun';
import { useRekomtekStore } from '@/stores/rekomtek';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { getJenisSarprasLabel } from '@/types/pengusulan';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import type { Proposal, SpatialOverlapResponse } from '@/types/pengusulan';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';
import LogStatusUsulan from '@/components/rekomtek/LogStatusUsulan.vue';
import PratinjauPekebunDanDokumenTab from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import { ChevronLeft, ChevronRight, Eye, CheckCircle, CheckCircle2, XCircle, Check, X, FileText, FileCheck, History, AlertCircle, Download } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const verifikasiDitjenbunStore = useVerifikasiDitjenbunStore();
const store = useRekomtekStore();
const authStore = useAuthStore();
const toast = useToast();

const usulanId = route.params.id as string;
const pageLoading = ref(true);
const isSubmitting = ref(false);
const showAuditTrail = ref(false);
const currentStep = ref(1);

const steps = [
  { id: 1, title: 'Pratinjau Pekebun & Dokumen', description: 'Tinjau Data & Lahan', icon: Eye },
  { id: 2, title: 'Review Rekomtek', description: 'Persetujuan & Keputusan', icon: FileCheck },
];



const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

const rekomtekVerif = ref<{ status: 'APPROVED' | 'REJECTED' | 'PENDING'; notes: string }>({
  status: 'PENDING',
  notes: '',
});

const toggleVerif = (newStatus: 'APPROVED' | 'REJECTED') => {
  if (isReadonly.value) return;
  rekomtekVerif.value.status = rekomtekVerif.value.status === newStatus ? 'PENDING' : newStatus;
  if (rekomtekVerif.value.status === 'APPROVED') {
    rekomtekVerif.value.notes = '';
  }
};

const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);

async function loadSpatialOverlap(proposalId: string | number) {
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

function parsePolygonCoords(raw: string): Array<[number, number]> {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed
        .filter((p: any) => p && ((Array.isArray(p) && p.length >= 2) || (typeof p.lat === 'number' && typeof p.lng === 'number')))
        .map((p: any) => {
          if (Array.isArray(p)) return [Number(p[0]), Number(p[1])] as [number, number];
          return [Number(p.lat), Number(p.lng)] as [number, number];
        })
        .filter(([lat, lng]: [number, number]) => Number.isFinite(lat) && Number.isFinite(lng));
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
        coordinates: (p.coordinates || []).map((c: any) => (Array.isArray(c) ? [Number(c[0]), Number(c[1])] : [Number(c.lat), Number(c.lng)])) as [number, number][],
        label: p.label || 'Lahan',
      })),
      distance: np.distance,
    }));
  }
  return [];
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

const isReadonly = computed(() => {
  const st = activeUsulan.value?.status || (activeUsulan.value as any)?.currentStatus;
  if (!st) return false;
  return !['DITJEN_VERIF_SUBMITTED', 'APPROVAL_DITJENBUN', 'REV_FROM_BPDP_VERIF'].includes(st);
});

interface DocValidationState {
  docId?: number;
  valid: boolean | null;
  note: string;
  url?: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAtFormatted?: string;
}

const bpdpValidations = ref<{
  rekomtek: DocValidationState;
  baVerifikasi: DocValidationState;
  baVerifikasiLapangan: DocValidationState;
  skCpcl: DocValidationState;
  suratPengantarProv: DocValidationState;
}>({
  rekomtek: { docId: undefined, valid: null, note: '', url: '', fileName: '', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasi: { docId: undefined, valid: null, note: '', url: '', fileName: '', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasiLapangan: { docId: undefined, valid: null, note: '', url: '', fileName: '', uploadedBy: '', uploadedAtFormatted: '' },
  skCpcl: { docId: undefined, valid: null, note: '', url: '', fileName: '', uploadedBy: '', uploadedAtFormatted: '' },
  suratPengantarProv: { docId: undefined, valid: null, note: '', url: '', fileName: '', uploadedBy: '', uploadedAtFormatted: '' },
});

watch(
  () => [rekomtekVerif.value.status, rekomtekVerif.value.notes],
  ([newStatus, newNotes]) => {
    if (newStatus === 'APPROVED') {
      bpdpValidations.value.rekomtek.valid = true;
      bpdpValidations.value.rekomtek.note = '';
    } else if (newStatus === 'REJECTED') {
      bpdpValidations.value.rekomtek.valid = false;
      bpdpValidations.value.rekomtek.note = String(newNotes || '');
    } else {
      bpdpValidations.value.rekomtek.valid = null;
      bpdpValidations.value.rekomtek.note = '';
    }
  },
  { immediate: true },
);

function syncProposalDocuments() {
  const p = pengajuan.value || (activeUsulan.value as any);
  if (!p) return;

  const findDoc = (docType: string) => {
    const target = docType.toUpperCase().replace(/[-_]/g, '');

    const aliases: Record<string, string[]> = {
      REKOMTEK: ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'],
      BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI', 'BERITA-ACARA-DOKUMEN'],
      BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BA_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BERITA_ACARA_VERIFIKASI_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN'],
      SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
      SURAT_PENGANTAR_SK_CPCL: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV', 'SURAT_PENGANTAR_PROVINSI'],
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
    return null;
  };

  const rekomtek = findDoc('REKOMTEK');
  bpdpValidations.value.rekomtek.docId = rekomtek?.id;
  bpdpValidations.value.rekomtek.url = rekomtek?.fileUrl || (activeUsulan.value as any)?.rekomtek?.signedUrl || '';
  bpdpValidations.value.rekomtek.fileName = rekomtek?.fileName || '';
  bpdpValidations.value.rekomtek.uploadedBy = rekomtek?.uploadedBy || '';
  bpdpValidations.value.rekomtek.uploadedAtFormatted = rekomtek?.uploadedAtFormatted || '';

  const baDoc = findDoc('BA_VERIFIKASI');
  bpdpValidations.value.baVerifikasi.docId = baDoc?.id;
  bpdpValidations.value.baVerifikasi.url = baDoc?.fileUrl || '';
  bpdpValidations.value.baVerifikasi.fileName = baDoc?.fileName || '';
  bpdpValidations.value.baVerifikasi.uploadedBy = baDoc?.uploadedBy || '';
  bpdpValidations.value.baVerifikasi.uploadedAtFormatted = baDoc?.uploadedAtFormatted || '';

  const baLapDoc = findDoc('BA_VERIFIKASI_LAPANGAN');
  bpdpValidations.value.baVerifikasiLapangan.docId = baLapDoc?.id;
  bpdpValidations.value.baVerifikasiLapangan.url = baLapDoc?.fileUrl || '';
  bpdpValidations.value.baVerifikasiLapangan.fileName = baLapDoc?.fileName || '';
  bpdpValidations.value.baVerifikasiLapangan.uploadedBy = baLapDoc?.uploadedBy || '';
  bpdpValidations.value.baVerifikasiLapangan.uploadedAtFormatted = baLapDoc?.uploadedAtFormatted || '';

  const skDoc = findDoc('SK_CPCL');
  bpdpValidations.value.skCpcl.docId = skDoc?.id;
  bpdpValidations.value.skCpcl.url = skDoc?.fileUrl || '';
  bpdpValidations.value.skCpcl.fileName = skDoc?.fileName || '';
  bpdpValidations.value.skCpcl.uploadedBy = skDoc?.uploadedBy || '';
  bpdpValidations.value.skCpcl.uploadedAtFormatted = skDoc?.uploadedAtFormatted || '';

  const suratDoc = findDoc('SURAT_PENGANTAR_SK_CPCL');
  bpdpValidations.value.suratPengantarProv.docId = suratDoc?.id;
  bpdpValidations.value.suratPengantarProv.url = suratDoc?.fileUrl || '';
  bpdpValidations.value.suratPengantarProv.fileName = suratDoc?.fileName || '';
  bpdpValidations.value.suratPengantarProv.uploadedBy = suratDoc?.uploadedBy || '';
  bpdpValidations.value.suratPengantarProv.uploadedAtFormatted = suratDoc?.uploadedAtFormatted || '';
}

const bpdpApprovalRejectionNote = ref('');
const hasBpdpValidations = ref(false);

function applyStatusFallback() {
  const st = activeUsulan.value?.status || (activeUsulan.value as any)?.currentStatus;
  if (!st) return;
  if (['DITJEN_APPR_SUBMITTED', 'APPROVAL_BPDP', 'BPDP_VERIF_SUBMITTED', 'BPDP_APPR_SUBMITTED', 'SK_DIRUT_ISSUED', 'SK_DIRUT_PUBLISHED', 'SELESAI'].includes(st)) {
    rekomtekVerif.value.status = 'APPROVED';
    rekomtekVerif.value.notes = '';
  } else if (st === 'REV_FROM_DITJEN_APPR') {
    rekomtekVerif.value.status = 'REJECTED';
  }
}

async function loadProposalDocumentValidations() {
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;
  bpdpApprovalRejectionNote.value = '';
  try {
    const res = await pengusulanStore.getProposalDocumentValidations({
      proposal_id: proposalIdNum,
    });
    const validationList = Array.isArray(res) ? res : (res as any)?.data || [];
    if (!validationList || validationList.length === 0) {
      applyStatusFallback();
      return;
    }

    // 1. Check Ditjenbun Approval's OWN validation on REKOMTEK
    const ditjenApprovalList = validationList.filter((v: any) => {
      const role = String(v.validated_by_role || v.role || '').toUpperCase();
      return role === 'DITJENBUN_APPROVAL' || role === 'DITJENBUN';
    });

    const docAliasesRekomtek = ['REKOMTEK', 'DRAFREKOMTEK', 'REKOMTEKDITJENBUN'];
    const matchedDitjenRekomtek = ditjenApprovalList.filter((v: any) => {
      const vDocType = (v.document_type || '').toUpperCase().replace(/[-_]/g, '');
      const docId = bpdpValidations.value.rekomtek.docId || rekomtekDoc.value?.id;
      const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.document_id || v.dokumen_id);
      if (docId && vDocId && vDocId === Number(docId)) return true;
      if (docAliasesRekomtek.includes(vDocType)) return true;
      return false;
    });

    let hasExplicitDitjenApproval = false;
    if (matchedDitjenRekomtek.length > 0) {
      const latestDitjenRekomtek = matchedDitjenRekomtek.slice().sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.id || 0) - Number(a.id || 0);
      })[0];

      rekomtekVerif.value.status = latestDitjenRekomtek.is_valid ? 'APPROVED' : 'REJECTED';
      rekomtekVerif.value.notes = latestDitjenRekomtek.is_valid ? '' : (latestDitjenRekomtek.notes || '');
      hasExplicitDitjenApproval = true;
    }

    // 2. Check BPDP Validations (from Peneliti / Verifikator / Approval BPDP)
    const bpdpValidationsList = validationList.filter((v: any) => {
      const role = String(v.validated_by_role || v.role || '').toUpperCase();
      return role === 'BPDP_APPROVAL' || role === 'BPDP_VERIFIKATOR' || role === 'BPDP';
    });
    hasBpdpValidations.value = bpdpValidationsList.length > 0;

    const docAliases: Record<string, string[]> = {
      rekomtek: ['REKOMTEK', 'DRAFREKOMTEK', 'REKOMTEKDITJENBUN'],
      baVerifikasi: ['BAVERIFIKASI', 'BERITAACARADOKUMEN', 'BERITAACARAVERIFIKASI', 'BERITAACARA', 'BADOKUMEN'],
      baVerifikasiLapangan: ['BAVERIFIKASILAPANGAN', 'BALAPANGAN', 'BERITAACARALAPANGAN', 'BERITAACARAVERIFIKASILAPANGAN'],
      skCpcl: ['SKCPCL', 'SKCPCLKABUPATEN'],
      suratPengantarProv: ['SURATPENGANTARSKCPCL', 'SURATPENGANTAR', 'SURATPENGANTARPROV', 'SURATPENGANTARPROVINSI'],
    };

    const applyVal = (key: 'rekomtek' | 'baVerifikasi' | 'baVerifikasiLapangan' | 'skCpcl' | 'suratPengantarProv') => {
      const docId = bpdpValidations.value[key].docId;
      const matched = bpdpValidationsList.filter((v: any) => {
        const vDocType = (v.document_type || '').toUpperCase().replace(/[-_]/g, '');
        if (['KEPUTUSANKELAYAKAN', 'KELAYAKAN', 'LAPORANKELAYAKAN'].includes(vDocType)) return false;

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

        if (key !== 'rekomtek' || !hasExplicitDitjenApproval) {
          bpdpValidations.value[key].valid = latest.is_valid === true;
          bpdpValidations.value[key].note = latest.notes || '';
        }

        // If REKOMTEK was rejected by BPDP and Ditjenbun Approval hasn't explicitly set it yet:
        if (key === 'rekomtek' && !hasExplicitDitjenApproval && latest.is_valid === false) {
          rekomtekVerif.value.status = 'REJECTED';
          rekomtekVerif.value.notes = latest.notes || '';
        }
      }
    };

    applyVal('rekomtek');
    applyVal('baVerifikasi');
    applyVal('baVerifikasiLapangan');
    applyVal('skCpcl');
    applyVal('suratPengantarProv');

    // 3. Fallback based on proposal status if no validation explicitly set
    if (!hasExplicitDitjenApproval && rekomtekVerif.value.status === 'PENDING') {
      applyStatusFallback();
    }

    const bpdpApprValidations = bpdpValidationsList.filter((v: any) => {
      const role = String(v.validated_by_role || v.role || '').toUpperCase();
      const docType = (v.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return (role === 'BPDP_APPROVAL' || role === 'BPDP') && (docType.includes('KELAYAKAN') || v.is_valid === false);
    });

    if (bpdpApprValidations.length > 0) {
      const latest = bpdpApprValidations.slice().sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.id) - Number(a.id);
      })[0];
      if (latest.notes) {
        bpdpApprovalRejectionNote.value = latest.notes;
      }
    }
  } catch (err) {
    console.error('Gagal memuat validasi dokumen Ditjenbun Approval:', err);
    applyStatusFallback();
  }
}

const bpdpDocumentList = computed(() => [
  {
    key: 'rekomtek',
    title: 'Rekomendasi Teknis Ditjenbun',
    subtitle: (activeUsulan.value as any)?.rekomtek?.nomorRekomtek || (activeUsulan.value as any)?.no_rekomtek ? `Nomor: ${(activeUsulan.value as any)?.rekomtek?.nomorRekomtek || (activeUsulan.value as any)?.no_rekomtek}` : undefined,
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

const isAllBpdpDocsApproved = computed(() => rejectedBpdpDocs.value.length === 0);

// Documents other than REKOMTEK that are rejected by BPDP
const rejectedOtherDocs = computed(() => {
  return bpdpDocumentList.value.filter((d) => d.key !== 'rekomtek' && d.state.valid === false);
});

const hasOtherDocRejections = computed(() => {
  return rejectedOtherDocs.value.length > 0;
});

const canApprove = computed(() => {
  return rekomtekVerif.value.status === 'APPROVED' && !hasOtherDocRejections.value;
});

const showRevisionButton = computed(() => {
  if (isReadonly.value) return false;
  return rekomtekVerif.value.status === 'REJECTED' || hasOtherDocRejections.value;
});

const hasBpdpVerifikatorValidations = computed(() => {
  return hasBpdpValidations.value;
});

const rekomtekDoc = computed(() => {
  const p = (pengajuan.value || activeUsulan.value) as any;
  if (!p) return null;

  const aliases = ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'];
  const matchDoc = (doc: any) => {
    const dt = (doc.document_type || doc.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
    return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
  };

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find(matchDoc);
    if (d) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name || d.namaFile || 'rekomtek_signed.pdf',
        fileUrl: d.file_url || d.urlFile || '',
        uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find(matchDoc);
    if (d) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile || (d as any).file_name || 'rekomtek_signed.pdf',
        fileUrl: d.urlFile || (d as any).file_url || '',
        uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at),
      };
    }
  }

  if (p.rekomtek?.signedUrl || p.rekomtek?.draftUrl) {
    return {
      id: bpdpValidations.value.rekomtek.docId,
      fileName: 'rekomtek_signed.pdf',
      fileUrl: p.rekomtek.signedUrl || p.rekomtek.draftUrl,
      uploadedBy: bpdpValidations.value.rekomtek.uploadedBy || '',
      uploadedAtFormatted: bpdpValidations.value.rekomtek.uploadedAtFormatted || '',
    };
  }

  if (bpdpValidations.value.rekomtek.url) {
    return {
      id: bpdpValidations.value.rekomtek.docId,
      fileName: bpdpValidations.value.rekomtek.fileName || 'rekomtek_signed.pdf',
      fileUrl: bpdpValidations.value.rekomtek.url,
      uploadedBy: bpdpValidations.value.rekomtek.uploadedBy || '',
      uploadedAtFormatted: bpdpValidations.value.rekomtek.uploadedAtFormatted || '',
    };
  }

  return null;
});

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openUrlPreview(url: string, title: string) {
  if (!url) return;
  previewDoc.value = { dataUrl: url, mimeType: 'application/pdf', title };
  showPreview.value = true;
}

onMounted(async () => {
  if (authStore.activeRole !== 'DITJENBUN_APPROVAL') {
    toast.error('Akses ditolak: Anda bukan Approval Ditjenbun', 'Forbidden');
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
        router.push('/ditjenbun/rekomtek');
        return;
      }
    }

    syncProposalDocuments();
    await loadProposalDocumentValidations();
  } catch (err) {
    console.error('Gagal memuat detail usulan Ditjenbun Approval:', err);
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
      } catch (err) {
        console.error('Gagal memuat detail usulan Ditjenbun Approval:', err);
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
  if (isReadonly.value) {
    toast.error('Usulan ini sedang tidak dalam tahap persetujuan Ditjenbun.', 'Aksi Tidak Diizinkan');
    return;
  }
  if (!canApprove.value) {
    toast.error('Tidak dapat menyetujui usulan: masih terdapat dokumen usulan yang ditolak pada Hasil Penelitian Dokumen Usulan.', 'Validasi Belum Sesuai');
    return;
  }
  confirmActionType.value = 'approve';
  confirmDestination.value = 'BPDP';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const docId = rekomtekDoc.value?.id || bpdpValidations.value.rekomtek.docId;
      const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || 0;
      const validationsPayload: any[] = [];
      if (docId) {
        validationsPayload.push({
          dokumen_proposal_id: Number(docId),
          proposal_document_id: Number(docId),
          pengajuan_id: proposalIdNum,
          proposal_id: proposalIdNum,
          document_type: 'REKOMTEK',
          is_valid: true,
          notes: 'Dokumen Rekomtek disetujui Ketua Tim Ditjenbun',
          validated_by_role: 'DITJENBUN_APPROVAL',
        });
      }

      await verifikasiDitjenbunStore.submitToBPDP(usulanId, {
        validations: validationsPayload.length > 0 ? validationsPayload : undefined,
        rekomtekDocId: docId,
        notes: 'Dokumen Rekomtek disetujui Ketua Tim Ditjenbun',
      });
      await store.approveDitjenbun(usulanId, 'Rekomendasi teknis disetujui Ketua Tim Ditjenbun. Diteruskan ke BPDP.', authStore.user?.name || 'Ketua Tim Ditjenbun');
      toast.success('Rekomtek disetujui dan berhasil diteruskan ke BPDP.', 'Disetujui');
      showConfirmModal.value = false;
      router.push('/ditjenbun/rekomtek');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyetujui rekomendasi teknis');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
};

const handleReject = () => {
  if (isReadonly.value) {
    toast.error('Usulan ini sedang tidak dalam tahap persetujuan Ditjenbun.', 'Aksi Tidak Diizinkan');
    return;
  }

  const docNotesList: string[] = [];

  // Only include REKOMTEK note if REKOMTEK is actually rejected
  if (rekomtekVerif.value.status === 'REJECTED' && rekomtekVerif.value.notes.trim()) {
    docNotesList.push(`Dokumen Rekomendasi Teknis (REKOMTEK): ${rekomtekVerif.value.notes.trim()}`);
  }

  // Include rejected other documents
  rejectedOtherDocs.value.forEach((d) => {
    const noteText = d.state.note ? d.state.note.trim() : 'Ditolak / Belum sesuai';
    docNotesList.push(`${d.title}: ${noteText}`);
  });

  if (docNotesList.length === 0) {
    toast.error('Harap berikan catatan alasan penolakan/pengembalian usulan.', 'Validasi Gagal');
    return;
  }

  // Each document note on its own line/point for popup modal
  const effectiveNotes = docNotesList.join('\n');

  confirmActionType.value = 'reject';
  confirmDestination.value = 'Verifikator Ditjenbun (Revisi)';
  confirmNotes.value = effectiveNotes;
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const docId = rekomtekDoc.value?.id || bpdpValidations.value.rekomtek.docId;
      const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || 0;
      const validations: any[] = [];
      if (rekomtekVerif.value.status === 'REJECTED') {
        validations.push({
          dokumen_proposal_id: docId ? Number(docId) : undefined,
          proposal_document_id: docId ? Number(docId) : undefined,
          pengajuan_id: proposalIdNum,
          proposal_id: proposalIdNum,
          document_type: 'REKOMTEK',
          is_valid: false,
          notes: rekomtekVerif.value.notes.trim(),
          validated_by_role: 'DITJENBUN_APPROVAL',
        });
      }

      await verifikasiDitjenbunStore.submitForRevision(usulanId, validations, `Dokumen Usulan: ${effectiveNotes}`, 'REV_FROM_DITJEN_APPR');
      await store.rejectDitjenbun(usulanId, `Dokumen Usulan: ${effectiveNotes}`, authStore.user?.name || 'Ketua Tim Ditjenbun');
      toast.warning('Usulan dikembalikan ke Verifikator Ditjenbun untuk perbaikan berkas.', 'Revisi Dikirim');
      showConfirmModal.value = false;
      router.push('/ditjenbun/rekomtek');
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
        <router-link to="/ditjenbun/rekomtek" class="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ChevronLeft class="w-5 h-5" />
        </router-link>
        <Breadcrumb />
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1" v-if="activeUsulan">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <Badge :variant="getRoleAwareStatusVariant(activeUsulan.status || (activeUsulan as any).currentStatus, 'DITJENBUN_APPROVAL')">Status: {{ getRoleAwareStatusLabel(activeUsulan.status || (activeUsulan as any).currentStatus, 'DITJENBUN_APPROVAL') }}</Badge>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
              {{ getJenisSarprasLabel((activeUsulan as any).paket_sarpras || (activeUsulan as any).jenisSarpras) || (activeUsulan as any).komoditas || 'Kelapa' }}
            </span>
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
          <router-link to="/ditjenbun/rekomtek">
            <Button variant="outline" size="sm" class="flex items-center gap-1.5 cursor-pointer">
              <ChevronLeft class="w-4 h-4" />
              <span>Kembali ke Antrean</span>
            </Button>
          </router-link>
          <button type="button" @click="currentStep = 2" class="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#066C2A] hover:bg-emerald-800 text-white transition-all shadow-sm active:scale-95 cursor-pointer">
            <span>Lanjut ke Review Rekomtek</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Review Rekomtek -->
      <div v-else-if="currentStep === 2" class="flex flex-col gap-5">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left Panel: Dokumen Rekomtek & Logs -->
          <div class="lg:col-span-2 flex flex-col gap-5">
            <!-- Card Dokumen Rekomtek -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">Hasil Asistensi Berkas & Dokumen Rekomendasi Teknis</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Verifikasi dokumen Rekomtek bertanda tangan yang diajukan oleh Verifikator Ditjenbun.</p>
              </div>

              <!-- Dokumen Rekomtek Box -->
              <div class="rounded-xl border border-slate-100 dark:border-slate-800/80 overflow-hidden">
                <div class="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800/80">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 flex items-center justify-center shrink-0">
                      <FileText class="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div>
                      <p class="text-[13px] font-semibold text-slate-800 dark:text-slate-200">Dokumen Rekomendasi Teknis</p>
                      <p class="text-[11px] text-slate-500">dari Verifikator Ditjenbun</p>
                    </div>
                  </div>
                  <div v-if="!isReadonly" class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="toggleVerif('APPROVED')"
                      :class="[
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer',
                        rekomtekVerif.status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300',
                      ]"
                    >
                      <Check class="w-3.5 h-3.5" />
                      <span>Setuju</span>
                    </button>
                    <button
                      type="button"
                      @click="toggleVerif('REJECTED')"
                      :class="[
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer',
                        rekomtekVerif.status === 'REJECTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300',
                      ]"
                    >
                      <X class="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-2">
                    <span
                      :class="[
                        'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border',
                        rekomtekVerif.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                          : rekomtekVerif.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
                      ]"
                    >
                      <Check v-if="rekomtekVerif.status === 'APPROVED'" class="w-3.5 h-3.5" />
                      <X v-else-if="rekomtekVerif.status === 'REJECTED'" class="w-3.5 h-3.5" />
                      <span>{{ rekomtekVerif.status === 'APPROVED' ? 'Disetujui' : rekomtekVerif.status === 'REJECTED' ? 'Ditolak' : 'Belum Diverifikasi' }}</span>
                    </span>
                  </div>
                </div>

                <div class="p-4 flex flex-col gap-3">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1">
                      <span class="text-[11px] font-semibold text-slate-400 uppercase">Nomor Rekomtek</span>
                      <span class="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                        {{ (activeUsulan as any).no_rekomtek || (activeUsulan as any).rekomtek?.nomorRekomtek || '-' }}
                      </span>
                    </div>

                    <div class="flex flex-col gap-1">
                      <span class="text-[11px] font-semibold text-slate-400 uppercase">Bentuk Bantuan</span>
                      <span class="text-[13px] font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {{ (activeUsulan as any).bentuk_bantuan || (activeUsulan as any).bantuanType || '-' }}
                      </span>
                    </div>
                  </div>

                  <button
                    v-if="rekomtekDoc?.fileUrl"
                    type="button"
                    @click="openUrlPreview(rekomtekDoc.fileUrl, 'Dokumen Rekomendasi Teknis')"
                    class="w-full h-9 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye class="w-4 h-4" />
                    <span>Pratinjau Rekomtek Bertanda Tangan ({{ rekomtekDoc.fileName }})</span>
                  </button>
                  <div v-if="rekomtekDoc?.uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Diunggah oleh {{ rekomtekDoc.uploadedBy }}<template v-if="rekomtekDoc.uploadedAtFormatted"> • {{ rekomtekDoc.uploadedAtFormatted }}</template>
                  </div>
                  <div v-else-if="!rekomtekDoc?.fileUrl" class="flex items-center justify-center h-9 rounded-lg border border-amber-200 bg-amber-50/50 text-amber-700 text-[11px] font-semibold">Dokumen Rekomtek belum diunggah oleh Verifikator</div>

                  <!-- Catatan Penolakan Rekomtek saat Readonly -->
                  <div v-if="isReadonly && rekomtekVerif.status === 'REJECTED' && rekomtekVerif.notes" class="flex flex-col gap-1 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-lg p-2.5 text-[11px] text-rose-800 dark:text-rose-300">
                    <span class="font-semibold">Catatan Penolakan:</span>
                    <p class="whitespace-pre-line">{{ rekomtekVerif.notes }}</p>
                  </div>

                  <!-- Catatan Penolakan Rekomtek (hanya jika Ditolak dan aktif diedit) -->
                  <div v-if="!isReadonly && rekomtekVerif.status === 'REJECTED'" class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-semibold text-slate-500">Catatan Penolakan <span class="text-rose-500">*</span></label>
                    <textarea
                      v-model="rekomtekVerif.notes"
                      rows="2"
                      placeholder="Tuliskan alasan penolakan dokumen Rekomtek..."
                      class="w-full px-3 py-2 border border-rose-200 dark:border-rose-900/50 rounded-lg text-[12px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Approval Action Card (Moved below Hasil Asistensi Berkas & Dokumen Rekomtek) -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">Keputusan Ketua Tim</h3>

              <!-- Case 1: Status not waiting for approval -->
              <div v-if="isReadonly" class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-center gap-2 text-slate-500">
                <CheckCircle v-if="(activeUsulan.status || (activeUsulan as any).currentStatus) !== 'REV_FROM_BPDP_APPR'" class="w-8 h-8 text-emerald-600" />
                <AlertCircle v-else class="w-8 h-8 text-amber-500" />
                <p class="text-[13px] font-semibold text-slate-700 dark:text-slate-350">
                  {{ (activeUsulan.status || (activeUsulan as any).currentStatus) === 'REV_FROM_BPDP_APPR' ? 'Usulan Sedang Direvisi di BPDP' : 'Persetujuan Selesai' }}
                </p>
                <p class="text-[11px] leading-relaxed">
                  Usulan saat ini berada pada status <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ (activeUsulan.status || (activeUsulan as any).currentStatus || '').replace(/_/g, ' ') }}</span>.
                </p>
                <p v-if="(activeUsulan.status || (activeUsulan as any).currentStatus) === 'REV_FROM_BPDP_APPR'" class="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 p-2 rounded-lg mt-1">
                  Usulan sedang direvisi secara internal oleh Verifikator BPDP.
                </p>
              </div>

              <!-- Case 2: Action buttons for approval -->
              <div v-else class="flex flex-col gap-3.5">
                <!-- Warning banner if other documents have rejections -->
                <div v-if="hasOtherDocRejections" class="flex gap-2.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-xl">
                  <AlertCircle class="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <div class="flex flex-col gap-0.5">
                    <span class="text-xs font-bold text-rose-800 dark:text-rose-300">Terdapat Dokumen Belum Sesuai</span>
                    <p class="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                      Masih terdapat dokumen yang ditolak pada <strong>Hasil Penelitian Dokumen Usulan</strong> ({{ rejectedOtherDocs.map(d => d.title).join(', ') }}). Tombol <strong>Push ke BPDP</strong> dinonaktifkan dan usulan harus dikembalikan ke Verifikator Ditjenbun untuk perbaikan.
                    </p>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row items-center gap-3">
                  <!-- Approve Button: Disabled when not all approved -->
                  <button
                    type="button"
                    @click="handleApprove"
                    :disabled="!canApprove || isSubmitting"
                    :class="[
                      'flex-1 w-full h-10 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm',
                      canApprove && !isSubmitting ? 'text-white bg-[#066C2A] hover:bg-[#065A23] active:scale-[0.98] cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
                    ]"
                  >
                    <CheckCircle class="w-4 h-4" />
                    <span>Push ke BPDP (Setujui)</span>
                  </button>

                  <!-- Revisi Kembali Button: On when showRevisionButton -->
                  <button
                    v-if="showRevisionButton"
                    type="button"
                    @click="handleReject"
                    :disabled="isSubmitting"
                    class="w-full sm:w-auto px-6 h-10 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                  >
                    <XCircle class="w-4 h-4" />
                    <span>Revisi Kembali ke Verifikator</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Logs Timeline -->
            <LogStatusUsulan :logs="(activeUsulan as any).logs || (activeUsulan as any).trackingStatus || []" />
          </div>

          <!-- Right Panel: Notes -->
          <div v-if="hasBpdpVerifikatorValidations" class="flex flex-col gap-5">
            <!-- Hasil Penelitian Dokumen Usulan dari Peneliti BPDP -->
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

              <!-- Compact Document List -->
              <div class="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                <div v-for="(docItem, dIdx) in bpdpDocumentList" :key="dIdx" class="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col gap-1.5">
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

                      <!-- Preview / Download Actions -->
                      <button
                        v-if="docItem.state.url"
                        type="button"
                        title="Pratinjau Dokumen"
                        class="h-6 w-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer"
                        @click="openUrlPreview(docItem.state.url, docItem.title)"
                      >
                        <Eye class="w-3 h-3" />
                      </button>
                      <a
                        v-if="docItem.state.url"
                        :href="docItem.state.url"
                        download
                        title="Unduh Dokumen"
                        class="h-6 w-6 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0"
                      >
                        <Download class="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <!-- Rejection Note if valid is false -->
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

        <!-- Step 2 Bottom Navigation -->
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <button type="button" @click="currentStep = 1" class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer">
            <ChevronLeft class="w-4 h-4" />
            <span>Kembali ke Pratinjau</span>
          </button>
        </div>
      </div>

      <!-- Preview Modal -->
      <DocumentPreviewModal :is-open="showPreview" :title="previewDoc?.title || 'Pratinjau Dokumen'" :data-url="previewDoc?.dataUrl || ''" :mime-type="previewDoc?.mimeType || 'application/pdf'" @close="showPreview = false" />

      <!-- Audit Trail Sidebar -->
      <Teleport to="body">
        <div v-if="showAuditTrail" class="fixed inset-0 z-40 bg-black/20" @click="showAuditTrail = false" />
        <AuditTrailSidebar v-if="showAuditTrail" :proposal-id="usulanId" @close="showAuditTrail = false" />
      </Teleport>

      <ApprovalConfirmationModal :is-open="showConfirmModal" :action-type="confirmActionType" :destination-stage="confirmDestination" :notes="confirmNotes" @close="showConfirmModal = false" @confirm="executePendingAction" />
    </div>
  </div>
</template>
