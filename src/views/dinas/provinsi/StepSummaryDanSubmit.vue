<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle2, XCircle, ArrowLeft, Send, FileText, Warehouse, Camera, Users, ClipboardCheck, Loader2, Eye } from 'lucide-vue-next';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiProvinsiDraftStore, PROPOSAL_ALIAS_MAP } from '@/stores/verifikasiProvinsiDraft';
import { useVerifikasiProvinsiStore } from '@/stores/verifikasiProvinsi';
import { useToast } from '@/composables/useToast';
import { PAKET_OPTIONS, PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { resolveProposalRequirements } from '@/lib/dynamicRequirements';
import { JenisSarpras } from '@/types/pengusulan';
import type { DokumenUpload, DokumenPersyaratan } from '@/types/pengusulan';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import RabTable from '@/components/pengusulan/RabTable.vue';
import { extractFileObject } from '@/services/proposal.service';
import { LOCALIZATION } from '@/config/localization';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const verifikasiStore = useVerifikasiProvinsiDraftStore();
const verifikasiProvinsiStore = useVerifikasiProvinsiStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)) || null;
});

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
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

const masterStore = useMasterSarprasStore();
const selectedPaketInfo = computed(() => PAKET_OPTIONS.find((p) => p.id === pengajuan.value?.jenisSarpras));

onMounted(() => {
  const pId = pengajuan.value?.jenisSarpras || (pengajuan.value as any)?.paket_sarpras;
  if (pId && masterStore.fetchPersyaratan) {
    masterStore.fetchPersyaratan(pId).catch(() => {});
  }
});

const dynamicResolvedRequirements = computed(() => {
  const pId = pengajuan.value?.jenisSarpras;
  if (!pId) return [];
  const masterList = masterStore.persyaratanMap[pId];
  const proposalDocs = (pengajuan.value as any)?.documents || (pengajuan.value as any)?.dokumen || [];
  return resolveProposalRequirements(pId, proposalDocs, masterList, true);
});

const currentPersyaratan = computed(() => {
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
    reqs = (pengajuan.value?.jenisSarpras ? (PAKET_PERSYARATAN_CONFIG[pengajuan.value.jenisSarpras] ?? []) : []).map((p) => ({ ...p }));
  }
  return reqs.filter(
    (p) =>
      !p.id
        .toUpperCase()
        .replace(/[-_\s]/g, '')
        .includes('RAB'),
  );
});

const isPupukPaket = computed(() => pengajuan.value?.jenisSarpras === JenisSarpras.EKSTENSIFIKASI || pengajuan.value?.jenisSarpras === JenisSarpras.INTENSIFIKASI);

const { getVerification } = verifikasiStore;

function getStatusBadge(key: string) {
  const v = getVerification(key);
  return v.status;
}

function getKabupatenStatusBadge(key: string): string {
  if (typeof (verifikasiStore as any).getKabupatenVerification === 'function') {
    const v = (verifikasiStore as any).getKabupatenVerification(key);
    if (v && v.status !== 'PENDING') return v.status;
  }
  const v = verifikasiStore.getVerification(key);
  if (v && v.status !== 'PENDING') return v.status;

  const aliases = PROPOSAL_ALIAS_MAP[key] || [];
  for (const a of aliases) {
    const vAlias = verifikasiStore.getVerification(a);
    if (vAlias && vAlias.status !== 'PENDING') return vAlias.status;
  }
  return 'PENDING';
}

