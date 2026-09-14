<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CheckCircle2, XCircle, ArrowLeft, Send, FileText, Warehouse, Camera, Users, ClipboardCheck, Loader2, Eye, ChevronDown, ChevronUp, ShieldCheck, AlertCircle, Check, Sparkles } from 'lucide-vue-next';
import type { DokumenUpload, DokumenPersyaratan } from '@/types/pengusulan';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import { useVerifikasiKabStore } from '@/stores/verifikasiKab';
import { useToast } from '@/composables/useToast';
import { PAKET_OPTIONS, PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { resolveProposalRequirements } from '@/lib/dynamicRequirements';
import { JenisSarpras } from '@/types/pengusulan';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';
import { TipeDokumenPekebun } from '@/types/pekebun';
import { rabService } from '@/services/rab.service';
import type { CreateRabItemPayload } from '@/types/rab';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const pengusulanStore = usePengusulanStore();
const verifikasiStore = useVerifikasiKabDraftStore();
const verifikasiKabStore = useVerifikasiKabStore();
const pekebunStore = usePekebunStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)) || pengusulanStore.listPengajuan[0];
});

const pekebunList = computed(() => {
  return (pengajuan.value?.daftarCPCL ?? []).map((cpcl) => {
    const enriched = pekebunStore.listPekebun.find((p) => p.nik === cpcl.nik);
    return { cpcl, enriched };
  });
});

function getExistingDoc(docType: string): DokumenUpload | null {
  if (!pengajuan.value) return null;
  const docs = (pengajuan.value as any).documents || (pengajuan.value as any).dokumen || [];
  const found = (Array.isArray(docs) ? docs : []).find((d: any) => {
    const t = String(d.document_type || d.documentType || d.tipeDokumen || d.persyaratanId || '')
      .toUpperCase()
      .trim();
    return t === docType.toUpperCase().trim();
  });
  if (!found) return null;
  return {
    persyaratanId: docType,
    namaFile: found.file_name || found.fileName || found.namaFile || `${docType}.pdf`,
    mimeType: found.mime_type || found.mimeType || 'application/pdf',
    ukuranBytes: Number(found.file_size || found.fileSize || found.ukuranBytes) || 0,
    dataUrl: found.file_url || found.fileUrl || found.urlFile || found.dataUrl || '',
    uploadedAt: found.created_at || found.uploadedAt || '',
    uploadedBy: found.updated_by_name || found.created_by_name || found.uploadedBy || '',
    uploaded_at_formatted: formatUploadedAt(found.uploaded_at_formatted || found.uploadedAtFormatted, found.updated_at || found.created_at || found.uploadedAt),
    uploadedAtFormatted: formatUploadedAt(found.uploaded_at_formatted || found.uploadedAtFormatted, found.updated_at || found.created_at || found.uploadedAt),
  };
}

const activeBeritaAcaraDokumen = computed(() => (verifikasiStore.beritaAcaraDokumenRemoved ? null : verifikasiStore.beritaAcaraDokumen || getExistingDoc('BERITA_ACARA_DOKUMEN')));
const activeBeritaAcaraLapangan = computed(() => (verifikasiStore.beritaAcaraLapanganRemoved ? null : verifikasiStore.beritaAcaraLapangan || getExistingDoc('BERITA_ACARA_LAPANGAN')));
const activeSkCpcl = computed(() => (verifikasiStore.skCpclRemoved ? null : verifikasiStore.skCpcl || getExistingDoc('SK_CPCL')));

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);
const confirmModalRef = ref<any>(null);

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
    previewDoc.value = { dataUrl, mimeType, title };
    showPreview.value = true;
  }
}

function getPersyaratanDoc(persyaratanId: string): DokumenPersyaratan | undefined {
  return pengajuan.value?.dokumen?.find((d) => (d as any).persyaratanId === persyaratanId || (d as any).tipeDokumen === persyaratanId);
}

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

const storageArea = computed(() => pengajuan.value?.storage_area || pengajuan.value?.gudangSerahTerima);

const hasStorageArea = computed(() => {
  if (!pengajuan.value) return false;
  const sa = storageArea.value;
  const hasSaData = !!(sa && (sa.address || sa.alamat || sa.coordinate || sa.koordinat || sa.fotoTampakDepan || sa.fotoTampakDalam || sa.exterior_photo_file_url || sa.interior_photo_file_url));
  return hasSaData || isPupukPaket.value;
});

