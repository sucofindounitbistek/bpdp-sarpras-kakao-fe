<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePekebunStore } from '@/stores/pekebun';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
  X,
  Upload,
  MapPin,
  Warehouse,
  FileText,
  AlertCircle,
  Download,
  Lock,
  Printer,
  ChevronDown,
  ChevronUp,
  Users,
  Calculator,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  AlertTriangle,
  History,
} from 'lucide-vue-next';
import type { DokumenUpload, DokumenPersyaratan, CreateProposalDocumentValidationPayload } from '@/types/pengusulan';
import { JenisSarpras, PengajuanStatus } from '@/types/pengusulan';
import { TipeDokumenPekebun } from '@/types/pekebun';
import { PAKET_OPTIONS, PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { resolveProposalRequirements } from '@/lib/dynamicRequirements';
import KabupatenRevisiConfirmationModal from '@/components/approval/KabupatenRevisiConfirmationModal.vue';
import DocumentVersionHistoryModal from '@/components/pengusulan/DocumentVersionHistoryModal.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import type { RejectedProposalDocItem, GroupedPekebunRejection, RejectedPekebunDetailItem } from '@/types/approval';
import VerificationOverlapMap from '@/components/verification/VerificationOverlapMap.vue';
import DropdownEksporPekebun from '@/components/verification/DropdownEksporPekebun.vue';
import RabTable from '@/components/pengusulan/RabTable.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import { useToast } from '@/composables/useToast';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useAuthStore } from '@/stores/auth';
import { getRabTahapCount } from '@/types/rab';
import type { CreateRabItemPayload } from '@/types/rab';
import { rabService } from '@/services/rab.service';
import { lahanService } from '@/services/lahan.service';
import { LOCALIZATION } from '@/config/localization';

function parsePolygonCoords(raw: string): Array<[number, number]> {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed
        .filter((p: any) => Array.isArray(p) && p.length >= 2)
        .map((p: any) => [Number(p[0]), Number(p[1])] as [number, number])
        .filter(([lat, lng]: [number, number]) => Number.isFinite(lat) && Number.isFinite(lng));
    }
  } catch {
    /* fall through */
  }
  // Handle newline/semicolon separated "lat, lng" lines
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
  // Last resort: legacy parseCoordinatePolygon
  const points = parseCoordinatePolygon(raw);
  return points.filter((pt) => pt.lat !== null && pt.lng !== null).map((pt) => [pt.lat!, pt.lng!] as [number, number]);
}

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const pekebunStore = usePekebunStore();
const verifikasiStore = useVerifikasiKabDraftStore();
const masterStore = useMasterSarprasStore();
const authStore = useAuthStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id));
});

// Watch proposal paket to fetch dynamic master requirements
watch(
  () => pengajuan.value?.jenisSarpras || (pengajuan.value as any)?.paket_sarpras || (pengajuan.value as any)?.paketSarpras,
  (paket) => {
    if (paket) {
      masterStore.fetchPersyaratan(String(paket), false);
    }
  },
  { immediate: true },
);

const spatialOverlapData = ref<any>(null);

async function loadSpatialOverlap(targetId: string | number) {
  if (!targetId) return;
  try {
    const res = await pengusulanStore.getSpatialOverlap(targetId);
    if (res) {
      spatialOverlapData.value = (res as any)?.data || res;
    }
  } catch (error) {
    console.error('Failed to load spatial overlap:', error);
  }
}

onMounted(() => {
  loadSpatialOverlap(id);
});

watch(
  () => id,
  (newId) => {
    if (newId) {
      loadSpatialOverlap(newId);
    }
  },
);

watch(
  () => [id, (pengajuan.value as any)?.rabFinalItems, (pengajuan.value as any)?.rabProposalItems, pengajuan.value?.rabItems],
  ([propId, finalItems, proposalItems, fallbackItems]) => {
    if (propId) {
      const sourceItems = (finalItems as any)?.length ? finalItems : (proposalItems as any)?.length ? proposalItems : (fallbackItems as any)?.length ? fallbackItems : [];
      verifikasiStore.initForProposal(String(propId), (sourceItems as any) || []);
      if (sourceItems && Array.isArray(sourceItems) && sourceItems.length > 0) {
        if (verifikasiStore.rabItems.length === 0) {
          verifikasiStore.rabItems = (sourceItems as any).map((r: any) => ({
            ...r,
            varietas: r.varietas || r.details?.varietas || '',
            varietasCustom: r.varietasCustom || r.details?.varietasCustom || '',
          }));
        } else {
          verifikasiStore.rabItems.forEach((r, idx) => {
            if (!r.varietas) {
              const match = (proposalItems as any)?.find((p: any) => p.uraian === r.uraian || p.id === r.id) || (sourceItems as any).find((p: any) => p.uraian === r.uraian || p.id === r.id) || (sourceItems as any)[idx];
              if (match && (match.varietas || match.details?.varietas)) {
                r.varietas = match.varietas || match.details?.varietas;
                r.varietasCustom = match.varietasCustom || match.details?.varietasCustom || '';
              }
            }
          });
        }
      }
    }
  },
  { immediate: true, deep: true },
);

const pekebunList = computed(() => {
  return (pengajuan.value?.daftarCPCL ?? []).map((cpcl) => {
    const enriched = (pekebunStore.listPekebun || []).find((p) => p.nik === cpcl.nik) || (pengajuan.value as any)?.pekebuns?.find((p: any) => (cpcl.nik && p.nik === cpcl.nik) || (cpcl.id && String(p.id) === String(cpcl.id)));
    return { cpcl, enriched };
  });
});

function goToVerifikasi(item: { primaryCpclId?: string; cpcl?: { id: string } }) {
  const targetId = item.primaryCpclId || item.cpcl?.id;
  router.push(`/dinas/verifikasi/kabupaten/${id}/pekebun/${targetId}`);
}

const dokumenLabels: Record<TipeDokumenPekebun, string> = {
  [TipeDokumenPekebun.SCAN_KTP]: 'Scan KTP',
  [TipeDokumenPekebun.SCAN_KK]: 'Scan KK',
  [TipeDokumenPekebun.SWAFOTO]: 'Swafoto',
  [TipeDokumenPekebun.SURAT_KUASA]: 'Surat Kuasa',
};

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

const showDokVerifModal = ref(false);
const selectedVerifDocId = ref('');
const selectedVerifDoc = computed(() => getDokumen(selectedVerifDocId.value));
const selectedPersyaratan = computed(() => currentPersyaratan.value.find((p) => p.id === selectedVerifDocId.value));
const currentDocIndex = computed(() => currentPersyaratan.value.findIndex((p) => p.id === selectedVerifDocId.value));
const hasPrevDoc = computed(() => currentDocIndex.value > 0);
const hasNextDoc = computed(() => currentDocIndex.value >= 0 && currentDocIndex.value < currentPersyaratan.value.length - 1);

function goToPrevDoc() {
  if (!hasPrevDoc.value) return;
  selectedVerifDocId.value = currentPersyaratan.value[currentDocIndex.value - 1].id;
}

function goToNextDoc() {
  if (!hasNextDoc.value) return;
  selectedVerifDocId.value = currentPersyaratan.value[currentDocIndex.value + 1].id;
}

const isRefreshingUrl = ref(false);
async function refreshProposalPresignedUrls() {
  if (!id) return;
  isRefreshingUrl.value = true;
  try {
    await pengusulanStore.getProposalDetail(id);
    toast.success('Tautan pratinjau dokumen berhasil dimuat ulang.');
  } catch {
    toast.error('Gagal memuat ulang tautan dokumen.');
  } finally {
    isRefreshingUrl.value = false;
  }
}

function getDokumenVerifStatus(persyaratanId: string): string {
  const v = getVerification(persyaratanId);
  if (v.status === 'APPROVED') return 'Sesuai';
  if (v.status === 'REJECTED') return 'Tidak Sesuai';
  return 'Belum Diverifikasi';
}

function openDokVerifModal(persyaratanId: string) {
  selectedVerifDocId.value = persyaratanId;
  showDokVerifModal.value = true;
}

function detectMimeType(url: string, name?: string, defaultMime?: string): string {
  const target = (name || url || '').toLowerCase().split('?')[0];
  if (target.endsWith('.jpg') || target.endsWith('.jpeg')) return 'image/jpeg';
  if (target.endsWith('.png')) return 'image/png';
  if (target.endsWith('.webp')) return 'image/webp';
  if (target.endsWith('.gif')) return 'image/gif';
  if (target.endsWith('.svg')) return 'image/svg+xml';
  if (target.endsWith('.pdf')) return 'application/pdf';
  if (defaultMime && (defaultMime.startsWith('image/') || defaultMime.includes('pdf'))) return defaultMime;
  return defaultMime || 'application/octet-stream';
}

function openPreview(doc?: any) {
  if (!doc) return;
  let dataUrl = '';
  let mimeType = 'application/octet-stream';
  let title = 'Dokumen';

  if (typeof doc === 'string') {
    dataUrl = doc;
    title = 'Pratinjau Dokumen';
    mimeType = detectMimeType(dataUrl, title, 'image/jpeg');
  } else if ('fileUrl' in doc && doc.fileUrl) {
    dataUrl = doc.fileUrl;
    title = doc.fileName || doc.namaFile || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.fileExtension || doc.mimeType);
  } else if ('file_url' in doc && doc.file_url) {
    dataUrl = doc.file_url;
    title = doc.file_name || doc.namaFile || doc.fileName || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mime_type || doc.file_extension || doc.mimeType);
  } else if ('dataUrl' in doc && doc.dataUrl) {
    dataUrl = doc.dataUrl;
    title = doc.namaFile || doc.fileName || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mimeType);
  } else if ('urlFile' in doc && doc.urlFile) {
    dataUrl = doc.urlFile;
    title = doc.namaFile || doc.fileName || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mimeType);
  } else if ('exterior_photo_file_url' in doc && doc.exterior_photo_file_url) {
    dataUrl = doc.exterior_photo_file_url;
    title = 'Foto Tampak Depan Gudang';
    mimeType = detectMimeType(dataUrl, title, 'image/jpeg');
  } else if ('interior_photo_file_url' in doc && doc.interior_photo_file_url) {
    dataUrl = doc.interior_photo_file_url;
    title = 'Foto Tampak Dalam Gudang';
    mimeType = detectMimeType(dataUrl, title, 'image/jpeg');
  }

  if (dataUrl) {
    previewDoc.value = {
      dataUrl,
      mimeType,
      title,
    };
    showPreview.value = true;
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractCoords(obj: any): Array<[number, number]> {
  if (!obj) return [];
  if (Array.isArray(obj.coordinates)) {
    return obj.coordinates
      .map((c: any) => {
        if (Array.isArray(c) && c.length >= 2) return [Number(c[0]), Number(c[1])] as [number, number];
        if (c && typeof c.lat === 'number' && typeof c.lng === 'number') return [c.lat, c.lng] as [number, number];
        return null;
      })
      .filter((c: any): c is [number, number] => c !== null && Number.isFinite(c[0]) && Number.isFinite(c[1]));
  }
  const raw = obj.koordinatPoligon || obj.polygon || obj.koordinat_polygon || (typeof obj.coordinates === 'string' ? obj.coordinates : '');
  if (typeof raw === 'string' && raw.trim()) {
    return parsePolygonCoords(raw);
  }
  return [];
}

const activePolygons = computed(() => {
  const overlap = spatialOverlapData.value || pengusulanStore.spatialOverlap;
  if (overlap?.active_polygons?.length) {
    const mapped = overlap.active_polygons
      .map((poly: any) => ({
        coordinates: extractCoords(poly),
        label: poly.label || poly.nama_pekebun || 'Lahan Pekebun',
      }))
      .filter((poly: any) => poly.coordinates.length >= 3);
    if (mapped.length > 0) return mapped;
  }

  if (!pengajuan.value) return [];
  const p = pengajuan.value as any;

  // Fallback 1: lahans directly on pengajuan
  if (Array.isArray(p.lahans) && p.lahans.length > 0) {
    const fromLahans = p.lahans.flatMap((lahan: any, idx: number) => {
      const coords = extractCoords(lahan);
      if (coords.length < 3) return [];
      const pekebunMatch = (p.pekebuns || p.daftarCPCL || []).find((pk: any) => String(pk.id) === String(lahan.pekebun_id) || pk.nik === lahan.nik);
      return [
        {
          coordinates: coords,
          label: pekebunMatch?.namaPekebun || pekebunMatch?.name || pekebunMatch?.nama || `Lahan Pekebun ${idx + 1}`,
        },
      ];
    });
    if (fromLahans.length > 0) return fromLahans;
  }

  // Fallback 2: pekebunList from enriched store or cpcl
  return pekebunList.value.flatMap((item, idx) => {
    const coords = extractCoords(item.enriched?.lahan) || extractCoords(item.cpcl) || extractCoords((item as any).lahan);
    const validCoords = coords.length >= 3 ? coords : extractCoords(item.cpcl);
    if (validCoords.length < 3) return [];
    return [
      {
        coordinates: validCoords,
        label: item.enriched?.nama || item.cpcl.namaPekebun || `Lahan Pekebun ${idx + 1}`,
      },
    ];
  });
});

const nearbyProposals = computed(() => {
  const overlap = spatialOverlapData.value || pengusulanStore.spatialOverlap;
  if (overlap?.other_proposals?.length) {
    return overlap.other_proposals.map((prop: any) => ({
      proposalId: String(prop.proposalId || prop.proposal_id || prop.id || ''),
      proposalNumber: prop.proposalNumber || prop.proposal_number || prop.nomor_proposal || prop.nomorProposal || '',
      proposalName: prop.proposalName || prop.proposal_name || prop.nama_lembaga || 'Kelembagaan',
      polygons: (prop.polygons || [])
        .map((poly: any) => ({
          coordinates: extractCoords(poly),
          label: poly.label || 'Lahan',
        }))
        .filter((poly: any) => poly.coordinates.length >= 3),
    }));
  }
  if (activePolygons.value.length === 0) return [];
  const activeCentroid = activePolygons.value[0].coordinates.reduce((acc: any, [lat, lng]: any) => [acc[0] + lat, acc[1] + lng], [0, 0]).map((v: any) => v / activePolygons.value[0].coordinates.length) as [number, number];

  return pengusulanStore.listPengajuan
    .filter((p) => p.id !== id)
    .filter((p) => {
      return (p.daftarCPCL ?? []).some((cpcl) => {
        const enriched = pekebunStore.listPekebun.find((pk) => pk.nik === cpcl.nik);
        const coords = extractCoords(enriched?.lahan) || extractCoords(cpcl);
        const validCoords = coords.length >= 3 ? coords : extractCoords(cpcl);
        if (validCoords.length < 3) return false;
        const centroid = validCoords.reduce((acc: any, [lat, lng]: any) => [acc[0] + lat, acc[1] + lng], [0, 0]).map((v: any) => v / validCoords.length) as [number, number];
        return haversineDistance(activeCentroid[0], activeCentroid[1], centroid[0], centroid[1]) <= 50;
      });
    })
    .map((p) => ({
      proposalId: p.id,
      proposalNumber: p.nomor_proposal || p.nomorProposal,
      proposalName: p.lembaga?.namaLembaga || 'Kelembagaan',
      polygons: (p.daftarCPCL ?? []).flatMap((cpcl) => {
        const enriched = pekebunStore.listPekebun.find((pk) => pk.nik === cpcl.nik);
        const coords = extractCoords(enriched?.lahan) || extractCoords(cpcl);
        const validCoords = coords.length >= 3 ? coords : extractCoords(cpcl);
        if (validCoords.length < 3) return [];
        return [{ coordinates: validCoords, label: enriched?.nama || cpcl.namaPekebun || 'Lahan Pekebun' }];
      }),
    }))
    .filter((p) => p.polygons.length > 0);
});

function fileToUpload(file: File, persyaratanId: string): Promise<DokumenUpload> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        persyaratanId,
        namaFile: file.name,
        mimeType: file.type,
        ukuranBytes: file.size,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  });
}

