<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePekebunStore } from '@/stores/pekebun';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import { useToast } from '@/composables/useToast';
import { ArrowLeft, ArrowRight, Check, X, FileText, User, MapPin, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, ZoomIn, ShieldCheck, Sparkles, Layers, Loader2 } from 'lucide-vue-next';
import { TipeDokumenPekebun } from '@/types/pekebun';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import SatelliteMapPreview from '@/components/ui/SatelliteMapPreview.vue';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const pengusulanStore = usePengusulanStore();
const pekebunStore = usePekebunStore();
const verifikasiStore = useVerifikasiKabDraftStore();

const pengajuanId = computed(() => (route.params.id as string) || '');
const cpclId = computed(() => (route.params.cpclId as string) || '');

const pageLoading = ref(false);
const isSecondaryDetailsOpen = ref(false);

onMounted(async () => {
  pageLoading.value = true;
  if (pengajuanId.value) {
    verifikasiStore.initForProposal(String(pengajuanId.value));
  }
  try {
    const proposalIdNum = Number(String(pengajuanId.value).replace(/[^\d]/g, '')) || pengajuanId.value;
    const results = await Promise.allSettled([
      pengusulanStore.getProposalDetail(pengajuanId.value),
      pengusulanStore.getFarmerDocumentValidations({ pengajuan_id: Number(proposalIdNum) }),
      pengusulanStore.getLandDocumentValidations({ pengajuan_id: Number(proposalIdNum) }),
      pekebunStore.fetchPekebunList({ limit: 100 }),
    ]);
    const proposalRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const farmerValidationsRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const landValidationsRes = results[2].status === 'fulfilled' ? results[2].value : null;

    const farmerValidationList = Array.isArray(farmerValidationsRes) ? farmerValidationsRes : (farmerValidationsRes as any)?.data || [];
    const landValidationList = Array.isArray(landValidationsRes) ? landValidationsRes : (landValidationsRes as any)?.data || [];
    const cpcl = pengusulanStore.activePengajuan?.daftarCPCL || (proposalRes as any)?.daftarCPCL || [];
    const pekebuns = (proposalRes as any)?.pekebuns || (proposalRes as any)?.cpcl || cpcl;
    const lahans = (proposalRes as any)?.lahans || (pengusulanStore.activePengajuan as any)?.lahans || [];

    if (farmerValidationList.length > 0) {
      verifikasiStore.syncFarmerDocumentValidations(farmerValidationList, pekebuns, cpcl);
    }
    if (landValidationList.length > 0) {
      verifikasiStore.syncLandDocumentValidations(landValidationList, pekebuns, lahans, cpcl);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pageLoading.value = false;
    if (allDocs.value.length > 0 && !selectedDocId.value) {
      selectedDocId.value = allDocs.value[0].id;
    }
  }
});

watch(
  () => route.params.cpclId,
  (newCpclId) => {
    if (newCpclId) {
      selectedDocId.value = null;
      activeLahanId.value = null;
      if (allDocs.value.length > 0) {
        selectedDocId.value = allDocs.value[0].id;
      }
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  },
);

const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(pengajuanId.value)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(pengajuanId.value));
});

const cpcl = computed(() => pengajuan.value?.daftarCPCL?.find((c) => String(c.id) === String(cpclId.value)));
const pekebun = computed(() => {
  const byNik = pekebunStore.listPekebun.find((p) => p.nik === cpcl.value?.nik);
  if (byNik) return byNik;
  const foundInPengajuan = (pengajuan.value as any)?.pekebuns?.find((p: any) => (cpcl.value?.nik && p.nik === cpcl.value?.nik) || (cpcl.value?.id && String(p.id) === String(cpcl.value?.id)));
  if (foundInPengajuan) return foundInPengajuan;
  return null;
});

