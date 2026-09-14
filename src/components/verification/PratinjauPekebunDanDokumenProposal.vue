<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePekebunStore } from '@/stores/pekebun';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiProvinsiDraftStore } from '@/stores/verifikasiProvinsiDraft';
import { Eye, CheckCircle2, MapPin, Warehouse, FileText } from 'lucide-vue-next';
import type { DokumenPersyaratan, DokumenUpload, ProposalDocument, SpatialOverlapResponse, Proposal } from '@/types/pengusulan';
import { JenisSarpras } from '@/types/pengusulan';
import type { DokumenPekebun } from '@/types/pekebun';
import { PAKET_OPTIONS, PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { resolveProposalRequirements } from '@/lib/dynamicRequirements';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import VerificationOverlapMap from '@/components/verification/VerificationOverlapMap.vue';
import PratinjauPekebunModal from '@/components/verification/PratinjauPekebunModal.vue';
import DropdownEksporPekebun from '@/components/verification/DropdownEksporPekebun.vue';
import RabTable from '@/components/pengusulan/RabTable.vue';
import type { RabItem } from '@/types/rab';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

interface PolygonData {
  coordinates: Array<[number, number]>;
  label?: string;
}

interface OtherProposalData {
  proposalId: string;
  proposalNumber: string;
  proposalName: string;
  polygons: PolygonData[];
  distance?: number;
}

const props = withDefaults(
  defineProps<{
    usulan?: any;
    proposal?: any;
    proposalId?: string | number;
    activePolygons?: PolygonData[];
    otherProposals?: OtherProposalData[];
    showNextButton?: boolean;
    nextButtonText?: string;
  }>(),
  {
    showNextButton: false,
    nextButtonText: 'Lanjut ke Surat Pengantar SK CPCL',
  },
);

const emit = defineEmits<{
  (e: 'next'): void;
}>();

const route = useRoute();
const pengusulanStore = usePengusulanStore();
const pekebunStore = usePekebunStore();
const verifikasiProvinsiStore = useVerifikasiProvinsiDraftStore();
const masterStore = useMasterSarprasStore();

const effectiveId = computed(() => {
  if (props.proposalId) return String(props.proposalId);
  const u = props.usulan || props.proposal;
  if (u?.id) return String(u.id);
  if (route.params.id) return String(route.params.id);
  return '';
});

const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);

// Retrieve proposal from props, activePengajuan, or listPengajuan
const pengajuan = computed<Proposal | any | null>(() => {
  if (props.usulan) return props.usulan;
  if (props.proposal) return props.proposal;
  const id = effectiveId.value;
  if (pengusulanStore.activePengajuan && (!id || String(pengusulanStore.activePengajuan.id) === String(id))) {
    return pengusulanStore.activePengajuan;
  }
  if (id) {
    const found = pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id));
    if (found) return found;
  }
  return pengusulanStore.activePengajuan || null;
});