function getDokumen(persyaratanId: string): DokumenPersyaratan | DokumenUpload | undefined {
  if (!pengajuan.value) return undefined;

  const aliases: Record<string, string[]> = {
    BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI', 'BERITA-ACARA-DOKUMEN'],
    BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN', 'BERITA-ACARA-LAPANGAN'],
    SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
    SURAT_PENGANTAR_SK_CPCL: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV', 'SURAT_PENGANTAR_PROVINSI'],
    SURAT_PENGANTAR: ['SURAT_PENGANTAR_SK_CPCL', 'SURAT_PENGANTAR', 'SURAT-PENGANTAR-SK-CPCL', 'SURAT-PENGANTAR', 'SURAT_PENGANTAR_PROV', 'SURAT_PENGANTAR_PROVINSI'],
    REKOMTEK: ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'],
    LEGALITAS_KP: ['LEGALITAS_KP', 'DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KELEMBAGAAN', 'LEGALITAS-KP'],
    SIMLUHTAN: ['SIMLUHTAN', 'SURAT_PERMOHONAN', 'SURAT-PERMOHONAN'],
    SURAT_PERMOHONAN: ['SURAT_PERMOHONAN', 'SIMLUHTAN'],
    GAMBAR_LAHAN: ['GAMBAR_LAHAN', 'PETA_LAHAN', 'PETA-LAHAN', 'PETA_POLIGON'],
    PERNYATAAN_LUAS: ['PERNYATAAN_LUAS', 'SURAT_PERNYATAAN_LUAS'],
    PERNYATAAN_TANPA_BAKAR: ['PERNYATAAN_TANPA_BAKAR', 'SURAT_PERNYATAAN_TANPA_BAKAR'],
    RAB_FINAL: ['RAB_FINAL', 'RAB-FINAL', 'RAB_DISETUJUI', 'RAB_KAB_SIGNED', 'RAB_SIGNED', 'RAB'],
  };

  const allowed = (aliases[persyaratanId.toUpperCase()] || [persyaratanId.toUpperCase()]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));

  // 1. Check API documents array
  if (pengajuan.value.documents && Array.isArray(pengajuan.value.documents)) {
    const docFromApi = pengajuan.value.documents.find((d: any) => {
      const dt = (d.document_type || '').toUpperCase().replace(/[-_]/g, '');
      if (!dt) return false;
      return allowed.includes(dt);
    });
    if (docFromApi) {
      return {
        id: docFromApi.id,
        persyaratanId: persyaratanId.toLowerCase().replace(/_/g, '-'),
        namaFile: docFromApi.file_name,
        mimeType: docFromApi.mime_type || 'application/pdf',
        ukuranBytes: typeof docFromApi.file_size === 'number' ? docFromApi.file_size : parseInt(docFromApi.file_size || '0', 10),
        dataUrl: docFromApi.file_url || '/templates/spek-teknis.pdf',
        uploadedAt: docFromApi.created_at || new Date().toISOString(),
        uploadedBy: docFromApi.updated_by_name || docFromApi.created_by_name || docFromApi.uploadedBy || '',
        uploaded_at_formatted: formatUploadedAt(docFromApi.uploaded_at_formatted || docFromApi.uploadedAtFormatted, docFromApi.updated_at || docFromApi.created_at),
        uploadedAtFormatted: formatUploadedAt(docFromApi.uploaded_at_formatted || docFromApi.uploadedAtFormatted, docFromApi.updated_at || docFromApi.created_at),
      };
    }
  }

  // 2. Check legacy dokumen array
  if (pengajuan.value.dokumen && Array.isArray(pengajuan.value.dokumen)) {
    const doc = pengajuan.value.dokumen.find((d) => {
      if (!d || !d.tipeDokumen) return false;
      const dt = d.tipeDokumen.toUpperCase().replace(/[-_]/g, '');
      return allowed.includes(dt);
    });
    if (doc) {
      return {
        ...doc,
        uploaded_at_formatted: formatUploadedAt((doc as any).uploaded_at_formatted || (doc as any).uploadedAtFormatted, (doc as any).updated_at || (doc as any).created_at || (doc as any).uploadedAt),
        uploadedAtFormatted: formatUploadedAt((doc as any).uploaded_at_formatted || (doc as any).uploadedAtFormatted, (doc as any).updated_at || (doc as any).created_at || (doc as any).uploadedAt),
      };
    }
  }

  return undefined;
}

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

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
    title = doc.fileName || doc.namaFile || doc.file_name || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mimeType || doc.mime_type);
  } else if ('file_url' in doc && doc.file_url) {
    dataUrl = doc.file_url;
    title = doc.file_name || doc.namaFile || doc.fileName || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mime_type || doc.mimeType);
  } else if ('dataUrl' in doc && doc.dataUrl) {
    dataUrl = doc.dataUrl;
    title = doc.namaFile || doc.fileName || doc.file_name || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mimeType || doc.mime_type);
  } else if ('urlFile' in doc && doc.urlFile) {
    dataUrl = doc.urlFile;
    title = doc.namaFile || doc.fileName || doc.file_name || 'Dokumen';
    mimeType = detectMimeType(dataUrl, title, doc.mimeType || doc.mime_type);
  }

  if (dataUrl) {
    previewDoc.value = { dataUrl, mimeType, title };
    showPreview.value = true;
  }
}

// ─── RAB (rab_final) Integration ──────────────────────────────────────────────
const showRabDetail = ref(false);

const effectiveRabFinal = computed(() => {
  const p = pengajuan.value as any;
  if (!p) return null;
  if (p.rab_final) return p.rab_final;
  if (p.rabFinal) return p.rabFinal;
  if (Array.isArray(p.rabs)) {
    return p.rabs.find((r: any) => String(r.flag).toUpperCase() === 'FINAL') || null;
  }
  return null;
});

const effectiveRabItems = computed<any[]>(() => {
  const p = pengajuan.value as any;
  if (!p) return [];
  if (Array.isArray(p.rab_final?.items) && p.rab_final.items.length > 0) {
    return p.rab_final.items;
  }
  if (Array.isArray(p.rabFinalItems) && p.rabFinalItems.length > 0) {
    return p.rabFinalItems;
  }
  if (Array.isArray(p.rabs)) {
    const finalRab = p.rabs.find((r: any) => String(r.flag).toUpperCase() === 'FINAL');
    if (finalRab?.items && Array.isArray(finalRab.items) && finalRab.items.length > 0) {
      return finalRab.items;
    }
  }
  if (Array.isArray(p.rabItems) && p.rabItems.length > 0) {
    return p.rabItems;
  }
  if (Array.isArray(p.rabProposalItems) && p.rabProposalItems.length > 0) {
    return p.rabProposalItems;
  }
  if (Array.isArray(p.rab_proposal?.items) && p.rab_proposal.items.length > 0) {
    return p.rab_proposal.items;
  }
  return [];
});

