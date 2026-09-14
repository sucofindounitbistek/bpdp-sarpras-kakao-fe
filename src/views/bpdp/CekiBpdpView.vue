<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiBPDPStore } from '@/stores/verifikasiBPDP';
import { useRekomtekStore } from '@/stores/rekomtek';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';
import VerifikasiDokumenItem from '@/components/rekomtek/VerifikasiDokumenItem.vue';
import AuthorityDocumentSectionCard from '@/components/verification/AuthorityDocumentSectionCard.vue';
import { AUTHORITY_CONFIG } from '@/lib/authoritySections';
import LogStatusUsulan from '@/components/rekomtek/LogStatusUsulan.vue';
import PratinjauPekebunDanDokumenTab from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import { ChevronLeft, ChevronRight, Download, FileText, FileCheck, CheckCircle2, Award, History, Eye, AlertCircle } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
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
const signedFileUploaded = ref(false);
const isUploading = ref(false);
const initialFileName = ref('');
const showAuditTrail = ref(false);
const currentStep = ref(1);

const backRoute = computed(() => {
  const from = route.query.from as string;
  if (from === 'revisi-penelitian' || from === '/bpdp/revisi-penelitian') return '/bpdp/revisi-penelitian';
  if (from === 'riwayat-selesai' || from === '/bpdp/riwayat-selesai') return '/bpdp/riwayat-selesai';
  if (from === 'sk-dirut' || from === '/bpdp/sk-dirut') return '/bpdp/sk-dirut';
  return '/bpdp/antrean';
});

const backLabel = computed(() => {
  const from = route.query.from as string;
  if (from === 'revisi-penelitian' || from === '/bpdp/revisi-penelitian') return 'Kembali ke Revisi Penelitian';
  if (from === 'riwayat-selesai' || from === '/bpdp/riwayat-selesai') return 'Kembali ke Riwayat Selesai';
  if (from === 'sk-dirut' || from === '/bpdp/sk-dirut') return 'Kembali ke SK Dirut';
  return 'Kembali ke Antrean';
});

const steps = [
  { id: 1, title: 'Pratinjau Pekebun & Dokumen', description: 'Tinjau Data & Lahan', icon: Eye },
  { id: 2, title: 'Penelitian Kepatuhan & Dokumen', description: 'Validasi Dokumen', icon: FileCheck },
];

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

interface DocValidationState {
  docId?: number;
  valid: boolean | null;
  note: string;
  url: string;
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
  rekomtek: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasi: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  baVerifikasiLapangan: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  skCpcl: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  suratPengantarProv: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
});

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);
const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);
const kelayakanValidationNote = ref<string>('');
const existingKelayakanDocId = ref<number | undefined>(undefined);
const existingKelayakanFileName = ref<string>('');
const existingKelayakanFileUrl = ref<string>('');
const existingKelayakanUploadedBy = ref<string>('');
const existingKelayakanUploadedAtFormatted = ref<string>('');
const uploadedKelayakanFile = ref<File | null>(null);

function openUrlPreview(url: string, title: string) {
  if (!url) return;
  previewDoc.value = { dataUrl: url, mimeType: 'application/pdf', title };
  showPreview.value = true;
}

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
  return !['DITJEN_APPR_SUBMITTED', 'VERIFIKASI_BPDP', 'REV_FROM_BPDP_APPR'].includes(st);
});