async function loadSpatialOverlap(proposalId: string | number) {
  if (!proposalId) return;
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

onMounted(async () => {
  const id = effectiveId.value;
  if (id) {
    const needsDetail = !pengajuan.value || (!pengajuan.value.pekebuns && !pengajuan.value.lahans);
    try {
      await Promise.allSettled([
        needsDetail ? pengusulanStore.getProposalDetail(id) : Promise.resolve(),
        !props.activePolygons?.length ? loadSpatialOverlap(id) : Promise.resolve(),
      ]);
    } catch (e) {
      console.error('Gagal memuat detail proposal atau spatial overlap:', e);
    }
  }
  if (pekebunStore.listPekebun.length === 0) {
    pekebunStore.fetchPekebunList().catch(() => {});
  }
});

watch(
  () => effectiveId.value,
  async (newId) => {
    if (newId) {
      const needsDetail = !pengajuan.value || (!pengajuan.value.pekebuns && !pengajuan.value.lahans);
      await Promise.allSettled([
        needsDetail ? pengusulanStore.getProposalDetail(newId) : Promise.resolve(),
        !props.activePolygons?.length ? loadSpatialOverlap(newId) : Promise.resolve(),
      ]);
    }
  },
);

// Map pekebuns and lahans where 1 pekebun can have one or more lahan
interface MappedPekebunItem {
  id: string;
  nama: string;
  nik: string;
  nomorKK: string;
  lahans: any[];
  totalLuasLahan: number;
  totalDocsCount: number;
  fotoUdara?: any;
  fotoUdaraList?: any[];
  rawPekebun: any;
}

const pekebunList = computed<MappedPekebunItem[]>(() => {
  const p = pengajuan.value;
  if (!p) return [];

  const allLahans: any[] = p.lahans || [];
  const rawPekebuns: any[] = p.pekebuns || [];

  // 1. Primary: Use pekebuns array from getProposalDetail
  if (rawPekebuns.length > 0) {
    return rawPekebuns.map((pk: any, idx: number) => {
      const pkId = String(pk.id ?? idx + 1);
      const enriched = pekebunStore.listPekebun.find(
        (item) => item.nik === pk.nik || String(item.id) === pkId
      );

      // Find all lahans belonging to this pekebun
      const matchingLahans = allLahans.filter(
        (l: any) => Number(l.pekebun_id) === Number(pk.id) || String(l.pekebun_id) === pkId
      );

      // Fallback lahan from pekebun object if none found in lahans array
      const effectiveLahans =
        matchingLahans.length > 0
          ? matchingLahans
          : pk.lahans && Array.isArray(pk.lahans) && pk.lahans.length > 0
          ? pk.lahans
          : pk.lahan
          ? [pk.lahan]
          : enriched?.lahan
          ? [enriched.lahan]
          : [];

      // Calculate total luas lahan
      const totalLuas = effectiveLahans.reduce((sum: number, l: any) => {
        const luas = Number(l.luas_lahan ?? l.luasLahan ?? 0);
        return sum + (isNaN(luas) ? 0 : luas);
      }, 0);

      // Count farmer documents
      const fDocsCount = (pk.documents || pk.dokumen || enriched?.dokumen || []).length;
      // Count land documents
      const lDocsCount = effectiveLahans.reduce((sum: number, l: any) => {
        const count = (l.documents || l.dokumen || l.dokumen_lahan || []).length;
        const extra = (l.scanLegalitasUrl ? 1 : 0) + (l.suratKeteranganBedaNamaUrl ? 1 : 0);
        return sum + Math.max(count, extra);
      }, 0);

      // Check drone photo from lahans => documents (document_type: FOTO_UDARA)
      const lahanDronePhotos: any[] = [];
      effectiveLahans.forEach((l: any, lIdx: number) => {
        const docs = l.documents || l.dokumen || l.dokumen_lahan || [];
        const foundDoc = docs.find((d: any) => String(d.document_type || d.documentType || d.tipeDokumen || '').toUpperCase() === 'FOTO_UDARA');
        if (foundDoc) {
          lahanDronePhotos.push({
            id: foundDoc.id,
            lahanId: l.id,
            lahanIndex: lIdx + 1,
            namaFile: foundDoc.file_name || foundDoc.fileName || foundDoc.namaFile || `Foto Udara Bidang ${lIdx + 1}`,
            file_name: foundDoc.file_name || foundDoc.fileName || foundDoc.namaFile || `Foto Udara Bidang ${lIdx + 1}`,
            fileUrl: foundDoc.file_url || foundDoc.fileUrl || foundDoc.urlFile,
            file_url: foundDoc.file_url || foundDoc.fileUrl || foundDoc.urlFile,
            dataUrl: foundDoc.file_url || foundDoc.fileUrl || foundDoc.urlFile,
            mimeType: foundDoc.mime_type || foundDoc.mimeType || 'image/jpeg',
            ukuranBytes: Number(foundDoc.file_size || foundDoc.fileSize || 0),
            uploadedAt: foundDoc.created_at || '',
          });
        } else {
          const stored = verifikasiProvinsiStore.fotoUdaraPerPekebun[String(l.id)] || verifikasiProvinsiStore.fotoUdaraPerPekebun[`CPCL-${l.id}`];
          if (stored) {
            lahanDronePhotos.push({
              ...stored,
              lahanId: l.id,
              lahanIndex: lIdx + 1,
            });
          }
        }
      });

      const dronePhoto =
        lahanDronePhotos[0] ||
        verifikasiProvinsiStore.fotoUdaraPerPekebun[pkId] ||
        verifikasiProvinsiStore.fotoUdaraPerPekebun[`CPCL-${pkId}`] ||
        null;

      return {
        id: pkId,
        nama: pk.name || pk.nama || pk.namaPekebun || enriched?.nama || `Pekebun ${idx + 1}`,
        nik: pk.nik || enriched?.nik || '-',
        nomorKK: pk.nomor_kk || pk.nomorKK || enriched?.nomorKK || '-',
        lahans: effectiveLahans,
        totalLuasLahan: Number(totalLuas.toFixed(2)),
        totalDocsCount: fDocsCount + lDocsCount,
        fotoUdara: dronePhoto,
        fotoUdaraList: lahanDronePhotos,
        rawPekebun: { ...enriched, ...pk },
      };
    });
  }

  // 2. Fallback: If only lahans are present, group by pekebun_id
  if (allLahans.length > 0) {
    const groups = new Map<string, any[]>();
    for (const l of allLahans) {
      const pId = String(l.pekebun_id || 'unknown');
      if (!groups.has(pId)) groups.set(pId, []);
      groups.get(pId)!.push(l);
    }

    return Array.from(groups.entries()).map(([pId, lahansForPekebun], idx) => {
      const enriched = pekebunStore.listPekebun.find((item) => String(item.id) === pId);
      const totalLuas = lahansForPekebun.reduce((sum: number, l: any) => sum + (Number(l.luas_lahan ?? l.luasLahan ?? 0) || 0), 0);
      const lDocsCount = lahansForPekebun.reduce((sum: number, l: any) => sum + (l.documents || l.dokumen || []).length, 0);
      const dronePhoto = verifikasiProvinsiStore.fotoUdaraPerPekebun[pId] || null;

      return {
        id: pId,
        nama: enriched?.nama || `Pekebun ${idx + 1}`,
        nik: enriched?.nik || '-',
        nomorKK: enriched?.nomorKK || '-',
        lahans: lahansForPekebun,
        totalLuasLahan: Number(totalLuas.toFixed(2)),
        totalDocsCount: (enriched?.dokumen?.length ?? 0) + lDocsCount,
        fotoUdara: dronePhoto,
        rawPekebun: enriched || { id: pId, nama: `Pekebun ${idx + 1}` },
      };
    });
  }

  // 3. Fallback: daftarCPCL legacy
  return (p.daftarCPCL ?? []).map((cpcl: any, idx: number) => {
    const enriched = pekebunStore.listPekebun.find((item) => item.nik === cpcl.nik);
    const cpclLahan = {
      id: cpcl.id || `lahan-${idx + 1}`,
      pekebun_id: String(cpcl.id || idx + 1),
      luas_lahan: cpcl.luasLahanHektar || 0,
      jenis_legalitas: cpcl.jenisHakLahan || 'SHM',
      nomor_legalitas: cpcl.nomorSuratLahan || '-',
      coordinates: cpcl.coordinates || [],
    };
    const dronePhoto = verifikasiProvinsiStore.fotoUdaraPerPekebun[String(cpcl.id)] || null;

    return {
      id: String(cpcl.id || idx + 1),
      nama: cpcl.namaPekebun || enriched?.nama || `Pekebun ${idx + 1}`,
      nik: cpcl.nik || enriched?.nik || '-',
      nomorKK: cpcl.nomorKK || enriched?.nomorKK || '-',
      lahans: [cpclLahan],
      totalLuasLahan: Number(cpcl.luasLahanHektar) || 0,
      totalDocsCount: (enriched?.dokumen?.length ?? 0) + (enriched?.lahan?.dokumen?.length ?? 0),
      fotoUdara: dronePhoto,
      rawPekebun: { ...enriched, ...cpcl },
    };
  });
});

// Pekebun Preview Modal State
const isPekebunModalOpen = ref(false);
const selectedPekebunItem = ref<MappedPekebunItem | null>(null);

function openPekebunPreview(item: MappedPekebunItem) {
  selectedPekebunItem.value = item;
  isPekebunModalOpen.value = true;
}

// Spatial overlap & active polygons calculation
const selectedPaketId = computed(() => {
  return pengajuan.value?.paket_sarpras || pengajuan.value?.jenisSarpras || '';
});

const selectedPaketInfo = computed(() => {
  return (
    PAKET_OPTIONS.find((p) => p.id === selectedPaketId.value || p.label.toLowerCase() === selectedPaketId.value.toLowerCase()) || {
      id: selectedPaketId.value,
      label: selectedPaketId.value || 'Paket Usulan',
      icon: '📦',
      isPupuk: isPupukPaket.value,
    }
  );
});

watch(
  () => selectedPaketId.value,
  (code) => {
    if (code) {
      masterStore.fetchPersyaratan(String(code), false);
    }
  },
  { immediate: true }
);

const dynamicResolvedRequirements = computed(() => {
  const pId = selectedPaketId.value;
  if (!pId) return [];
  const masterList = masterStore.persyaratanMap[pId];
  const proposalDocs = (pengajuan.value as any)?.documents || (pengajuan.value as any)?.dokumen || [];
  return resolveProposalRequirements(pId, proposalDocs, masterList, true);
});

const currentPersyaratan = computed(() => {
  const pId = selectedPaketId.value;
  if (!pId) return [];
  if (dynamicResolvedRequirements.value.length > 0) {
    return dynamicResolvedRequirements.value.map((d) => ({
      id: d.id,
      nama: d.nama,
      wajib: d.isWajib,
      formatDownloadUrl: d.formatDownloadUrl || null,
      isFromMaster: d.isFromMaster,
    }));
  }
  return PAKET_PERSYARATAN_CONFIG[pId as JenisSarpras] || PAKET_PERSYARATAN_CONFIG[JenisSarpras.EKSTENSIFIKASI] || [];
});

const isPupukPaket = computed(() => {
  const p = String(selectedPaketId.value).toUpperCase();
  return p.includes('EKSTENSIFIKASI') || p.includes('INTENSIFIKASI') || p.includes('PUPUK') || p.includes('BENIH');
});

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

function extractCoords(obj: any): Array<[number, number]> {
  if (!obj) return [];
  if (Array.isArray(obj.coordinates)) {
    return obj.coordinates
      .filter((c: any) => c && typeof c.lat === 'number' && typeof c.lng === 'number')
      .map((c: any) => [c.lat, c.lng] as [number, number]);
  }
  if (typeof obj.koordinatPoligon === 'string') {
    return parsePolygonCoords(obj.koordinatPoligon);
  }
  return [];
}

const activePolygons = computed<PolygonData[]>(() => {
  if (props.activePolygons && props.activePolygons.length > 0) {
    return props.activePolygons;
  }
  if (currentSpatialOverlap.value?.active_polygons && currentSpatialOverlap.value.active_polygons.length > 0) {
    return currentSpatialOverlap.value.active_polygons.map((p) => ({
      coordinates: (p.coordinates || []).map((c) => [c[0], c[1]] as [number, number]),
      label: p.label,
    }));
  }

  // Fallback: local coordinates from lahans of mapped pekebuns
  if (!pengajuan.value) return [];
  const polys: PolygonData[] = [];
  for (const item of pekebunList.value) {
    for (let idx = 0; idx < item.lahans.length; idx++) {
      const l = item.lahans[idx];
      const coords = extractCoords(l);
      if (coords.length >= 3) {
        polys.push({
          coordinates: coords,
          label: `${item.nama} - Lahan ${idx + 1}`,
        });
      }
    }
  }
  return polys;
});

const nearbyProposals = computed<OtherProposalData[]>(() => {
  if (props.otherProposals && props.otherProposals.length > 0) {
    return props.otherProposals;
  }
  if (currentSpatialOverlap.value?.other_proposals && currentSpatialOverlap.value.other_proposals.length > 0) {
    return currentSpatialOverlap.value.other_proposals.map((op) => ({
      proposalId: String(op.proposalId),
      proposalNumber: op.proposalNumber,
      proposalName: op.proposalName,
      polygons: (op.polygons || []).map((p) => ({
        coordinates: (p.coordinates || []).map((c) => [c[0], c[1]] as [number, number]),
        label: p.label,
      })),
    }));
  }
  return [];
});

function getDokumen(persyaratanId: string): DokumenPersyaratan | ProposalDocument | any {
  if (!pengajuan.value) return undefined;

  // 0. Cek di dynamicResolvedRequirements
  const resolved = dynamicResolvedRequirements.value.find((d) => d.id === persyaratanId || d.code === persyaratanId);
  if (resolved && resolved.isUploaded && resolved.fileUrl) {
    return {
      id: resolved.uploadedDocId || resolved.id,
      file_name: resolved.fileName,
      file_url: resolved.fileUrl,
      file_size: resolved.fileSize,
      mime_type: resolved.mimeType,
      document_type: resolved.code,
      urlFile: resolved.fileUrl,
      namaFile: resolved.fileName,
      ukuranBytes: resolved.fileSize,
    };
  }

  const aliases: Record<string, string[]> = {
    BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI'],
    BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN'],
    SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
    SURAT_PENGANTAR_SK_CPCL: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV'],
    SURAT_PENGANTAR: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV'],
    REKOMTEK: ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'],
  };

  const allowed = (aliases[persyaratanId.toUpperCase()] || [persyaratanId.toUpperCase()]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));

  if (pengajuan.value.documents && Array.isArray(pengajuan.value.documents)) {
    const found = pengajuan.value.documents.find((d: any) => {
      const dt = (d.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return dt && allowed.includes(dt);
    });
    if (found) return found;
  }

  if (pengajuan.value.dokumen && Array.isArray(pengajuan.value.dokumen)) {
    return pengajuan.value.dokumen.find((d: any) => {
      const dt = (d.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return dt && allowed.includes(dt);
    });
  }

  return undefined;
}

function getDocName(doc: any): string {
  if (!doc) return '';
  return doc.file_name || doc.namaFile || doc.fileName || 'Dokumen';
}

function getDocSizeFormatted(doc: any): string {
  if (!doc) return '';
  const bytes = Number(doc.file_size || doc.ukuranBytes || 0);
  if (!bytes) return '';
  return `${(bytes / 1024).toFixed(0)} KB`;
}

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function detectMimeType(url: string, name?: string, defaultMime?: string): string {
  if (defaultMime && defaultMime.startsWith('image/')) return defaultMime;
  if (defaultMime && defaultMime.includes('pdf')) return 'application/pdf';
  const target = (name || url || '').toLowerCase().split('?')[0];
  if (target.endsWith('.jpg') || target.endsWith('.jpeg')) return 'image/jpeg';
  if (target.endsWith('.png')) return 'image/png';
  if (target.endsWith('.webp')) return 'image/webp';
  if (target.endsWith('.gif')) return 'image/gif';
  if (target.endsWith('.svg')) return 'image/svg+xml';
  if (target.endsWith('.pdf')) return 'application/pdf';
  return defaultMime || 'application/octet-stream';
}

function openPreview(doc?: DokumenPekebun | DokumenPersyaratan | DokumenUpload | ProposalDocument | any) {
  if (!doc) return;
  let dataUrl = '';
  let mimeType = 'application/octet-stream';
  let title = 'Dokumen';

  if (typeof doc === 'string') {
    dataUrl = doc;
    title = 'Pratinjau Dokumen';
    mimeType = detectMimeType(dataUrl, title, 'image/jpeg');
  } else if (doc.file_url) {
    dataUrl = doc.file_url;
    title = doc.file_name || doc.namaFile || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mime_type || doc.file_extension);
  } else if ('fileUrl' in doc && doc.fileUrl) {
    dataUrl = doc.fileUrl;
    title = (doc as any).namaFile || (doc as DokumenPekebun).fileName || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, (doc as any).mimeType || (doc as DokumenPekebun).fileExtension);
  } else if ('dataUrl' in doc && doc.dataUrl) {
    dataUrl = (doc as DokumenUpload).dataUrl;
    title = (doc as DokumenUpload).namaFile;
    mimeType = detectMimeType(dataUrl, title, (doc as DokumenUpload).mimeType);
  } else if ('urlFile' in doc && doc.urlFile) {
    dataUrl = (doc as DokumenPersyaratan).urlFile;
    title = (doc as DokumenPersyaratan).namaFile;
    mimeType = detectMimeType(dataUrl, title);
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
    previewDoc.value = { dataUrl, mimeType, title };
    showPreview.value = true;
  }
}