async function handleFotoUdaraUpload(cpclOrLahanId: string, file: File) {
  const lId = String(cpclOrLahanId);
  const cleanNumId = Number(lId.replace(/\D/g, ''));

  // Attempt API upload if lahan ID has numeric portion
  if (cleanNumId && !isNaN(cleanNumId)) {
    try {
      const res = await lahanService.uploadDocument(cleanNumId, file, 'FOTO_UDARA');
      const data = res?.data || res;
      const uploadedDoc: DokumenUpload = {
        persyaratanId: `foto-udara-${lId}`,
        namaFile: data?.file_name || file.name,
        mimeType: data?.mime_type || file.type,
        ukuranBytes: Number(data?.file_size) || file.size,
        dataUrl: data?.file_url || '',
        uploadedAt: data?.created_at || new Date().toISOString(),
      };
      verifikasiStore.fotoUdaraPerPekebun[lId] = uploadedDoc;

      // Sync activePengajuan lahans documents
      const p = pengusulanStore.activePengajuan;
      if (p && Array.isArray((p as any).lahans)) {
        const targetLahan = (p as any).lahans.find((l: any) => String(l.id) === lId || Number(l.id) === cleanNumId);
        if (targetLahan) {
          if (!targetLahan.documents) targetLahan.documents = [];
          const existingIdx = targetLahan.documents.findIndex((d: any) => String(d.document_type || d.documentType).toUpperCase() === 'FOTO_UDARA');
          const newDocPayload = {
            id: data?.id,
            document_type: 'FOTO_UDARA',
            file_name: data?.file_name || file.name,
            file_url: data?.file_url || '',
            file_size: String(data?.file_size || file.size),
            file_extension: data?.file_extension || '',
            mime_type: data?.mime_type || file.type,
            created_at: data?.created_at || new Date().toISOString(),
          };
          if (existingIdx >= 0) {
            targetLahan.documents[existingIdx] = newDocPayload;
          } else {
            targetLahan.documents.push(newDocPayload);
          }
        }
      }
      toast.success('Foto Udara berhasil diunggah.');
      return;
    } catch (err: any) {
      console.warn('API upload failed, falling back to local file reader:', err);
    }
  }

  // Fallback for tests or offline/local mock
  const doc = await fileToUpload(file, `foto-udara-${lId}`);
  verifikasiStore.fotoUdaraPerPekebun[lId] = doc;
  toast.success('Foto Udara berhasil diunggah.');
}

async function handleKabRabUpload(file: File) {
  if (file.type !== 'application/pdf') {
    toast.error('RAB bertandatangan harus berformat PDF.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Ukuran file melebihi 10 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const doc: DokumenUpload = {
      persyaratanId: 'RAB_KAB_SIGNED',
      namaFile: file.name,
      mimeType: file.type,
      ukuranBytes: file.size,
      dataUrl: e.target?.result as string,
      uploadedAt: new Date().toISOString(),
    };
    verifikasiStore.setRabDitandatangani(doc);
    toast.success(`RAB bertandatangan "${doc.namaFile}" berhasil diunggah.`);
  };
  reader.readAsDataURL(file);
}

const showDownloadConfirm = ref(false);
const rabDownloaded = ref(false);

const step2Unlocked = computed(() => verifikasiStore.rabItems.length > 0);
const step3Unlocked = computed(() => rabDownloaded.value);
const step4Visible = computed(() => rabDownloaded.value);

function requestDownloadRAB() {
  if (verifikasiStore.rabItems.length === 0) {
    toast.error(LOCALIZATION.rabTable.downloadWarning);
    return;
  }
  showDownloadConfirm.value = true;
}

const storageArea = computed(() => pengajuan.value?.storage_area || pengajuan.value?.gudangSerahTerima);
const gudangAlamat = computed(() => storageArea.value?.address || storageArea.value?.alamat || '-');
const gudangKoordinat = computed(() => storageArea.value?.coordinate || storageArea.value?.koordinat || '-');

const exteriorPhoto = computed(() => {
  const sa = storageArea.value;
  if (!sa) return null;
  const doc = sa.fotoTampakDepan;
  const url = doc?.dataUrl || doc?.fileUrl || sa.exterior_photo_file_url || (typeof doc === 'string' ? doc : '');
  if (!url && !doc) return null;
  return {
    persyaratanId: 'gudang-depan',
    namaFile: doc?.namaFile || doc?.namaFile || 'Foto Tampak Depan Gudang',
    dataUrl: url,
    mimeType: doc?.mimeType || doc?.mimeType || detectMimeType(url, doc?.namaFile || doc?.namaFile, 'image/jpeg'),
  };
});

const interiorPhoto = computed(() => {
  const sa = storageArea.value;
  if (!sa) return null;
  const doc = sa.fotoTampakDalam;
  const url = doc?.dataUrl || doc?.fileUrl || sa.interior_photo_file_url || (typeof doc === 'string' ? doc : '');
  if (!url && !doc) return null;
  return {
    persyaratanId: 'gudang-dalam',
    namaFile: doc?.namaFile || doc?.namaFile || 'Foto Tampak Dalam Gudang',
    dataUrl: url,
    mimeType: doc?.mimeType || doc?.mimeType || detectMimeType(url, doc?.namaFile || doc?.namaFile, 'image/jpeg'),
  };
});
const currentPaket = computed(() => pengajuan.value?.paket_sarpras || pengajuan.value?.jenisSarpras || (pengajuan.value as any)?.paketSarpras || '');

function formatDecimal(val: number | null | undefined, maxDigits = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits,
  });
}

function confirmDownloadRAB() {
  showDownloadConfirm.value = false;
  const tahapCount = getRabTahapCount(currentPaket.value);

  let colspan = 7;
  let headers: string[] = [];

  if (tahapCount === 4) {
    colspan = 11;
    headers = ['Jenis', 'Barang / Jasa', 'Varietas', 'Tahap 1', 'Tahap 2', 'Tahap 3', 'Tahap 4', 'Total', 'Satuan', 'Harga Satuan (Rp)', 'Sub-total (Rp)'];
  } else if (tahapCount === 2) {
    colspan = 9;
    headers = ['Jenis', 'Barang / Jasa', 'Varietas', 'Tahap 1', 'Tahap 2', 'Total', 'Satuan', 'Harga Satuan (Rp)', 'Sub-total (Rp)'];
  } else {
    colspan = 7;
    headers = ['Jenis', 'Barang / Jasa', 'Varietas', 'Volume', 'Satuan', 'Harga Satuan (Rp)', 'Sub-total (Rp)'];
  }

  const headersHTML = headers.map((h) => `<th>${h}</th>`).join('');

  const rowsHTML = verifikasiStore.rabItems
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

      const displayVarietas = r.varietas === 'Kelapa Varietas Lainnya' ? (r.varietasCustom ? `${r.varietas} (${r.varietasCustom})` : r.varietas) : r.varietas || '-';

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

  const summaryHTML = `
    <tr class="total-row">
      <td colspan="${colspan - 1}" class="right-align font-semibold">Total Anggaran</td>
      <td class="right-align font-semibold">${formatDecimal(verifikasiStore.rabTotal, 1)}</td>
    </tr>
  `;

  const kelompokTaniName =
    pengajuan.value?.lembaga?.namaLembaga ||
    (pengajuan.value as any)?.nama_kelembagaan ||
    (pengajuan.value as any)?.namaKelompokTani ||
    (pengajuan.value as any)?.namaLembagaPekebun ||
    authStore.user?.kelembagaan_name ||
    'Kelembagaan Pekebun';

  const kelompokTaniAddress = (pengajuan.value as any)?.alamat_kelembagaan || pengajuan.value?.lembaga?.alamatLengkap || '-';

  const ketuaName = pengajuan.value?.lembaga?.namaKetua || (pengajuan.value as any)?.nama_ketua || (pengajuan.value as any)?.kelembagaan?.nama_ketua || (pengajuan.value as any)?.namaKetua || 'Budi Santoso';

  const nomorProposal = pengajuan.value?.nomor_proposal || pengajuan.value?.nomorProposal || '-';

  const paketLabel = currentPaket.value || 'Rancangan Anggaran Biaya';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rancangan Anggaran Biaya Final - ${nomorProposal}</title>
      <style>
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: ${tahapCount > 1 ? 'A4 landscape' : 'A4 portrait'};
            margin: 15mm;
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
          margin-bottom: 20px;
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
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-top: 15px;
          margin-bottom: 15px;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 7px 9px;
          text-align: left;
        }
        th {
          background-color: #f8fafc !important;
          font-weight: 600;
          color: #334155;
        }
        .package-header {
          background-color: #f1f5f9 !important;
          font-weight: 700;
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
        .total-row {
          background-color: #f8fafc;
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
        <h1>Rancangan Anggaran Biaya (RAB) Final</h1>
        <h2>${kelompokTaniName}</h2>
      </div>
      <div class="info">
        <div><strong>Alamat:</strong> ${kelompokTaniAddress}</div>
        <div><strong>No. Proposal:</strong> ${nomorProposal}</div>
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
  toast.success('Dokumen RAB Final (PDF) berhasil di-generate.');
}

function cancelDownloadRAB() {
  showDownloadConfirm.value = false;
}

function getPekebunStatus(cpclId: string, nik?: string, lahans?: Array<{ id: string }>, additionalKeys?: string[]): 'Sesuai' | 'Tidak Sesuai' | 'Belum Diverifikasi' {
  const keysToCheck = new Set<string>();
  if (cpclId) keysToCheck.add(String(cpclId));
  if (nik && nik !== '-') keysToCheck.add(String(nik).trim());
  if (lahans) {
    for (const l of lahans) {
      if (l.id) keysToCheck.add(String(l.id));
    }
  }
  if (additionalKeys) {
    for (const k of additionalKeys) {
      if (k) keysToCheck.add(String(k).trim());
    }
  }

  const keysArray = Array.from(keysToCheck);
  const prefixes = keysArray.map((k) => `doc-${k}-`);
  const matchingEntries = Object.entries(verifikasiStore.verifications).filter(([k]) => prefixes.some((p) => k.startsWith(p)));

  // 1. Any rejection takes precedence
  if (matchingEntries.some(([, v]) => v.status === 'REJECTED')) {
    return 'Tidak Sesuai';
  }

  for (const k of keysArray) {
    const pv = verifikasiStore.pekebunVerifications[k];
    if (pv && pv.status === 'REJECTED') return 'Tidak Sesuai';
  }

  // 2. Approvals
  const approvedEntries = matchingEntries.filter(([, v]) => v.status === 'APPROVED');
  if (approvedEntries.length > 0) {
    return 'Sesuai';
  }

  for (const k of keysArray) {
    const pv = verifikasiStore.pekebunVerifications[k];
    if (pv && pv.status === 'APPROVED') return 'Sesuai';
  }

  return 'Belum Diverifikasi';
}

interface GroupedLahan {
  id: string;
  luasLahanHektar: number;
  jenisHakLahan: string;
  nomorSuratLahan: string;
  koordinat?: any;
}

interface GroupedPekebunItem {
  key: string;
  nik: string;
  namaPekebun: string;
  primaryCpclId: string;
  primaryCpcl: any;
  enriched: any;
  lahans: GroupedLahan[];
  totalLuasLahan: number;
  totalBidang: number;
  status: 'Sesuai' | 'Tidak Sesuai' | 'Belum Diverifikasi';
}

const groupedPekebunList = computed((): GroupedPekebunItem[] => {
  const rawList = pengajuan.value?.daftarCPCL ?? [];
  const map = new Map<string, GroupedPekebunItem>();

  for (const cpcl of rawList) {
    const key = (cpcl.nik && cpcl.nik.trim()) || (cpcl.namaPekebun && cpcl.namaPekebun.trim()) || String(cpcl.id);
    const enriched = (pekebunStore.listPekebun || []).find((p) => p.nik === cpcl.nik) || (pengajuan.value as any)?.pekebuns?.find((p: any) => (cpcl.nik && p.nik === cpcl.nik) || (cpcl.id && String(p.id) === String(cpcl.id)));

    if (!map.has(key)) {
      map.set(key, {
        key,
        nik: cpcl.nik || '-',
        namaPekebun: cpcl.namaPekebun || 'Pekebun',
        primaryCpclId: String(cpcl.id),
        primaryCpcl: cpcl,
        enriched,
        lahans: [],
        totalLuasLahan: 0,
        totalBidang: 0,
        status: 'Belum Diverifikasi',
      });
    }

    const item = map.get(key)!;
    item.lahans.push({
      id: String(cpcl.id),
      luasLahanHektar: Number(cpcl.luasLahanHektar) || 0,
      jenisHakLahan: cpcl.jenisHakLahan || 'Surat Lahan',
      nomorSuratLahan: cpcl.nomorSuratLahan || '-',
      koordinat: (cpcl as any).koordinat || (cpcl as any).coordinates,
    });
    item.totalLuasLahan += Number(cpcl.luasLahanHektar) || 0;
    item.totalBidang = item.lahans.length;
    if (!item.enriched && enriched) {
      item.enriched = enriched;
    }
  }

  const result = Array.from(map.values());
  for (const item of result) {
    const extraKeys: string[] = [];
    if (item.enriched?.id) extraKeys.push(String(item.enriched.id));
    if (item.primaryCpcl?.pekebun_id) extraKeys.push(String(item.primaryCpcl.pekebun_id));
    const matchedProfile = (pekebunStore.listPekebun || []).find((p) => (item.nik && item.nik !== '-' && p.nik === item.nik) || (item.namaPekebun && p.nama === item.namaPekebun));
    if (matchedProfile?.id) extraKeys.push(String(matchedProfile.id));
    if (matchedProfile?.nik) extraKeys.push(String(matchedProfile.nik));

    item.status = getPekebunStatus(item.primaryCpclId, item.nik, item.lahans, extraKeys);
  }

  return result;
});

function getFotoUdaraForLahan(lahanId: string | number) {
  const lId = String(lahanId);
  const cleanNumId = Number(lId.replace(/\D/g, ''));

  // 1. Check in pengajuan.value.lahans
  const rawLahans: any[] = (pengajuan.value as any)?.lahans || [];
  const foundLahan = rawLahans.find((l: any) => String(l.id) === lId || (cleanNumId && Number(l.id) === cleanNumId));
  if (foundLahan && Array.isArray(foundLahan.documents)) {
    const doc = foundLahan.documents.find((d: any) => String(d.document_type || d.documentType).toUpperCase() === 'FOTO_UDARA');
    if (doc) {
      return {
        id: doc.id,
        persyaratanId: `foto-udara-${lId}`,
        namaFile: doc.file_name || doc.fileName || 'Foto Udara',
        file_name: doc.file_name || doc.fileName || 'Foto Udara',
        fileUrl: doc.file_url || doc.fileUrl,
        file_url: doc.file_url || doc.fileUrl,
        dataUrl: doc.file_url || doc.fileUrl,
        mimeType: doc.mime_type || doc.mimeType || 'image/jpeg',
        ukuranBytes: Number(doc.file_size || doc.fileSize || 0),
        uploadedAt: doc.created_at || '',
      };
    }
  }

  // 2. Check in verifikasiStore.fotoUdaraPerPekebun by lahan id
  if (verifikasiStore.fotoUdaraPerPekebun[lId]) {
    return verifikasiStore.fotoUdaraPerPekebun[lId];
  }
  if (verifikasiStore.fotoUdaraPerPekebun[`CPCL-${lId}`]) {
    return verifikasiStore.fotoUdaraPerPekebun[`CPCL-${lId}`];
  }

  return undefined;
}

function getFotoUdaraForPekebun(item: GroupedPekebunItem) {
  for (const l of item.lahans) {
    const fu = getFotoUdaraForLahan(l.id);
    if (fu) return fu;
  }
  if (verifikasiStore.fotoUdaraPerPekebun[item.primaryCpclId]) {
    return verifikasiStore.fotoUdaraPerPekebun[item.primaryCpclId];
  }
  if (verifikasiStore.fotoUdaraPerPekebun[`CPCL-${item.primaryCpclId}`]) {
    return verifikasiStore.fotoUdaraPerPekebun[`CPCL-${item.primaryCpclId}`];
  }
  if (item.nik && item.nik !== '-' && verifikasiStore.fotoUdaraPerPekebun[item.nik]) {
    return verifikasiStore.fotoUdaraPerPekebun[item.nik];
  }
  if (item.enriched?.id && verifikasiStore.fotoUdaraPerPekebun[String(item.enriched.id)]) {
    return verifikasiStore.fotoUdaraPerPekebun[String(item.enriched.id)];
  }
  return undefined;
}

function isPekebunFotoUdaraComplete(item: GroupedPekebunItem): boolean {
  if (item.lahans.length > 0) {
    return item.lahans.every((l) => !!getFotoUdaraForLahan(l.id));
  }
  return !!getFotoUdaraForPekebun(item);
}

const allFotoUdaraUploaded = computed(() => {
  if (groupedPekebunList.value.length === 0) return true;
  return groupedPekebunList.value.every((item) => isPekebunFotoUdaraComplete(item));
});

const missingFotoUdaraCount = computed(() => {
  return groupedPekebunList.value.filter((item) => !isPekebunFotoUdaraComplete(item)).length;
});

async function onFotoUdaraLahanChange(lahanId: string | number, event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files?.[0]) {
    await handleFotoUdaraUpload(String(lahanId), target.files[0]);
  }
}