const rabFinalTotal = computed(() => {
  if (effectiveRabItems.value.length > 0) {
    return effectiveRabItems.value.reduce((sum: number, it: any) => sum + (Number(it.total_price ?? it.subTotal ?? it.sub_total ?? 0) || 0), 0);
  }
  return pengajuan.value?.total_anggaran || pengajuan.value?.totalAnggaranPengajuan || 0;
});

const rabFinalDoc = computed(() => {
  const doc = getDokumen('RAB_FINAL');
  if (doc) return doc;
  if ((pengajuan.value as any)?.rabDitandatangani) return (pengajuan.value as any).rabDitandatangani;
  return null;
});

const hasRabData = computed(() => {
  return !!effectiveRabFinal.value || effectiveRabItems.value.length > 0 || !!rabFinalDoc.value || !!(pengajuan.value as any)?.rabItems?.length;
});

// ─── Foto Udara from lahans => documents (FOTO_UDARA) ──────────────────────────
const fotoUdaraList = computed(() => {
  const p = pengajuan.value as any;
  if (!p) return [];

  const results: Array<{
    id: string | number;
    pekebunName?: string;
    namaFile: string;
    fileUrl: string;
    dataUrl: string;
    mimeType: string;
    uploadedBy?: string;
    uploadedAtFormatted?: string;
    ukuranBytes?: number;
  }> = [];

  const seenDocIds = new Set<string | number>();

  const processLahans = (lahans: any[], defaultPekebunName?: string) => {
    lahans.forEach((lahan: any, lIdx: number) => {
      const docs = lahan.documents || lahan.dokumen || lahan.dokumen_lahan || [];
      const pkName = lahan.namaPekebun || lahan.nama_pekebun || defaultPekebunName || `Bidang Lahan #${lIdx + 1}`;

      docs.forEach((d: any) => {
        const dt = (d.document_type || d.documentType || d.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
        if (dt === 'FOTOUDARA' || dt.includes('FOTOUDARA')) {
          const docId = d.id || `lahan-${lahan.id || lIdx}-${d.file_name || 'foto'}`;
          if (seenDocIds.has(docId)) return;
          seenDocIds.add(docId);

          const url = d.file_url || d.fileUrl || d.urlFile || d.dataUrl || '';
          const name = d.file_name || d.fileName || d.namaFile || `Foto_Udara_Lahan_${lIdx + 1}.jpg`;
          results.push({
            id: docId,
            pekebunName: pkName,
            namaFile: name,
            fileUrl: url,
            dataUrl: url,
            mimeType: d.mime_type || d.mimeType || detectMimeType(url, name, 'image/jpeg'),
            ukuranBytes: Number(d.file_size || d.fileSize || d.ukuranBytes || 0),
            uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
            uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at || d.uploadedAt),
          });
        }
      });
    });
  };

  // 1. Check direct lahans array
  if (Array.isArray(p.lahans) && p.lahans.length > 0) {
    processLahans(p.lahans);
  }

  // 2. Check pekebuns array
  if (Array.isArray(p.pekebuns) && p.pekebuns.length > 0) {
    p.pekebuns.forEach((pk: any) => {
      const pkName = pk.name || pk.nama || pk.namaPekebun;
      if (Array.isArray(pk.lahans) && pk.lahans.length > 0) {
        processLahans(pk.lahans, pkName);
      } else if (pk.lahan) {
        processLahans([pk.lahan], pkName);
      }
    });
  }

  // 3. Fallback to verifikasiStore.fotoUdaraPerPekebun
  if (results.length === 0 && verifikasiStore.fotoUdaraPerPekebun) {
    Object.entries(verifikasiStore.fotoUdaraPerPekebun).forEach(([cpclId, doc]) => {
      if (doc) {
        results.push({
          id: cpclId,
          pekebunName: `Pekebun #${cpclId}`,
          namaFile: doc.namaFile,
          fileUrl: doc.dataUrl || (doc as any).fileUrl || (doc as any).urlFile || '',
          dataUrl: doc.dataUrl || (doc as any).fileUrl || (doc as any).urlFile || '',
          mimeType: doc.mimeType || 'image/jpeg',
          ukuranBytes: doc.ukuranBytes || 0,
        });
      }
    });
  }

  return results;
});

const fotoUdaraCount = computed(() => fotoUdaraList.value.length);

const hasRejection = computed(() => Object.values(verifikasiStore.verifications).some((v) => v.status === 'REJECTED'));