const storageArea = computed(() => pengajuan.value?.storage_area || pengajuan.value?.gudangSerahTerima);
const gudangAlamat = computed(() => storageArea.value?.address || storageArea.value?.alamat || '-');
const gudangKoordinat = computed(() => storageArea.value?.coordinate || storageArea.value?.koordinat || '-');

const fotoDepan = computed(() => {
  if (storageArea.value?.fotoTampakDepan) return storageArea.value.fotoTampakDepan;
  const url = storageArea.value?.exterior_photo_file_url || storageArea.value?.exterior_photo_url;
  if (url) {
    return {
      file_name: 'foto_tampak_depan_gudang.jpg',
      namaFile: 'foto_tampak_depan_gudang.jpg',
      file_url: url,
      mime_type: 'image/jpeg',
    };
  }
  return null;
});

const fotoDalam = computed(() => {
  if (storageArea.value?.fotoTampakDalam) return storageArea.value.fotoTampakDalam;
  const url = storageArea.value?.interior_photo_file_url || storageArea.value?.interior_photo_url;
  if (url) {
    return {
      file_name: 'foto_tampak_dalam_gudang.jpg',
      namaFile: 'foto_tampak_dalam_gudang.jpg',
      file_url: url,
      mime_type: 'image/jpeg',
    };
  }
  return null;
});