const exteriorPhoto = computed(() => {
  const sa = storageArea.value;
  if (!sa) return null;
  const doc = sa.fotoTampakDepan;
  const url = doc?.dataUrl || doc?.fileUrl || sa.exterior_photo_file_url || (typeof doc === 'string' ? doc : '');
  if (!url && !doc) return null;
  return {
    persyaratanId: 'gudang-depan',
    namaFile: doc?.namaFile || 'Foto Tampak Depan Gudang',
    dataUrl: url,
    mimeType: doc?.mimeType || detectMimeType(url, doc?.namaFile, 'image/jpeg'),
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
    namaFile: doc?.namaFile || 'Foto Tampak Dalam Gudang',
    dataUrl: url,
    mimeType: doc?.mimeType || detectMimeType(url, doc?.namaFile, 'image/jpeg'),
  };
});

const isSubmitting = ref(false);

function buildValidationPayloads() {
  const farmerPayload: any[] = [];
  const landPayload: any[] = [];
  const proposalDocPayload: any[] = [];
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
            notes: verification.notes || '',
            details: details,
          });
        }
      }
    }
  }

  // Proposal Document Validations (SIMLUHTAN, LEGALITAS_KP, etc. excluding RAB)
  const proposalDocs = (pengajuan.value as any)?.documents || (pengajuan.value as any)?.dokumen || [];
  const aliasMap: Record<string, string> = {
    SK_CPCL: 'sk-cpcl',
    BERITA_ACARA_DOKUMEN: 'berita-acara-dokumen',
    BERITA_ACARA_LAPANGAN: 'berita-acara-lapangan',
  };

  for (const doc of proposalDocs) {
    const docIdNum = Number(String(doc.id).replace(/[^\d]/g, '')) || 0;
    const docType = (doc.document_type || doc.documentType || doc.tipeDokumen || doc.persyaratanId || '').toUpperCase().trim();
    if (docType.includes('RAB')) continue;
    const verifKey = aliasMap[docType] || docType;
    const v = verifikasiStore.getVerification(verifKey);
    if (v && v.status !== 'PENDING') {
      proposalDocPayload.push({
        dokumen_proposal_id: docIdNum,
        is_valid: v.status === 'APPROVED',
        notes: v.notes || undefined,
      });
    }
  }

  // Storage Area Validation Payload
  const storageAreaPayload: any = {};
  const gudangAlamatVerif = verifikasiStore.getVerification('gudangAlamat');
  if (gudangAlamatVerif.status !== 'PENDING') {
    storageAreaPayload.address_is_valid = gudangAlamatVerif.status === 'APPROVED';
    if (gudangAlamatVerif.notes) storageAreaPayload.address_notes = gudangAlamatVerif.notes;
  }
  const gudangKoordinatVerif = verifikasiStore.getVerification('gudangKoordinat');
  if (gudangKoordinatVerif.status !== 'PENDING') {
    storageAreaPayload.coordinate_is_valid = gudangKoordinatVerif.status === 'APPROVED';
    if (gudangKoordinatVerif.notes) storageAreaPayload.coordinate_notes = gudangKoordinatVerif.notes;
  }
  const fotoDepanVerif = verifikasiStore.getVerification('fotoTampakDepan');
  if (fotoDepanVerif.status !== 'PENDING') {
    storageAreaPayload.exterior_photo_is_valid = fotoDepanVerif.status === 'APPROVED';
    if (fotoDepanVerif.notes) storageAreaPayload.exterior_photo_notes = fotoDepanVerif.notes;
  }
  const fotoDalamVerif = verifikasiStore.getVerification('fotoTampakDalam');
  if (fotoDalamVerif.status !== 'PENDING') {
    storageAreaPayload.interior_photo_is_valid = fotoDalamVerif.status === 'APPROVED';
    if (fotoDalamVerif.notes) storageAreaPayload.interior_photo_notes = fotoDalamVerif.notes;
  }

  return { farmerPayload, landPayload, proposalDocPayload, storageAreaPayload };
}

function getStatusBadge(key: string) {
  const v = verifikasiStore.getVerification(key);
  return v.status;
}