function buildProposalValidationPayloads() {
  const payloads: any[] = [];
  const pengajuanIdNum = Number(String(id).replace(/[^\d]/g, '')) || 0;
  const docs = pengajuan.value?.documents || pengajuan.value?.dokumen || [];

  const aliases: Record<string, string[]> = {
    BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA'],
    BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
    SK_CPCL: ['SK_CPCL', 'SK-CPCL'],
  };

  const checkDoc = (type: string, key: string) => {
    const allowed = aliases[type.toUpperCase()] || [type.toUpperCase()];
    const d = docs.find((doc: any) => {
      const dt = (doc.document_type || doc.tipeDokumen || '').toUpperCase();
      return allowed.includes(dt);
    });
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

  checkDoc('BA_VERIFIKASI', 'baVerifikasiDoc');
  checkDoc('BA_VERIFIKASI_LAPANGAN', 'baVerifikasiLapanganDoc');
  checkDoc('SK_CPCL', 'skCpclDoc');

  return payloads;
}

function handleKembalikanRevisi() {
  const rejWithoutNotes = Object.values(verifikasiStore.verifications).some((v) => v.status === 'REJECTED' && !v.notes.trim());
  if (rejWithoutNotes) {
    toast.error('Harap berikan catatan alasan penolakan pada item yang ditolak.');
    return;
  }
  confirmActionType.value = 'reject';
  confirmDestination.value = 'Dinas Kabupaten/Kota (Revisi)';
  confirmNotes.value = Object.entries(verifikasiStore.verifications)
    .filter(([, v]) => v.status === 'REJECTED')
    .map(([k, v]) => `[${k}]: ${v.notes}`)
    .join('\n');
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const validationsPayload = buildProposalValidationPayloads();
      await verifikasiProvinsiStore.sendBackForRevision(pengajuan.value!.id, validationsPayload, confirmNotes.value);
      toast.warning('Proposal dikembalikan ke Dinas Kabupaten untuk perbaikan berkas.');
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

const existingSuratPengantar = computed<DokumenUpload | null>(() => {
  const d = getDokumen('SURAT_PENGANTAR_SK_CPCL') || getDokumen('SURAT_PENGANTAR');
  return d ? (d as DokumenUpload) : null;
});

const suratPengantarDoc = computed<DokumenUpload | null>(() => {
  if (verifikasiStore.skCpcl) return verifikasiStore.skCpcl;
  return existingSuratPengantar.value;
});

const baVerifikasiDoc = computed<DokumenUpload | null>(() => {
  const d = getDokumen('BA_VERIFIKASI');
  return d ? (d as DokumenUpload) : null;
});

const baVerifikasiLapanganDoc = computed<DokumenUpload | null>(() => {
  const d = getDokumen('BA_VERIFIKASI_LAPANGAN');
  return d ? (d as DokumenUpload) : null;
});

const skCpclDoc = computed<DokumenUpload | null>(() => {
  const d = getDokumen('SK_CPCL');
  return d ? (d as DokumenUpload) : null;
});

function fileToUpload(file: File): Promise<DokumenUpload> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: undefined,
        persyaratanId: 'surat-pengantar-sk-cpcl',
        namaFile: file.name,
        mimeType: file.type || 'application/pdf',
        ukuranBytes: file.size,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
        file: file,
      });
    };
    reader.readAsDataURL(file);
  });
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const doc = await fileToUpload(file);
    verifikasiStore.skCpcl = doc;
    toast.success('Dokumen Surat Pengantar SK CPCL berhasil diubah.');
  }
}