function normalizeRabItem(it: any, idx: number): RabItem {
  const q1 = it.jumlahTahap1 ?? it.details?.jumlahTahap1 ?? it.jumlah_tahap_1 ?? null;
  const q2 = it.jumlahTahap2 ?? it.details?.jumlahTahap2 ?? it.jumlah_tahap_2 ?? null;
  const q3 = it.jumlahTahap3 ?? it.details?.jumlahTahap3 ?? it.jumlah_tahap_3 ?? null;
  const q4 = it.jumlahTahap4 ?? it.details?.jumlahTahap4 ?? it.jumlah_tahap_4 ?? null;
  const sumStages = (Number(q1) || 0) + (Number(q2) || 0) + (Number(q3) || 0) + (Number(q4) || 0);
  const vol = Number(it.volume ?? it.jumlah_total ?? it.jumlahTotal ?? (sumStages > 0 ? sumStages : 1));
  const harga = Number(it.hargaSatuan ?? it.price_per_unit ?? it.harga_satuan ?? 0);
  const subTotal = Number(it.subTotal ?? it.total_price ?? it.sub_total ?? (vol * harga));

  const varietas = it.varietas || it.details?.varietas || '';
  const varietasCustom = it.varietasCustom || it.details?.varietasCustom || it.details?.varietas_custom || '';
  const jenis = it.jenis || it.details?.jenis || it.item_type || 'BARANG';
  const uraian = it.uraian || it.item_name || it.name || it.nama_barang || '-';
  const satuan = it.satuan || it.unit || 'unit';

  return {
    id: String(it.id || `rab-item-${idx + 1}`),
    tahap: it.tahap || 'Semua Tahap',
    uraian,
    volume: vol,
    satuan,
    unit: satuan,
    hargaSatuan: harga,
    price_per_unit: harga,
    subTotal,
    total_price: subTotal,
    jenis,
    varietas,
    varietasCustom,
    jumlahTahap1: q1 !== null && q1 !== undefined ? Number(q1) : null,
    jumlahTahap2: q2 !== null && q2 !== undefined ? Number(q2) : null,
    jumlahTahap3: q3 !== null && q3 !== undefined ? Number(q3) : null,
    jumlahTahap4: q4 !== null && q4 !== undefined ? Number(q4) : null,
    jumlahTotal: vol,
    details: {
      ...(it.details || {}),
      jenis,
      varietas,
      varietasCustom,
      jumlahTahap1: q1 !== null && q1 !== undefined ? Number(q1) : null,
      jumlahTahap2: q2 !== null && q2 !== undefined ? Number(q2) : null,
      jumlahTahap3: q3 !== null && q3 !== undefined ? Number(q3) : null,
      jumlahTahap4: q4 !== null && q4 !== undefined ? Number(q4) : null,
    },
  };
}