const uniquePekebunList = computed(() => {
  const rawList: any[] = pengajuan.value?.daftarCPCL || (pengajuan.value as any)?.pekebuns || [];
  const map = new Map<string, any>();

  for (const item of rawList) {
    const key = (item.nik && String(item.nik).trim()) || (item.namaPekebun && String(item.namaPekebun).trim()) || String(item.id);
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
});

const currentUniqueIndex = computed(() => {
  if (!cpcl.value) return -1;
  const currentKey = (cpcl.value.nik && String(cpcl.value.nik).trim()) || (cpcl.value.namaPekebun && String(cpcl.value.namaPekebun).trim()) || String(cpcl.value.id);
  return uniquePekebunList.value.findIndex((p: any) => {
    const k = (p.nik && String(p.nik).trim()) || (p.namaPekebun && String(p.namaPekebun).trim()) || String(p.id);
    return k === currentKey || String(p.id) === String(cpclId.value);
  });
});

const hasNextPekebun = computed(() => {
  // Jika hanya ada 1 pekebun dalam usulan, jangan tampilkan tombol
  if (uniquePekebunList.value.length <= 1) return false;
  return currentUniqueIndex.value >= 0 && currentUniqueIndex.value < uniquePekebunList.value.length - 1;
});

const nextCpcl = computed(() => {
  if (!hasNextPekebun.value) return null;
  return uniquePekebunList.value[currentUniqueIndex.value + 1];
});

const targetPekebunId = computed(() => {
  if (pekebun.value?.id) return Number(pekebun.value.id);
  const foundInPengajuan = (pengajuan.value as any)?.pekebuns?.find((p: any) => p.nik === cpcl.value?.nik);
  if (foundInPengajuan?.id) return Number(foundInPengajuan.id);
  const foundInLahan = (pengajuan.value as any)?.lahans?.find((l: any) => String(l.id) === String(cpclId.value));
  if (foundInLahan?.pekebun_id) return Number(foundInLahan.pekebun_id);
  return null;
});

const filteredLahans = computed(() => {
  const allLahans: any[] = (pengajuan.value as any)?.lahans || [];
  if (targetPekebunId.value !== null) {
    return allLahans.filter((l: any) => Number(l.pekebun_id) === Number(targetPekebunId.value));
  }
  return allLahans.filter((l: any) => String(l.id) === String(cpclId.value));
});

function isSuratKeteranganKades(docType: string): boolean {
  const t = String(docType || '')
    .toUpperCase()
    .trim();
  return t === 'SURAT_KETERANGAN_KEPALA_DESA' || t === 'SURAT_KETERANGAN_BEDA_NAMA' || t === 'SURAT_BEDA_NAMA' || t === 'SURAT_KET_KADES' || t.includes('BEDA_NAMA') || t.includes('KEPALA_DESA') || t.includes('KADES');
}

function isScanLegalitas(docType: string): boolean {
  const t = String(docType || '')
    .toUpperCase()
    .trim();
  return t === 'SCAN_LEGALITAS' || t.includes('LEGALITAS');
}

const currentLahan = computed(() => {
  if (filteredLahans.value.length > 0) {
    const match = filteredLahans.value.find((l: any) => String(l.id) === String(cpclId.value));
    return match || filteredLahans.value[0];
  }
  return (pengajuan.value as any)?.lahans?.find((l: any) => String(l.id) === String(cpclId.value)) || null;
});

const lahanDocs = computed(() => {
  const docs: any[] = [];
  const lahansToScan = filteredLahans.value.length > 0 ? filteredLahans.value : currentLahan.value ? [currentLahan.value] : [];
  for (let idx = 0; idx < lahansToScan.length; idx++) {
    const l = lahansToScan[idx];
    const lahanNum = idx + 1;
    const lDocs = l.documents || l.dokumen || [];
    for (const d of lDocs) {
      const rawType = String(d.document_type || d.documentType || d.tipeDokumen || '')
        .toUpperCase()
        .trim();
      if (rawType === 'FOTO_UDARA' || rawType.includes('FOTO_UDARA')) {
        continue;
      }
      let docType = rawType;
      let label = 'Dokumen Lahan';
      if (isScanLegalitas(rawType)) {
        docType = 'SCAN_LEGALITAS';
        label = 'Scan Legalitas Lahan';
      } else if (isSuratKeteranganKades(rawType)) {
        docType = 'SURAT_KETERANGAN_KEPALA_DESA';
        label = 'Surat Keterangan Kepala Desa';
      }

      docs.push({
        id: String(d.id),
        documentType: docType,
        fileName: d.file_name || d.fileName || d.file?.file_name || label,
        fileUrl: d.file_url || d.fileUrl || d.file?.file_url || '',
        mimeType: d.mime_type || d.mimeType || d.file?.mime_type || 'application/pdf',
        fileExtension: d.file_extension || d.fileExtension || d.file?.file_extension || 'pdf',
        lahan: l,
        lahanIndex: lahanNum,
        lahanLabel: `Lahan ${lahanNum}`,
        isLahanDoc: true,
      });
    }

    // Fallback if surat_keterangan_beda_nama is attached as separate property on lahan
    const hasKadesDoc = docs.some((d) => String(d.lahan?.id) === String(l.id) && isSuratKeteranganKades(d.documentType));
    if (!hasKadesDoc && (l.scanBedaNamaLahan || l.suratKeteranganBedaNamaUrl || l.scanBedaNamaUrl)) {
      const url = l.scanBedaNamaLahan?.fileUrl || l.suratKeteranganBedaNamaUrl || l.scanBedaNamaUrl;
      docs.push({
        id: `lahan-${l.id || idx}-kades`,
        documentType: 'SURAT_KETERANGAN_KEPALA_DESA',
        fileName: 'Surat Keterangan Kepala Desa',
        fileUrl: url,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        lahan: l,
        lahanIndex: lahanNum,
        lahanLabel: `Lahan ${lahanNum}`,
        isLahanDoc: true,
      });
    }
  }

  if (docs.length === 0 && pekebun.value?.lahan) {
    const pLahan: any = pekebun.value.lahan;
    const lDocs = pLahan.dokumen || pLahan.documents || [];
    for (const d of lDocs) {
      const rawType = String(d.document_type || d.documentType || d.tipeDokumen || '')
        .toUpperCase()
        .trim();
      if (rawType === 'FOTO_UDARA' || rawType.includes('FOTO_UDARA')) {
        continue;
      }
      let docType = rawType;
      let label = 'Dokumen Lahan';
      if (isScanLegalitas(rawType)) {
        docType = 'SCAN_LEGALITAS';
        label = 'Scan Legalitas Lahan';
      } else if (isSuratKeteranganKades(rawType)) {
        docType = 'SURAT_KETERANGAN_KEPALA_DESA';
        label = 'Surat Keterangan Kepala Desa';
      }

      docs.push({
        id: String(d.id),
        documentType: docType,
        fileName: d.file_name || d.fileName || d.file?.file_name || label,
        fileUrl: d.file_url || d.fileUrl || d.file?.file_url || '',
        mimeType: d.mime_type || d.mimeType || d.file?.mime_type || 'application/pdf',
        fileExtension: d.file_extension || d.fileExtension || d.file?.file_extension || 'pdf',
        lahan: pLahan,
        lahanIndex: 1,
        lahanLabel: 'Lahan 1',
        isLahanDoc: true,
      });
    }
    if (docs.length === 0 && pLahan.scanLegalitasUrl) {
      docs.push({
        id: `lahan-${pLahan.id || cpclId.value}-legalitas`,
        documentType: 'SCAN_LEGALITAS',
        fileName: 'Scan Legalitas Lahan',
        fileUrl: pLahan.scanLegalitasUrl,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        lahan: pLahan,
        lahanIndex: 1,
        lahanLabel: 'Lahan 1',
        isLahanDoc: true,
      });
    }
    if (!docs.some((d) => isSuratKeteranganKades(d.documentType)) && (pLahan.scanBedaNamaLahan || pLahan.suratKeteranganBedaNamaUrl)) {
      docs.push({
        id: `lahan-${pLahan.id || cpclId.value}-kades`,
        documentType: 'SURAT_KETERANGAN_KEPALA_DESA',
        fileName: 'Surat Keterangan Kepala Desa',
        fileUrl: pLahan.scanBedaNamaLahan?.fileUrl || pLahan.suratKeteranganBedaNamaUrl,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        lahan: pLahan,
        lahanIndex: 1,
        lahanLabel: 'Lahan 1',
        isLahanDoc: true,
      });
    }
  }

  return docs;
});

const farmerDocs = computed(() => {
  const docs = (() => {
    if (pekebun.value?.documents && pekebun.value.documents.length > 0) return pekebun.value.documents;
    if (pekebun.value?.dokumen && pekebun.value.dokumen.length > 0) return pekebun.value.dokumen;
    if ((cpcl.value as any)?.dokumen && (cpcl.value as any).dokumen.length > 0) return (cpcl.value as any).dokumen;
    if ((cpcl.value as any)?.documents && (cpcl.value as any).documents.length > 0) return (cpcl.value as any).documents;
    return [];
  })();
  return docs.map((d: any) => ({
    ...d,
    documentType: String(d.documentType || d.tipeDokumen || d.document_type || '')
      .toUpperCase()
      .trim(),
    isLahanDoc: false,
  }));
});

const lahansWithDocs = computed(() => {
  const lahansToScan = filteredLahans.value.length > 0 ? filteredLahans.value : currentLahan.value ? [currentLahan.value] : [];
  return lahansToScan.map((l: any, idx: number) => {
    const docs = lahanDocs.value.filter((d: any) => String(d.lahan?.id) === String(l.id) || d.lahanIndex === idx + 1);
    return {
      lahan: l,
      index: idx + 1,
      label: `Lahan ${idx + 1}`,
      docs,
    };
  });
});

const activeLahanId = ref<string | null>(null);

const statusLabels: Record<string, string> = {
  BELUM_MENIKAH: 'Belum Menikah',
  MENIKAH: 'Menikah',
  CERAI_HIDUP: 'Cerai Hidup',
  CERAI_MATI: 'Cerai Mati',
};

const dokumenLabels: Record<string, string> = {
  [TipeDokumenPekebun.SCAN_KTP]: 'Scan KTP',
  [TipeDokumenPekebun.SCAN_KK]: 'Scan KK',
  [TipeDokumenPekebun.SWAFOTO]: 'Swafoto',
  [TipeDokumenPekebun.SURAT_KUASA]: 'Surat Kuasa',
  SCAN_LEGALITAS: 'Scan Legalitas Lahan',
  SURAT_KETERANGAN_KEPALA_DESA: 'Surat Keterangan Kepala Desa',
  SURAT_KETERANGAN_BEDA_NAMA: 'Surat Keterangan Kepala Desa',
  SURAT_BEDA_NAMA: 'Surat Keterangan Kepala Desa',
  FOTO_UDARA: 'Foto Udara Lahan',
};

const selectedDocId = ref<string | null>(null);

function toggleSelected(docId: string) {
  selectedDocId.value = docId;
}

function fieldKey(docId: string, field: string) {
  return `doc-${cpclId.value}-${docId}-${field}`;
}

function getFieldVerification(docId: string, field: string) {
  return verifikasiStore.getVerification(fieldKey(docId, field));
}

function toggleFieldStatus(docId: string, field: string, status: 'APPROVED' | 'REJECTED') {
  const v = getFieldVerification(docId, field);
  v.status = v.status === status ? 'PENDING' : status;
  if (v.status === 'APPROVED') v.notes = '';

  const altIds: string[] = [];
  if (targetPekebunId.value && String(targetPekebunId.value) !== String(cpclId.value)) {
    altIds.push(String(targetPekebunId.value));
  }
  if (cpcl.value?.nik) {
    altIds.push(String(cpcl.value.nik));
  }

  for (const altId of altIds) {
    const altKey = `doc-${altId}-${docId}-${field}`;
    verifikasiStore.setVerificationStatus(altKey, v.status);
    if (v.status === 'REJECTED' && v.notes) {
      verifikasiStore.verifications[altKey].notes = v.notes;
    }
  }

  const foundDoc = allDocs.value.find((d: any) => d.id === docId);
  if (foundDoc) {
    const pStatus = docStatus(foundDoc);
    verifikasiStore.setVerificationStatus(docKey(docId), pStatus);
    for (const altId of altIds) {
      verifikasiStore.setVerificationStatus(`doc-${altId}-${docId}`, pStatus);
    }
  }
  syncPekebunVerificationState();
}

function docKey(docId: string) {
  return `doc-${cpclId.value}-${docId}`;
}

function getDocVerification(docId: string) {
  return verifikasiStore.getVerification(docKey(docId));
}

function toggleDocStatus(docId: string, status: 'APPROVED' | 'REJECTED') {
  const v = getDocVerification(docId);
  v.status = v.status === status ? 'PENDING' : status;
  if (v.status === 'APPROVED') v.notes = '';

  const altIds: string[] = [];
  if (targetPekebunId.value && String(targetPekebunId.value) !== String(cpclId.value)) {
    altIds.push(String(targetPekebunId.value));
  }
  if (cpcl.value?.nik) {
    altIds.push(String(cpcl.value.nik));
  }
  for (const altId of altIds) {
    verifikasiStore.setVerificationStatus(`doc-${altId}-${docId}`, v.status);
    if (v.status === 'REJECTED' && v.notes) {
      verifikasiStore.verifications[`doc-${altId}-${docId}`].notes = v.notes;
    }
  }

  syncPekebunVerificationState();
}

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openPreview(doc: any) {
  if (!doc) return;
  previewDoc.value = {
    dataUrl: doc.fileUrl,
    mimeType: (doc as any).mimeType || doc.fileExtension || 'application/pdf',
    title: (doc as any).namaFile || doc.fileName || 'Dokumen',
  };
  showPreview.value = true;
}

const allDocs = computed(() => {
  return [...farmerDocs.value, ...lahanDocs.value];
});

function docStatus(doc: any): 'APPROVED' | 'REJECTED' | 'PENDING' {
  if (!doc) return 'PENDING';
  const docType = String(doc.documentType || doc.tipeDokumen || doc.document_type || '')
    .toUpperCase()
    .trim();
  let keys: string[] = [];
  if (docType === TipeDokumenPekebun.SCAN_KTP || docType === 'SCAN_KTP') {
    keys = [fieldKey(doc.id, 'namaLengkap'), fieldKey(doc.id, 'nik')];
  } else if (docType === TipeDokumenPekebun.SCAN_KK || docType === 'SCAN_KK') {
    keys = [fieldKey(doc.id, 'nomorKK')];
  } else if (isScanLegalitas(docType)) {
    const polyKey =
      doc.lahan?.id && verifikasiStore.getVerification(`lahan-${doc.lahan.id}-polygon`).status !== 'PENDING'
        ? `lahan-${doc.lahan.id}-polygon`
        : `doc-${cpclId.value}-${doc.id}-polygon`;
    keys = [
      fieldKey(doc.id, 'jenis_legalitas'),
      fieldKey(doc.id, 'nomor_legalitas'),
      fieldKey(doc.id, 'tanggal_penerbitan_legalitas'),
      fieldKey(doc.id, 'luas_lahan'),
      polyKey,
    ];
  } else if (isSuratKeteranganKades(docType)) {
    keys = [fieldKey(doc.id, 'nomor_surat_beda_nama')];
  } else {
    keys = [docKey(doc.id)];
  }

  if (keys.length > 0 && keys.every((k) => verifikasiStore.getVerification(k).status === 'APPROVED')) return 'APPROVED';
  if (keys.some((k) => verifikasiStore.getVerification(k).status === 'REJECTED')) return 'REJECTED';
  return 'PENDING';
}

function formatDate(val: any): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(val);
  }
}