function handleAjukanKeDitjenbun() {
  if (!pengajuan.value) return;

  const noSurat = (verifikasiStore.noSuratProvinsi || pengajuan.value?.no_surat_provinsi || '').trim();
  const tglSurat = (verifikasiStore.tglSuratProvinsi || pengajuan.value?.tgl_surat_provinsi || '').trim();
  const namaDinas = (verifikasiStore.namaDinasProvinsi || pengajuan.value?.nama_dinas_provinsi || pengajuan.value?.nama_dinas_kabupaten || '').trim();

  if (!noSurat || !tglSurat || !namaDinas || !suratPengantarDoc.value) {
    toast.error('Nomor Surat, Tanggal Surat, Nomenklatur Nama Dinas, dan Berkas PDF SK CPCL Provinsi wajib dilengkapi sebelum diajukan ke Ditjenbun.');
    return;
  }

  confirmActionType.value = 'approve';
  confirmDestination.value = 'Ditjenbun';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const validationsPayload = buildProposalValidationPayloads();

      let docAction: 'create' | 'update' | 'none' = 'none';
      let documentIdToUpdate: number | string | undefined = undefined;
      const documentsToUpload: any[] = [];

      const fileObj = verifikasiStore.skCpcl ? extractFileObject(verifikasiStore.skCpcl) : null;
      const hasNewFile = !!fileObj;
      const existingDoc = existingSuratPengantar.value;
      const hadExistingDoc = !!existingDoc;

      if (hasNewFile && fileObj) {
        documentsToUpload.push({
          ...verifikasiStore.skCpcl,
          document_type: 'SURAT_PENGANTAR_SK_CPCL',
          file: fileObj,
        });

        if (hadExistingDoc && existingDoc.id) {
          docAction = 'update'; // User changed the existing document -> PUT /proposals/{proposal_id}/documents/{id}
          documentIdToUpdate = existingDoc.id;
        } else {
          docAction = 'create'; // User uploaded for the first time -> POST /proposals/{proposal_id}/documents/bulk
        }
      } else {
        docAction = 'none'; // Document not changed/uploaded -> do not call upload/sync
      }

      await verifikasiProvinsiStore.submitToDitjenbun(
        pengajuan.value!.id,
        validationsPayload,
        documentsToUpload,
        docAction,
        documentIdToUpdate,
        {
          no_surat_provinsi: noSurat,
          tgl_surat_provinsi: tglSurat,
          nama_dinas_provinsi: namaDinas,
        },
      );

      verifikasiProvinsiStore.verifications = { ...verifikasiStore.verifications };
      verifikasiProvinsiStore.skCpcl = verifikasiStore.skCpcl;
      verifikasiProvinsiStore.fotoLayoutUdara = verifikasiStore.fotoLayoutUdara;
      verifikasiProvinsiStore.fotoUdaraPerPekebun = { ...verifikasiStore.fotoUdaraPerPekebun };

      toast.success('Berkas berhasil diajukan ke Ditjenbun!', 'Pengajuan Berhasil');
      verifikasiStore.resetDraft();
      showConfirmModal.value = false;
      router.push('/dinas/verifikasi/provinsi');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mengajukan ke Ditjenbun.');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-slate-900">Ringkasan Verifikasi</h2>
      <p class="text-xs text-slate-500">Tinjau kembali hasil verifikasi sebelum mengajukan ke Ditjenbun.</p>
    </div>

    <!-- Package Info -->
    <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-3xl leading-none">{{ selectedPaketInfo?.icon || '📦' }}</span>
        <div class="flex flex-col">
          <span class="text-xs text-slate-500 font-medium">Jenis Paket</span>
          <span class="text-sm font-bold text-slate-800">{{ selectedPaketInfo?.label || 'Paket Tidak Ditemukan' }}</span>
        </div>
      </div>

      <!-- Foto Udara (Kabupaten) -->
      <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
        <div class="flex items-center gap-2">
          <Camera class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs text-slate-600">Foto Udara (Kabupaten) — {{ fotoUdaraCount }} berkas</span>
        </div>
        <div class="flex items-center gap-2">
          <span v-if="fotoUdaraCount > 0" class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Tersedia ({{ fotoUdaraCount }})</span>
          <span v-else class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Belum Ada</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Document Verification Summary -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <ClipboardCheck class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 1: Verifikasi Dokumen & Input</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
        <!-- Documents -->
        <div v-for="p in currentPersyaratan" :key="p.id" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-700">{{ p.nama }}</span>
            <span v-if="p.wajib" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">Wajib</span>
            <span v-else class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Opsional</span>
          </div>
          <div class="flex items-center gap-2">
            <button v-if="getDokumen(p.id)" type="button" @click="openPreview(getDokumen(p.id))" class="text-[#066C2A] hover:text-emerald-800"><Eye class="w-3.5 h-3.5" /></button>
            <template v-if="getKabupatenStatusBadge(p.id) === 'APPROVED'">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
            </template>
            <template v-else-if="getKabupatenStatusBadge(p.id) === 'REJECTED'">
              <XCircle class="w-4 h-4 text-rose-600" />
              <span class="text-xs font-semibold text-rose-700">Ditolak</span>
            </template>
            <template v-else>
              <span class="text-xs text-slate-400 italic">Belum diverifikasi</span>
            </template>
          </div>
        </div>

        <!-- Gudang (if pupuk) -->
        <template v-if="isPupukPaket">
          <div class="flex items-center gap-2">
            <Warehouse class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-semibold text-slate-700">Gudang Serah Terima</span>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <span class="text-xs text-slate-600">Alamat & Koordinat</span>
            <div class="flex items-center gap-2">
              <template v-if="getKabupatenStatusBadge('gudangAlamat') === 'APPROVED'">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
              </template>
              <template v-else-if="getKabupatenStatusBadge('gudangAlamat') === 'REJECTED'">
                <XCircle class="w-4 h-4 text-rose-600" />
                <span class="text-xs font-semibold text-rose-700">Ditolak</span>
              </template>
              <template v-else>
                <span class="text-xs text-slate-400 italic">Belum</span>
              </template>
            </div>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <span class="text-xs text-slate-600">Foto Tampak Depan</span>
            <div class="flex items-center gap-2">
              <button
                v-if="pengajuan?.storage_area?.fotoTampakDepan || pengajuan?.gudangSerahTerima?.fotoTampakDepan"
                type="button"
                @click="openPreview((pengajuan?.storage_area?.fotoTampakDepan || pengajuan?.gudangSerahTerima?.fotoTampakDepan)!)"
                class="text-[#066C2A] hover:text-emerald-800"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <template v-if="getKabupatenStatusBadge('fotoTampakDepan') === 'APPROVED'">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
              </template>
              <template v-else-if="getKabupatenStatusBadge('fotoTampakDepan') === 'REJECTED'">
                <XCircle class="w-4 h-4 text-rose-600" />
                <span class="text-xs font-semibold text-rose-700">Ditolak</span>
              </template>
              <template v-else>
                <span class="text-xs text-slate-400 italic">Belum</span>
              </template>
            </div>
          </div>
          <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <span class="text-xs text-slate-600">Foto Tampak Dalam</span>
            <div class="flex items-center gap-2">
              <button
                v-if="pengajuan?.storage_area?.fotoTampakDalam || pengajuan?.gudangSerahTerima?.fotoTampakDalam"
                type="button"
                @click="openPreview((pengajuan?.storage_area?.fotoTampakDalam || pengajuan?.gudangSerahTerima?.fotoTampakDalam)!)"
                class="text-[#066C2A] hover:text-emerald-800"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <template v-if="getKabupatenStatusBadge('fotoTampakDalam') === 'APPROVED'">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
              </template>
              <template v-else-if="getKabupatenStatusBadge('fotoTampakDalam') === 'REJECTED'">
                <XCircle class="w-4 h-4 text-rose-600" />
                <span class="text-xs font-semibold text-rose-700">Ditolak</span>
              </template>
              <template v-else>
                <span class="text-xs text-slate-400 italic">Belum</span>
              </template>
            </div>
          </div>
        </template>

        <!-- RAB Section (RAB Final) -->
        <template v-if="hasRabData">
          <div class="flex items-center gap-2">
            <FileText class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-semibold text-slate-700">Rencana Anggaran Biaya (RAB) Final</span>
          </div>

          <!-- Dokumen RAB Bertandatangan / RAB Final -->
          <div v-if="rabFinalDoc" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <div class="flex flex-col min-w-0 pr-2">
              <span class="text-xs text-slate-600 font-medium truncate">Dokumen RAB Final (Bertandatangan)</span>
              <span v-if="rabFinalDoc.namaFile" class="text-[11px] text-slate-500 truncate">{{ rabFinalDoc.namaFile }}</span>
              <span v-if="rabFinalDoc.uploadedBy" class="text-[10px] text-slate-400">
                Diunggah oleh {{ rabFinalDoc.uploadedBy }}<span v-if="rabFinalDoc.uploaded_at_formatted || rabFinalDoc.uploadedAtFormatted"> &bull; {{ rabFinalDoc.uploaded_at_formatted || rabFinalDoc.uploadedAtFormatted }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" @click="openPreview(rabFinalDoc)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau"><Eye class="w-3.5 h-3.5" /></button>
              <template v-if="getKabupatenStatusBadge('RAB_FINAL') === 'APPROVED' || getKabupatenStatusBadge('rabDocument') === 'APPROVED'">
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
              </template>
              <template v-else-if="getKabupatenStatusBadge('RAB_FINAL') === 'REJECTED' || getKabupatenStatusBadge('rabDocument') === 'REJECTED'">
                <XCircle class="w-4 h-4 text-rose-600" />
                <span class="text-xs font-semibold text-rose-700">Ditolak</span>
              </template>
              <template v-else>
                <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                <span class="text-xs font-semibold text-emerald-700">Tersedia</span>
              </template>
            </div>
          </div>

          <!-- Rincian RAB (rab_final) -->
          <div class="flex flex-col p-2.5 bg-white rounded-lg border border-slate-200 gap-2">
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs text-slate-700 font-semibold">Rincian RAB (rab_final)</span>
                <span v-if="effectiveRabItems.length > 0" class="text-[11px] text-slate-500">
                  {{ effectiveRabItems.length }} item rincian anggaran &bull; <strong class="text-emerald-700">Rp {{ rabFinalTotal.toLocaleString('id-ID') }}</strong>
                </span>
                <span v-else-if="rabFinalTotal > 0" class="text-[11px] text-slate-500">
                  Total anggaran: <strong class="text-emerald-700">Rp {{ rabFinalTotal.toLocaleString('id-ID') }}</strong>
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="effectiveRabItems.length > 0"
                  type="button"
                  @click="showRabDetail = !showRabDetail"
                  class="text-xs text-[#066C2A] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye class="w-3.5 h-3.5" />
                  {{ showRabDetail ? 'Tutup Tabel' : 'Lihat Rincian' }}
                </button>
                <template v-if="getKabupatenStatusBadge('rabItems') === 'APPROVED' || getKabupatenStatusBadge('RAB_FINAL') === 'APPROVED'">
                  <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                  <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
                </template>
                <template v-else-if="getKabupatenStatusBadge('rabItems') === 'REJECTED' || getKabupatenStatusBadge('RAB_FINAL') === 'REJECTED'">
                  <XCircle class="w-4 h-4 text-rose-600" />
                  <span class="text-xs font-semibold text-rose-700">Ditolak</span>
                </template>
                <template v-else>
                  <CheckCircle2 class="w-4 h-4 text-emerald-600" />
                  <span class="text-xs font-semibold text-emerald-700">Sesuai</span>
                </template>
              </div>
            </div>

            <!-- Expandable Table for Rincian RAB Final -->
            <div v-if="showRabDetail && effectiveRabItems.length > 0" class="mt-2 pt-2 border-t border-slate-100 overflow-x-auto">
              <RabTable :items="effectiveRabItems" :readonly="true" :paket="pengajuan?.jenisSarpras" />
              <div class="flex justify-end items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Anggaran RAB Final:</span>
                <span class="text-sm font-bold font-mono text-[#066C2A]">Rp {{ rabFinalTotal.toLocaleString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Foto Udara (Kabupaten) -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <Camera class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-semibold text-slate-700">Foto Udara (Kabupaten) — {{ fotoUdaraList.length }} berkas</span>
          </div>
          <div v-for="item in fotoUdaraList" :key="item.id" class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
            <div class="flex flex-col min-w-0 pr-2">
              <span class="text-xs font-medium text-slate-700 truncate">{{ item.namaFile }}</span>
              <span v-if="item.pekebunName" class="text-[10px] text-slate-500">Pekebun: {{ item.pekebunName }}</span>
              <span v-if="item.uploadedBy" class="text-[10px] text-slate-400">
                Diunggah oleh {{ item.uploadedBy }}<span v-if="item.uploadedAtFormatted"> &bull; {{ item.uploadedAtFormatted }}</span>
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" @click="openPreview(item)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau Foto Udara"><Eye class="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div v-if="fotoUdaraList.length === 0" class="text-xs text-rose-500 italic p-2.5 bg-white rounded-lg border border-slate-200">Belum ada foto udara</div>
        </div>
      </div>
    </div>

    <!-- Step 2: SK CPCL & BA Summary -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Step 2: Asistensi Dokumen Verifikasi & SK CPCL</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3">
        <!-- Berita Acara Verifikasi Dokumen -->
        <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="flex flex-col">
            <span class="text-xs text-slate-600">Berita Acara Verifikasi Dokumen (Kabupaten)</span>
            <span v-if="baVerifikasiDoc?.uploadedBy" class="text-[10px] text-slate-500"
              >Diunggah oleh {{ baVerifikasiDoc.uploadedBy }}<span v-if="baVerifikasiDoc.uploadedAtFormatted"> &bull; {{ baVerifikasiDoc.uploadedAtFormatted }}</span></span
            >
          </div>
          <div class="flex items-center gap-2">
            <button v-if="baVerifikasiDoc" type="button" @click="openPreview(baVerifikasiDoc)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau">
              <Eye class="w-3.5 h-3.5" />
            </button>
            <template v-if="getStatusBadge('baVerifikasiDoc') === 'APPROVED'">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
            </template>
            <template v-else-if="getStatusBadge('baVerifikasiDoc') === 'REJECTED'">
              <XCircle class="w-4 h-4 text-rose-600" />
              <span class="text-xs font-semibold text-rose-700">Ditolak</span>
            </template>
            <template v-else>
              <span class="text-xs text-slate-400 italic">Belum diverifikasi</span>
            </template>
          </div>
        </div>

        <!-- Berita Acara Verifikasi Lapangan -->
        <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="flex flex-col">
            <span class="text-xs text-slate-600">Berita Acara Verifikasi Lapangan (Kabupaten)</span>
            <span v-if="baVerifikasiLapanganDoc?.uploadedBy" class="text-[10px] text-slate-500"
              >Diunggah oleh {{ baVerifikasiLapanganDoc.uploadedBy }}<span v-if="baVerifikasiLapanganDoc.uploadedAtFormatted"> &bull; {{ baVerifikasiLapanganDoc.uploadedAtFormatted }}</span></span
            >
          </div>
          <div class="flex items-center gap-2">
            <button v-if="baVerifikasiLapanganDoc" type="button" @click="openPreview(baVerifikasiLapanganDoc)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau">
              <Eye class="w-3.5 h-3.5" />
            </button>
            <template v-if="getStatusBadge('baVerifikasiLapanganDoc') === 'APPROVED'">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
            </template>
            <template v-else-if="getStatusBadge('baVerifikasiLapanganDoc') === 'REJECTED'">
              <XCircle class="w-4 h-4 text-rose-600" />
              <span class="text-xs font-semibold text-rose-700">Ditolak</span>
            </template>
            <template v-else>
              <span class="text-xs text-slate-400 italic">Belum diverifikasi</span>
            </template>
          </div>
        </div>

        <!-- SK CPCL Kabupaten -->
        <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="flex flex-col">
            <span class="text-xs text-slate-600">SK CPCL (Kabupaten)</span>
            <span v-if="skCpclDoc?.uploadedBy" class="text-[10px] text-slate-500"
              >Diunggah oleh {{ skCpclDoc.uploadedBy }}<span v-if="skCpclDoc.uploadedAtFormatted"> &bull; {{ skCpclDoc.uploadedAtFormatted }}</span></span
            >
          </div>
          <div class="flex items-center gap-2">
            <button v-if="skCpclDoc" type="button" @click="openPreview(skCpclDoc)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau">
              <Eye class="w-3.5 h-3.5" />
            </button>
            <template v-if="getStatusBadge('skCpclDoc') === 'APPROVED'">
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span class="text-xs font-semibold text-emerald-700">Disetujui</span>
            </template>
            <template v-else-if="getStatusBadge('skCpclDoc') === 'REJECTED'">
              <XCircle class="w-4 h-4 text-rose-600" />
              <span class="text-xs font-semibold text-rose-700">Ditolak</span>
            </template>
            <template v-else>
              <span class="text-xs text-slate-400 italic">Belum diverifikasi</span>
            </template>
          </div>
        </div>

        <!-- Surat Pengantar SK CPCL Provinsi -->
        <div class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
          <div class="flex flex-col">
            <span class="text-xs text-slate-600">Dokumen Surat Pengantar SK CPCL (Provinsi)</span>
            <span v-if="suratPengantarDoc?.uploadedBy" class="text-[10px] text-slate-500"
              >Diunggah oleh {{ suratPengantarDoc.uploadedBy }}<span v-if="suratPengantarDoc.uploadedAtFormatted"> &bull; {{ suratPengantarDoc.uploadedAtFormatted }}</span></span
            >
          </div>
          <div class="flex items-center gap-2">
            <template v-if="suratPengantarDoc">
              <button type="button" @click="openPreview(suratPengantarDoc)" class="text-[#066C2A] hover:text-emerald-800" title="Pratinjau">
                <Eye class="w-3.5 h-3.5" />
              </button>
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span class="text-xs font-semibold text-emerald-700">{{ suratPengantarDoc.namaFile }}</span>
              <label class="cursor-pointer ml-1">
                <span class="flex items-center gap-1 text-[11px] text-[#066C2A] font-semibold hover:bg-emerald-100 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 transition-colors"> Ubah Berkas </span>
                <input type="file" accept=".pdf" class="hidden" @change="handleFileChange" />
              </label>
            </template>
            <template v-else>
              <span class="text-xs text-rose-500 italic">Belum diunggah</span>
              <label class="cursor-pointer ml-1">
                <span class="flex items-center gap-1 text-[11px] text-[#066C2A] font-semibold hover:bg-emerald-100 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 transition-colors"> Unggah Berkas </span>
                <input type="file" accept=".pdf" class="hidden" @change="handleFileChange" />
              </label>
            </template>
          </div>
        </div>

        <!-- Rincian Metadata Surat Provinsi -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-medium">Nomor Surat Provinsi</span>
            <span class="text-xs font-bold text-slate-800">{{ verifikasiStore.noSuratProvinsi || pengajuan?.no_surat_provinsi || '-' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-medium">Tanggal Surat Provinsi</span>
            <span class="text-xs font-bold text-slate-800">{{ verifikasiStore.tglSuratProvinsi || pengajuan?.tgl_surat_provinsi || '-' }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-medium">Nomenklatur Nama Dinas</span>
            <span class="text-xs font-bold text-slate-800">{{ verifikasiStore.namaDinasProvinsi || pengajuan?.nama_dinas_provinsi || pengajuan?.nama_dinas_kabupaten || '-' }}</span>
          </div>
        </div>

        <!-- CPCL Data Reference -->
        <div v-if="pengajuan?.daftarCPCL?.length" class="mt-3">
          <div class="flex items-center gap-2 mb-2">
            <Users class="w-3.5 h-3.5 text-slate-500" />
            <span class="text-xs font-semibold text-slate-700">Data CPCL ({{ pengajuan.daftarCPCL.length }} pekebun)</span>
            <span class="text-[10px] text-slate-400">Total: {{ pengajuan.daftarCPCL.reduce((s, c) => s + c.luasLahanHektar, 0).toFixed(1) }} Ha</span>
          </div>
          <div class="overflow-x-auto border border-slate-200 rounded-lg">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-2">No</th>
                  <th class="p-2">Nama</th>
                  <th class="p-2">NIK</th>
                  <th class="p-2">Luas</th>
                  <th class="p-2">Dokumen</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(item, idx) in pengajuan.daftarCPCL" :key="item.id">
                  <td class="p-2 font-mono text-slate-400">{{ idx + 1 }}</td>
                  <td class="p-2 font-bold text-slate-900">{{ item.namaPekebun }}</td>
                  <td class="p-2 font-mono text-xs">{{ item.nik }}</td>
                  <td class="p-2 font-semibold text-[#066C2A]">{{ item.luasLahanHektar }} Ha</td>
                  <td class="p-2 text-xs">{{ item.jenisHakLahan }} {{ item.nomorSuratLahan }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Rejection Notes (if any) -->
    <div v-if="Object.entries(verifikasiStore.verifications).some(([, v]) => v.status === 'REJECTED')" class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <XCircle class="w-4 h-4 text-rose-600" />
        <span class="text-xs font-bold text-rose-800">Catatan Penolakan</span>
      </div>
      <div v-for="(item, key) in verifikasiStore.verifications" :key="key">
        <div v-if="item.status === 'REJECTED'" class="text-xs text-rose-700 p-2 bg-white rounded-lg border border-rose-100">
          <span class="font-semibold">[{{ key }}]</span> {{ item.notes }}
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between pt-2">
      <button type="button" @click="verifikasiStore.currentStep = 3" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
        <ArrowLeft class="w-4 h-4" /> Kembali
      </button>

      <button
        type="button"
        @click="hasRejection ? handleKembalikanRevisi() : handleAjukanKeDitjenbun()"
        :disabled="isSubmitting"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm disabled:opacity-50',
          hasRejection ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20' : 'bg-[#066C2A] text-white hover:bg-emerald-800 shadow-emerald-900/20',
        ]"
      >
        <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
        <template v-else-if="hasRejection">
          <XCircle class="w-4 h-4" />
          {{ LOCALIZATION.verificationAction.returnForRevision }}
        </template>
        <template v-else>
          <Send class="w-4 h-4" />
          Ajukan ke Ditjenbun
        </template>
      </button>
    </div>

    <ApprovalConfirmationModal
      ref="confirmModalRef"
      :is-open="showConfirmModal"
      :action-type="confirmActionType"
      :destination-stage="confirmDestination"
      :notes="confirmNotes"
      @close="showConfirmModal = false"
      @confirm="executePendingAction"
    />
    <DocumentPreviewModal :isOpen="showPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showPreview = false" />
  </div>
</template>