const rabList = computed<RabItem[]>(() => {
  const p = pengajuan.value as any;
  if (!p) return [];

  if (Array.isArray(p.rabFinalItems) && p.rabFinalItems.length > 0) {
    return p.rabFinalItems.map(normalizeRabItem);
  }
  if (Array.isArray(p.rab_final?.items) && p.rab_final.items.length > 0) {
    return p.rab_final.items.map(normalizeRabItem);
  }
  if (Array.isArray(p.rabs) && p.rabs.length > 0) {
    const finalRab = p.rabs.find((r: any) => r.flag === 'FINAL');
    if (finalRab?.items && Array.isArray(finalRab.items) && finalRab.items.length > 0) {
      return finalRab.items.map(normalizeRabItem);
    }
  }
  if (Array.isArray(p.rabItems) && p.rabItems.length > 0) {
    return p.rabItems.map(normalizeRabItem);
  }
  if (Array.isArray(p.rabs) && p.rabs.length > 0) {
    const propRab = p.rabs.find((r: any) => r.flag === 'PROPOSAL') || p.rabs[0];
    if (propRab?.items && Array.isArray(propRab.items) && propRab.items.length > 0) {
      return propRab.items.map(normalizeRabItem);
    }
  }
  if (Array.isArray(p.rabProposalItems) && p.rabProposalItems.length > 0) {
    return p.rabProposalItems.map(normalizeRabItem);
  }
  if (Array.isArray(p.rab_proposal?.items) && p.rab_proposal.items.length > 0) {
    return p.rab_proposal.items.map(normalizeRabItem);
  }
  return [];
});

const rabTotal = computed(() => {
  if (rabList.value.length > 0) {
    return rabList.value.reduce((sum: number, r: any) => sum + (r.subTotal || r.total_price || 0), 0);
  }
  if (pengajuan.value?.total_anggaran) return pengajuan.value.total_anggaran;
  if (pengajuan.value?.totalAnggaranPengajuan) return pengajuan.value.totalAnggaranPengajuan;
  return 0;
});