function handleRemoveFotoUdaraLahan(lahanId: string | number) {
  const lId = String(lahanId);
  delete verifikasiStore.fotoUdaraPerPekebun[lId];
  delete verifikasiStore.fotoUdaraPerPekebun[`CPCL-${lId}`];

  const p = pengusulanStore.activePengajuan;
  if (p && Array.isArray((p as any).lahans)) {
    const targetLahan = (p as any).lahans.find((l: any) => String(l.id) === lId);
    if (targetLahan && Array.isArray(targetLahan.documents)) {
      targetLahan.documents = targetLahan.documents.filter((d: any) => String(d.document_type || d.documentType).toUpperCase() !== 'FOTO_UDARA');
    }
  }

  const cleanNumId = Number(lId.replace(/\D/g, ''));
  if (cleanNumId && !isNaN(cleanNumId)) {
    lahanService.deleteDocument(cleanNumId, 'FOTO_UDARA').catch((err) => {
      console.warn('Failed to delete document on server:', err);
    });
  }

  toast.info('Foto Udara dihapus.');
}

// --- Dokumen Proposal Verification ---
const normalizedPaket = computed(() => {
  if (!pengajuan.value) return '';
  const raw = String(pengajuan.value.jenisSarpras || (pengajuan.value as any).jenis_sarpras || (pengajuan.value as any).paket_sarpras || (pengajuan.value as any).paketSarpras || '').trim();
  return raw.toUpperCase();
});

const selectedPaketInfo = computed(() => PAKET_OPTIONS.find((p) => p.id === pengajuan.value?.jenisSarpras || p.id === normalizedPaket.value));

const dynamicResolvedRequirements = computed(() => {
  if (!pengajuan.value) return [];
  const key = pengajuan.value.jenisSarpras || normalizedPaket.value;
  const masterList = masterStore.persyaratanMap[key];
  const proposalDocs = (pengajuan.value as any).documents || pengajuan.value.dokumen || [];
  return resolveProposalRequirements(key, proposalDocs, masterList, true);
});

const currentPersyaratan = computed(() => {
  if (!pengajuan.value) return [];
  let reqs: Array<{ id: string; nama: string; wajib: boolean; formatDownloadUrl: string | null; isFromMaster?: boolean }> = [];
  if (dynamicResolvedRequirements.value.length > 0) {
    reqs = dynamicResolvedRequirements.value.map((d) => ({
      id: d.id,
      nama: d.nama,
      wajib: d.isWajib,
      formatDownloadUrl: d.formatDownloadUrl || null,
      isFromMaster: d.isFromMaster,
    }));
  } else {
    const key = pengajuan.value.jenisSarpras || normalizedPaket.value;
    reqs = [...(PAKET_PERSYARATAN_CONFIG[key] ?? [])];
  }
  return reqs.filter((p) => !normalizeDocToken(p.id).includes('RAB'));
});

const isPupukPaket = computed(() => {
  const p = normalizedPaket.value;
  return p.includes('EKSTENSIFIKASI') || p.includes('INTENSIFIKASI') || p.includes('PUPUK') || p.includes('FERTILIZER') || p === JenisSarpras.EKSTENSIFIKASI || p === JenisSarpras.INTENSIFIKASI;
});

const hasStorageArea = computed(() => {
  if (!pengajuan.value) return false;
  const sa = pengajuan.value.storage_area || pengajuan.value.gudangSerahTerima;
  const hasSaData = !!(sa && (sa.address || sa.alamat || sa.coordinate || sa.koordinat || sa.fotoTampakDepan || sa.fotoTampakDalam || sa.exterior_photo_file_url || sa.interior_photo_file_url));
  return hasSaData || isPupukPaket.value;
});

const pemohonRabItems = computed(() => {
  const p = pengajuan.value as any;
  if (p?.rabProposalItems?.length) return p.rabProposalItems;
  if (p?.rab_proposal?.items?.length) return p.rab_proposal.items;
  return p?.rabItems || [];
});

const pemohonRabTotal = computed(() => {
  return pemohonRabItems.value.reduce((sum: number, r: any) => sum + (r.subTotal || 0), 0);
});

const hasRabContent = computed(() => {
  if (!pengajuan.value) return false;
  const hasItems = (pemohonRabItems.value && pemohonRabItems.value.length > 0) || (verifikasiStore.rabItems && verifikasiStore.rabItems.length > 0);
  const hasDoc = !!getDokumen('RAB_RK');
  return hasItems || hasDoc || true;
});

const DOC_ALIAS_MAP: Record<string, string[]> = {
  LEGALITAS_KP: ['DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KP', 'KELEMBAGAAN', 'LEGALITAS_LEMBAGA'],
  SIMLUHTAN: ['SURAT_PERMOHONAN', 'SIMLUHTAN', 'PERMOHONAN', 'DATA_PENUNJUKKAN_KETUA'],
  RAB_RK: ['RAB_PROPOSAL', 'RAB_RK', 'RAB_FINAL', 'RAB'],
  RAB_DETAIL: ['RAB_PROPOSAL', 'RAB_DETAIL', 'RAB_FINAL', 'RAB'],
  PROPOSAL_TEKNIS: ['PROPOSAL_TEKNIS', 'PROPOSAL_TEKNIS_DAN_RAB'],
  PERNYATAAN_LUAS: ['PERNYATAAN_LUAS', 'SURAT_PERNYATAAN_LUAS', 'SURAT_PERNYATAAN_KEABSAHAN', 'SPTJM'],
  PERNYATAAN_TANPA_BAKAR: ['PERNYATAAN_TANPA_BAKAR', 'SURAT_PERNYATAAN_TANPA_BAKAR'],
  GAMBAR_LAHAN: ['GAMBAR_LAHAN', 'PETA_LAHAN', 'DENAH_LAHAN'],
};

function normalizeDocToken(str: string): string {
  return (str || '').toUpperCase().replace(/[-_\s]/g, '');
}

function matchDocType(docType: string, aliases: string[]): boolean {
  const normDocType = normalizeDocToken(docType);
  if (!normDocType) return false;
  return aliases.some((a) => normalizeDocToken(a) === normDocType);
}

function getDokumen(persyaratanId: string): DokumenPersyaratan | undefined {
  if (!pengajuan.value) return undefined;

  // 0. Cek terlebih dahulu di dynamicResolvedRequirements
  const resolved = dynamicResolvedRequirements.value.find((d) => d.id === persyaratanId || d.code === persyaratanId);
  if (resolved && resolved.isUploaded && resolved.fileUrl) {
    return {
      id: String(resolved.uploadedDocId || resolved.id),
      persyaratanId: resolved.code || persyaratanId,
      tipeDokumen: (resolved.code || persyaratanId) as any,
      namaFile: resolved.fileName || 'Dokumen Proposal.pdf',
      urlFile: resolved.fileUrl || '',
      ukuranBytes: Number(resolved.fileSize) || 0,
      uploadedAt: resolved.uploadedAt || '',
      isValid: true,
    };
  }

  const aliases = DOC_ALIAS_MAP[persyaratanId] || [persyaratanId];

  // 1. Check in pengajuan.value.dokumen array
  const fromDokumen = (pengajuan.value.dokumen || []).find((d) => {
    const t = d.tipeDokumen || d.persyaratanId || '';
    return matchDocType(t, aliases);
  });
  if (fromDokumen) return fromDokumen;

  // 2. Check in pengajuan.value.documents array
  const fromDocs = (pengajuan.value.documents || []).find((d: any) => {
    const t = d.document_type || d.documentType || d.tipeDokumen || '';
    return matchDocType(t, aliases);
  });
  if (fromDocs) {
    const rawDoc = fromDocs as any;
    return {
      id: String(rawDoc.id),
      persyaratanId: rawDoc.document_type || persyaratanId,
      tipeDokumen: (rawDoc.document_type || persyaratanId) as any,
      namaFile: rawDoc.file_name || rawDoc.file?.name || 'Dokumen Proposal.pdf',
      urlFile: rawDoc.file_url || rawDoc.file?.file_url || rawDoc.urlFile || '',
      ukuranBytes: Number(rawDoc.file_size) || 0,
      uploadedAt: rawDoc.created_at || '',
      isValid: true,
    };
  }

  return undefined;
}

const { getVerification, setVerificationStatus } = verifikasiStore;

function approveAll() {
  currentPersyaratan.value.forEach((p) => setVerificationStatus(p.id, 'APPROVED'));
  if (hasStorageArea.value) {
    setVerificationStatus('gudangAlamat', 'APPROVED');
    setVerificationStatus('gudangKoordinat', 'APPROVED');
    setVerificationStatus('fotoTampakDepan', 'APPROVED');
    setVerificationStatus('fotoTampakDalam', 'APPROVED');
  }
  toast.success('Semua item telah ditandai sebagai disetujui.');
}

const allVerificationKeys = computed(() => {
  const keys = currentPersyaratan.value.map((p) => p.id);
  if (hasStorageArea.value) keys.push('gudangAlamat', 'gudangKoordinat', 'fotoTampakDepan', 'fotoTampakDalam');
  return keys;
});

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const isSubmittingRejection = ref(false);
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

const showVersionHistoryModal = ref(false);
const selectedHistoryDocType = ref('');
const selectedHistoryDocLabel = ref('');