async function loadSpatialOverlap(proposalId: string | number) {
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

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
      KEPUTUSAN_KELAYAKAN: ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN', 'HASIL_PENELITIAN_BPDP', 'LAPORAN_PENELITIAN'],
      KELAYAKAN: ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN', 'HASIL_PENELITIAN_BPDP', 'LAPORAN_PENELITIAN'],
    };
    const allowed = (aliases[docType] || [docType]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));

    if (p.documents && Array.isArray(p.documents)) {
      const d = p.documents.find((doc: any) => {
        const dt = (doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
        return allowed.includes(dt) || dt === target;
      });
      if (d && (d.file_url || d.urlFile || d.file_name || d.id !== undefined)) {
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
      if (d && (d.urlFile || d.file_url || d.namaFile || (d as any).id !== undefined)) {
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

  const rekomtekDoc = findDoc('REKOMTEK');
  bpdpValidations.value.rekomtek.docId = rekomtekDoc?.id;
  bpdpValidations.value.rekomtek.url = rekomtekDoc?.fileUrl || (activeUsulan.value as any)?.rekomtek?.signedUrl || '';
  bpdpValidations.value.rekomtek.fileName = rekomtekDoc?.fileName || '';
  bpdpValidations.value.rekomtek.uploadedBy = rekomtekDoc?.uploadedBy || '';
  bpdpValidations.value.rekomtek.uploadedAtFormatted = rekomtekDoc?.uploadedAtFormatted || '';

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

  const kelayakanDoc = findDoc('KEPUTUSAN_KELAYAKAN') || findDoc('KELAYAKAN');
  if (kelayakanDoc) {
    existingKelayakanDocId.value = kelayakanDoc.id;
    existingKelayakanFileName.value = kelayakanDoc.fileName || 'laporan_kelayakan_signed.pdf';
    existingKelayakanFileUrl.value = kelayakanDoc.fileUrl || '';
    existingKelayakanUploadedBy.value = kelayakanDoc.uploadedBy || '';
    existingKelayakanUploadedAtFormatted.value = kelayakanDoc.uploadedAtFormatted || '';
    signedFileUploaded.value = true;
    initialFileName.value = existingKelayakanFileName.value;
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

    // Filter only validations from BPDP_VERIFIKATOR or BPDP_APPROVAL
    const bpdpValidationsList = validationList.filter((v: any) => {
      const role = String(v.validated_by_role || v.role || '').toUpperCase();
      return role === 'BPDP_VERIFIKATOR' || role === 'BPDP_APPROVAL' || role === 'BPDP';
    });

    const applyVal = (key: 'rekomtek' | 'baVerifikasi' | 'baVerifikasiLapangan' | 'skCpcl' | 'suratPengantarProv') => {
      const docId = bpdpValidations.value[key].docId;
      if (!docId) return;

      const matched = bpdpValidationsList.filter((v: any) => Number(v.dokumen_proposal_id) === Number(docId));
      if (matched.length > 0) {
        const latest = matched.slice().sort((a: any, b: any) => {
          const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
          if (timeA !== timeB) return timeB - timeA;
          return Number(b.id) - Number(a.id);
        })[0];

        bpdpValidations.value[key].valid = latest.is_valid;
        bpdpValidations.value[key].note = latest.notes || '';
      }
    };

    applyVal('rekomtek');
    applyVal('baVerifikasi');
    applyVal('baVerifikasiLapangan');
    applyVal('skCpcl');
    applyVal('suratPengantarProv');

    const matchedKelayakan = bpdpValidationsList.filter((v: any) => {
      const dt = String(v.document_type || '')
        .toUpperCase()
        .replace(/[-_]/g, '');
      const isKelDocType = dt === 'KEPUTUSANKELAYAKAN' || dt === 'KELAYAKAN' || dt === 'LAPORANKELAYAKAN';
      const isDocIdMatch = Boolean(existingKelayakanDocId.value && (Number(v.dokumen_proposal_id) === Number(existingKelayakanDocId.value) || Number(v.proposal_document_id) === Number(existingKelayakanDocId.value)));
      return isKelDocType || isDocIdMatch;
    });

    if (matchedKelayakan.length > 0) {
      const latestKelayakan = matchedKelayakan.slice().sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.id) - Number(a.id);
      })[0];

      if (latestKelayakan && (latestKelayakan.is_valid === false || latestKelayakan.notes)) {
        kelayakanValidationNote.value = latestKelayakan.notes || '';
      } else {
        kelayakanValidationNote.value = '';
      }
    }

    if (!kelayakanValidationNote.value) {
      const u = activeUsulan.value as any;
      if (u?.status === 'REV_FROM_BPDP_APPR' || u?.currentStatus === 'REV_FROM_BPDP_APPR') {
        kelayakanValidationNote.value = u.notes || u.catatan || '';
      }
    }
  } catch (err) {
    console.error('Gagal memuat riwayat validasi dokumen proposal:', err);
  }
}