const docRabSigned = computed(() => {
  if (pengajuan.value?.rabDitandatangani) return pengajuan.value.rabDitandatangani;
  if (pengajuan.value?.documents && Array.isArray(pengajuan.value.documents)) {
    const d = pengajuan.value.documents.find((doc: any) =>
      ['RAB_KAB_SIGNED', 'RAB_SIGNED', 'RAB_TERTANDATANGANI', 'RAB_FINAL', 'RAB_PROPOSAL', 'RAB'].includes((doc.document_type || '').toUpperCase())
    );
    if (d) {
      return {
        persyaratanId: 'rab-signed',
        namaFile: d.file_name,
        file_name: d.file_name,
        file_url: d.file_url,
        dataUrl: d.file_url,
        mimeType: d.mime_type || 'application/pdf',
        ukuranBytes: Number(d.file_size) || 0,
        uploadedAt: d.created_at,
      };
    }
  }
  if (pengajuan.value?.dokumen && Array.isArray(pengajuan.value.dokumen)) {
    const d = pengajuan.value.dokumen.find((doc: any) =>
      ['RAB_KAB_SIGNED', 'RAB_SIGNED', 'RAB_TERTANDATANGANI', 'RAB_FINAL', 'RAB_PROPOSAL', 'RAB'].includes((doc.tipeDokumen || doc.persyaratanId || '').toUpperCase())
    );
    if (d) {
      return d;
    }
  }
  return null;
});