function openVersionHistory(docType: string, label: string) {
  selectedHistoryDocType.value = docType;
  selectedHistoryDocLabel.value = label;
  showVersionHistoryModal.value = true;
}

const rejectedProposalDocs = computed<RejectedProposalDocItem[]>(() => {
  const storageAreaLabelMap: Record<string, string> = {
    gudangAlamat: 'Gudang (Alamat)',
    gudangKoordinat: 'Gudang (Koordinat)',
    fotoTampakDepan: 'Gudang (Foto Tampak Depan)',
    fotoTampakDalam: 'Gudang (Foto Tampak Dalam)',
  };

  return allVerificationKeys.value
    .filter((key) => getVerification(key).status === 'REJECTED')
    .map((key) => {
      const label = currentPersyaratan.value.find((p) => p.id === key)?.nama ?? storageAreaLabelMap[key] ?? key;
      return {
        id: key,
        name: label,
        notes: getVerification(key).notes || '',
      };
    });
});

const groupedPekebunRejections = computed<GroupedPekebunRejection[]>(() => {
  const result: GroupedPekebunRejection[] = [];

  for (const p of pekebunList.value) {
    const cpclId = p.cpcl.id;
    const prefix = `doc-${cpclId}-`;
    const rejectedEntries = Object.entries(verifikasiStore.verifications).filter(([key, v]) => key.startsWith(prefix) && v.status === 'REJECTED');

    // 1. Identify all lahans associated with this pekebun
    const lahans: any[] = (pengajuan.value as any)?.lahans || (p.enriched as any)?.lahans || (p.enriched?.lahan ? [p.enriched.lahan] : []);
    const matchingLahans: any[] = [];
    for (const l of lahans) {
      const idMatch = String(l.id) === String(cpclId);
      const pekebunIdMatch =
        (p.enriched?.id && String(l.pekebun_id || '') === String(p.enriched.id)) ||
        ((p.cpcl as any)?.pekebun_id && String(l.pekebun_id || '') === String((p.cpcl as any).pekebun_id));
      const cpclLahanMatch = (p.cpcl as any)?.lahan && String((p.cpcl as any).lahan.id) === String(l.id);
      if (idMatch || pekebunIdMatch || cpclLahanMatch) {
        if (!matchingLahans.some((existing) => String(existing.id) === String(l.id))) {
          matchingLahans.push(l);
        }
      }
    }
    if (!matchingLahans.some((l) => String(l.id) === String(cpclId))) {
      matchingLahans.push({
        id: String(cpclId),
        jenisHakLahan: p.cpcl.jenisHakLahan,
        nomorSuratLahan: p.cpcl.nomorSuratLahan,
      });
    }

    // 2. Direct polygon verification items
    const polygonItems: RejectedPekebunDetailItem[] = [];
    for (const l of matchingLahans) {
      if (!l.id) continue;
      const polyKey = `lahan-${l.id}-polygon`;
      const polyVerif = verifikasiStore.verifications[polyKey];
      if (polyVerif && polyVerif.status === 'REJECTED') {
        const lLabel = l.nomorSuratLahan ? `${l.jenisHakLahan || 'Lahan'} - ${l.nomorSuratLahan}` : l.namaLahan || 'Lahan';
        polygonItems.push({
          key: polyKey,
          docTypeOrField: `${lLabel} (Poligon Batas Lahan)`,
          notes: polyVerif.notes || '',
        });
      }
    }

    // Skip if nothing is rejected for this pekebun
    if (rejectedEntries.length === 0 && polygonItems.length === 0) continue;

    // 3. Filter out parent container keys if child subfield or polygon rejections exist, or if parent notes is empty
    const leafRejectedEntries = rejectedEntries.filter(([key, v]) => {
      const hasSubfield = rejectedEntries.some(([otherKey]) => otherKey !== key && otherKey.startsWith(`${key}-`));
      if (hasSubfield) return false;

      const remainder = key.substring(prefix.length);
      const isParentDocKey = !remainder.includes('-');
      if (isParentDocKey) {
        const hasRelatedRejection = polygonItems.length > 0 || rejectedEntries.some(([otherKey]) => otherKey.includes('-'));
        if (!v.notes?.trim() && hasRelatedRejection) {
          return false;
        }
      }
      return true;
    });

    const items: RejectedPekebunDetailItem[] = leafRejectedEntries.map(([key, v]) => {
      const remainder = key.substring(prefix.length);
      let label = remainder;
      if (remainder.includes('-')) {
        const parts = remainder.split('-');
        const field = parts.pop() || remainder;
        const docIdStr = parts.join('-');

        const fieldLabels: Record<string, string> = {
          namaLengkap: 'Nama Lengkap',
          nik: 'NIK',
          nomorKK: 'Nomor KK',
          jenis_legalitas: 'Jenis Legalitas Lahan',
          nomor_legalitas: 'Nomor Legalitas Lahan',
          tanggal_penerbitan_legalitas: 'Tanggal Penerbitan Legalitas',
          luas_lahan: 'Luas Lahan',
          nomor_surat_beda_nama: 'Surat Kades Beda Nama',
          polygon: 'Poligon Batas Lahan',
          koordinat_poligon: 'Poligon Batas Lahan',
        };
        const fLabel = fieldLabels[field] || field;

        // Try to find base document name
        const farmerDocs: any[] = (p.enriched?.dokumen as any[]) || (p.cpcl?.documents as any[]) || (p.cpcl?.dokumen as any[]) || [];
        const foundFarmerDoc = farmerDocs.find((d: any) => String(d.id) === String(docIdStr));
        if (foundFarmerDoc) {
          const rawType = (foundFarmerDoc as any).documentType || (foundFarmerDoc as any).tipeDokumen || (foundFarmerDoc as any).document_type || '';
          const baseLabel = (dokumenLabels as Record<string, string>)[rawType] || (foundFarmerDoc as any).fileName || rawType || 'Dokumen Pekebun';
          label = `${baseLabel} (${fLabel})`;
        } else {
          let foundLDocLabel = '';
          for (const l of matchingLahans) {
            const lDocs = l.documents || l.dokumen || [];
            if (lDocs.some((d: any) => String(d.id) === String(docIdStr))) {
              foundLDocLabel = l.nomorSuratLahan ? `${l.jenisHakLahan || 'Lahan'} - ${l.nomorSuratLahan}` : l.namaLahan || 'Lahan';
              break;
            }
          }
          label = foundLDocLabel ? `${foundLDocLabel} (${fLabel})` : fLabel;
        }
      } else {
        label = (dokumenLabels as Record<string, string>)[remainder] || 'Dokumen Lahan/Pekebun';
      }

      return {
        key,
        docTypeOrField: label,
        notes: v.notes || '',
      };
    });

    // 4. Merge polygonItems avoiding duplicates
    for (const polyItem of polygonItems) {
      const existing = items.find((i) => i.key === polyItem.key || (i.docTypeOrField.includes('Poligon Batas Lahan') && i.key.endsWith('-polygon')));
      if (!existing) {
        items.push(polyItem);
      } else if (!existing.notes && polyItem.notes) {
        existing.notes = polyItem.notes;
      }
    }

    if (items.length > 0) {
      result.push({
        pekebunId: cpclId,
        namaPekebun: p.cpcl.namaPekebun || 'Pekebun',
        nik: p.cpcl.nik || '-',
        items,
      });
    }
  }

  return result;
});

const hasRejection = computed(() => {
  return rejectedProposalDocs.value.length > 0 || groupedPekebunRejections.value.length > 0;
});

watch(
  [() => hasRejection.value, () => rejectedProposalDocs.value, () => groupedPekebunRejections.value, () => verifikasiStore.verifications],
  ([hasRej, rejDocs, rejPekebuns, verifs]) => {
    const allRejectedStoreEntries = Object.entries(verifs || {})
      .filter(([_, v]) => v?.status === 'REJECTED')
      .map(([key, v]) => ({ key, notes: v.notes, validatedByRole: v.validatedByRole }));

    const mappedProposalKeys = new Set(rejDocs.map((d) => d.id));
    const mappedPekebunKeys = new Set(rejPekebuns.flatMap((p) => p.items.map((i) => i.key)));
    const unmappedStoreKeys = allRejectedStoreEntries.filter((item) => !mappedProposalKeys.has(item.key) && !mappedPekebunKeys.has(item.key));

    if (hasRej || allRejectedStoreEntries.length > 0) {
      console.groupCollapsed(
        `%c[Verifikasi Kabupaten] Alive Rejections (${rejDocs.length} proposal docs, ${rejPekebuns.reduce((sum, p) => sum + p.items.length, 0)} pekebun items, ${allRejectedStoreEntries.length} total keys in store)`,
        'color: #e11d48; font-weight: bold;',
      );
      console.log('hasRejection (Action Button Shows Kembalikan):', hasRej);
      console.log('1. Active Rejected Proposal Documents:', rejDocs);
      console.log('2. Active Rejected Pekebun & Lahan Documents/Fields:', rejPekebuns);
      console.log('3. All Raw Store Keys with status == REJECTED:', allRejectedStoreEntries);
      if (unmappedStoreKeys.length > 0) {
        console.warn('⚠️ Store keys marked REJECTED but not matched to active proposal docs or CPCL list (Orphaned):', unmappedStoreKeys);
      }
      console.groupEnd();
    } else {
      console.log('%c[Verifikasi Kabupaten] No alive rejections. (Ready to proceed to SK CPCL)', 'color: #059669; font-weight: bold;');
    }
  },
  { immediate: true, deep: true },
);

async function executePendingAction() {
  if (!pendingConfirmAction.value) return;
  isSubmittingRejection.value = true;
  try {
    await pendingConfirmAction.value();
  } catch (err: any) {
    toast.error(err.message || 'Terjadi kesalahan saat mengembalikan berkas.');
  } finally {
    isSubmittingRejection.value = false;
  }
}

function buildValidationPayloads() {
  const farmerPayload: any[] = [];
  const landPayload: any[] = [];
  const pengajuanIdNum = Number(String(id).replace(/[^\d]/g, '')) || 0;
  const seenLandDocs = new Set<number>();

  for (const item of pekebunList.value) {
    const cpclId = item.cpcl.id;
    const enriched = item.enriched;
    if (enriched) {
      const docs = enriched.dokumen || [];
      for (const doc of docs) {
        const docIdNum = Number(String(doc.id).replace(/[^\d]/g, '')) || 0;
        const docType = doc.documentType || (doc as any).tipeDokumen;

        const details: any[] = [];
        if (docType === TipeDokumenPekebun.SCAN_KTP) {
          details.push(
            { field_name: 'namaLengkap', is_valid: verifikasiStore.getVerification(`doc-${cpclId}-${doc.id}-namaLengkap`).status === 'APPROVED' },
            { field_name: 'nik', is_valid: verifikasiStore.getVerification(`doc-${cpclId}-${doc.id}-nik`).status === 'APPROVED' },
          );
        } else if (docType === TipeDokumenPekebun.SCAN_KK) {
          details.push({ field_name: 'nomorKK', is_valid: verifikasiStore.getVerification(`doc-${cpclId}-${doc.id}-nomorKK`).status === 'APPROVED' });
        }

        const isDocValid = details.length > 0 ? details.every((d) => d.is_valid) : verifikasiStore.getVerification(`doc-${cpclId}-${doc.id}`).status === 'APPROVED';

        farmerPayload.push({
          dokumen_pekebun_id: docIdNum,
          pengajuan_id: pengajuanIdNum,
          is_valid: isDocValid,
          notes: verifikasiStore.getVerification(`doc-${cpclId}-${doc.id}`).notes || '',
          details: details,
        });
      }

      // Lahan documents
      const lahans = (pengajuan.value as any)?.lahans || [];
      const pekebunId = enriched?.id;
      const matchingLahans = lahans.filter((l: any) => (pekebunId ? Number(l.pekebun_id) === Number(pekebunId) : String(l.id) === String(cpclId)));
      const targetLahans = matchingLahans.length > 0 ? matchingLahans : enriched?.lahan ? [enriched.lahan] : [];

      for (const lahan of targetLahans) {
        const lDocs = lahan.documents || lahan.dokumen || [];
        for (const d of lDocs) {
          const docIdNum = Number(String(d.id).replace(/[^\d]/g, '')) || 0;
          if (!docIdNum || seenLandDocs.has(docIdNum)) continue;
          seenLandDocs.add(docIdNum);

          const docType = String(d.document_type || d.documentType || d.tipeDokumen || '')
            .toUpperCase()
            .trim();
          const details: any[] = [];
          if (docType === 'SCAN_LEGALITAS' || docType.includes('LEGALITAS')) {
            const fields = ['jenis_legalitas', 'nomor_legalitas', 'tanggal_penerbitan_legalitas', 'luas_lahan'];
            for (const f of fields) {
              const fVerif = verifikasiStore.getVerification(`doc-${cpclId}-${d.id}-${f}`);
              details.push({
                field_name: f,
                is_valid: fVerif.status === 'APPROVED',
                notes: fVerif.notes || undefined,
              });
            }
            // Check polygon verification
            const polyVerif =
              verifikasiStore.getVerification(`doc-${cpclId}-${d.id}-polygon`).status !== 'PENDING'
                ? verifikasiStore.getVerification(`doc-${cpclId}-${d.id}-polygon`)
                : verifikasiStore.getVerification(`lahan-${lahan.id}-polygon`);
            if (polyVerif && polyVerif.status !== 'PENDING') {
              details.push({
                field_name: 'polygon',
                is_valid: polyVerif.status === 'APPROVED',
                notes: polyVerif.notes || undefined,
              });
            }
          } else if (
            docType === 'SURAT_KETERANGAN_KEPALA_DESA' ||
            docType === 'SURAT_KETERANGAN_BEDA_NAMA' ||
            docType === 'SURAT_BEDA_NAMA' ||
            docType === 'SURAT_KET_KADES' ||
            docType.includes('BEDA_NAMA') ||
            docType.includes('KEPALA_DESA') ||
            docType.includes('KADES')
          ) {
            const f = 'nomor_surat_beda_nama';
            const fVerif = verifikasiStore.getVerification(`doc-${cpclId}-${d.id}-${f}`);
            details.push({
              field_name: f,
              is_valid: fVerif.status === 'APPROVED',
              notes: fVerif.notes || undefined,
            });
          }

          const verification = verifikasiStore.getVerification(`doc-${cpclId}-${d.id}`);
          const isDocValid = details.length > 0 ? details.every((det) => det.is_valid) : verification.status === 'APPROVED';

          landPayload.push({
            dokumen_lahan_id: docIdNum,
            pengajuan_id: pengajuanIdNum,
            is_valid: isDocValid,
            notes: verification.notes || (details.find((det) => !det.is_valid && det.notes)?.notes || ''),
            details: details,
          });
        }
      }
    }
  }

  return { farmerPayload, landPayload };
}