function handleAjukanKeProvinsi() {
  if (!pengajuan.value) return;
  confirmActionType.value = 'approve';
  confirmDestination.value = 'Dinas Provinsi';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    isSubmitting.value = true;
    try {
      const { farmerPayload, landPayload, proposalDocPayload, storageAreaPayload } = buildValidationPayloads();
      if (farmerPayload.length > 0) {
        await pengusulanStore.bulkFarmerValidations(farmerPayload);
      }
      if (landPayload.length > 0) {
        await pengusulanStore.bulkLandValidations(landPayload);
      }
      if (proposalDocPayload.length > 0) {
        await pengusulanStore.bulkProposalDocumentValidations(proposalDocPayload);
      }

      if (verifikasiStore.rabItems.length > 0) {
        try {
          const items: CreateRabItemPayload[] = verifikasiStore.rabItems.map((r) => ({
            uraian: r.uraian || '-',
            volume: r.volume || r.jumlahTotal || (r.jumlahTahap1 || 0) + (r.jumlahTahap2 || 0) || 1,
            unit: r.satuan || r.unit || 'unit',
            price_per_unit: r.hargaSatuan || r.price_per_unit || 0,
            item_type: r.jenis === 'JASA' ? 'JASA' : (r.item_type as 'BARANG' | 'JASA') || 'BARANG',
            details: {
              jenis: r.jenis || '',
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
        } catch (rabErr) {
          console.warn('Gagal menyimpan RAB FINAL Kabupaten:', rabErr);
        }
      }

      const documentsToUpload: any[] = [];
      if (verifikasiStore.skCpcl) {
        documentsToUpload.push({
          ...verifikasiStore.skCpcl,
          document_type: 'SK_CPCL',
        });
      }
      if (verifikasiStore.beritaAcaraDokumen) {
        documentsToUpload.push({
          ...verifikasiStore.beritaAcaraDokumen,
          document_type: 'BERITA_ACARA_DOKUMEN',
        });
      }
      if (verifikasiStore.beritaAcaraLapangan) {
        documentsToUpload.push({
          ...verifikasiStore.beritaAcaraLapangan,
          document_type: 'BERITA_ACARA_LAPANGAN',
        });
      }

      if (documentsToUpload.length > 0) {
        const existingDocs = (pengajuan.value as any)?.documents || (pengajuan.value as any)?.dokumen || [];
        const toCreate: any[] = [];

        for (const doc of documentsToUpload) {
          const docType = (doc.document_type || '').toUpperCase().trim();
          const existing = existingDocs.find((d: any) => (d.document_type || d.tipeDokumen || d.persyaratanId || '').toUpperCase().trim() === docType);

          if (existing && existing.id) {
            await pengusulanStore.updateProposalDocument(pengajuan.value!.id, existing.id, doc);
          } else {
            toCreate.push(doc);
          }
        }

        if (toCreate.length > 0) {
          try {
            await pengusulanStore.bulkCreateProposalDocuments(pengajuan.value!.id, toCreate);
          } catch (createErr: any) {
            const errMsg = String(createErr?.message || createErr?.error?.message || createErr || '');
            if (errMsg.includes('uq_dokumen_proposals_type') || errMsg.includes('23505') || errMsg.includes('duplicate key')) {
              const latestDocsRes = await pengusulanStore.fetchProposalDocuments(pengajuan.value!.id);
              const latestDocs = (latestDocsRes as any)?.data || latestDocsRes || [];
              for (const doc of toCreate) {
                const docType = (doc.document_type || '').toUpperCase().trim();
                const existing = (Array.isArray(latestDocs) ? latestDocs : []).find((d: any) => (d.document_type || d.tipeDokumen || '').toUpperCase().trim() === docType);
                if (existing && existing.id) {
                  await pengusulanStore.updateProposalDocument(pengajuan.value!.id, existing.id, doc);
                }
              }
            } else {
              throw createErr;
            }
          }
        }
      }

      const nomenklatur = authStore.user?.nomenklatur_dinas || (authStore.user as any)?.nama_dinas || '';
      const updatePayload: any = { status: 'KAB_SUBMITTED' };
      if (nomenklatur) {
        updatePayload.nama_dinas_kabupaten = nomenklatur;
      }
      if (Object.keys(storageAreaPayload).length > 0) {
        updatePayload.storage_area = storageAreaPayload;
      }
      await pengusulanStore.updateProposal(pengajuan.value!.id, updatePayload);

      verifikasiKabStore.addSubmission({
        pengajuanId: pengajuan.value!.id,
        verifications: { ...verifikasiStore.verifications },
        skCpcl: verifikasiStore.skCpcl,
        beritaAcaraDokumen: verifikasiStore.beritaAcaraDokumen,
        beritaAcaraLapangan: verifikasiStore.beritaAcaraLapangan,
        fotoUdaraPerPekebun: { ...verifikasiStore.fotoUdaraPerPekebun },
        submittedAt: new Date().toISOString(),
      });
      pengusulanStore.updateStatus(pengajuan.value!.id, 'KAB_SUBMITTED');
      toast.success('Berkas berhasil diajukan ke Provinsi!', 'Pengajuan Berhasil');
      verifikasiStore.resetDraft();
      showConfirmModal.value = false;
      router.push('/dinas/verifikasi');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat mengajukan ke provinsi.');
    } finally {
      isSubmitting.value = false;
    }
  };
  showConfirmModal.value = true;
}

// Formatters & Computed Summaries
function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

const rabTotal = computed(() => {
  if (verifikasiStore.rabItems.length > 0) {
    return verifikasiStore.rabTotal || verifikasiStore.rabItems.reduce((acc, r: any) => acc + (r.totalHarga || (r.volume || 1) * (r.hargaSatuan || r.price_per_unit || 0)), 0);
  }
  const items = pengajuan.value?.rabItems || [];
  return items.reduce((acc: number, r: any) => acc + (Number(r.total_price) || Number(r.volume || 1) * Number(r.price_per_unit || 0)), 0);
});

interface GroupedLahan {
  id: string;
  luasLahanHektar: number;
  jenisHakLahan: string;
  nomorSuratLahan: string;
  coordinates?: any[];
}

interface GroupedCpcl {
  key: string;
  namaPekebun: string;
  nik: string;
  lahans: GroupedLahan[];
  totalLuas: number;
}

const groupedCpclList = computed<GroupedCpcl[]>(() => {
  const raw = pengajuan.value?.daftarCPCL || [];
  const map = new Map<string, GroupedCpcl>();

  for (const c of raw) {
    const key = (c.nik && String(c.nik).trim()) || (c.namaPekebun && String(c.namaPekebun).trim()) || String(c.id);
    if (!map.has(key)) {
      map.set(key, {
        key,
        namaPekebun: c.namaPekebun || 'Pekebun',
        nik: c.nik || '-',
        lahans: [],
        totalLuas: 0,
      });
    }

    const item = map.get(key)!;
    item.lahans.push({
      id: String(c.id),
      luasLahanHektar: Number(c.luasLahanHektar) || 0,
      jenisHakLahan: c.jenisHakLahan || 'Surat Lahan',
      nomorSuratLahan: c.nomorSuratLahan || '-',
      coordinates: c.coordinates,
    });
    item.totalLuas += Number(c.luasLahanHektar) || 0;
  }

  return Array.from(map.values());
});

const cpclSummary = computed(() => {
  const list = pengajuan.value?.daftarCPCL || [];
  const uniquePekebuns = groupedCpclList.value.length;
  const totalBidang = list.length;
  const totalLuas = list.reduce((sum: number, c: any) => sum + (Number(c.luasLahanHektar) || 0), 0);
  return {
    totalPekebun: uniquePekebuns,
    totalBidang,
    totalLuas: totalLuas.toFixed(2),
  };
});

const isReadyToSubmit = computed(() => {
  const hasSk = !!activeSkCpcl.value;
  return hasSk;
});

const totalLahanCount = computed(() => {
  if (pengajuan.value?.daftarCPCL?.length) return pengajuan.value.daftarCPCL.length;
  if ((pengajuan.value as any)?.lahans?.length) return (pengajuan.value as any).lahans.length;
  return 0;
});

const uploadedFotoUdaraCount = computed(() => {
  const p = pengajuan.value as any;
  const storeUploaded = verifikasiStore.fotoUdaraPerPekebun || {};
  const coveredLahanIds = new Set<string>();

  for (const k of Object.keys(storeUploaded)) {
    if (storeUploaded[k]) {
      coveredLahanIds.add(k.replace(/^CPCL-/, ''));
    }
  }

  if (p?.lahans && Array.isArray(p.lahans)) {
    for (const l of p.lahans) {
      const docs = l.documents || l.dokumen || [];
      const hasFu = docs.some((d: any) => {
        const rawType = String(d.document_type || d.documentType || d.tipeDokumen || '').toUpperCase().trim();
        return rawType === 'FOTO_UDARA' || rawType.includes('FOTO_UDARA');
      });
      if (hasFu) {
        coveredLahanIds.add(String(l.id));
      }
    }
  }

  const cpclList = p?.daftarCPCL || [];
  if (cpclList.length > 0) {
    let count = 0;
    for (const c of cpclList) {
      const cId = String(c.id);
      const cleanNum = cId.replace(/\D/g, '');
      if (coveredLahanIds.has(cId) || (cleanNum && coveredLahanIds.has(cleanNum))) {
        count++;
      }
    }
    return Math.max(count, coveredLahanIds.size);
  }

  return coveredLahanIds.size;
});

const isFotoUdaraComplete = computed(() => {
  if (totalLahanCount.value === 0) return true;
  return uploadedFotoUdaraCount.value >= totalLahanCount.value;
});

const activeSections = ref<Record<string, boolean>>({
  dokumen: true,
  cpcl: true,
  skCpcl: true,
});

function toggleSection(key: string) {
  activeSections.value[key] = !activeSections.value[key];
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Top Header Banner -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-[#066C2A] text-[10px] font-bold tracking-wider uppercase border border-emerald-200/60"> Tahap 3 Verifikasi </span>
          <span class="text-xs text-slate-400">&bull;</span>
          <span class="text-xs text-slate-500 font-medium">Finalisasi &amp; Pengajuan</span>
        </div>
        <h2 class="text-base sm:text-lg font-bold text-slate-900">Ringkasan Verifikasi &amp; Pengajuan ke Provinsi</h2>
        <p class="text-xs text-slate-500">Tinjau rekapitulasi kelengkapan berkas usulan proposal, hasil verifikasi data CPCL, dan dokumen SK CPCL sebelum diajukan ke Dinas Provinsi.</p>
      </div>

      <!-- Quick Status Pill -->
      <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
        <span v-if="isReadyToSubmit" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-200 text-xs font-bold shadow-2xs">
          <Sparkles class="w-4 h-4 text-emerald-600" />
          <span>Siap Diajukan ke Provinsi</span>
        </span>
        <span v-else class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs">
          <AlertCircle class="w-4 h-4 text-amber-600" />
          <span>Dokumen SK CPCL Belum Lengkap</span>
        </span>
      </div>
    </div>

    <!-- Bento Overview Grid: Proposal Info, Metrik, Kesiapan -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <!-- Bento 1: Profil Proposal & Kelembagaan (col-span-5) -->
      <div class="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#066C2A] border border-emerald-100 flex items-center justify-center text-2xl shrink-0">
            {{ selectedPaketInfo?.icon || '📦' }}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Paket Sarpras Usulan</span>
            <h3 class="text-sm font-bold text-slate-900 leading-snug truncate">
              {{ selectedPaketInfo?.label || pengajuan?.jenisSarpras || 'Paket Usulan' }}
            </h3>
            <span class="text-xs text-slate-500 font-medium truncate mt-0.5">
              {{ pengajuan?.lembaga?.namaLembaga || 'Kelembagaan Pemohon' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400">Nomor Proposal</span>
            <span class="font-mono font-bold text-slate-700 truncate">
              {{ pengajuan?.nomor_proposal || pengajuan?.nomorProposal || '-' }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400">Ketua Kelompok</span>
            <span class="font-semibold text-slate-700 truncate">
              {{ pengajuan?.lembaga?.namaKetua || '-' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Bento 2: Metrik Usulan CPCL & Anggaran (col-span-7) -->
      <div class="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Rekapitulasi Sasaran Usulan</span>
          <span class="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold border border-emerald-200/60"> Tingkat Kabupaten </span>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calon Pekebun</span>
            <span class="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{{ cpclSummary.totalPekebun }} Orang</span>
            <span class="text-[10px] text-slate-500">{{ cpclSummary.totalBidang }} Bidang Lahan</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Luas Usulan</span>
            <span class="text-base sm:text-lg font-bold text-emerald-800 mt-0.5">{{ cpclSummary.totalLuas }} Ha</span>
            <span class="text-[10px] text-slate-500">Kesesuaian Spasial Valid</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimasi RAB</span>
            <span class="text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate" :title="formatRupiah(rabTotal)">
              {{ formatRupiah(rabTotal) }}
            </span>
            <span class="text-[10px] text-slate-500">RAB Final Disetujui</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 1: Verifikasi Berkas Proposal & Gudang (Accordion Card) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div @click="toggleSection('dokumen')" class="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-100 flex items-center justify-center shrink-0">
            <ClipboardCheck class="w-5 h-5" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900">1. Hasil Verifikasi Berkas Proposal &amp; Sarpras</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"> Tahap 1 </span>
            </div>
            <p class="text-xs text-slate-500">Pemeriksaan dokumen persyaratan administratif, foto gudang, dan anggaran RAB.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <component :is="activeSections.dokumen ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div v-show="activeSections.dokumen" class="p-5 flex flex-col gap-3">
        <!-- Document Table / Cards -->
        <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
          <div v-for="p in currentPersyaratan" :key="p.id" class="flex items-center justify-between p-3 bg-white hover:bg-slate-50/50 transition-colors">
            <div class="flex items-center gap-2.5 min-w-0">
              <FileText class="w-4 h-4 text-slate-400 shrink-0" />
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs font-bold text-slate-800 truncate">{{ p.nama }}</span>
                <span v-if="p.wajib" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200"> Wajib </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                v-if="getPersyaratanDoc(p.id)"
                type="button"
                @click="openPreview(getPersyaratanDoc(p.id))"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>Pratinjau</span>
              </button>

              <template v-if="getStatusBadge(p.id) === 'APPROVED'">
                <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"> <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sesuai </span>
              </template>
              <template v-else-if="getStatusBadge(p.id) === 'REJECTED'">
                <span class="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg"> <XCircle class="w-3.5 h-3.5 text-rose-600" /> Ditolak </span>
              </template>
              <template v-else>
                <span class="text-[11px] text-slate-400 italic px-2">Belum diperiksa</span>
              </template>
            </div>
          </div>

          <!-- Gudang Serah Terima (Jika Paket Pupuk atau Memiliki Data Gudang) -->
          <template v-if="hasStorageArea">
            <div class="flex items-center justify-between p-3 bg-slate-50/50">
              <div class="flex items-center gap-2.5 min-w-0">
                <Warehouse class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="text-xs font-bold text-slate-800">Gudang: Alamat &amp; Titik Koordinat</span>
              </div>
              <div class="flex items-center gap-2">
                <span v-if="getStatusBadge('gudangAlamat') === 'APPROVED'" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sesuai
                </span>
                <span v-else-if="getStatusBadge('gudangAlamat') === 'REJECTED'" class="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                  <XCircle class="w-3.5 h-3.5 text-rose-600" /> Tidak Sesuai
                </span>
                <span v-else class="text-[11px] text-slate-400 italic px-2">Belum diperiksa</span>
              </div>
            </div>

            <!-- Foto Tampak Depan -->
            <div class="flex items-center justify-between p-3 bg-slate-50/50">
              <div class="flex items-center gap-2.5 min-w-0">
                <Camera class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="text-xs font-bold text-slate-800">Gudang: Foto Tampak Depan</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="exteriorPhoto?.dataUrl"
                  type="button"
                  @click="openPreview(exteriorPhoto)"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                  <span>Pratinjau</span>
                </button>
                <span v-if="getStatusBadge('fotoTampakDepan') === 'APPROVED'" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sesuai
                </span>
                <span v-else-if="getStatusBadge('fotoTampakDepan') === 'REJECTED'" class="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                  <XCircle class="w-3.5 h-3.5 text-rose-600" /> Tidak Sesuai
                </span>
                <span v-else class="text-[11px] text-slate-400 italic px-2">Belum diperiksa</span>
              </div>
            </div>

            <!-- Foto Tampak Dalam -->
            <div class="flex items-center justify-between p-3 bg-slate-50/50">
              <div class="flex items-center gap-2.5 min-w-0">
                <Camera class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="text-xs font-bold text-slate-800">Gudang: Foto Tampak Dalam</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="interiorPhoto?.dataUrl"
                  type="button"
                  @click="openPreview(interiorPhoto)"
                  class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                  <span>Pratinjau</span>
                </button>
                <span v-if="getStatusBadge('fotoTampakDalam') === 'APPROVED'" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sesuai
                </span>
                <span v-else-if="getStatusBadge('fotoTampakDalam') === 'REJECTED'" class="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                  <XCircle class="w-3.5 h-3.5 text-rose-600" /> Tidak Sesuai
                </span>
                <span v-else class="text-[11px] text-slate-400 italic px-2">Belum diperiksa</span>
              </div>
            </div>
          </template>

          <!-- RAB Status -->
          <div class="flex items-center justify-between p-3 bg-white">
            <div class="flex items-center gap-2.5 min-w-0">
              <FileText class="w-4 h-4 text-emerald-600 shrink-0" />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-800">Anggaran Biaya (RAB Usulan)</span>
                <span class="text-[10px] text-slate-500 font-mono">Total RAB: {{ formatRupiah(rabTotal) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="getPersyaratanDoc('RAB_RK')"
                type="button"
                @click="openPreview(getPersyaratanDoc('RAB_RK'))"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>Dokumen RAB</span>
              </button>
              <span class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"> <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sesuai </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Data Pekebun & Lahan CPCL (Accordion Card) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div @click="toggleSection('cpcl')" class="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <Users class="w-5 h-5" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900">2. Calon Pekebun &amp; Calon Lahan (CPCL)</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"> {{ cpclSummary.totalPekebun }} Pekebun &bull; {{ cpclSummary.totalLuas }} Ha </span>
            </div>
            <p class="text-xs text-slate-500">Hasil verifikasi NIK, KTP, KK, legalitas hak atas tanah, dan foto udara lahan.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <component :is="activeSections.cpcl ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div v-show="activeSections.cpcl" class="p-5 flex flex-col gap-4">
        <!-- Foto Udara per Pekebun Summary Banner -->
        <div class="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <Camera class="w-4 h-4 text-[#066C2A]" />
            <span class="font-bold text-slate-800">Lampiran Foto Udara Lahan:</span>
            <span class="text-slate-600 font-medium"> {{ uploadedFotoUdaraCount }} dari {{ totalLahanCount }} lahan terlampir </span>
          </div>
          <span v-if="isFotoUdaraComplete && uploadedFotoUdaraCount > 0" class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"> Foto Udara Lengkap </span>
          <span v-else-if="uploadedFotoUdaraCount > 0" class="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200"> Sebagian Terunggah </span>
          <span v-else class="text-[11px] text-slate-400 italic">Opsional / Belum Diunggah</span>
        </div>

        <!-- CPCL Reference Table Grouped by Pekebun -->
        <div v-if="groupedCpclList.length" class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-800 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3 w-12 text-center">No</th>
                <th class="p-3">Nama Pekebun &amp; NIK</th>
                <th class="p-3">Rincian Bidang Kebun</th>
                <th class="p-3 text-right">Total Luas</th>
                <th class="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(p, idx) in groupedCpclList" :key="p.key" class="hover:bg-slate-50/70">
                <td class="p-3 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
                <td class="p-3">
                  <div class="flex flex-col min-w-0">
                    <span class="font-bold text-slate-900 text-xs">{{ p.namaPekebun }}</span>
                    <span class="font-mono text-[10px] text-slate-500">NIK: {{ p.nik }}</span>
                  </div>
                </td>
                <td class="p-3">
                  <div class="flex flex-col gap-1">
                    <div v-for="(l, lIdx) in p.lahans" :key="l.id" class="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      <span class="font-bold text-slate-700">Bidang {{ lIdx + 1 }}:</span>
                      <span class="font-bold text-emerald-800 font-mono">{{ l.luasLahanHektar }} Ha</span>
                      <span class="text-slate-400">&bull;</span>
                      <span class="text-slate-500">{{ l.jenisHakLahan }} ({{ l.nomorSuratLahan }})</span>
                    </div>
                  </div>
                </td>
                <td class="p-3 text-right font-bold text-emerald-800 font-mono text-xs">{{ p.totalLuas.toFixed(2) }} Ha</td>
                <td class="p-3 text-center">
                  <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"> <Check class="w-3 h-3" /> Valid </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Section 3: Dokumen Pengesahan SK CPCL & Berita Acara (Accordion Card) -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div @click="toggleSection('skCpcl')" class="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-slate-900">3. Dokumen Pengesahan SK CPCL &amp; Berita Acara</h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800"> Tahap 2 </span>
            </div>
            <p class="text-xs text-slate-500">Surat Keputusan penetapan CPCL serta Berita Acara hasil verifikasi lapangan.</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <component :is="activeSections.skCpcl ? ChevronUp : ChevronDown" class="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div v-show="activeSections.skCpcl" class="p-5 flex flex-col gap-3">
        <!-- Card: SK CPCL (Mandatory) -->
        <div class="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 truncate">Surat Keputusan (SK) CPCL Ditandatangani</span>
                <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">Wajib</span>
              </div>
              <template v-if="activeSkCpcl">
                <span class="text-[11px] text-slate-500 font-mono truncate"> {{ activeSkCpcl.namaFile }} ({{ (activeSkCpcl.ukuranBytes / 1024).toFixed(0) }} KB) </span>
                <span v-if="activeSkCpcl.uploadedBy" class="text-[11px] text-slate-500"> Diunggah oleh {{ activeSkCpcl.uploadedBy }}<span v-if="activeSkCpcl.uploadedAtFormatted"> &bull; {{ activeSkCpcl.uploadedAtFormatted }}</span> </span>
              </template>
              <span v-else class="text-[11px] text-rose-500 italic">Belum diunggah</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              v-if="activeSkCpcl"
              type="button"
              @click="openPreview(activeSkCpcl)"
              class="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
              <span>Pratinjau</span>
            </button>
            <span v-if="activeSkCpcl" class="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg"> <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Siap Diajukan </span>
            <span v-else class="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg"> <AlertCircle class="w-3.5 h-3.5 text-rose-500" /> Belum Diunggah </span>
          </div>
        </div>

        <!-- Card: Berita Acara Verifikasi Dokumen -->
        <div class="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-900 truncate">Berita Acara Verifikasi Dokumen</span>
              <template v-if="activeBeritaAcaraDokumen">
                <span class="text-[11px] text-slate-500 font-mono truncate"> {{ activeBeritaAcaraDokumen.namaFile }} ({{ (activeBeritaAcaraDokumen.ukuranBytes / 1024).toFixed(0) }} KB) </span>
                <span v-if="activeBeritaAcaraDokumen.uploadedBy" class="text-[11px] text-slate-500"> Diunggah oleh {{ activeBeritaAcaraDokumen.uploadedBy }}<span v-if="activeBeritaAcaraDokumen.uploadedAtFormatted"> &bull; {{ activeBeritaAcaraDokumen.uploadedAtFormatted }}</span> </span>
              </template>
              <span v-else class="text-[11px] text-slate-400 italic">Dokumen pendukung opsional</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              v-if="activeBeritaAcaraDokumen"
              type="button"
              @click="openPreview(activeBeritaAcaraDokumen)"
              class="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
              <span>Pratinjau</span>
            </button>
            <span v-if="activeBeritaAcaraDokumen" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Terlampir
            </span>
          </div>
        </div>

        <!-- Card: Berita Acara Verifikasi Lapangan -->
        <div class="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-900 truncate">Berita Acara Verifikasi Lapangan</span>
              <template v-if="activeBeritaAcaraLapangan">
                <span class="text-[11px] text-slate-500 font-mono truncate"> {{ activeBeritaAcaraLapangan.namaFile }} ({{ (activeBeritaAcaraLapangan.ukuranBytes / 1024).toFixed(0) }} KB) </span>
                <span v-if="activeBeritaAcaraLapangan.uploadedBy" class="text-[11px] text-slate-500"> Diunggah oleh {{ activeBeritaAcaraLapangan.uploadedBy }}<span v-if="activeBeritaAcaraLapangan.uploadedAtFormatted"> &bull; {{ activeBeritaAcaraLapangan.uploadedAtFormatted }}</span> </span>
              </template>
              <span v-else class="text-[11px] text-slate-400 italic">Dokumen pendukung opsional</span>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              v-if="activeBeritaAcaraLapangan"
              type="button"
              @click="openPreview(activeBeritaAcaraLapangan)"
              class="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
              <span>Pratinjau</span>
            </button>
            <span v-if="activeBeritaAcaraLapangan" class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Terlampir
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Navigation Bar -->
    <div class="sticky bottom-4 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <button
        type="button"
        @click="verifikasiStore.currentStep = 3"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Kembali ke Unggah SK CPCL</span>
      </button>

      <div class="flex items-center gap-3">
        <span v-if="!isReadyToSubmit" class="text-xs text-amber-700 font-medium hidden md:inline"> Lengkapi unggah dokumen SK CPCL di Tahap 2 untuk melanjutkan </span>

        <button
          type="button"
          @click="handleAjukanKeProvinsi()"
          :disabled="isSubmitting || !isReadyToSubmit"
          :class="[
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer shadow-emerald-900/20',
            isReadyToSubmit && !isSubmitting ? 'bg-[#066C2A] text-white hover:bg-emerald-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed',
          ]"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
          <template v-else>
            <Send class="w-4 h-4" />
            <span>Ajukan Berkas ke Dinas Provinsi</span>
          </template>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <ApprovalConfirmationModal
      ref="confirmModalRef"
      :is-open="showConfirmModal"
      :action-type="confirmActionType"
      :destination-stage="confirmDestination"
      :notes="confirmNotes"
      @close="showConfirmModal = false"
      @confirm="executePendingAction"
    />

    <DocumentPreviewModal :is-open="showPreview && !!previewDoc" :title="previewDoc?.title ?? ''" :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? 'application/octet-stream'" @close="showPreview = false" />
  </div>
</template>