const VALIDATOR_DOC_TYPES = [
  { type: 'BERITA_ACARA_DOKUMEN', label: 'Berita Acara Verifikasi Dokumen', aliases: ['BERITA_ACARA_DOKUMEN', 'BA_VERIFIKASI', 'BERITA_ACARA'] },
  { type: 'BERITA_ACARA_LAPANGAN', label: 'Berita Acara Verifikasi Lapangan', aliases: ['BERITA_ACARA_LAPANGAN', 'BA_VERIFIKASI_LAPANGAN', 'BA_LAPANGAN'] },
  { type: 'SK_CPCL', label: 'Surat Keputusan (SK) CPCL', aliases: ['SK_CPCL', 'SKCPCL'] },
  { type: 'SURAT_PENGANTAR_SK_CPCL', label: 'Surat Pengantar SK CPCL Provinsi', aliases: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURATPENGANTARSKCPCL'] },
  { type: 'REKOMTEK', label: 'Rekomendasi Teknis Ditjenbun', aliases: ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEKDITJENBUN'] },
  { type: 'KEPUTUSAN_KELAYAKAN', label: 'Surat Keputusan Kelayakan BPDP', aliases: ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN'] },
  { type: 'SK_DIRUT', label: 'Surat Keputusan (SK) Direktur Utama BPDP', aliases: ['SK_DIRUT', 'SKDIRUT', 'SK_PENETAPAN_DIRUT'] },
];

const validatorDocuments = computed(() => {
  const p = pengajuan.value;
  if (!p) return [];
  const allDocs = (p.documents && Array.isArray(p.documents)) ? p.documents : ((p.dokumen && Array.isArray(p.dokumen)) ? p.dokumen : []);
  const results: Array<{
    type: string;
    label: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | string;
    uploadedBy: string;
    uploadedAtFormatted: string;
    rawDoc: any;
  }> = [];

  for (const item of VALIDATOR_DOC_TYPES) {
    const found = allDocs.find((d: any) => {
      const dt = (d.document_type || d.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return item.aliases.some((a) => a.replace(/[-_]/g, '') === dt);
    });
    if (found && (found.file_url || found.urlFile || found.file_name || found.namaFile)) {
      const uploadedBy = found.updated_by_name || found.created_by_name || found.uploadedBy || '';
      const uploadedAtFormatted = formatUploadedAt(
        found.uploaded_at_formatted || found.uploadedAtFormatted,
        found.updated_at || found.created_at || found.uploaded_at || found.uploadedAt
      );
      results.push({
        type: item.type,
        label: item.label,
        fileName: found.file_name || found.namaFile || `${item.label}.pdf`,
        fileUrl: found.file_url || found.urlFile || '',
        fileSize: found.file_size || found.ukuranBytes || 0,
        uploadedBy,
        uploadedAtFormatted,
        rawDoc: found,
      });
    }
  }
  return results;
});

function handleNext() {
  emit('next');
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-slate-900">Pratinjau Pekebun & Dokumen Proposal</h2>
      <p class="text-xs text-slate-500">Tinjau data pekebun, kepemilikan lahan, dan berkas pengajuan usulan.</p>
    </div>

    <!-- Spatial Overlap Map -->
    <VerificationOverlapMap
      v-if="pengajuan"
      :active-proposal-id="effectiveId"
      :active-proposal-name="pengajuan?.lembaga?.namaLembaga || pengajuan?.kelembagaan?.nama_lembaga || pengajuan?.namaKelompokTani || ''"
      :active-proposal-number="pengajuan?.nomor_proposal || pengajuan?.nomorProposal || pengajuan?.nomorUsulan || ''"
      :active-polygons="activePolygons"
      :other-proposals="nearbyProposals"
    />

    <!-- Pekebun Section Header & Export Toolbar -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Daftar Calon Pekebun &amp; Lahan</h3>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {{ pekebunList.length }} Anggota
        </span>
      </div>
      <DropdownEksporPekebun
        :proposal="pengajuan"
        :pekebuns="pengajuan?.pekebuns || pekebunList"
        :lahans="pengajuan?.lahans"
        :disabled="!pengajuan || pekebunList.length === 0"
      />
    </div>

    <!-- Pekebun Table -->
    <div v-if="pekebunList.length === 0" class="p-6 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
      Tidak ada data pekebun dalam pengajuan ini.
    </div>

    <div v-else class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
            <th class="p-3 w-12 text-center">No</th>
            <th class="p-3 text-left">Nama Pekebun</th>
            <th class="p-3 text-left">NIK</th>
            <th class="p-3 text-left">Lahan</th>
            <th class="p-3 text-center">Dokumen</th>
            <th class="p-3 text-center">Foto Udara</th>
            <th class="p-3 text-center w-28">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(item, idx) in pekebunList" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
            <td class="p-3 text-center text-slate-400 font-medium">{{ idx + 1 }}</td>
            <td class="p-3">
              <span class="font-semibold text-slate-800">{{ item.nama }}</span>
            </td>
            <td class="p-3">
              <span class="font-mono text-slate-500">{{ item.nik }}</span>
            </td>
            <td class="p-3">
              <div class="flex flex-col gap-0.5">
                <template v-if="item.lahans.length > 1">
                  <span class="font-semibold text-slate-800">{{ item.lahans.length }} Lahan (Total {{ item.totalLuasLahan }} Ha)</span>
                  <span class="text-[10px] text-slate-400">Termasuk {{ item.lahans.map((l: any) => l.jenis_legalitas || l.jenisLegalitas || 'SHM').join(', ') }}</span>
                </template>
                <template v-else-if="item.lahans.length === 1">
                  <span class="text-slate-700 font-medium">{{ item.totalLuasLahan }} Ha</span>
                  <span class="text-slate-400 text-[11px]">
                    {{ item.lahans[0].jenis_legalitas || item.lahans[0].jenisLegalitas || 'SHM' }}: {{ item.lahans[0].nomor_legalitas || item.lahans[0].nomorLegalitas || '-' }}
                  </span>
                </template>
                <template v-else>
                  <span class="text-slate-400 italic">0 Ha</span>
                </template>
              </div>
            </td>
            <td class="p-3 text-center">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px] border border-emerald-200">
                <CheckCircle2 class="w-3 h-3" /> {{ item.totalDocsCount }}
              </span>
            </td>
            <td class="p-3 text-center">
              <template v-if="item.fotoUdaraList && item.fotoUdaraList.length > 1">
                <div class="flex flex-col gap-1 items-center justify-center">
                  <div v-for="(fu, fIdx) in item.fotoUdaraList" :key="fu.id || fIdx" class="flex items-center gap-1">
                    <CheckCircle2 class="w-3 h-3 text-emerald-600 shrink-0" />
                    <span class="text-[10px] text-slate-700 font-medium">B{{ fu.lahanIndex || (fIdx + 1) }}:</span>
                    <span class="text-[10px] font-semibold text-slate-800 truncate max-w-[55px]" :title="fu.namaFile">{{ fu.namaFile }}</span>
                    <button type="button" @click="openPreview(fu)" class="text-[10px] text-[#066C2A] font-semibold hover:underline cursor-pointer" title="Pratinjau">
                      <Eye class="w-3 h-3 inline" />
                    </button>
                  </div>
                </div>
              </template>
              <template v-else-if="item.fotoUdara">
                <div class="flex items-center justify-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span class="text-[10px] font-semibold text-slate-800 truncate max-w-[80px]">{{ item.fotoUdara.namaFile || 'Foto Udara' }}</span>
                  <button type="button" @click="openPreview(item.fotoUdara)" class="text-[10px] text-[#066C2A] font-semibold hover:underline cursor-pointer">
                    <Eye class="w-3 h-3 inline" />
                  </button>
                </div>
              </template>
              <span v-else class="text-[10px] text-slate-400 italic">-</span>
            </td>
            <td class="p-3 text-center">
              <button
                type="button"
                @click="openPekebunPreview(item)"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#066C2A] text-white text-[10px] font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
              >
                <Eye class="w-3 h-3" /> Pratinjau
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Dokumen Proposal Section -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Proposal</span>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="text-3xl leading-none">{{ selectedPaketInfo?.icon || '📦' }}</span>
          <div class="flex flex-col">
            <span class="text-xs text-slate-500 font-medium">Jenis Paket Terpilih</span>
            <span class="text-sm font-bold text-slate-800">{{ selectedPaketInfo?.label || 'Paket Tidak Ditemukan' }}</span>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-xs">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="p-3">Nama Dokumen</th>
              <th class="p-3">Status Dokumen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="p in currentPersyaratan" :key="p.id">
              <td class="p-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-semibold text-slate-800">{{ p.nama }}</span>
                  <span v-if="p.wajib" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">Wajib</span>
                </div>
              </td>
              <td class="p-3">
                <div v-if="getDokumen(p.id)" class="flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-semibold text-slate-800 truncate">{{ getDocName(getDokumen(p.id)) }}</span>
                    <span v-if="getDocSizeFormatted(getDokumen(p.id))" class="text-[10px] text-slate-400">{{ getDocSizeFormatted(getDokumen(p.id)) }}</span>
                  </div>
                  <button
                    type="button"
                    @click="openPreview(getDokumen(p.id))"
                    class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-100 ml-auto cursor-pointer"
                  >
                    <Eye class="w-3 h-3" /> Lihat
                  </button>
                </div>
                <div v-else class="text-xs text-rose-500 font-medium italic">Belum diunggah</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Dokumen Verifikasi / Pengesahan Instansi -->
      <div v-if="validatorDocuments.length > 0" class="flex flex-col gap-4 mt-2">
        <div class="flex items-center gap-2">
          <div class="h-px flex-1 bg-slate-200" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Verifikasi & Pengesahan</span>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-lg bg-white shadow-xs">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3">Nama Dokumen</th>
                <th class="p-3">Pengunggah & Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="doc in validatorDocuments" :key="doc.type">
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                    <div class="flex flex-col min-w-0">
                      <span class="text-xs font-semibold text-slate-800">{{ doc.label }}</span>
                      <span class="text-[11px] text-slate-500 truncate">{{ doc.fileName }}</span>
                    </div>
                  </div>
                </td>
                <td class="p-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex flex-col">
                      <span v-if="doc.uploadedBy" class="text-xs text-slate-600 font-medium">
                        Diunggah oleh {{ doc.uploadedBy }}<span v-if="doc.uploadedAtFormatted" class="text-slate-400 font-normal"> &bull; {{ doc.uploadedAtFormatted }}</span>
                      </span>
                      <span v-if="doc.fileSize" class="text-[10px] text-slate-400">
                        {{ getDocSizeFormatted(doc.rawDoc) }}
                      </span>
                    </div>
                    <button
                      type="button"
                      @click="openPreview(doc.rawDoc)"
                      class="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 px-2.5 py-1 rounded-md hover:bg-slate-100 ml-auto cursor-pointer"
                    >
                      <Eye class="w-3 h-3" /> Lihat
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Gudang Serah Terima (for Pupuk / Benih) -->
      <div v-if="isPupukPaket" class="flex flex-col gap-4 mt-2">
        <div class="flex items-center gap-2">
          <div class="h-px flex-1 bg-slate-200" />
          <div class="flex items-center gap-1.5">
            <Warehouse class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Gudang Serah Terima</span>
          </div>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
          <div class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
            <span class="text-xs font-semibold text-slate-700">Alamat Gudang</span>
            <p class="text-xs text-slate-800 font-medium p-2 bg-slate-50 rounded border border-slate-100">{{ gudangAlamat }}</p>
          </div>

          <div class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
            <span class="text-xs font-semibold text-slate-700"><MapPin class="w-3 h-3 inline mr-0.5" /> Koordinat</span>
            <p class="text-xs text-slate-800 font-mono font-medium p-2 bg-slate-50 rounded border border-slate-100">{{ gudangKoordinat }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <span class="text-xs font-semibold text-slate-700">Foto Tampak Depan</span>
              <div v-if="fotoDepan" class="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span class="text-xs truncate font-medium text-slate-800">{{ getDocName(fotoDepan) }}</span>
                <button type="button" @click="openPreview(fotoDepan)" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer">
                  <Eye class="w-3.5 h-3.5 inline mr-1" />Lihat
                </button>
              </div>
              <div v-else class="text-xs text-rose-500 italic">Foto belum diunggah</div>
            </div>

            <div class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
              <span class="text-xs font-semibold text-slate-700">Foto Tampak Dalam</span>
              <div v-if="fotoDalam" class="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span class="text-xs truncate font-medium text-slate-800">{{ getDocName(fotoDalam) }}</span>
                <button type="button" @click="openPreview(fotoDalam)" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer">
                  <Eye class="w-3.5 h-3.5 inline mr-1" />Lihat
                </button>
              </div>
              <div v-else class="text-xs text-rose-500 italic">Foto belum diunggah</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RAB Section -->
      <div v-if="rabList.length > 0" class="flex flex-col gap-4 mt-2">
        <div class="flex items-center gap-2">
          <div class="h-px flex-1 bg-slate-200" />
          <div class="flex items-center gap-1.5">
            <FileText class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Rencana Anggaran Biaya (RAB) Final</span>
          </div>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
          <div v-if="docRabSigned" class="flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
            <span class="text-xs font-semibold text-slate-700">Dokumen RAB Bertandatangan</span>
            <div class="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
              <div class="flex items-center gap-2">
                <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
                <span class="text-xs font-medium text-slate-800 truncate">{{ getDocName(docRabSigned) }}</span>
                <span v-if="getDocSizeFormatted(docRabSigned)" class="text-[10px] text-slate-400">{{ getDocSizeFormatted(docRabSigned) }}</span>
              </div>
              <button type="button" @click="openPreview(docRabSigned)" class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer">
                <Eye class="w-3.5 h-3.5 inline mr-1" />Lihat
              </button>
            </div>
          </div>

          <!-- Tabel Rincian RAB Final (Using RabTable like in Kabupaten Verification) -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden w-full max-w-full shadow-xs">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Tabel Rincian RAB Final ({{ rabList.length }} item)</span>
            </div>
            <div class="p-4 w-full max-w-full overflow-hidden">
              <RabTable :items="rabList" :readonly="true" :paket="selectedPaketId" />
              <div v-if="rabList.length > 0" class="flex justify-end items-center gap-3 mt-3 pt-3 border-t border-slate-200">
                <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Anggaran RAB Final</span>
                <span class="text-sm font-bold font-mono text-[#066C2A]">Rp {{ rabTotal.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Optional Bottom Action Button (e.g. for Provinsi step wizard) -->
      <div v-if="showNextButton" class="flex items-center justify-between pt-2">
        <div class="flex-1" />
        <button
          type="button"
          @click="handleNext"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
        >
          {{ nextButtonText }}
          <span class="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>

    <!-- Pekebun Preview Modal -->
    <PratinjauPekebunModal
      :is-open="isPekebunModalOpen"
      :pekebun="selectedPekebunItem?.rawPekebun"
      :lahans="selectedPekebunItem?.lahans"
      :proposal-id="effectiveId"
      @close="isPekebunModalOpen = false"
    />

    <!-- Document Preview Modal (Proposal documents, Gudang, RAB) -->
    <DocumentPreviewModal
      :isOpen="showPreview"
      :title="previewDoc?.title || ''"
      :dataUrl="previewDoc?.dataUrl || ''"
      :mimeType="previewDoc?.mimeType || ''"
      @close="showPreview = false"
    />
  </div>
</template>