function submitRejection() {
  console.log('[StepVerifikasiPekebunDanDokumenProposal] submitRejection triggered with alive rejections:', {
    rejectedProposalDocs: rejectedProposalDocs.value,
    groupedPekebunRejections: groupedPekebunRejections.value,
  });

  const rejDocWithoutNotes = rejectedProposalDocs.value.filter((d) => !d.notes || !d.notes.trim());
  const rejPekebunWithoutNotes: { pekebun: string; item: string }[] = [];
  for (const p of groupedPekebunRejections.value) {
    for (const i of p.items) {
      if (!i.notes || !i.notes.trim()) {
        rejPekebunWithoutNotes.push({ pekebun: p.namaPekebun, item: i.docTypeOrField });
      }
    }
  }

  if (rejDocWithoutNotes.length > 0 || rejPekebunWithoutNotes.length > 0) {
    const missingNames = [
      ...rejDocWithoutNotes.map((d) => d.name),
      ...rejPekebunWithoutNotes.map((p) => `${p.pekebun}: ${p.item}`),
    ];
    console.warn('[StepVerifikasiPekebunDanDokumenProposal] Missing rejection notes on items:', missingNames);
    toast.error(`Harap berikan catatan alasan penolakan pada item yang ditolak (${missingNames.slice(0, 3).join(', ')}${missingNames.length > 3 ? ` +${missingNames.length - 3} lainnya` : ''}).`);
    return;
  }

  confirmActionType.value = 'reject';
  confirmDestination.value = 'Pemohon (Revisi)';

  pendingConfirmAction.value = async () => {
    try {
      const { farmerPayload, landPayload } = buildValidationPayloads();
      if (farmerPayload.length > 0) {
        await pengusulanStore.bulkFarmerValidations(farmerPayload);
      }
      if (landPayload.length > 0) {
        await pengusulanStore.bulkLandValidations(landPayload);
      }
    } catch (err) {
      console.error('Failed to sync farmer/land validations on rejection:', err);
    }

    await syncBulkProposalDocumentValidations();
    if (pengajuan.value) {
      try {
        const storageAreaPayload: any = {};
        const gudangAlamatVerif = verifikasiStore.getVerification('gudangAlamat');
        if (gudangAlamatVerif.status !== 'PENDING') {
          storageAreaPayload.address_is_valid = gudangAlamatVerif.status === 'APPROVED';
          storageAreaPayload.address_notes = gudangAlamatVerif.notes || '';
        }
        const gudangKoordinatVerif = verifikasiStore.getVerification('gudangKoordinat');
        if (gudangKoordinatVerif.status !== 'PENDING') {
          storageAreaPayload.coordinate_is_valid = gudangKoordinatVerif.status === 'APPROVED';
          storageAreaPayload.coordinate_notes = gudangKoordinatVerif.notes || '';
        }
        const fotoDepanVerif = verifikasiStore.getVerification('fotoTampakDepan');
        if (fotoDepanVerif.status !== 'PENDING') {
          storageAreaPayload.exterior_photo_is_valid = fotoDepanVerif.status === 'APPROVED';
          storageAreaPayload.exterior_photo_notes = fotoDepanVerif.notes || '';
        }
        const fotoDalamVerif = verifikasiStore.getVerification('fotoTampakDalam');
        if (fotoDalamVerif.status !== 'PENDING') {
          storageAreaPayload.interior_photo_is_valid = fotoDalamVerif.status === 'APPROVED';
          storageAreaPayload.interior_photo_notes = fotoDalamVerif.notes || '';
        }

        const updatePayload: any = {
          status: 'REV_FROM_KAB',
        };
        if (Object.keys(storageAreaPayload).length > 0) {
          updatePayload.storage_area = storageAreaPayload;
        }

        await pengusulanStore.updateProposal(pengajuan.value.id, updatePayload);
      } catch (err) {
        console.error('Failed to update proposal status on backend:', err);
      }

      const notesSummary = [...rejectedProposalDocs.value.map((d) => `${d.name}: ${d.notes}`), ...groupedPekebunRejections.value.flatMap((p) => p.items.map((i) => `${p.namaPekebun} - ${i.docTypeOrField}: ${i.notes}`))].join('\n');

      pengusulanStore.updateStatus(pengajuan.value.id, PengajuanStatus.REV_FROM_KAB, notesSummary);
    }
    toast.warning('Proposal dikembalikan ke Pemohon untuk perbaikan.', 'Revisi Dikirim');
    showConfirmModal.value = false;
    router.push('/dinas/verifikasi');
  };
  showConfirmModal.value = true;
}

async function syncBulkProposalDocumentValidations() {
  const payloadsMap = new Map<number, CreateProposalDocumentValidationPayload>();

  currentPersyaratan.value.forEach((p) => {
    const doc = getDokumen(p.id);
    if (!doc || !('id' in doc) || !(doc as any).id) return;
    const docId = Number((doc as any).id);
    if (!docId) return;

    const v = getVerification(p.id);
    payloadsMap.set(docId, {
      dokumen_proposal_id: docId,
      is_valid: v.status === 'APPROVED',
      notes: v.notes || undefined,
      validated_by_role: 'DINAS_KABUPATEN',
    });
  });

  const payloads = Array.from(payloadsMap.values());
  if (payloads.length > 0) {
    await pengusulanStore.bulkProposalDocumentValidations(payloads);
  }
}

async function syncFinalRab() {
  if (verifikasiStore.rabItems.length > 0 && pengajuan.value) {
    try {
      const items: CreateRabItemPayload[] = verifikasiStore.rabItems.map((r) => ({
        uraian: r.uraian || '-',
        volume: r.volume || r.jumlahTotal || (r.jumlahTahap1 || 0) + (r.jumlahTahap2 || 0) || 1,
        unit: r.satuan || r.unit || 'unit',
        price_per_unit: r.hargaSatuan || r.price_per_unit || 0,
        item_type: r.jenis === 'JASA' ? 'JASA' : (r.item_type as 'BARANG' | 'JASA') || 'BARANG',
        details: {
          jenis: r.jenis || '',
          varietas: r.varietas || '',
          varietasCustom: r.varietasCustom || '',
          jumlahTahap1: r.jumlahTahap1 ?? null,
          jumlahTahap2: r.jumlahTahap2 ?? null,
          jumlahTahap3: r.jumlahTahap3 ?? null,
          jumlahTahap4: r.jumlahTahap4 ?? null,
          spesifikasi: r.spesifikasi || '',
        },
      }));

      await rabService.create({
        proposal_id: Number(pengajuan.value.id),
        flag: 'FINAL',
        items,
      });
    } catch (err) {
      console.warn('Gagal menyimpan RAB FINAL Kabupaten:', err);
    }
  }
}

const isRabFinalUploaded = computed(() => {
  return (
    !!verifikasiStore.rabDitandatangani ||
    !!pengajuan.value?.rabDitandatangani ||
    !!(pengajuan.value as any)?.rab_kab_signed ||
    !!pengajuan.value?.dokumen?.some((d: any) =>
      ['RAB_KAB_SIGNED', 'RAB_FINAL', 'RAB_TERTANDATANGANI'].includes(String(d.tipeDokumen || d.document_type || d.documentType || '').toUpperCase()),
    ) ||
    !!(pengajuan.value as any)?.documents?.some((d: any) =>
      ['RAB_KAB_SIGNED', 'RAB_FINAL', 'RAB_TERTANDATANGANI'].includes(String(d.tipeDokumen || d.document_type || d.documentType || '').toUpperCase()),
    )
  );
});

async function validateAndProceed() {
  if (!allFotoUdaraUploaded.value) {
    toast.warning(`Terdapat ${missingFotoUdaraCount.value} pekebun yang belum memiliki Foto Udara. Seluruh Foto Udara pekebun wajib diunggah sebelum melanjutkan ke tahap SK CPCL.`, 'Foto Udara Belum Lengkap');
    return;
  }

  if (!isRabFinalUploaded.value) {
    toast.warning('Dokumen RAB bertandatangan (Finalisasi RAB) wajib diunggah sebelum melanjutkan ke tahap SK CPCL.', 'RAB Final Belum Diunggah');
    activeSections.value.rab = true;
    return;
  }

  const unfulfilledMandatory = currentPersyaratan.value.filter((p) => {
    if (!p.wajib) return false;
    const doc = getDokumen(p.id);
    const v = getVerification(p.id);
    return !doc || v.status !== 'APPROVED';
  });

  if (unfulfilledMandatory.length > 0) {
    const missingDocs = unfulfilledMandatory
      .map((p) => {
        const doc = getDokumen(p.id);
        if (!doc) return `${p.nama} (Belum diunggah)`;
        return `${p.nama} (Belum disetujui)`;
      })
      .join(', ');
    toast.error(`Dokumen wajib berikut belum lengkap atau disetujui: ${missingDocs}`, 'Validasi Gagal');
    return;
  }

  const pendingDocs = currentPersyaratan.value.filter((p) => {
    const doc = getDokumen(p.id);
    if (!doc) return false;
    return getVerification(p.id).status === 'PENDING';
  });

  if (pendingDocs.length > 0) {
    const names = pendingDocs.map((p) => p.nama).join(', ');
    toast.warning(`Harap lakukan verifikasi pada dokumen berikut: ${names}`, 'Verifikasi Belum Selesai');
    return;
  }

  await syncBulkProposalDocumentValidations();
  await syncFinalRab();
  verifikasiStore.currentStep = 3;
}

// --- Accordion Modules State & Tallies (Feature 071) ---
const activeSections = ref<Record<string, boolean>>({
  cpcl: true, // Modul 1: CPCL & Peta Spasial (Default Terbuka)
  dokumen: true, // Modul 2: Berkas Proposal (Default Terbuka)
  gudang: false, // Modul 3: Gudang Serah Terima (Default Tertutup)
  rab: false, // Modul 4: RAB (Default Tertutup)
});

function toggleSection(key: string) {
  activeSections.value[key] = !activeSections.value[key];
}

const isAllExpanded = computed(() => {
  const cpclOpen = activeSections.value.cpcl;
  const dokumenOpen = activeSections.value.dokumen;
  const gudangOpen = !hasStorageArea.value || activeSections.value.gudang;
  const rabOpen = activeSections.value.rab;
  return cpclOpen && dokumenOpen && gudangOpen && rabOpen;
});

function toggleAllSections() {
  const target = !isAllExpanded.value;
  activeSections.value.cpcl = target;
  activeSections.value.dokumen = target;
  activeSections.value.gudang = target;
  activeSections.value.rab = target;
}

const pekebunSummary = computed(() => {
  const total = groupedPekebunList.value.length;
  let approved = 0;
  let rejected = 0;
  let pending = 0;

  for (const item of groupedPekebunList.value) {
    if (item.status === 'Sesuai') approved++;
    else if (item.status === 'Tidak Sesuai') rejected++;
    else pending++;
  }

  return { total, approved, rejected, pending };
});

const dokumenSummary = computed(() => {
  const total = currentPersyaratan.value.length;
  let approved = 0;
  let rejected = 0;
  let pending = 0;
  let missing = 0;

  for (const p of currentPersyaratan.value) {
    const doc = getDokumen(p.id);
    if (!doc) {
      missing++;
    } else {
      const v = getVerification(p.id);
      if (v.status === 'APPROVED') approved++;
      else if (v.status === 'REJECTED') rejected++;
      else pending++;
    }
  }

  return { total, approved, rejected, pending, missing };
});

const gudangSummary = computed(() => {
  if (!hasStorageArea.value) return null;
  const keys = ['gudangAlamat', 'gudangKoordinat', 'fotoTampakDepan', 'fotoTampakDalam'];
  let approved = 0;
  let rejected = 0;
  let pending = 0;

  for (const k of keys) {
    const v = getVerification(k);
    if (v.status === 'APPROVED') approved++;
    else if (v.status === 'REJECTED') rejected++;
    else pending++;
  }

  return { total: keys.length, approved, rejected, pending };
});