onMounted(async () => {
  if (authStore.activeRole !== 'BPDP_VERIFIKATOR') {
    toast.error('Akses ditolak: Anda bukan Verifikator BPDP', 'Forbidden');
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

    if (activeUsulan.value) {
      const u = activeUsulan.value as any;
      if (u.kelayakan?.signedUrl || existingKelayakanFileUrl.value) {
        signedFileUploaded.value = true;
        initialFileName.value = 'Laporan_Kelayakan_Signed.pdf';
      }
    }
  } catch (err: any) {
    console.error('Gagal memuat usulan BPDP:', err);
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
  async (newVal) => {
    if (newVal) {
      syncProposalDocuments();
      await loadProposalDocumentValidations();
    }
  },
);

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
      coordinates: poly.coordinates || [],
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

type DocKey = 'rekomtek' | 'baVerifikasi' | 'baVerifikasiLapangan' | 'skCpcl' | 'suratPengantarProv';

function handleDocChange(doc: DocKey, field: 'valid' | 'note', value: any) {
  (bpdpValidations.value[doc] as any)[field] = value;
}

const allDocumentsChecked = computed(() => {
  const v = bpdpValidations.value;
  return v.rekomtek.valid !== null && v.baVerifikasi.valid !== null && v.baVerifikasiLapangan.valid !== null && v.skCpcl.valid !== null && v.suratPengantarProv.valid !== null;
});

const checkedDocumentsCount = computed(() => {
  const v = bpdpValidations.value;
  return [v.rekomtek.valid, v.baVerifikasi.valid, v.baVerifikasiLapangan.valid, v.skCpcl.valid, v.suratPengantarProv.valid].filter((val) => val !== null).length;
});

const kabupatenStats = computed(() => {
  const v = bpdpValidations.value;
  const docs = [v.baVerifikasi, v.baVerifikasiLapangan, v.skCpcl];
  const checked = docs.filter((d) => d.valid !== null).length;
  const rejected = docs.filter((d) => d.valid === false).length;
  return {
    total: 3,
    checked,
    rejected,
    statusText: checked === 3 && rejected === 0 ? 'Semua Berkas Sesuai' : `${checked}/3 Terperiksa`,
  };
});

const provinsiStats = computed(() => {
  const v = bpdpValidations.value.suratPengantarProv;
  const checked = v.valid !== null ? 1 : 0;
  const rejected = v.valid === false ? 1 : 0;
  return {
    total: 1,
    checked,
    rejected,
    statusText: checked === 1 && rejected === 0 ? 'Berkas Sesuai' : `${checked}/1 Terperiksa`,
  };
});

const ditjenbunStats = computed(() => {
  const v = bpdpValidations.value.rekomtek;
  const checked = v.valid !== null ? 1 : 0;
  const rejected = v.valid === false ? 1 : 0;
  return {
    total: 1,
    checked,
    rejected,
    statusText: checked === 1 && rejected === 0 ? 'Berkas Sesuai' : `${checked}/1 Terperiksa`,
  };
});

function buildProposalValidationPayloads() {
  const payloads: any[] = [];
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || 0;

  const checkDoc = (type: string, docState: DocValidationState) => {
    if (docState.valid !== null) {
      const docId = docState.docId || 0;
      payloads.push({
        dokumen_proposal_id: docId,
        proposal_document_id: docId,
        pengajuan_id: proposalIdNum,
        proposal_id: proposalIdNum,
        document_type: type,
        is_valid: docState.valid === true,
        notes: docState.note || '',
        validated_by_role: 'BPDP_VERIFIKATOR',
      });
    }
  };

  checkDoc('REKOMTEK', bpdpValidations.value.rekomtek);
  checkDoc('BA_VERIFIKASI', bpdpValidations.value.baVerifikasi);
  checkDoc('BA_VERIFIKASI_LAPANGAN', bpdpValidations.value.baVerifikasiLapangan);
  checkDoc('SK_CPCL', bpdpValidations.value.skCpcl);
  checkDoc('SURAT_PENGANTAR_SK_CPCL', bpdpValidations.value.suratPengantarProv);

  return payloads;
}

const handleFileSelected = async (file: File) => {
  isUploading.value = true;
  uploadedKelayakanFile.value = file;
  setTimeout(async () => {
    await store.uploadKelayakanFile(usulanId, `/files/signed-kelayakan-${usulanId}.pdf`);
    signedFileUploaded.value = true;
    isUploading.value = false;
    toast.success('Berkas Laporan Penelitian Rekomtek berhasil diunggah.', 'Unggah Sukses');
  }, 1000);
};

const handleAjukanKelayakan = () => {
  if (isReadonly.value) {
    toast.error('Usulan ini sedang tidak dalam tahap pemeriksaan verifikator BPDP.', 'Aksi Tidak Diizinkan');
    return;
  }
  if (!allDocumentsChecked.value) {
    toast.error('Mohon periksa seluruh 5 dokumen verifikasi sebelum melanjutkan.', 'Validasi Belum Lengkap');
    return;
  }
  if (!signedFileUploaded.value && !existingKelayakanFileUrl.value && !uploadedKelayakanFile.value) {
    toast.error('Mohon unggah berkas Laporan Penelitian yang sudah ditandatangani.', 'Validasi Gagal');
    return;
  }

  confirmActionType.value = 'approve';
  confirmDestination.value = 'Kepala Divisi BPDP (Approval)';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    try {
      const validationPayloads = buildProposalValidationPayloads();

      await verifikasiBPDPStore.submitToBPDPApproval(usulanId, {
        validations: validationPayloads,
        kelayakanFile: uploadedKelayakanFile.value,
        kelayakanDocId: existingKelayakanDocId.value,
        notes: 'Diajukan Laporan Penelitian ke Kadiv BPDP',
      });

      await store.submitKelayakanToKadiv(usulanId, authStore.user?.name || 'Verifikator BPDP');
      toast.success('Penelitian rekomtek berhasil diajukan ke Kepala Divisi BPDP.', 'Sukses Diajukan');
      showConfirmModal.value = false;
      router.push(backRoute.value);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengajukan Laporan Penelitian');
    }
  };
  showConfirmModal.value = true;
};

const executePendingAction = async () => {
  if (!pendingConfirmAction.value) return;
  isSubmitting.value = true;
  try {
    await pendingConfirmAction.value();
  } finally {
    isSubmitting.value = false;
  }
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
          <div class="flex items-center gap-2">
            <Badge :variant="getRoleAwareStatusVariant(activeUsulan.status || (activeUsulan as any).currentStatus, 'BPDP_VERIFIKATOR')">Status: {{ getRoleAwareStatusLabel(activeUsulan.status || (activeUsulan as any).currentStatus, 'BPDP_VERIFIKATOR') }}</Badge>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-800 px-2 py-0.5 rounded-md"> Verifikator BPDP </span>
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
            <span>Lanjut ke Penelitian Dokumen</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Penelitian Dokumen -->
      <div v-else-if="currentStep === 2" class="flex flex-col gap-5">
        <!-- Revision Warning Banner (if any) -->
        <div v-if="kelayakanValidationNote" class="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-300">
          <AlertCircle class="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold uppercase tracking-wider">Catatan Perbaikan dari Kepala Divisi BPDP</span>
            <p class="text-xs leading-relaxed whitespace-pre-wrap">{{ kelayakanValidationNote }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left Panel: Document Validation List -->
          <div class="lg:col-span-2 flex flex-col gap-5">
            <!-- Header Card with Overall Context -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
              <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">Penelitian Dokumen Berdasarkan Kewenangan Instansi (BPDP)</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">Periksa kesesuaian seluruh berkas lampiran yang diterbitkan oleh masing-masing tingkat instansi pemerintah.</p>
            </div>

            <!-- Section 1: Dinas Kabupaten / Kota -->
            <AuthorityDocumentSectionCard :tier="AUTHORITY_CONFIG.KABUPATEN" :total-docs="kabupatenStats.total" :rejected-count="kabupatenStats.rejected" :status-text="kabupatenStats.statusText">
              <div class="flex flex-col gap-4">
                <!-- Document Item 4: SK CPCL -->
                <VerifikasiDokumenItem
                  title="Surat Keputusan CPCL"
                  subtitle="Dari Dinas Kabupaten/Kota"
                  badgeType="blue"
                  :valid="bpdpValidations.skCpcl.valid"
                  :note="bpdpValidations.skCpcl.note"
                  :fileUrl="bpdpValidations.skCpcl.url"
                  :uploadedBy="bpdpValidations.skCpcl.uploadedBy"
                  :uploadedAtFormatted="bpdpValidations.skCpcl.uploadedAtFormatted"
                  downloadLabel="Download SK CPCL"
                  :readonly="isReadonly"
                  @update:valid="(val) => handleDocChange('skCpcl', 'valid', val)"
                  @update:note="(val) => handleDocChange('skCpcl', 'note', val)"
                  @preview="openUrlPreview(bpdpValidations.skCpcl.url, 'Surat Keputusan CPCL')"
                />

                <!-- Document Item 2: Berita Acara Verifikasi Dokumen -->
                <VerifikasiDokumenItem
                  title="Berita Acara Hasil Verifikasi Dokumen"
                  subtitle="Dokumen Berita Acara Verifikasi Usulan"
                  badgeType="slate"
                  :valid="bpdpValidations.baVerifikasi.valid"
                  :note="bpdpValidations.baVerifikasi.note"
                  :fileUrl="bpdpValidations.baVerifikasi.url"
                  :uploadedBy="bpdpValidations.baVerifikasi.uploadedBy"
                  :uploadedAtFormatted="bpdpValidations.baVerifikasi.uploadedAtFormatted"
                  downloadLabel="Download Berita Acara Verifikasi"
                  :readonly="isReadonly"
                  @update:valid="(val) => handleDocChange('baVerifikasi', 'valid', val)"
                  @update:note="(val) => handleDocChange('baVerifikasi', 'note', val)"
                  @preview="openUrlPreview(bpdpValidations.baVerifikasi.url, 'Berita Acara Hasil Verifikasi Dokumen')"
                />

                <!-- Document Item 3: Berita Acara Verifikasi Lapangan -->
                <VerifikasiDokumenItem
                  title="Berita Acara Hasil Verifikasi Lapangan"
                  subtitle="Dokumen Berita Acara Verifikasi Lapangan"
                  badgeType="slate"
                  :valid="bpdpValidations.baVerifikasiLapangan.valid"
                  :note="bpdpValidations.baVerifikasiLapangan.note"
                  :fileUrl="bpdpValidations.baVerifikasiLapangan.url"
                  :uploadedBy="bpdpValidations.baVerifikasiLapangan.uploadedBy"
                  :uploadedAtFormatted="bpdpValidations.baVerifikasiLapangan.uploadedAtFormatted"
                  downloadLabel="Download Berita Acara Lapangan"
                  :readonly="isReadonly"
                  @update:valid="(val) => handleDocChange('baVerifikasiLapangan', 'valid', val)"
                  @update:note="(val) => handleDocChange('baVerifikasiLapangan', 'note', val)"
                  @preview="openUrlPreview(bpdpValidations.baVerifikasiLapangan.url, 'Berita Acara Hasil Verifikasi Lapangan')"
                />
              </div>
            </AuthorityDocumentSectionCard>

            <!-- Section 2: Dinas Provinsi -->
            <AuthorityDocumentSectionCard :tier="AUTHORITY_CONFIG.PROVINSI" :total-docs="provinsiStats.total" :rejected-count="provinsiStats.rejected" :status-text="provinsiStats.statusText">
              <VerifikasiDokumenItem
                title="Surat Pengantar SK CPCL"
                subtitle="Dari Dinas Provinsi"
                badgeType="amber"
                :valid="bpdpValidations.suratPengantarProv.valid"
                :note="bpdpValidations.suratPengantarProv.note"
                :fileUrl="bpdpValidations.suratPengantarProv.url"
                :uploadedBy="bpdpValidations.suratPengantarProv.uploadedBy"
                :uploadedAtFormatted="bpdpValidations.suratPengantarProv.uploadedAtFormatted"
                downloadLabel="Download Surat Pengantar"
                :readonly="isReadonly"
                @update:valid="(val) => handleDocChange('suratPengantarProv', 'valid', val)"
                @update:note="(val) => handleDocChange('suratPengantarProv', 'note', val)"
                @preview="openUrlPreview(bpdpValidations.suratPengantarProv.url, 'Surat Pengantar SK CPCL')"
              />
            </AuthorityDocumentSectionCard>

            <!-- Section 3: Ditjen Perkebunan (Ditjenbun) -->
            <AuthorityDocumentSectionCard :tier="AUTHORITY_CONFIG.DITJENBUN" :total-docs="ditjenbunStats.total" :rejected-count="ditjenbunStats.rejected" :status-text="ditjenbunStats.statusText">
              <VerifikasiDokumenItem
                title="Rekomendasi Teknis Ditjenbun"
                :subtitle="
                  (activeUsulan as any).rekomtek?.nomorRekomtek || (activeUsulan as any).no_rekomtek ? `Nomor: ${(activeUsulan as any).rekomtek?.nomorRekomtek || (activeUsulan as any).no_rekomtek}` : 'Dokumen Rekomtek Resmi Ditjenbun'
                "
                badgeType="emerald"
                :valid="bpdpValidations.rekomtek.valid"
                :note="bpdpValidations.rekomtek.note"
                :fileUrl="bpdpValidations.rekomtek.url || (activeUsulan as any).rekomtek?.signedUrl"
                :uploadedBy="bpdpValidations.rekomtek.uploadedBy"
                :uploadedAtFormatted="bpdpValidations.rekomtek.uploadedAtFormatted"
                downloadLabel="Download Rekomtek Ditjenbun"
                :readonly="isReadonly"
                @update:valid="(val) => handleDocChange('rekomtek', 'valid', val)"
                @update:note="(val) => handleDocChange('rekomtek', 'note', val)"
                @preview="openUrlPreview(bpdpValidations.rekomtek.url || (activeUsulan as any).rekomtek?.signedUrl || '', 'Rekomendasi Teknis Ditjenbun')"
              />
            </AuthorityDocumentSectionCard>

            <!-- Logs History -->
            <LogStatusUsulan :logs="(activeUsulan as any).logs" />
          </div>

          <!-- Right Panel: Actions & Reference -->
          <div class="flex flex-col gap-5">
            <!-- Ditjenbun Rekomtek Info Card -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">Rujukan Rekomtek Ditjenbun</h3>

              <div class="flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase">Nomor Rekomtek</span>
                  <span class="text-[13px] font-bold text-slate-800 dark:text-slate-200">
                    {{ (activeUsulan as any).rekomtek?.nomorRekomtek || (activeUsulan as any).no_rekomtek || '-' }}
                  </span>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-semibold text-slate-400 uppercase">Bantuan Dikirim</span>
                  <span class="text-[13px] font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {{ (activeUsulan as any).bantuanType || (activeUsulan as any).bentuk_bantuan || '-' }}
                  </span>
                </div>

                <div v-if="(activeUsulan as any).rekomtek?.signedUrl || bpdpValidations.rekomtek.url">
                  <div class="flex items-center gap-2">
                    <a
                      :href="(activeUsulan as any).rekomtek?.signedUrl || bpdpValidations.rekomtek.url"
                      download
                      class="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:text-slate-350 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download class="w-4 h-4 text-slate-500" />
                      <span>Unduh Rekomtek Ditjenbun</span>
                    </a>
                    <button
                      type="button"
                      title="Pratinjau"
                      class="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      @click="openUrlPreview((activeUsulan as any).rekomtek?.signedUrl || bpdpValidations.rekomtek.url, 'Rekomtek Signed')"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Card: Keputusan Penelitian -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">Keputusan Penelitian</h3>
                <span
                  :class="[
                    'flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                    allDocumentsChecked ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50' : 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                  ]"
                >
                  <CheckCircle2 v-if="allDocumentsChecked" class="w-3.5 h-3.5" />
                  <span>{{ checkedDocumentsCount }}/5 Terperiksa</span>
                </span>
              </div>

              <!-- Case 1: Status not waiting for verification -->
              <div v-if="isReadonly" class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-center gap-2 text-slate-500">
                <CheckCircle2 v-if="(activeUsulan.status || (activeUsulan as any).currentStatus) !== 'REV_FROM_BPDP_VERIF'" class="w-8 h-8 text-emerald-600" />
                <AlertCircle v-else class="w-8 h-8 text-amber-500" />
                <p class="text-[13px] font-semibold text-slate-700 dark:text-slate-350">
                  {{ (activeUsulan.status || (activeUsulan as any).currentStatus) === 'REV_FROM_BPDP_VERIF' ? 'Usulan Sedang Direvisi di Ditjenbun' : 'Tahap Pemeriksaan Ditutup' }}
                </p>
                <p class="text-[11px] leading-relaxed">
                  Status usulan saat ini: <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ (activeUsulan.status || (activeUsulan as any).currentStatus || '').replace(/_/g, ' ') }}</span
                  >.
                </p>
                <p
                  v-if="(activeUsulan.status || (activeUsulan as any).currentStatus) === 'REV_FROM_BPDP_VERIF'"
                  class="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 p-2 rounded-lg mt-1"
                >
                  Usulan telah dikembalikan ke Ditjenbun Approval untuk perbaikan rekomendasi teknis.
                </p>

                <!-- Catatan Perbaikan dari Kepala Divisi BPDP (Readonly view) -->
                <div
                  v-if="kelayakanValidationNote"
                  class="mt-2 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-left w-full shadow-2xs"
                >
                  <AlertCircle class="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div class="flex flex-col gap-1">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200"> Catatan Perbaikan dari Kepala Divisi BPDP </span>
                    <p class="text-xs leading-relaxed whitespace-pre-wrap text-amber-800 dark:text-amber-300">
                      {{ kelayakanValidationNote }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Case 2: Active verification submission form (Always Open) -->
              <div v-else class="flex flex-col gap-4">
                <!-- Checklist incomplete notice -->
                <div v-if="!allDocumentsChecked" class="flex gap-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3 rounded-xl">
                  <FileText class="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <p class="text-[12px] text-amber-700 dark:text-amber-400 leading-normal">Masih ada dokumen yang <strong>belum diperiksa</strong>. Silakan periksa seluruh 5 berkas di sebelah kiri sebelum mengajukan.</p>
                </div>

                <!-- Upload Dokumen Kelayakan Signed (KEPUTUSAN_KELAYAKAN) -->
                <div class="flex flex-col gap-1.5">
                  <FileUpload
                    id="kelayakanUpload"
                    label="Dokumen Penelitian Ditandatangani"
                    accept=".pdf"
                    required
                    placeholder="Unggah Laporan Penelitian Rekomtek yang telah ditandatangani (PDF max 10MB)"
                    document-label="Kelayakan-BPDP"
                    :proposal-number="(activeUsulan as any)?.nomor_proposal || (activeUsulan as any)?.nomorProposal || (activeUsulan as any)?.nomorUsulan || 'DRAFT'"
                    :institution-name="(activeUsulan as any)?.lembaga?.namaLembaga || (activeUsulan as any)?.kelembagaan?.nama_lembaga || (activeUsulan as any)?.namaKelompokTani || 'Kelembagaan'"
                    :initial-file-name="initialFileName"
                    @file-selected="handleFileSelected"
                  />
                  <p v-if="isUploading" class="text-[11px] text-slate-400 flex items-center gap-1 animate-pulse">
                    <span class="inline-block w-2 h-2 rounded-full bg-[#066C2A]"></span>
                    Mengunggah berkas...
                  </p>
                  <p v-else-if="signedFileUploaded || existingKelayakanFileUrl" class="text-[11px] text-emerald-600 font-semibold flex flex-col gap-0.5">
                    <span class="flex items-center gap-1"> <CheckCircle2 class="w-3.5 h-3.5" /> Berkas Laporan Penelitian berhasil diunggah </span>
                    <span v-if="existingKelayakanUploadedBy" class="text-[10px] text-slate-500 font-normal">
                      Diunggah oleh {{ existingKelayakanUploadedBy }}<template v-if="existingKelayakanUploadedAtFormatted"> • {{ existingKelayakanUploadedAtFormatted }}</template>
                    </span>
                  </p>

                  <!-- Catatan Perbaikan dari Kepala Divisi BPDP (below KEPUTUSAN_KELAYAKAN form input) -->
                  <div v-if="kelayakanValidationNote" class="mt-2 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800 dark:text-amber-300 shadow-2xs">
                    <AlertCircle class="w-4.5 h-4.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div class="flex flex-col gap-1">
                      <span class="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200"> Catatan Perbaikan dari Kepala Divisi BPDP </span>
                      <p class="text-xs leading-relaxed whitespace-pre-wrap text-amber-800 dark:text-amber-300">
                        {{ kelayakanValidationNote }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="button"
                  @click="handleAjukanKelayakan"
                  :disabled="isSubmitting || !allDocumentsChecked || (!signedFileUploaded && !existingKelayakanFileUrl && !uploadedKelayakanFile)"
                  :class="[
                    'w-full h-10 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm',
                    allDocumentsChecked && (signedFileUploaded || existingKelayakanFileUrl || uploadedKelayakanFile) && !isSubmitting
                      ? 'text-white bg-[#066C2A] hover:bg-[#065A23] shadow-emerald-950/10 cursor-pointer'
                      : 'text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed',
                  ]"
                >
                  <Award class="w-4 h-4" />
                  <span>Ajukan Laporan Penelitian ke Kadiv BPDP</span>
                </button>
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
    </div>

    <!-- Confirmation Modal -->
    <ApprovalConfirmationModal :is-open="showConfirmModal" :action-type="confirmActionType" :destination-stage="confirmDestination" :notes="confirmNotes" @close="showConfirmModal = false" @confirm="executePendingAction" />

    <DocumentPreviewModal :is-open="showPreview && !!previewDoc" :title="previewDoc?.title ?? ''" :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? 'application/octet-stream'" @close="showPreview = false" />
  </div>
</template>