const selectedDoc = computed(() => {
  const found = allDocs.value.find((d: any) => d.id === selectedDocId.value);
  return found ?? (allDocs.value.length > 0 ? allDocs.value[0] : null);
});

const activeLahan = computed(() => {
  if (selectedDoc.value?.isLahanDoc && selectedDoc.value.lahan) {
    return selectedDoc.value.lahan;
  }
  if (activeLahanId.value) {
    const found = filteredLahans.value.find((l: any) => String(l.id) === String(activeLahanId.value));
    if (found) return found;
  }
  return currentLahan.value;
});

const activeLahanPolygonKey = computed(() => {
  const lId = activeLahan.value?.id || (activeLahan.value as any)?.lahanId;
  if (lId) return `lahan-${lId}-polygon`;
  if (selectedDoc.value?.id) return `doc-${cpclId.value}-${selectedDoc.value.id}-polygon`;
  return '';
});

function getActiveLahanPolygonVerification() {
  const key = activeLahanPolygonKey.value;
  if (!key) return { status: 'PENDING' as const, notes: '' };
  return verifikasiStore.getVerification(key);
}

function toggleActiveLahanPolygonStatus(status: 'APPROVED' | 'REJECTED') {
  const key = activeLahanPolygonKey.value;
  if (!key) return;
  const v = verifikasiStore.getVerification(key);
  v.status = v.status === status ? 'PENDING' : status;
  if (v.status === 'APPROVED') v.notes = '';

  const lId = activeLahan.value?.id || (activeLahan.value as any)?.lahanId;
  if (lId) {
    const matchedDocs = allDocs.value.filter((d: any) => String(d.lahan?.id || '') === String(lId) && isScanLegalitas(d.documentType || d.tipeDokumen || d.document_type || ''));
    for (const doc of matchedDocs) {
      const dv = verifikasiStore.getVerification(`doc-${cpclId.value}-${doc.id}-polygon`);
      dv.status = v.status;
      if (v.status === 'APPROVED') {
        dv.notes = '';
      } else {
        dv.notes = v.notes;
        const parentDocKey = `doc-${cpclId.value}-${doc.id}`;
        if (verifikasiStore.verifications[parentDocKey] && !verifikasiStore.verifications[parentDocKey].notes) {
          verifikasiStore.verifications[parentDocKey].notes = v.notes;
        }
      }
    }
  }
  syncPekebunVerificationState();
}

function onActiveLahanPolygonNotesChange(notes: string) {
  const lId = activeLahan.value?.id || (activeLahan.value as any)?.lahanId;
  if (lId) {
    const matchedDocs = allDocs.value.filter((d: any) => String(d.lahan?.id || '') === String(lId) && isScanLegalitas(d.documentType || d.tipeDokumen || d.document_type || ''));
    for (const doc of matchedDocs) {
      const dv = verifikasiStore.getVerification(`doc-${cpclId.value}-${doc.id}-polygon`);
      dv.notes = notes;
      const parentDocKey = `doc-${cpclId.value}-${doc.id}`;
      if (verifikasiStore.verifications[parentDocKey]) {
        verifikasiStore.verifications[parentDocKey].notes = notes;
      }
    }
  }
}