const rabSummary = computed(() => {
  const docSigned = verifikasiStore.rabDitandatangani;
  const hasItems = verifikasiStore.rabItems.length > 0;
  return { docSigned: !!docSigned, hasItems, total: verifikasiStore.rabTotal };
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Top Header & Global Control Toolbar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-[#066C2A] text-[10px] font-bold tracking-wider uppercase border border-emerald-200/60"> Tahap 1 Verifikasi </span>
          <span class="text-xs text-slate-400">&bull;</span>
          <span class="text-xs text-slate-500 font-medium">Usulan Kelayakan Lapangan</span>
        </div>
        <h2 class="text-base sm:text-lg font-bold text-slate-900">Verifikasi Usulan Proposal &amp; Data Pekebun</h2>
        <p class="text-xs text-slate-500">Periksa dan validasi tumpang tindih lahan, kelayakan berkas pekebun, kelengkapan dokumen proposal, gudang, dan anggaran RAB.</p>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
        <button
          type="button"
          @click="toggleAllSections"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
        >
          <component :is="isAllExpanded ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 text-slate-500" />
          <span>{{ isAllExpanded ? 'Tutup Semua Modul' : 'Buka Semua Modul' }}</span>
        </button>
      </div>
    </div>

    <!-- Modul 1: Verifikasi Calon Pekebun, Lahan (CPCL) & Peta Spasial -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button type="button" @click="toggleSection('cpcl')" class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#066C2A] border border-emerald-100">
            <Users class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Modul 1: Data Pekebun, Calon Lahan (CPCL) &amp; Peta Spasial</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> {{ pekebunSummary.total }} Anggota CPCL </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> {{ activePolygons.length }} Poligon Lahan </span>
              <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full', allFotoUdaraUploaded ? 'bg-emerald-50 text-[#066C2A] border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200']">
                Foto Udara: {{ groupedPekebunList.length - missingFotoUdaraCount }}/{{ groupedPekebunList.length }}
              </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#066C2A] border border-emerald-200"> Radius Pemindaian: Maks. 50 km </span>
            </div>
            <p class="text-[11px] text-slate-500 truncate">Verifikasi berkas pekebun, alas hak lahan, upload foto udara, dan analisis spasial poligon kebun (radius 50 km).</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span v-if="pekebunSummary.approved === pekebunSummary.total && pekebunSummary.total > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 class="w-3 h-3" /> Semua Sesuai ({{ pekebunSummary.approved }})
          </span>
          <span v-else-if="pekebunSummary.rejected > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            <XCircle class="w-3 h-3" /> {{ pekebunSummary.rejected }} Ditolak
          </span>
          <span v-else class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"> {{ pekebunSummary.approved }}/{{ pekebunSummary.total }} Sesuai </span>

          <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
            <ChevronUp v-if="activeSections.cpcl" class="w-3.5 h-3.5" />
            <ChevronDown v-else class="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <div v-show="activeSections.cpcl" class="p-5 flex flex-col gap-6">
        <!-- Sub-Bagian A: Peta Spasial & Analisis Poligon Overlap Lahan -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Peta Sebaran Spasial &amp; Deteksi Tumpang Tindih (Radius &le; 50 km)</span>
            </div>
            <span class="text-[11px] text-slate-400"> {{ activePolygons.length }} poligon terdaftar </span>
          </div>
          <VerificationOverlapMap
            v-if="pengajuan"
            :active-proposal-id="id"
            :active-proposal-name="pengajuan?.lembaga?.namaLembaga || ''"
            :active-proposal-number="pengajuan?.nomor_proposal || pengajuan?.nomorProposal || ''"
            :active-polygons="activePolygons"
            :other-proposals="nearbyProposals"
          />
        </div>

        <!-- Sub-Bagian B: Daftar Calon Pekebun & Lahan (CPCL) -->
        <div class="flex flex-col gap-3 pt-4 border-t border-slate-200/80">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Daftar Calon Pekebun &amp; Calon Lahan (CPCL)</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> {{ pekebunSummary.total }} Anggota </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[11px] text-slate-400 hidden sm:inline"> Upload foto udara dan verifikasi data masing-masing anggota </span>
              <DropdownEksporPekebun
                :proposal="pengajuan"
                :pekebuns="pengajuan?.pekebuns"
                :lahans="pengajuan?.lahans"
                :disabled="!pengajuan || groupedPekebunList.length === 0"
              />
              <a
                href="/templates/format-foto-udara.pdf"
                download="Format-Foto-Udara.pdf"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#066C2A] text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                title="Unduh Contoh Format Foto Udara"
              >
                <Download class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>Unduh Format Foto Udara</span>
              </a>
            </div>
          </div>

          <!-- Pekebun Table Grouped -->
          <div v-if="groupedPekebunList.length === 0" class="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">Tidak ada data pekebun dalam pengajuan ini.</div>

          <div v-else class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th class="p-3 text-left">Nama Pekebun &amp; NIK</th>
                  <th class="p-3 text-left">Bidang Lahan (CPCL)</th>
                  <th class="p-3 text-center">Dokumen</th>
                  <th class="p-3 text-center">Foto Udara <span class="text-pink-400">(Wajib Isi)</span></th>
                  <th class="p-3 text-center">Status</th>
                  <th class="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in groupedPekebunList" :key="item.key" class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td class="p-3">
                    <div class="flex flex-col gap-0.5">
                      <span class="font-semibold text-slate-800">{{ item.namaPekebun }}</span>
                      <span class="font-mono text-slate-500 text-[11px]">{{ item.nik }}</span>
                    </div>
                  </td>
                  <td class="p-3">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-700">Total {{ item.totalLuasLahan.toFixed(2) }} Ha</span>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"> {{ item.totalBidang }} Bidang Lahan </span>
                      </div>
                      <!-- Rincian tiap bidang lahan -->
                      <div class="flex flex-col gap-1.5">
                        <div v-for="(lahan, lIdx) in item.lahans" :key="lahan.id" class="flex items-center gap-1.5 text-[11px] bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          <span class="font-medium text-slate-700">Bidang {{ lIdx + 1 }}:</span>
                          <span class="font-semibold text-slate-800">{{ lahan.luasLahanHektar }} Ha</span>
                          <span class="text-slate-400">({{ lahan.jenisHakLahan }}: {{ lahan.nomorSuratLahan }})</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="p-3 text-center">
                    <span v-if="item.enriched" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                      <CheckCircle2 class="w-3 h-3" /> {{ item.enriched.dokumen.length }} Berkas
                    </span>
                    <span v-else class="text-slate-300">-</span>
                  </td>
                  <td class="p-3">
                    <!-- Single Lahan (or fallback) -->
                    <template v-if="item.lahans.length <= 1">
                      <div class="flex items-center justify-center gap-1">
                        <template v-if="!getFotoUdaraForLahan(item.lahans[0]?.id || item.primaryCpclId)">
                          <input
                            type="file"
                            :id="`fotoUdara-${item.key}`"
                            accept=".pdf,.png,.jpg,.jpeg"
                            class="hidden"
                            @change="(e: Event) => onFotoUdaraLahanChange(item.lahans[0]?.id || item.primaryCpclId, e)"
                          />
                          <label :for="`fotoUdara-${item.key}`" class="cursor-pointer inline-flex items-center gap-0.5 text-[10px] text-[#066C2A] font-semibold hover:underline">
                            <Upload class="w-3 h-3" /> Unggah
                          </label>
                          <span class="text-slate-300 text-[10px]">|</span>
                          <a
                            href="/templates/format-foto-udara.pdf"
                            download="Format-Foto-Udara.pdf"
                            class="inline-flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-[#066C2A] font-semibold hover:underline cursor-pointer"
                            title="Unduh Contoh Format Foto Udara"
                          >
                            <Download class="w-3 h-3" /> Format
                          </a>
                        </template>
                        <template v-else>
                          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span class="text-[10px] font-semibold text-slate-800 truncate max-w-[80px]">
                            {{ getFotoUdaraForLahan(item.lahans[0]?.id || item.primaryCpclId)?.namaFile }}
                          </span>
                          <button
                            type="button"
                            @click="openPreview(getFotoUdaraForLahan(item.lahans[0]?.id || item.primaryCpclId))"
                            class="text-[10px] text-[#066C2A] font-semibold hover:underline cursor-pointer"
                          >
                            <Eye class="w-3 h-3 inline" />
                          </button>
                          <button
                            type="button"
                            @click="handleRemoveFotoUdaraLahan(item.lahans[0]?.id || item.primaryCpclId)"
                            class="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                          >
                            <Trash2 class="w-3 h-3 inline" />
                          </button>
                        </template>
                      </div>
                    </template>

                    <!-- Multi-Lahan: Upload per Bidang Lahan -->
                    <template v-else>
                      <div class="flex flex-col gap-1.5">
                        <div
                          v-for="(lahan, lIdx) in item.lahans"
                          :key="lahan.id"
                          class="flex items-center justify-between gap-1 text-[11px] bg-slate-50/70 p-1.5 rounded-lg border border-slate-100"
                        >
                          <div class="flex items-center gap-1 min-w-0">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span class="font-medium text-slate-700 shrink-0">Bidang {{ lIdx + 1 }}:</span>
                          </div>
                          <template v-if="!getFotoUdaraForLahan(lahan.id)">
                            <div class="flex items-center gap-1">
                              <input
                                type="file"
                                :id="`fotoUdara-${lahan.id}`"
                                accept=".pdf,.png,.jpg,.jpeg"
                                class="hidden"
                                @change="(e: Event) => onFotoUdaraLahanChange(lahan.id, e)"
                              />
                              <label :for="`fotoUdara-${lahan.id}`" class="cursor-pointer inline-flex items-center gap-0.5 text-[10px] text-[#066C2A] font-semibold hover:underline">
                                <Upload class="w-3 h-3" /> Unggah
                              </label>
                              <span class="text-slate-300 text-[10px]">|</span>
                              <a
                                href="/templates/format-foto-udara.pdf"
                                download="Format-Foto-Udara.pdf"
                                class="inline-flex items-center gap-0.5 text-[10px] text-slate-500 hover:text-[#066C2A] font-semibold hover:underline cursor-pointer"
                                title="Unduh Contoh Format Foto Udara"
                              >
                                <Download class="w-3 h-3" /> Format
                              </a>
                            </div>
                          </template>
                          <template v-else>
                            <div class="flex items-center gap-1">
                              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span class="text-[10px] font-semibold text-slate-800 truncate max-w-[70px]" :title="getFotoUdaraForLahan(lahan.id)?.namaFile">
                                {{ getFotoUdaraForLahan(lahan.id)?.namaFile }}
                              </span>
                              <button
                                type="button"
                                @click="openPreview(getFotoUdaraForLahan(lahan.id))"
                                class="text-[10px] text-[#066C2A] font-semibold hover:underline cursor-pointer"
                                title="Pratinjau"
                              >
                                <Eye class="w-3 h-3 inline" />
                              </button>
                              <button
                                type="button"
                                @click="handleRemoveFotoUdaraLahan(lahan.id)"
                                class="text-[10px] text-rose-600 font-semibold hover:underline cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 class="w-3 h-3 inline" />
                              </button>
                            </div>
                          </template>
                        </div>
                      </div>
                    </template>
                  </td>
                  <td class="p-3 text-center">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        item.status === 'Sesuai' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Tidak Sesuai' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500',
                      ]"
                    >
                      <Check v-if="item.status === 'Sesuai'" class="w-3 h-3" />
                      <X v-else-if="item.status === 'Tidak Sesuai'" class="w-3 h-3" />
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <button
                      type="button"
                      @click="goToVerifikasi(item)"
                      class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#066C2A] text-white text-[10px] font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                    >
                      <Eye class="w-3 h-3" /> Verifikasi Pekebun
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modul 2: Verifikasi Berkas Proposal & Kelembagaan -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button type="button" @click="toggleSection('dokumen')" class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#066C2A] border border-emerald-100">
            <FileText class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Modul 2: Berkas Proposal &amp; Dokumen Legalitas</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> {{ dokumenSummary.total }} Berkas Persyaratan </span>
            </div>
            <p class="text-[11px] text-slate-500 truncate">Pemeriksaan kelayakan berkas administratif, legalitas kelembagaan, dan surat permohonan sarpras.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span v-if="dokumenSummary.rejected > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
            <XCircle class="w-3 h-3" /> {{ dokumenSummary.rejected }} Perlu Perbaikan
          </span>
          <span v-else-if="dokumenSummary.approved === dokumenSummary.total && dokumenSummary.total > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 class="w-3 h-3" /> Semua Sesuai ({{ dokumenSummary.approved }})
          </span>
          <span v-else class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"> {{ dokumenSummary.approved }}/{{ dokumenSummary.total }} Sesuai </span>

          <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
            <ChevronUp v-if="activeSections.dokumen" class="w-3.5 h-3.5" />
            <ChevronDown v-else class="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <div v-show="activeSections.dokumen" class="p-5 flex flex-col gap-4">
        <div class="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl leading-none">{{ selectedPaketInfo?.icon || '📦' }}</span>
            <div class="flex flex-col">
              <span class="text-[11px] text-slate-500 font-medium">Jenis Paket Terpilih</span>
              <span class="text-sm font-bold text-slate-800">{{ selectedPaketInfo?.label || 'Paket Tidak Ditemukan' }}</span>
            </div>
          </div>
          <button
            type="button"
            @click="approveAll"
            class="self-start sm:self-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" /> Setujui Semua Item
          </button>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-800 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3">Nama Dokumen</th>
                <th class="p-3">File Terlampir</th>
                <th class="p-3 text-center w-36">Status</th>
                <th class="p-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="p in currentPersyaratan" :key="p.id">
                <tr :class="getVerification(p.id).status === 'REJECTED' ? 'bg-rose-50/40' : getVerification(p.id).status === 'APPROVED' ? 'bg-emerald-50/30' : 'bg-white'">
                  <td class="p-3">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-semibold text-slate-800">{{ p.nama }}</span>
                      <span v-if="p.wajib" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">Wajib</span>
                      <span v-else class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Opsional</span>
                      <span v-if="(getDokumen(p.id) as any)?.source === 'IAM_SYNC' || (getDokumen(p.id) as any)?.isVerifiedFromIam" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        ✓ Sinkronisasi IAM
                      </span>
                    </div>
                  </td>
                  <td class="p-3">
                    <div v-if="getDokumen(p.id)" class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2 min-w-0">
                        <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-semibold text-slate-800 truncate max-w-xs">{{ getDokumen(p.id)!.namaFile }}</span>
                          <div class="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{{ (getDokumen(p.id)!.ukuranBytes / 1024).toFixed(0) }} KB</span>
                            <span v-if="(getDokumen(p.id) as any)?.version" class="font-bold text-slate-600"> Versi {{ (getDokumen(p.id) as any).version }} </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        @click="openVersionHistory(p.id, p.nama)"
                        class="text-[11px] font-semibold text-[#066C2A] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        title="Lihat riwayat revisi dan perbandingan versi"
                      >
                        <History class="w-3.5 h-3.5" /> Riwayat
                      </button>
                    </div>
                    <span v-else class="text-xs text-rose-500 font-medium italic">Belum diunggah</span>
                  </td>
                  <td class="p-3 text-center">
                    <span
                      :class="[
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
                        getDokumenVerifStatus(p.id) === 'Sesuai' ? 'bg-emerald-50 text-emerald-700' : getDokumenVerifStatus(p.id) === 'Tidak Sesuai' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500',
                      ]"
                    >
                      <Check v-if="getDokumenVerifStatus(p.id) === 'Sesuai'" class="w-3 h-3" />
                      <X v-else-if="getDokumenVerifStatus(p.id) === 'Tidak Sesuai'" class="w-3 h-3" />
                      {{ getDokumenVerifStatus(p.id) }}
                    </span>
                  </td>
                  <td class="p-3 text-center">
                    <button
                      v-if="getDokumen(p.id)"
                      type="button"
                      @click="openDokVerifModal(p.id)"
                      class="inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#066C2A] px-2.5 py-1.5 rounded-lg hover:bg-emerald-800 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye class="w-3 h-3" /> Verifikasi
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modul 3: Pemeriksaan Gudang Serah Terima Barang -->
    <div v-if="hasStorageArea" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button type="button" @click="toggleSection('gudang')" class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#066C2A] border border-emerald-100">
            <Warehouse class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Modul 3: Pemeriksaan Gudang Serah Terima Barang</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"> Paket Sarpras Relevan </span>
            </div>
            <p class="text-[11px] text-slate-500 truncate">Verifikasi kelayakan alamat, koordinat peta, foto fisik tampak depan, dan foto tampak dalam gudang.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <template v-if="gudangSummary">
            <span v-if="gudangSummary.rejected > 0" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800"> <XCircle class="w-3 h-3" /> {{ gudangSummary.rejected }} Ditolak </span>
            <span v-else-if="gudangSummary.approved === 4" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"> <CheckCircle2 class="w-3 h-3" /> Semua Sesuai (4/4) </span>
            <span v-else class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"> {{ gudangSummary.approved }}/4 Sesuai </span>
          </template>

          <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
            <ChevronUp v-if="activeSections.gudang" class="w-3.5 h-3.5" />
            <ChevronDown v-else class="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <div v-show="activeSections.gudang" class="p-5 flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Alamat Gudang -->
          <div class="flex flex-col gap-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-700">Alamat Gudang</span>
              <div class="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  @click="setVerificationStatus('gudangAlamat', 'APPROVED')"
                  :class="[
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    getVerification('gudangAlamat').status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50',
                  ]"
                >
                  <Check class="w-3.5 h-3.5" /> Setuju
                </button>
                <button
                  type="button"
                  @click="setVerificationStatus('gudangAlamat', 'REJECTED')"
                  :class="[
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    getVerification('gudangAlamat').status === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-rose-50',
                  ]"
                >
                  <X class="w-3.5 h-3.5" /> Tolak
                </button>
              </div>
            </div>
            <p class="text-xs text-slate-800 font-medium p-2.5 bg-white rounded-lg border border-slate-200">{{ gudangAlamat }}</p>
            <textarea
              v-if="getVerification('gudangAlamat').status === 'REJECTED'"
              v-model="getVerification('gudangAlamat').notes"
              rows="2"
              placeholder="Catatan penolakan alamat gudang..."
              class="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
            />
          </div>

          <!-- Koordinat Gudang -->
          <div class="flex flex-col gap-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-700"><MapPin class="w-3.5 h-3.5 inline mr-1 text-slate-500" />Koordinat Gudang (Lat, Long)</span>
              <div class="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  @click="setVerificationStatus('gudangKoordinat', 'APPROVED')"
                  :class="[
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    getVerification('gudangKoordinat').status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50',
                  ]"
                >
                  <Check class="w-3.5 h-3.5" /> Setuju
                </button>
                <button
                  type="button"
                  @click="setVerificationStatus('gudangKoordinat', 'REJECTED')"
                  :class="[
                    'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    getVerification('gudangKoordinat').status === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-rose-50',
                  ]"
                >
                  <X class="w-3.5 h-3.5" /> Tolak
                </button>
              </div>
            </div>
            <p class="text-xs text-slate-800 font-mono font-medium p-2.5 bg-white rounded-lg border border-slate-200">{{ gudangKoordinat }}</p>
            <textarea
              v-if="getVerification('gudangKoordinat').status === 'REJECTED'"
              v-model="getVerification('gudangKoordinat').notes"
              rows="2"
              placeholder="Catatan penolakan titik koordinat..."
              class="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Foto Tampak Depan -->
          <div class="flex flex-col gap-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <span class="text-xs font-bold text-slate-700">Foto Tampak Depan Gudang</span>
            <div v-if="exteriorPhoto?.dataUrl" class="flex flex-col gap-2">
              <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span class="text-xs truncate font-medium text-slate-800">{{ exteriorPhoto.namaFile }}</span>
                <button type="button" @click="openPreview(exteriorPhoto)" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer"><Eye class="w-3.5 h-3.5 inline mr-1" />Pratinjau</button>
              </div>
              <div class="flex items-center gap-1 self-end bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  @click="setVerificationStatus('fotoTampakDepan', 'APPROVED')"
                  :class="['px-2.5 py-1 text-xs rounded-md font-semibold cursor-pointer', getVerification('fotoTampakDepan').status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-600']"
                >
                  <Check class="w-3.5 h-3.5 inline" /> Setuju
                </button>
                <button
                  type="button"
                  @click="setVerificationStatus('fotoTampakDepan', 'REJECTED')"
                  :class="['px-2.5 py-1 text-xs rounded-md font-semibold cursor-pointer', getVerification('fotoTampakDepan').status === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-600']"
                >
                  <X class="w-3.5 h-3.5 inline" /> Tolak
                </button>
              </div>
            </div>
            <div v-else class="text-xs text-rose-500 italic p-2 bg-white rounded-lg border border-slate-200">Foto belum diunggah pemohon</div>
            <textarea
              v-if="getVerification('fotoTampakDepan').status === 'REJECTED'"
              v-model="getVerification('fotoTampakDepan').notes"
              rows="2"
              placeholder="Catatan penolakan foto tampak depan..."
              class="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none focus:border-rose-500 resize-none mt-2 text-slate-800"
            />
          </div>

          <!-- Foto Tampak Dalam -->
          <div class="flex flex-col gap-2 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200">
            <span class="text-xs font-bold text-slate-700">Foto Tampak Dalam Gudang</span>
            <div v-if="interiorPhoto?.dataUrl" class="flex flex-col gap-2">
              <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                <span class="text-xs truncate font-medium text-slate-800">{{ interiorPhoto.namaFile }}</span>
                <button type="button" @click="openPreview(interiorPhoto)" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer"><Eye class="w-3.5 h-3.5 inline mr-1" />Pratinjau</button>
              </div>
              <div class="flex items-center gap-1 self-end bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  @click="setVerificationStatus('fotoTampakDalam', 'APPROVED')"
                  :class="['px-2.5 py-1 text-xs rounded-md font-semibold cursor-pointer', getVerification('fotoTampakDalam').status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'text-slate-600']"
                >
                  <Check class="w-3.5 h-3.5 inline" /> Setuju
                </button>
                <button
                  type="button"
                  @click="setVerificationStatus('fotoTampakDalam', 'REJECTED')"
                  :class="['px-2.5 py-1 text-xs rounded-md font-semibold cursor-pointer', getVerification('fotoTampakDalam').status === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-600']"
                >
                  <X class="w-3.5 h-3.5 inline" /> Tolak
                </button>
              </div>
            </div>
            <div v-else class="text-xs text-rose-500 italic p-2 bg-white rounded-lg border border-slate-200">Foto belum diunggah pemohon</div>
            <textarea
              v-if="getVerification('fotoTampakDalam').status === 'REJECTED'"
              v-model="getVerification('fotoTampakDalam').notes"
              rows="2"
              placeholder="Catatan penolakan foto tampak dalam..."
              class="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-rose-50/30 focus:outline-none focus:border-rose-500 resize-none mt-2 text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modul 4: Verifikasi & Rekonsiliasi Rencana Anggaran Biaya (RAB) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button type="button" @click="toggleSection('rab')" class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-[#066C2A] border border-emerald-100">
            <Calculator class="w-4 h-4" />
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Modul 4: Rencana Anggaran Biaya (RAB)</span>
              <span v-if="verifikasiStore.rabTotal > 0" class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-[#066C2A] border border-emerald-200/60">
                Rp {{ verifikasiStore.rabTotal.toLocaleString('id-ID') }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 truncate">Rekonsiliasi rincian anggaran pemohon, pengisian RAB Kabupaten, unduh berkas &amp; unggah RAB bertandatangan.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span v-if="rabSummary.docSigned" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"> <CheckCircle2 class="w-3 h-3" /> RAB Bertandatangan Siap </span>
          <span v-else class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> Proses Penyelarasan </span>

          <div class="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
            <ChevronUp v-if="activeSections.rab" class="w-3.5 h-3.5" />
            <ChevronDown v-else class="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      <div v-show="activeSections.rab" class="p-5 flex flex-col gap-5">
        <!-- Sub-Bagian A: RAB Usulan Pemohon -->
        <div v-if="hasRabContent" class="flex flex-col gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">A. Berkas &amp; Rincian Usulan RAB Pemohon</span>
          </div>

          <!-- Dokumen RAB Pemohon (Read-only / Informasi) -->
          <div class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs font-semibold text-slate-700">Dokumen RAB Usulan Bertandatangan</span>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Dokumen Referensi</span>
            </div>

            <div v-if="getDokumen('RAB_RK')" class="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div class="flex items-center gap-2 min-w-0">
                <FileText class="w-4 h-4 text-slate-500 shrink-0" />
                <span class="text-xs font-medium text-slate-800 truncate">{{ getDokumen('RAB_RK')?.namaFile }}</span>
                <span class="text-[10px] text-slate-400">{{ ((getDokumen('RAB_RK')?.ukuranBytes || 0) / 1024).toFixed(0) }} KB</span>
              </div>
              <button type="button" @click="openPreview(getDokumen('RAB_RK'))" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer"><Eye class="w-3.5 h-3.5 inline mr-1" />Pratinjau</button>
            </div>
            <div v-else class="text-xs text-slate-400 italic p-2 bg-slate-50 rounded-lg border border-slate-200">Dokumen RAB fisik belum diunggah</div>
          </div>

          <!-- RAB Items from Pekebun -->
          <div v-if="pemohonRabItems?.length" class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200 w-full max-w-full overflow-hidden">
            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tabel Rincian Anggaran Pemohon ({{ pemohonRabItems.length }} item)</span>
            <div class="border border-slate-100 rounded-lg overflow-hidden w-full max-w-full">
              <RabTable :items="pemohonRabItems" :readonly="true" :paket="currentPaket" />
            </div>
            <div class="flex justify-end items-center gap-3 pt-2 border-t border-slate-100">
              <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Anggaran Pemohon</span>
              <span class="text-sm font-bold font-mono text-[#066C2A]">Rp {{ pemohonRabTotal.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>

        <!-- Sub-Bagian B: RAB Kabupaten Stepper -->
        <div class="flex flex-col gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">B. Tahapan Penetapan RAB Kabupaten</span>

          <!-- Vertical Stepper -->
          <div class="flex flex-col gap-0 w-full max-w-full mt-1">
            <!-- Step 1: Isi RAB -->
            <div class="flex gap-4 w-full max-w-full">
              <div class="flex flex-col items-center">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#066C2A] text-white shrink-0">1</div>
                <div class="w-0.5 flex-1 bg-[#066C2A]/30 mt-1 mb-1" />
              </div>
              <div class="flex-1 min-w-0 max-w-full pb-5">
                <p class="text-sm font-bold text-slate-800">Edit RAB Kabupaten</p>
                <p class="text-xs text-slate-500 mb-3">Lengkapi dan selaraskan tabel rencana anggaran biaya kegiatan.</p>

                <div class="bg-white rounded-xl border border-slate-200 overflow-hidden w-full max-w-full shadow-xs">
                  <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                    <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tabel Rincian RAB Kabupaten</span>
                  </div>
                  <div class="p-4 w-full max-w-full overflow-hidden">
                    <RabTable :items="verifikasiStore.rabItems" :paket="currentPaket" @add="verifikasiStore.addRabItem" @update="verifikasiStore.updateRabItem" @remove="verifikasiStore.removeRabItem" />
                    <div v-if="verifikasiStore.rabItems.length > 0" class="flex justify-end items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                      <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Anggaran</span>
                      <span class="text-sm font-bold font-mono text-[#066C2A]">Rp {{ verifikasiStore.rabTotal.toLocaleString('id-ID') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Download Confirmation Popup (Moved directly below the table of RAB final) -->
                <Transition name="fade">
                  <div v-if="showDownloadConfirm" data-testid="rab-download-confirm" class="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl shadow-xs">
                    <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div class="flex-1 text-xs text-amber-800"><span class="font-semibold">Konfirmasi:</span> Sistem akan meng-generate dan mencetak dokumen RAB Final dalam format PDF. Lanjutkan?</div>
                    <div class="flex gap-2 shrink-0">
                      <button type="button" @click="confirmDownloadRAB" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer">Ya, Generate PDF</button>
                      <button type="button" @click="cancelDownloadRAB" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer">Batal</button>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Step 2: Generate & Download RAB -->
            <div class="flex gap-4 w-full max-w-full">
              <div class="flex flex-col items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', step2Unlocked ? 'bg-[#066C2A] text-white' : 'bg-slate-200 text-slate-400']">2</div>
                <div class="w-0.5 flex-1 mt-1 mb-1" :class="step2Unlocked ? 'bg-[#066C2A]/30' : 'bg-slate-200'" />
              </div>
              <div class="flex-1 min-w-0 max-w-full pb-5">
                <div class="flex items-center gap-2 mb-1">
                  <p :class="['text-sm font-bold', step2Unlocked ? 'text-slate-800' : 'text-slate-400']">Generate &amp; Unduh Dokumen RAB (PDF)</p>
                  <Lock v-if="!step2Unlocked" class="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p class="text-xs text-slate-500 mb-3">Sistem akan meng-generate dokumen RAB berdasarkan data tabel yang diselaraskan.</p>

                <button
                  type="button"
                  @click="requestDownloadRAB"
                  :disabled="!step2Unlocked"
                  class="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  :class="step2Unlocked ? 'bg-[#066C2A] text-white border-[#066C2A] hover:bg-emerald-800' : 'bg-white text-slate-400 border-slate-200'"
                >
                  <Download class="w-3.5 h-3.5" /> Generate &amp; Unduh RAB (PDF)
                </button>
              </div>
            </div>

            <!-- Step 3: Print & Sign -->
            <div class="flex gap-4 w-full max-w-full">
              <div class="flex flex-col items-center">
                <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', step3Unlocked ? 'bg-[#066C2A] text-white' : 'bg-slate-200 text-slate-400']">3</div>
                <div class="w-0.5 flex-1 mt-1 mb-1" :class="step3Unlocked ? 'bg-[#066C2A]/30' : 'bg-slate-200'" />
              </div>
              <div class="flex-1 min-w-0 max-w-full pb-5">
                <div class="flex items-center gap-2 mb-1">
                  <p :class="['text-sm font-bold', step3Unlocked ? 'text-slate-800' : 'text-slate-400']">Cetak &amp; Pengesahan Tanda Tangan</p>
                  <Lock v-if="!step3Unlocked" class="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p class="text-xs text-slate-500 mb-3">Cetak dokumen RAB yang telah diunduh, lalu tandatangani oleh pihak verifikator &amp; pejabat berwenang.</p>

                <div v-if="step3Unlocked" class="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                  <Printer class="w-4 h-4 text-slate-500" />
                  <span class="text-xs text-slate-600">Dokumen RAB telah di-generate. Silakan cetak dan tandatangani fisik.</span>
                </div>
              </div>
            </div>

            <!-- Step 4: Upload Signed RAB -->
            <Transition name="fade">
              <div v-if="step4Visible" class="flex gap-4 w-full max-w-full">
                <div class="flex flex-col items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#066C2A] text-white shrink-0">4</div>
                </div>
                <div class="flex-1 min-w-0 max-w-full">
                  <p class="text-sm font-bold text-slate-800 mb-1">Upload RAB Bertandatangan</p>
                  <p class="text-xs text-slate-500 mb-3">Unggah scan dokumen RAB yang sudah ditandatangani dalam format PDF (maks. 10 MB).</p>

                  <div class="bg-white rounded-xl border border-slate-200 p-4">
                    <div v-if="!verifikasiStore.rabDitandatangani">
                      <FileUpload
                        id="rab-kab-signed"
                        accept=".pdf"
                        document-label="RAB-Kabupaten"
                        :proposal-number="pengajuan?.nomor_proposal || (pengajuan as any)?.nomorProposal || 'DRAFT'"
                        :institution-name="pengajuan?.lembaga?.namaLembaga || (pengajuan as any)?.namaLembagaPekebun || 'Kelembagaan'"
                        placeholder="Upload RAB bertandatangan oleh Kabupaten (PDF maks. 10 MB)"
                        :required="true"
                        @file-selected="handleKabRabUpload"
                      />
                    </div>
                    <div v-else class="flex items-center justify-between gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-semibold text-slate-800 truncate">{{ verifikasiStore.rabDitandatangani.namaFile }}</span>
                          <span class="text-[10px] text-slate-400">{{ (verifikasiStore.rabDitandatangani.ukuranBytes / 1024).toFixed(0) }} KB</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          @click="openPreview(verifikasiStore.rabDitandatangani)"
                          class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] px-2 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          <Eye class="w-3 h-3" /> Pratinjau
                        </button>
                        <button
                          type="button"
                          @click="verifikasiStore.setRabDitandatangani(null)"
                          class="flex items-center gap-1 text-[10px] font-semibold text-rose-500 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 class="w-3 h-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Actions Bar -->
    <div class="sticky bottom-4 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-xs">
        <template v-if="!hasRejection && !allFotoUdaraUploaded">
          <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
          <span class="text-amber-700 font-medium"> Foto Udara belum lengkap ({{ missingFotoUdaraCount }} dari {{ groupedPekebunList.length }} pekebun belum diunggah). Seluruh foto udara wajib diunggah untuk melanjutkan. </span>
        </template>
        <template v-else-if="!hasRejection && !isRabFinalUploaded">
          <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
          <span class="text-amber-700 font-medium"> Dokumen finalisasi RAB belum diunggah. Unggah RAB bertandatangan pada Modul 4 (RAB) sebelum melanjutkan ke tahap SK CPCL. </span>
        </template>
        <template v-else>
          <AlertCircle class="w-4 h-4 text-emerald-600 shrink-0" />
          <span class="text-slate-500">Pastikan seluruh data pekebun, berkas proposal, dan RAB telah diverifikasi sebelum melanjutkan ke tahap SK CPCL.</span>
        </template>
      </div>
      <button
        type="button"
        @click="hasRejection ? submitRejection() : validateAndProceed()"
        :disabled="!hasRejection && (!allFotoUdaraUploaded || !isRabFinalUploaded)"
        :title="!hasRejection && !allFotoUdaraUploaded ? 'Unggah seluruh Foto Udara pekebun untuk melanjutkan' : !hasRejection && !isRabFinalUploaded ? 'Unggah RAB bertandatangan untuk melanjutkan' : undefined"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm shrink-0',
          hasRejection
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20 cursor-pointer'
            : (!allFotoUdaraUploaded || !isRabFinalUploaded)
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
              : 'bg-[#066C2A] hover:bg-emerald-800 text-white shadow-emerald-900/20 cursor-pointer',
        ]"
      >
        <template v-if="hasRejection">
          <XCircle class="w-4 h-4" />
          {{ LOCALIZATION.verificationAction.returnForRevision }}
        </template>
        <template v-else>
          Simpan &amp; Lanjut ke SK CPCL
          <span class="text-base leading-none">&rarr;</span>
        </template>
      </button>
    </div>

    <!-- Dokumen Verifikasi Modal (2-Column Split Workbench) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDokVerifModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" @click="showDokVerifModal = false" />

          <!-- Modal Window -->
          <div class="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[920px] flex flex-col overflow-hidden border border-slate-200">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/90 bg-slate-50/80 shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <FileText class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-800">Verifikasi Berkas Proposal</h3>
                    <span class="text-[11px] text-slate-400 font-normal">|</span>
                    <span class="text-xs font-semibold text-slate-500"> Dokumen {{ currentDocIndex + 1 }} dari {{ currentPersyaratan.length }} </span>
                  </div>
                  <p class="text-[11px] text-slate-500 truncate">Periksa kelengkapan dan keabsahan dokumen proposal yang diunggah oleh kelembagaan.</p>
                </div>
              </div>

              <!-- Header Right: Quick Tallies & Close -->
              <div class="flex items-center gap-3 shrink-0">
                <div class="hidden sm:flex items-center gap-2 text-xs">
                  <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"> <Check class="w-3 h-3" /> {{ dokumenSummary.approved }} Sesuai </span>
                  <span v-if="dokumenSummary.rejected > 0" class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    <X class="w-3 h-3" /> {{ dokumenSummary.rejected }} Catatan
                  </span>
                  <span class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> {{ dokumenSummary.pending }} Belum Dicek </span>
                </div>
                <button
                  type="button"
                  @click="showDokVerifModal = false"
                  class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Modal Body (Split Workbench: Left Directory, Right Viewer + Decision) -->
            <div class="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              <!-- ============================================== -->
              <!-- LEFT COLUMN: Document Directory List (320px)   -->
              <!-- ============================================== -->
              <div class="w-full md:w-80 lg:w-84 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/70 flex flex-col shrink-0 overflow-hidden">
                <div class="p-3 border-b border-slate-200/80 bg-white/70 flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Daftar Dokumen</span>
                  <span class="text-[11px] font-mono text-slate-500 font-semibold">{{ currentPersyaratan.length }} Berkas</span>
                </div>

                <div class="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2">
                  <button
                    v-for="(p, idx) in currentPersyaratan"
                    :key="p.id"
                    type="button"
                    @click="selectedVerifDocId = p.id"
                    :class="[
                      'w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5',
                      selectedVerifDocId === p.id ? 'bg-white border-[#066C2A] shadow-xs ring-1 ring-[#066C2A]/80' : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300',
                    ]"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex items-start gap-2 min-w-0">
                        <span class="w-5 h-5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {{ idx + 1 }}
                        </span>
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">{{ p.nama }}</span>
                          <span v-if="p.wajib" class="text-[9px] font-bold text-rose-600 uppercase">Wajib</span>
                          <span v-else class="text-[9px] font-bold text-slate-500 uppercase">Opsional</span>
                        </div>
                      </div>

                      <!-- Document status icon -->
                      <span v-if="getVerification(p.id).status === 'APPROVED'" class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0" title="Sesuai">
                        <Check class="w-3 h-3" />
                      </span>
                      <span v-else-if="getVerification(p.id).status === 'REJECTED'" class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0" title="Perlu Catatan">
                        <X class="w-3 h-3" />
                      </span>
                      <span v-else class="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0" title="Belum Dicek">
                        <Clock class="w-3 h-3" />
                      </span>
                    </div>

                    <!-- File Info footer -->
                    <div class="text-[10px] text-slate-500 truncate pl-7">
                      <template v-if="getDokumen(p.id)">
                        <span class="font-mono">{{ getDokumen(p.id)!.namaFile }}</span>
                      </template>
                      <span v-else class="text-rose-500 italic">Belum diunggah</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- ============================================== -->
              <!-- RIGHT COLUMN: Preview Viewer & Decision Panel  -->
              <!-- ============================================== -->
              <div class="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
                <!-- Viewer Top Bar -->
                <div class="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div class="flex items-center gap-2 min-w-0">
                    <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                      {{ selectedPersyaratan?.nama || '-' }}
                    </h4>
                    <span v-if="selectedPersyaratan?.wajib" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200"> Wajib </span>
                  </div>

                  <!-- Viewer Actions (Open new tab, reload, download) -->
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      v-if="selectedVerifDoc?.urlFile"
                      type="button"
                      @click="refreshProposalPresignedUrls"
                      :disabled="isRefreshingUrl"
                      class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Muat ulang tautan jika kedaluwarsa"
                    >
                      <RefreshCw :class="['w-3 h-3', isRefreshingUrl ? 'animate-spin text-emerald-600' : 'text-slate-500']" />
                      <span>Segarkan URL</span>
                    </button>
                    <a
                      v-if="selectedVerifDoc?.urlFile"
                      :href="selectedVerifDoc.urlFile"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#066C2A] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      title="Buka dokumen di tab baru"
                    >
                      <ExternalLink class="w-3 h-3" />
                      <span>Buka Tab Baru</span>
                    </a>
                  </div>
                </div>

                <!-- Viewer Body: Preview Box -->
                <div class="flex-1 p-4 bg-slate-100/60 overflow-hidden flex flex-col min-h-0">
                  <div class="w-full h-full bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden flex items-center justify-center relative">
                    <template v-if="selectedVerifDoc?.urlFile">
                      <img v-if="selectedVerifDoc.urlFile.match(/\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?|$)/i)" :src="selectedVerifDoc.urlFile" :alt="selectedVerifDoc.namaFile" class="max-w-full max-h-full object-contain p-2" />
                      <iframe v-else :src="selectedVerifDoc.urlFile" class="w-full h-full border-0" title="Pratinjau Dokumen" />
                    </template>
                    <div v-else class="flex flex-col items-center justify-center gap-2 p-8 text-center">
                      <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                        <AlertTriangle class="w-6 h-6" />
                      </div>
                      <span class="text-xs font-bold text-slate-700">Berkas Belum Diunggah</span>
                      <p class="text-[11px] text-slate-400 max-w-xs">Pemohon belum melampirkan berkas untuk persyaratan ini.</p>
                    </div>
                  </div>
                </div>

                <!-- Decision & Navigation Bottom Card -->
                <div class="p-4 border-t border-slate-200 bg-white flex flex-col gap-3 shrink-0">
                  <!-- Row 1: Decision Buttons -->
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      @click="setVerificationStatus(selectedVerifDocId, 'APPROVED')"
                      :class="[
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        getVerification(selectedVerifDocId).status === 'APPROVED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300',
                      ]"
                    >
                      <Check class="w-4 h-4" /> Dokumen Sesuai
                    </button>
                    <button
                      type="button"
                      @click="setVerificationStatus(selectedVerifDocId, 'REJECTED')"
                      :class="[
                        'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                        getVerification(selectedVerifDocId).status === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300',
                      ]"
                    >
                      <X class="w-4 h-4" /> Tidak Sesuai (Perlu Catatan)
                    </button>
                  </div>

                  <!-- Row 2: Rejection Notes Input -->
                  <div v-if="getVerification(selectedVerifDocId).status === 'REJECTED'" class="flex flex-col gap-1">
                    <label class="text-[10px] font-bold text-rose-700 uppercase tracking-wider"> Catatan Alasan Penolakan / Perbaikan: </label>
                    <textarea
                      v-model="getVerification(selectedVerifDocId).notes"
                      rows="2"
                      placeholder="Contoh: Dokumen tidak terbaca / buram, mohon unggah ulang scan asli..."
                      class="w-full text-xs p-2.5 rounded-xl border border-rose-300 bg-rose-50/30 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                    />
                  </div>

                  <!-- Row 3: Navigation Next / Prev / Finish -->
                  <div class="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      @click="goToPrevDoc"
                      :disabled="!hasPrevDoc"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft class="w-4 h-4" /> Dokumen Sebelumnya
                    </button>

                    <div class="flex items-center gap-2">
                      <button
                        v-if="hasNextDoc"
                        type="button"
                        @click="goToNextDoc"
                        class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#066C2A] text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                      >
                        Lanjut ke Dokumen Berikutnya <ChevronRight class="w-4 h-4" />
                      </button>
                      <button
                        v-else
                        type="button"
                        @click="showDokVerifModal = false"
                        class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                      >
                        Selesai Memeriksa <CheckCircle2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <KabupatenRevisiConfirmationModal
      :is-open="showConfirmModal"
      :is-submitting="isSubmittingRejection"
      :proposal-number="pengajuan?.nomor_proposal || pengajuan?.nomorProposal || '-'"
      :lembaga-name="pengajuan?.lembaga?.namaLembaga || '-'"
      :destination-stage="confirmDestination"
      :rejected-proposal-docs="rejectedProposalDocs"
      :grouped-pekebun-rejections="groupedPekebunRejections"
      @close="showConfirmModal = false"
      @confirm="executePendingAction"
    />

    <DocumentVersionHistoryModal :is-open="showVersionHistoryModal" :proposal-id="Number(id)" :document-type="selectedHistoryDocType" :document-label="selectedHistoryDocLabel" @close="showVersionHistoryModal = false" />

    <DocumentPreviewModal :is-open="showPreview && !!previewDoc" :title="previewDoc?.title ?? ''" :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? 'application/octet-stream'" @close="showPreview = false" />
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