// Verification Progress Metrics
const totalDocs = computed(() => allDocs.value.length);
const approvedDocsCount = computed(() => allDocs.value.filter((d) => docStatus(d) === 'APPROVED').length);
const rejectedDocsCount = computed(() => allDocs.value.filter((d) => docStatus(d) === 'REJECTED').length);
const pendingDocsCount = computed(() => allDocs.value.filter((d) => docStatus(d) === 'PENDING').length);
const verifiedDocsCount = computed(() => approvedDocsCount.value + rejectedDocsCount.value);
const progressPercentage = computed(() => {
  if (totalDocs.value === 0) return 0;
  return Math.round((verifiedDocsCount.value / totalDocs.value) * 100);
});

function syncPekebunVerificationState() {
  if (!cpcl.value) return;

  const total = allDocs.value.length;
  const approved = approvedDocsCount.value;
  const rejected = rejectedDocsCount.value;
  const pending = pendingDocsCount.value;

  let overallStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
  if (rejected > 0) {
    overallStatus = 'REJECTED';
  } else if (total > 0 && approved > 0 && pending === 0) {
    overallStatus = 'APPROVED';
  } else if (approved > 0) {
    overallStatus = 'APPROVED';
  }

  const keysToUpdate = [String(cpclId.value)];
  if (cpcl.value.nik) keysToUpdate.push(String(cpcl.value.nik));
  if (targetPekebunId.value) keysToUpdate.push(String(targetPekebunId.value));
  for (const l of filteredLahans.value) {
    if (l.id) keysToUpdate.push(String(l.id));
  }

  for (const k of keysToUpdate) {
    verifikasiStore.pekebunVerifications[k] = { status: overallStatus, notes: '' };
  }
}

watch(
  [approvedDocsCount, rejectedDocsCount, pendingDocsCount],
  () => {
    syncPekebunVerificationState();
  },
  { immediate: true },
);

function goToNextDoc() {
  if (allDocs.value.length === 0) return;
  const currentIndex = allDocs.value.findIndex((d: any) => d.id === selectedDoc.value?.id);
  if (currentIndex >= 0 && currentIndex < allDocs.value.length - 1) {
    selectedDocId.value = allDocs.value[currentIndex + 1].id;
  } else {
    // Jump to first pending doc if exists
    const firstPending = allDocs.value.find((d: any) => docStatus(d) === 'PENDING');
    if (firstPending) {
      selectedDocId.value = firstPending.id;
    }
  }
}

function isImage(doc: any): boolean {
  if (!doc) return false;
  const mime = String(doc.mimeType || '').toLowerCase();
  const ext = String(doc.fileExtension || '').toLowerCase();
  const url = String(doc.fileUrl || '').toLowerCase();
  return mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext) || url.match(/\.(jpeg|jpg|png|webp)$/i) !== null;
}

const isSaving = ref(false);

async function saveCurrentPekebunValidations(): Promise<boolean> {
  syncPekebunVerificationState();
  if (!cpcl.value) return true;

  const proposalIdNum = Number(String(pengajuanId.value).replace(/[^\d]/g, '')) || 0;
  const farmerPayload: any[] = [];
  const landPayload: any[] = [];
  const seenLandDocs = new Set<number>();

  // 1. Build farmer documents payload
  for (const doc of farmerDocs.value) {
    const rawId = (doc as any).rawDoc?.id || (doc as any).dokumen_pekebun_id || doc.id;
    const docIdNum = Number(String(rawId).replace(/[^\d]/g, '')) || 0;
    if (!docIdNum) continue;

    const docType = String(doc.documentType || (doc as any).tipeDokumen || '')
      .toUpperCase()
      .trim();
    const details: any[] = [];
    let isTouched = false;

    if (docType === TipeDokumenPekebun.SCAN_KTP || docType === 'SCAN_KTP') {
      const namaVerif = getFieldVerification(doc.id, 'namaLengkap');
      const nikVerif = getFieldVerification(doc.id, 'nik');
      if (namaVerif.status !== 'PENDING' || nikVerif.status !== 'PENDING') {
        isTouched = true;
      }
      details.push({ field_name: 'namaLengkap', is_valid: namaVerif.status === 'APPROVED', notes: namaVerif.notes || undefined }, { field_name: 'nik', is_valid: nikVerif.status === 'APPROVED', notes: nikVerif.notes || undefined });
    } else if (docType === TipeDokumenPekebun.SCAN_KK || docType === 'SCAN_KK') {
      const kkVerif = getFieldVerification(doc.id, 'nomorKK');
      if (kkVerif.status !== 'PENDING') {
        isTouched = true;
      }
      details.push({ field_name: 'nomorKK', is_valid: kkVerif.status === 'APPROVED', notes: kkVerif.notes || undefined });
    }

    const docVerif = getDocVerification(doc.id);
    if (docVerif.status !== 'PENDING') {
      isTouched = true;
    }

    if (!isTouched) continue;

    const isDocValid = details.length > 0 ? details.every((d) => d.is_valid) : docVerif.status === 'APPROVED';

    farmerPayload.push({
      dokumen_pekebun_id: docIdNum,
      pengajuan_id: proposalIdNum,
      is_valid: isDocValid,
      notes: docVerif.notes || '',
      details,
    });
  }

  // 2. Build land documents payload
  for (const doc of lahanDocs.value) {
    const rawId = (doc as any).rawDoc?.id || (doc as any).dokumen_lahan_id || doc.id;
    const docIdNum = Number(String(rawId).replace(/[^\d]/g, '')) || 0;
    if (!docIdNum || seenLandDocs.has(docIdNum)) continue;
    seenLandDocs.add(docIdNum);

    const docType = String(doc.documentType || (doc as any).tipeDokumen || '')
      .toUpperCase()
      .trim();
    const details: any[] = [];
    let isTouched = false;

    if (isScanLegalitas(docType)) {
      const fields = ['jenis_legalitas', 'nomor_legalitas', 'tanggal_penerbitan_legalitas', 'luas_lahan'];
      for (const f of fields) {
        const fVerif = getFieldVerification(doc.id, f);
        if (fVerif.status !== 'PENDING') {
          isTouched = true;
        }
        details.push({
          field_name: f,
          is_valid: fVerif.status === 'APPROVED',
          notes: fVerif.notes || undefined,
        });
      }
      const polyVerif =
        verifikasiStore.getVerification(`doc-${cpcl.value?.id}-${doc.id}-polygon`).status !== 'PENDING'
          ? verifikasiStore.getVerification(`doc-${cpcl.value?.id}-${doc.id}-polygon`)
          : (doc.lahan?.id ? verifikasiStore.getVerification(`lahan-${doc.lahan.id}-polygon`) : null);
      if (polyVerif && polyVerif.status !== 'PENDING') {
        isTouched = true;
        details.push({
          field_name: 'polygon',
          is_valid: polyVerif.status === 'APPROVED',
          notes: polyVerif.notes || undefined,
        });
      }
    } else if (isSuratKeteranganKades(docType)) {
      const f = 'nomor_surat_beda_nama';
      const fVerif = getFieldVerification(doc.id, f);
      if (fVerif.status !== 'PENDING') {
        isTouched = true;
      }
      details.push({
        field_name: f,
        is_valid: fVerif.status === 'APPROVED',
        notes: fVerif.notes || undefined,
      });
    }

    const docVerif = getDocVerification(doc.id);
    if (docVerif.status !== 'PENDING') {
      isTouched = true;
    }

    if (!isTouched) continue;

    const isDocValid = details.length > 0 ? details.every((d) => d.is_valid) : docVerif.status === 'APPROVED';

    landPayload.push({
      dokumen_lahan_id: docIdNum,
      pengajuan_id: proposalIdNum,
      is_valid: isDocValid,
      notes: docVerif.notes || '',
      details,
    });
  }

  try {
    const promises: Promise<any>[] = [];
    if (farmerPayload.length > 0) {
      promises.push(pengusulanStore.bulkFarmerValidations(farmerPayload));
    }
    if (landPayload.length > 0) {
      promises.push(pengusulanStore.bulkLandValidations(landPayload));
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    return true;
  } catch (err: any) {
    console.error('Failed to save validations to backend:', err);
    toast.error(err.message || 'Gagal menyimpan data validasi ke server');
    return false;
  }
}

async function goToNextPekebun() {
  if (!nextCpcl.value || isSaving.value) return;
  isSaving.value = true;
  try {
    await saveCurrentPekebunValidations();
    router.push(`/dinas/verifikasi/kabupaten/${pengajuanId.value}/pekebun/${nextCpcl.value.id}`);
  } finally {
    isSaving.value = false;
  }
}

async function goBack() {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    await saveCurrentPekebunValidations();
    router.push(`/dinas/verifikasi/kabupaten/${pengajuanId.value}`);
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50/50 p-4 md:p-8 flex flex-col gap-6 mx-auto max-w-7xl pb-6">
    <!-- Skeleton Loading -->
    <div class="animate-pulse space-y-4" v-if="pageLoading">
      <div class="h-10 bg-slate-200 rounded-xl w-1/3"></div>
      <div class="h-20 bg-slate-100 rounded-2xl"></div>
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-5 h-96 bg-slate-100 rounded-2xl"></div>
        <div class="col-span-7 h-96 bg-slate-100 rounded-2xl"></div>
      </div>
    </div>

    <template v-else>
      <!-- Top Navigation & Profile Summary Header -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Left: Back button & Farmer Identity -->
          <div class="flex items-start sm:items-center gap-3.5 min-w-0">
            <button
              type="button"
              :disabled="isSaving"
              @click="goBack"
              class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
              title="Simpan & Kembali ke Ringkasan Usulan"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin text-slate-600" />
              <ArrowLeft v-else class="w-4 h-4" />
            </button>
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md uppercase tracking-wider"> Verifikasi Pekebun </span>
                <span v-if="currentUniqueIndex >= 0" class="text-xs font-semibold text-slate-500"> Anggota #{{ currentUniqueIndex + 1 }} dari {{ uniquePekebunList.length }} </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 class="text-lg md:text-xl font-bold text-slate-900 truncate">
                  {{ cpcl?.namaPekebun || 'Pekebun' }}
                </h1>
                <span class="text-xs text-slate-400 hidden sm:inline">&bull;</span>
                <span class="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded"> NIK: {{ cpcl?.nik || '-' }} </span>
                <span class="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded"> No. KK: {{ cpcl?.nomorKK || '-' }} </span>
                <span v-if="pekebun?.statusPernikahan" class="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {{ statusLabels[pekebun.statusPernikahan] ?? pekebun.statusPernikahan }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Progress Card -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 shrink-0">
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between gap-4">
                <span class="text-xs font-bold text-slate-700">Progres Berkas</span>
                <span class="text-xs font-bold font-mono text-[#066C2A]">{{ verifiedDocsCount }}/{{ totalDocs }} Selesai ({{ progressPercentage }}%)</span>
              </div>
              <div class="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-[#066C2A] rounded-full transition-all duration-300" :style="{ width: `${progressPercentage}%` }"></div>
              </div>
            </div>

            <div class="flex items-center gap-1.5 pt-2 sm:pt-0 sm:pl-3 sm:border-l sm:border-slate-200 text-xs">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-emerald-100/70 text-emerald-800 text-[11px]"> <Check class="w-3 h-3" /> {{ approvedDocsCount }} Sesuai </span>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold bg-rose-100/70 text-rose-800 text-[11px]"> <X class="w-3 h-3" /> {{ rejectedDocsCount }} Catatan </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State If CPCL Not Found -->
      <div v-if="!cpcl" class="p-12 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 shadow-xs">Data pekebun tidak ditemukan.</div>

      <!-- Main Split Workbench Layout (Unified 2-Column Workbench) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <!-- ========================================================= -->
        <!-- LEFT COLUMN: Document Navigator Directory                 -->
        <!-- ========================================================= -->
        <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4 min-w-0">
          <!-- Card 1: Document Selector Navigation List -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 flex flex-col gap-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-2">
              <div class="flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-[#066C2A]" />
                <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Berkas Persyaratan</h2>
              </div>
              <span class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"> {{ allDocs.length }} Berkas </span>
            </div>

            <!-- Group A: Farmer Identity Documents -->
            <div v-if="farmerDocs.length" class="flex flex-col gap-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"> <User class="w-3 h-3 text-slate-400" /> Identitas Pekebun </span>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="doc in farmerDocs"
                  :key="doc.id"
                  type="button"
                  @click="toggleSelected(doc.id)"
                  :class="[
                    'flex items-center justify-between gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer',
                    selectedDoc?.id === doc.id ? 'border-[#066C2A] bg-emerald-50/40 shadow-2xs ring-1 ring-[#066C2A]' : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60',
                  ]"
                >
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <div :class="['w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold', selectedDoc?.id === doc.id ? 'bg-[#066C2A] text-white' : 'bg-slate-100 text-slate-600']">
                      <FileText class="w-3 h-3" />
                    </div>
                    <div class="flex flex-col min-w-0 flex-1">
                      <span class="text-xs font-semibold text-slate-800 truncate">
                        {{ dokumenLabels[doc.documentType] || doc.documentType }}
                      </span>
                      <span class="text-[9px] text-slate-400 truncate">{{ doc.fileName }}</span>
                    </div>
                  </div>

                  <!-- Status Badge -->
                  <div class="shrink-0">
                    <span v-if="docStatus(doc) === 'APPROVED'" class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 class="w-2.5 h-2.5 text-emerald-600" /> Sesuai
                    </span>
                    <span v-else-if="docStatus(doc) === 'REJECTED'" class="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      <XCircle class="w-2.5 h-2.5 text-rose-600" /> Catatan
                    </span>
                    <span v-else class="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500"> Belum </span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Group B: Land Documents -->
            <div v-if="lahanDocs.length" class="flex flex-col gap-1.5 mt-0.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"> <MapPin class="w-3 h-3 text-slate-400" /> Legalitas Lahan </span>

              <div class="flex flex-col gap-2">
                <div v-for="lItem in lahansWithDocs" :key="lItem.lahan.id || lItem.index" class="p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-1.5">
                  <div class="flex items-center justify-between text-xs border-b border-slate-200/60 pb-1">
                    <div class="flex items-center gap-1">
                      <span class="font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[9px]">
                        {{ lItem.label }}
                      </span>
                      <span class="font-semibold text-slate-700 truncate max-w-[120px] text-[11px]">
                        {{ lItem.lahan.jenis_legalitas || 'Lahan' }}
                      </span>
                    </div>
                    <span class="text-[9px] text-slate-500 font-mono">{{ lItem.lahan.luas_lahan }} Ha</span>
                  </div>

                  <div class="flex flex-col gap-1">
                    <button
                      v-for="doc in lItem.docs"
                      :key="doc.id"
                      type="button"
                      @click="toggleSelected(doc.id)"
                      :class="[
                        'flex items-center justify-between gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer',
                        selectedDoc?.id === doc.id ? 'border-[#066C2A] bg-white shadow-2xs ring-1 ring-[#066C2A]' : 'border-slate-200 bg-white hover:border-slate-300',
                      ]"
                    >
                      <div class="flex items-center gap-1.5 min-w-0 flex-1">
                        <FileText class="w-3 h-3 text-slate-400 shrink-0" />
                        <div class="flex flex-col min-w-0 flex-1">
                          <span class="text-[11px] font-semibold text-slate-800 truncate">
                            {{ dokumenLabels[doc.documentType] || doc.documentType }}
                          </span>
                          <span class="text-[8px] text-slate-400 truncate">{{ doc.fileName }}</span>
                        </div>
                      </div>

                      <div class="shrink-0">
                        <span v-if="docStatus(doc) === 'APPROVED'" class="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800"> <Check class="w-2 h-2" /> Sesuai </span>
                        <span v-else-if="docStatus(doc) === 'REJECTED'" class="inline-flex items-center gap-0.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800"> <X class="w-2 h-2" /> Catatan </span>
                        <span v-else class="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500"> Belum </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- RIGHT COLUMN: Unified Pratinjau & Form Verifikasi          -->
        <!-- ========================================================= -->
        <div class="lg:col-span-8 xl:col-span-9 flex flex-col gap-4 min-w-0">
          <div v-if="selectedDoc" class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <!-- Unified Header of Verification Panel -->
            <div class="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/90 gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <ShieldCheck class="w-4 h-4 text-[#066C2A] shrink-0" />
                <div class="flex items-center gap-1.5 min-w-0">
                  <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                    {{ dokumenLabels[selectedDoc.documentType] || selectedDoc.documentType }}
                  </h2>
                  <span v-if="selectedDoc.lahanLabel" class="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                    {{ selectedDoc.lahanLabel }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span v-if="docStatus(selectedDoc) === 'APPROVED'" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 class="w-3 h-3 text-emerald-600" /> Sesuai
                </span>
                <span v-else-if="docStatus(selectedDoc) === 'REJECTED'" class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  <XCircle class="w-3 h-3 text-rose-600" /> Perlu Catatan
                </span>
                <span v-else class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"> <Clock class="w-3 h-3 text-slate-400" /> Belum Dicek </span>
                <button
                  v-if="selectedDoc?.fileUrl"
                  type="button"
                  @click="openPreview(selectedDoc)"
                  class="inline-flex items-center gap-1 text-xs font-semibold text-[#066C2A] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <ZoomIn class="w-3 h-3" /> Perbesar
                </button>
              </div>
            </div>

            <!-- Unified Body: Side-by-side Pratinjau & Form Verifikasi -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
              <!-- Left Sub-col: Embed Document Viewer -->
              <div class="md:col-span-6 flex flex-col gap-1.5 min-w-0">
                <div class="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-100">
                  <span class="font-bold uppercase tracking-wider text-slate-600">Pratinjau Berkas</span>
                  <span class="truncate max-w-[180px] font-mono text-slate-400">{{ selectedDoc.fileName }}</span>
                </div>

                <div class="p-2 bg-slate-100/70 rounded-xl border border-slate-200/80 min-h-[420px] h-[460px] flex items-center justify-center relative overflow-hidden">
                  <template v-if="selectedDoc?.fileUrl">
                    <!-- If Image -->
                    <div v-if="isImage(selectedDoc)" class="cursor-pointer group relative w-full h-full flex items-center justify-center" @click="openPreview(selectedDoc)">
                      <img :src="selectedDoc.fileUrl" :alt="selectedDoc.fileName" class="max-w-full max-h-[440px] object-contain rounded-lg shadow-2xs border border-white" />
                      <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <ZoomIn class="w-4 h-4" /> Klik untuk memperbesar
                      </div>
                    </div>

                    <!-- If PDF -->
                    <div v-else class="w-full h-full flex flex-col">
                      <iframe :src="selectedDoc.fileUrl" class="w-full h-full rounded-lg border border-slate-200 bg-white" title="Pratinjau Dokumen PDF" />
                    </div>
                  </template>

                  <!-- Empty State -->
                  <div v-else class="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400">
                    <FileText class="w-10 h-10 text-slate-300" />
                    <p class="text-xs font-medium">Berkas belum diunggah atau tidak ditemukan.</p>
                  </div>
                </div>
              </div>

              <!-- Right Sub-col: Compact Verification Checklist & Actions -->
              <div class="md:col-span-6 flex flex-col gap-2.5 min-w-0 max-h-[490px] overflow-y-auto pr-1">
                <div class="flex items-center gap-1.5 text-[11px] text-slate-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-200/60 shrink-0">
                  <Sparkles class="w-3.5 h-3.5 text-[#066C2A] shrink-0" />
                  <span class="truncate">Cocokkan data terdaftar dengan berkas pratinjau di samping.</span>
                </div>

                <!-- Case 1: SCAN KTP (Validates Nama & NIK) -->
                <template v-if="selectedDoc.documentType === TipeDokumenPekebun.SCAN_KTP || selectedDoc.documentType === 'SCAN_KTP'">
                  <!-- Field 1: Nama Lengkap -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</span>
                      <span class="text-[9px] text-slate-400 font-mono">Data Terdaftar</span>
                    </div>
                    <p class="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ cpcl.namaPekebun }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'namaLengkap', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'namaLengkap').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'namaLengkap', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'namaLengkap').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'namaLengkap').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'namaLengkap').notes"
                        rows="1"
                        placeholder="Alasan nama lengkap tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>

                  <!-- Field 2: NIK -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">NIK (16 Digit)</span>
                      <span class="text-[9px] text-slate-400 font-mono">Data Terdaftar</span>
                    </div>
                    <p class="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ cpcl.nik }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nik', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nik').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nik', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nik').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'nik').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'nik').notes"
                        rows="1"
                        placeholder="Alasan NIK tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </template>

                <!-- Case 2: SCAN KK -->
                <template v-else-if="selectedDoc.documentType === TipeDokumenPekebun.SCAN_KK || selectedDoc.documentType === 'SCAN_KK'">
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Kartu Keluarga (KK)</span>
                      <span class="text-[9px] text-slate-400 font-mono">16 Digit</span>
                    </div>
                    <p class="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ cpcl.nomorKK }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomorKK', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomorKK').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomorKK', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomorKK').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'nomorKK').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'nomorKK').notes"
                        rows="1"
                        placeholder="Alasan nomor KK tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </template>

                <!-- Case 3: Swafoto & Surat Kuasa -->
                <template v-else-if="selectedDoc.documentType === TipeDokumenPekebun.SWAFOTO || selectedDoc.documentType === TipeDokumenPekebun.SURAT_KUASA || selectedDoc.documentType === 'SURAT_KUASA'">
                  <div class="flex flex-col gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-xs font-bold text-slate-800">
                        {{ dokumenLabels[selectedDoc.documentType] || selectedDoc.documentType }}
                      </span>
                      <p class="text-[10px] text-slate-500">Periksa keabsahan foto, kejelasan identitas, serta tanda tangan pemohon.</p>
                    </div>
                    <div class="flex flex-col gap-1 pt-1 border-t border-slate-200/60">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleDocStatus(selectedDoc.id, 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                            getDocVerification(selectedDoc.id).status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Dokumen Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleDocStatus(selectedDoc.id, 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
                            getDocVerification(selectedDoc.id).status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-700 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Perlu Catatan
                        </button>
                      </div>
                      <textarea
                        v-if="getDocVerification(selectedDoc.id).status === 'REJECTED'"
                        v-model="getDocVerification(selectedDoc.id).notes"
                        rows="2"
                        placeholder="Tuliskan alasan ketidaksesuaian dokumen..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </template>

                <!-- Case 4: SCAN LEGALITAS LAHAN (4 Fields) -->
                <template v-else-if="selectedDoc.documentType === 'SCAN_LEGALITAS'">
                  <!-- Field 1: Jenis Legalitas -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jenis Legalitas</span>
                      <span class="text-[9px] text-slate-400">Hak Milik / SKT</span>
                    </div>
                    <p class="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ selectedDoc.lahan?.jenis_legalitas || currentLahan?.jenis_legalitas || cpcl?.jenisHakLahan || '-' }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'jenis_legalitas', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'jenis_legalitas').status === 'APPROVED'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'jenis_legalitas', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'jenis_legalitas').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'jenis_legalitas').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'jenis_legalitas').notes"
                        rows="1"
                        placeholder="Alasan jenis legalitas tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>

                  <!-- Field 2: Nomor Legalitas -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Surat / Sertifikat</span>
                      <span class="text-[9px] text-slate-400 font-mono">No. Dokumen</span>
                    </div>
                    <p class="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ selectedDoc.lahan?.nomor_legalitas || currentLahan?.nomor_legalitas || cpcl?.nomorSuratLahan || '-' }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomor_legalitas', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomor_legalitas').status === 'APPROVED'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomor_legalitas', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomor_legalitas').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'nomor_legalitas').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'nomor_legalitas').notes"
                        rows="1"
                        placeholder="Alasan nomor legalitas tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>

                  <!-- Field 3: Tanggal Penerbitan -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Penerbitan</span>
                      <span class="text-[9px] text-slate-400">Tanggal Resmi</span>
                    </div>
                    <p class="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ formatDate(selectedDoc.lahan?.tanggal_penerbitan_legalitas || currentLahan?.tanggal_penerbitan_legalitas) }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'tanggal_penerbitan_legalitas', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'tanggal_penerbitan_legalitas').status === 'APPROVED'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'tanggal_penerbitan_legalitas', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'tanggal_penerbitan_legalitas').status === 'REJECTED'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'tanggal_penerbitan_legalitas').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'tanggal_penerbitan_legalitas').notes"
                        rows="1"
                        placeholder="Alasan tanggal penerbitan tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>

                  <!-- Field 4: Luas Lahan -->
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Luas Lahan Terdaftar</span>
                      <span class="text-[9px] text-slate-400 font-mono">Hektar (Ha)</span>
                    </div>
                    <p class="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{{ selectedDoc.lahan?.luas_lahan ?? currentLahan?.luas_lahan ?? cpcl?.luasLahanHektar ?? '-' }} Ha</p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'luas_lahan', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'luas_lahan').status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'luas_lahan', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'luas_lahan').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'luas_lahan').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'luas_lahan').notes"
                        rows="1"
                        placeholder="Alasan luas lahan tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </template>

                <!-- Case 5: Surat Keterangan Kades (Beda Nama) -->
                <template v-else-if="isSuratKeteranganKades(selectedDoc.documentType)">
                  <div class="flex flex-col gap-1 p-2 rounded-xl border border-slate-200/80 bg-slate-50/50">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nomor Surat Beda Nama</span>
                      <span class="text-[9px] text-slate-400 font-mono">No. Surat Kades</span>
                    </div>
                    <p class="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                      {{ selectedDoc.lahan?.nomor_surat_beda_nama || selectedDoc.lahan?.nomorSuratBedaNama || '-' }}
                    </p>
                    <div class="flex flex-col gap-1 mt-0.5">
                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomor_surat_beda_nama', 'APPROVED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomor_surat_beda_nama').status === 'APPROVED'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                          ]"
                        >
                          <Check class="w-3 h-3" /> Sesuai
                        </button>
                        <button
                          type="button"
                          @click="toggleFieldStatus(selectedDoc.id, 'nomor_surat_beda_nama', 'REJECTED')"
                          :class="[
                            'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-[11px] rounded-lg font-semibold transition-all cursor-pointer',
                            getFieldVerification(selectedDoc.id, 'nomor_surat_beda_nama').status === 'REJECTED' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                          ]"
                        >
                          <X class="w-3 h-3" /> Tidak Sesuai
                        </button>
                      </div>
                      <textarea
                        v-if="getFieldVerification(selectedDoc.id, 'nomor_surat_beda_nama').status === 'REJECTED'"
                        v-model="getFieldVerification(selectedDoc.id, 'nomor_surat_beda_nama').notes"
                        rows="1"
                        placeholder="Alasan nomor surat keterangan beda nama tidak sesuai..."
                        class="w-full text-[10px] p-1.5 rounded-md border border-rose-300 bg-rose-50/40 focus:outline-none focus:border-rose-500 resize-none text-slate-800"
                      />
                    </div>
                  </div>
                </template>

                <!-- Footer Shortcut: Next Document -->
                <div class="pt-2 mt-auto border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[10px] text-slate-400"> Berkas {{ allDocs.findIndex((d) => d.id === selectedDoc?.id) + 1 }} dari {{ allDocs.length }} </span>
                  <button type="button" @click="goToNextDoc" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer">
                    Dokumen Berikutnya <ArrowRight class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="p-10 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200 shadow-xs">Pilih dokumen di sebelah kiri untuk memulai verifikasi data.</div>
        </div>

        <!-- ========================================================= -->
        <!-- SECONDARY DETAILS: Collapsible Accordion (Identity & Map)  -->
        <!-- ========================================================= -->
        <div class="lg:col-span-12 mt-2">
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <!-- Accordion Toggle Header -->
            <button
              type="button"
              @click="isSecondaryDetailsOpen = !isSecondaryDetailsOpen"
              class="w-full px-5 py-4 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/80 transition-colors text-left cursor-pointer border-b border-slate-100"
            >
              <div class="flex items-center gap-2.5">
                <Layers class="w-4 h-4 text-[#066C2A]" />
                <div>
                  <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Informasi Lengkap Profil Pekebun &amp; Peta Poligon Lahan</h3>
                  <p class="text-[11px] text-slate-500">Klik untuk melihat rincian alamat lengkap, agronomi, dan koordinat satelit kebun.</p>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-2xs">
                <ChevronUp v-if="isSecondaryDetailsOpen" class="w-4 h-4" />
                <ChevronDown v-else class="w-4 h-4" />
              </div>
            </button>

            <!-- Collapsible Body -->
            <div v-if="isSecondaryDetailsOpen" class="p-5 flex flex-col gap-6">
              <!-- Sub-section 1: Biodata Lengkap Pekebun -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                  <User class="w-4 h-4 text-slate-500" />
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Biodata Lengkap</h4>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Nama Lengkap</span>
                    <p class="font-bold text-slate-800 mt-0.5">{{ cpcl.namaPekebun }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">NIK</span>
                    <p class="font-mono font-semibold text-slate-800 mt-0.5">{{ cpcl.nik }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">No. KK</span>
                    <p class="font-mono font-semibold text-slate-800 mt-0.5">{{ cpcl.nomorKK }}</p>
                  </div>
                  <div v-if="pekebun" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Status Pernikahan</span>
                    <p class="font-semibold text-slate-800 mt-0.5">{{ statusLabels[pekebun.statusPernikahan] ?? pekebun.statusPernikahan }}</p>
                  </div>
                  <div v-if="pekebun" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Tempat, Tanggal Lahir</span>
                    <p class="text-slate-800 mt-0.5">{{ pekebun.tempatLahir }}, {{ pekebun.tanggalLahir }}</p>
                  </div>
                  <div v-if="pekebun" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">No. Handphone</span>
                    <p class="text-slate-800 mt-0.5">{{ pekebun.nomorHP || '-' }}</p>
                  </div>
                  <div v-if="pekebun" class="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 md:col-span-3 lg:col-span-2">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Alamat Domisili</span>
                    <p class="text-slate-800 mt-0.5">{{ pekebun.alamat }}, {{ pekebun.kodepos || '' }}</p>
                  </div>
                </div>
              </div>

              <!-- Sub-section 2: Data Lahan & Peta Satelit -->
              <div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-slate-500" />
                    <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Rincian Lahan &amp; Koordinat</h4>
                  </div>
                  <!-- Multi-Lahan Switcher -->
                  <div v-if="filteredLahans.length > 1" class="flex items-center gap-1.5">
                    <button
                      v-for="(l, idx) in filteredLahans"
                      :key="l.id"
                      type="button"
                      @click="activeLahanId = String(l.id)"
                      :class="['px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer', String(activeLahan?.id) === String(l.id) ? 'bg-[#066C2A] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']"
                    >
                      Lahan {{ idx + 1 }}
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Luas Lahan</span>
                    <p class="font-bold text-slate-900 mt-0.5">{{ activeLahan?.luas_lahan ?? activeLahan?.luasLahan ?? cpcl.luasLahanHektar }} Ha</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Jenis Legalitas</span>
                    <p class="font-semibold text-slate-800 mt-0.5">{{ activeLahan?.jenis_legalitas ?? activeLahan?.jenisHakLahan ?? cpcl.jenisHakLahan }}</p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Nomor Legalitas</span>
                    <p class="font-mono text-slate-800 mt-0.5">{{ activeLahan?.nomor_legalitas ?? activeLahan?.nomorSuratLahan ?? cpcl.nomorSuratLahan }}</p>
                  </div>
                  <div v-if="activeLahan?.nomor_surat_beda_nama || activeLahan?.nomorSuratBedaNama" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Surat Beda Nama</span>
                    <p class="font-mono text-slate-800 mt-0.5">{{ activeLahan?.nomor_surat_beda_nama || activeLahan?.nomorSuratBedaNama }}</p>
                  </div>
                  <div v-if="activeLahan?.tahun_tanam || activeLahan?.tahunTanam" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Tahun Tanam</span>
                    <p class="text-slate-800 mt-0.5">{{ activeLahan.tahun_tanam || activeLahan.tahunTanam }}</p>
                  </div>
                  <div v-if="activeLahan?.jenis_bibit || activeLahan?.jenisBibit" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Jenis Bibit</span>
                    <p class="text-slate-800 mt-0.5">{{ activeLahan.jenis_bibit || activeLahan.jenisBibit }}</p>
                  </div>
                  <div v-if="activeLahan?.desaNama" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Desa / Kelurahan</span>
                    <p class="text-slate-800 mt-0.5">{{ activeLahan.desaNama }}</p>
                  </div>
                  <div v-if="activeLahan?.kecamatanNama" class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Kecamatan</span>
                    <p class="text-slate-800 mt-0.5">{{ activeLahan.kecamatanNama }}</p>
                  </div>
                  <div v-if="activeLahan?.alamat_kebun || activeLahan?.alamatKebun" class="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 md:col-span-3 lg:col-span-4">
                    <span class="text-slate-400 text-[10px] uppercase font-semibold">Alamat Kebun</span>
                    <p class="text-slate-800 mt-0.5">{{ activeLahan.alamat_kebun || activeLahan.alamatKebun }}</p>
                  </div>
                </div>

                <!-- Satellite Polygon Map View -->
                <div class="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mt-1">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span class="text-xs font-bold text-slate-700 uppercase tracking-wider"> Peta Poligon Lahan Kebun (Mode Satelit) </span>
                    <!-- Verification Action Buttons -->
                    <div class="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        @click="toggleActiveLahanPolygonStatus('APPROVED')"
                        :class="[
                          'flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer',
                          getActiveLahanPolygonVerification().status === 'APPROVED'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
                        ]"
                      >
                        <Check class="w-3.5 h-3.5" /> Sesuai
                      </button>
                      <button
                        type="button"
                        @click="toggleActiveLahanPolygonStatus('REJECTED')"
                        :class="[
                          'flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all cursor-pointer',
                          getActiveLahanPolygonVerification().status === 'REJECTED'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-600 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700',
                        ]"
                      >
                        <X class="w-3.5 h-3.5" /> Tidak Sesuai
                      </button>
                    </div>
                  </div>

                  <SatelliteMapPreview
                    :coordinates="activeLahan?.coordinates || cpcl?.coordinates || pekebun?.lahan?.coordinates"
                    :luas-lahan="activeLahan?.luas_lahan || activeLahan?.luasLahan || cpcl?.luasLahanHektar || pekebun?.lahan?.luasLahan"
                    height="320px"
                  />

                  <!-- Rejection Notes Textarea -->
                  <div v-if="getActiveLahanPolygonVerification().status === 'REJECTED'" class="flex flex-col gap-1 mt-1">
                    <label class="text-[11px] font-semibold text-rose-700">Catatan Perbaikan Poligon / Koordinat Lahan:</label>
                    <textarea
                      v-model="getActiveLahanPolygonVerification().notes"
                      @input="onActiveLahanPolygonNotesChange(($event.target as HTMLTextAreaElement).value)"
                      rows="2"
                      placeholder="Masukkan catatan perbaikan koordinat / poligon lahan yang tidak sesuai..."
                      class="w-full text-xs p-2.5 rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========================================================= -->
    <!-- STICKY BOTTOM ACTION BAR                                  -->
    <!-- ========================================================= -->
    <div v-if="cpcl" class="sticky bottom-4 z-50 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/60 px-4 md:px-6 py-3.5 mt-2 transition-all duration-300">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <!-- Left: Summary Tally -->
        <div class="flex items-center gap-2 text-xs">
          <span class="text-slate-500 font-medium">Status Verifikasi:</span>
          <span class="px-2.5 py-1 rounded-full font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-[11px] flex items-center gap-1">
            <CheckCircle2 class="w-3 h-3 text-emerald-600" /> {{ approvedDocsCount }} Sesuai
          </span>
          <span class="px-2.5 py-1 rounded-full font-bold bg-rose-100/80 text-rose-800 border border-rose-200 text-[11px] flex items-center gap-1"> <XCircle class="w-3 h-3 text-rose-600" /> {{ rejectedDocsCount }} Perlu Catatan </span>
          <span v-if="pendingDocsCount > 0" class="px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200 text-[11px]"> {{ pendingDocsCount }} Belum Dicek </span>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-2.5 shrink-0">
          <template v-if="hasNextPekebun">
            <button
              type="button"
              :disabled="isSaving"
              @click="goBack"
              class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/90 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin text-slate-500" />
              <ArrowLeft v-else class="w-3.5 h-3.5 text-slate-500" />
              <span>Kembali ke Usulan</span>
            </button>
            <button
              type="button"
              :disabled="isSaving"
              @click="goToNextPekebun"
              class="px-4 py-2 text-xs font-bold rounded-xl bg-[#066C2A] text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Loader2 v-if="isSaving" class="w-3.5 h-3.5 animate-spin text-white" />
              <span>Lanjut ke Pekebun Berikutnya</span>
              <ArrowRight v-if="!isSaving" class="w-3.5 h-3.5" />
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              :disabled="isSaving"
              @click="goBack"
              class="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#066C2A] text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin text-white" />
              <CheckCircle2 v-else class="w-4 h-4" />
              <span>Simpan Validasi &amp; Kembali ke Usulan</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Document Preview Modal (Fullscreen / Zoom) -->
    <DocumentPreviewModal :isOpen="showPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showPreview = false" />
  </div>
</template>
