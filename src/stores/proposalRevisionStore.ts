import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { proposalService } from '@/services/proposal.service';
import { useToast } from '@/composables/useToast';
import { LOCALIZATION } from '@/config/localization';

export interface RevisionDocumentItem {
  id: number;
  proposal_id: number;
  file_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: string;
  file_extension: string;
  mime_type: string;
  validation?: {
    id: number;
    is_valid: boolean;
    notes?: string | null;
    validated_by_role?: string | null;
  } | null;
  is_updated?: boolean;
}

export interface CategorizedRejectionItem {
  category: 'PROPOSAL_DOC' | 'GUDANG' | 'PEKEBUN' | 'RAB';
  target_id: number;
  target_key: string;
  item_label: string;
  notes: string;
  is_resolved?: boolean;
  farmer_id?: number;
  farmer_name?: string;
  farmer_nik?: string;
  lahan_id?: number;
  field_name?: string;
  document_type?: string;
  current_value?: string;
}

export interface FarmerRejectedField {
  fieldName: string;
  label: string;
  notes: string;
  currentValue?: string;
}

export interface FarmerRejectedDoc {
  documentType: string;
  label: string;
  notes: string;
  docId?: number;
  fileUrl?: string;
}

export interface LandRejectedGroup {
  lahanId: number;
  lahanLabel: string;
  rejectedFields: FarmerRejectedField[];
  rejectedDocs: FarmerRejectedDoc[];
}

export interface RejectedFarmerGroup {
  farmerId: number;
  farmerName: string;
  farmerNik: string;
  rejectedFields: FarmerRejectedField[];
  rejectedDocs: FarmerRejectedDoc[];
  rejectedLands: LandRejectedGroup[];
}

export const useProposalRevisionStore = defineStore('proposalRevision', () => {
  const toast = useToast();

  const proposalId = ref<number | null>(null);
  const proposalData = ref<any | null>(null);
  const revisionDocuments = ref<RevisionDocumentItem[]>([]);
  const categorizedRejections = ref<CategorizedRejectionItem[]>([]);
  
  const updatedFilesMap = ref<Record<number, number>>({});
  const updatedFarmerFilesMap = ref<Record<string, number>>({}); // key: `${farmerId}-${docType}` or docId
  const updatedLandFilesMap = ref<Record<string, number>>({}); // key: `${lahanId}-${docType}` or docId
  const updatedFarmerDataMap = ref<Record<number, { name?: string; nik?: string; nomor_kk?: string; address?: string; phone_number?: string }>>({});
  const updatedLandDataMap = ref<Record<number, { luas_lahan?: number; jenis_legalitas?: string; nomor_legalitas?: string; nomor_surat_beda_nama?: string; coordinates?: string; polygon?: string }>>({});
  const updatedRabSignedFileId = ref<number | null>(null);
  const updatedRabItemsMap = ref<Record<number, { rab_item_id: number; uraian?: string; volume?: number; unit?: string; price_per_unit?: number }>>({});

  const isLoading = ref<boolean>(false);
  const isSubmitting = ref<boolean>(false);
  const isDrafting = ref<boolean>(false);

  const rejectedDocuments = computed(() => {
    return revisionDocuments.value.filter(
      (doc) => doc.validation && doc.validation.is_valid === false
    );
  });

  const rejectedFarmerList = computed<RejectedFarmerGroup[]>(() => {
    const farmerMap = new Map<number, RejectedFarmerGroup>();
    const farmerRejections = categorizedRejections.value.filter((i) => i.category === 'PEKEBUN');

    for (const item of farmerRejections) {
      const fId = item.farmer_id || item.target_id;
      if (!fId) continue;

      if (!farmerMap.has(fId)) {
        // Look up farmer name and NIK from proposalData if available
        const foundFarmer = (proposalData.value?.pekebuns || proposalData.value?.daftarCPCL || []).find(
          (p: any) => Number(p.id) === Number(fId) || p.nik === item.farmer_nik
        );
        farmerMap.set(fId, {
          farmerId: fId,
          farmerName: item.farmer_name || foundFarmer?.namaPekebun || foundFarmer?.name || 'Pekebun',
          farmerNik: item.farmer_nik || foundFarmer?.nik || '-',
          rejectedFields: [],
          rejectedDocs: [],
          rejectedLands: [],
        });
      }

      const group = farmerMap.get(fId)!;

      if (item.lahan_id) {
        // Rejection is associated with a land plot
        let landGroup = group.rejectedLands.find((l) => l.lahanId === item.lahan_id);
        if (!landGroup) {
          const landIdx = group.rejectedLands.length + 1;
          landGroup = {
            lahanId: item.lahan_id,
            lahanLabel: `Lahan ${landIdx}`,
            rejectedFields: [],
            rejectedDocs: [],
          };
          group.rejectedLands.push(landGroup);
        }

        if (item.field_name) {
          landGroup.rejectedFields.push({
            fieldName: item.field_name,
            label: item.item_label || item.field_name,
            notes: item.notes,
            currentValue: item.current_value,
          });
        } else if (item.document_type) {
          landGroup.rejectedDocs.push({
            documentType: item.document_type,
            label: item.item_label || item.document_type,
            notes: item.notes,
            docId: item.target_id,
          });
        }
      } else {
        // Rejection is on farmer profile / documents
        if (item.field_name) {
          group.rejectedFields.push({
            fieldName: item.field_name,
            label: item.item_label || item.field_name,
            notes: item.notes,
            currentValue: item.current_value,
          });
        } else if (item.document_type) {
          group.rejectedDocs.push({
            documentType: item.document_type,
            label: item.item_label || item.document_type,
            notes: item.notes,
            docId: item.target_id,
          });
        } else {
          // Fallback if item is generic doc
          group.rejectedDocs.push({
            documentType: 'DOCUMENT',
            label: item.item_label || 'Dokumen Pekebun',
            notes: item.notes,
            docId: item.target_id,
          });
        }
      }
    }

    return Array.from(farmerMap.values());
  });

  const unresolvedRejectedCount = computed(() => {
    let count = 0;
    const resolvedProposalDocIds = new Set<number>();

    // Proposal docs (including RAB docs present in revisionDocuments)
    for (const doc of rejectedDocuments.value) {
      if (updatedFilesMap.value[doc.id] || doc.is_updated) {
        resolvedProposalDocIds.add(doc.id);
      } else {
        count++;
      }
    }

    // Categorized rejections (Pekebun, Land, Gudang, RAB)
    for (const item of categorizedRejections.value) {
      if (item.category === 'PEKEBUN') {
        const isResolved = isFarmerItemResolved(item);
        if (!isResolved) count++;
      } else if (item.category === 'RAB') {
        if (item.target_id && rejectedDocuments.value.some((d) => d.id === item.target_id)) {
          continue;
        }
        if (!updatedRabSignedFileId.value && !item.is_resolved) count++;
      }
    }

    return count;
  });

  function isFarmerItemResolved(item: CategorizedRejectionItem): boolean {
    if (item.is_resolved) return true;
    const fId = item.farmer_id || item.target_id;

    if (item.lahan_id) {
      const lId = item.lahan_id;
      if (item.document_type) {
        const key1 = `${lId}-${item.document_type}`;
        const key2 = String(item.target_id);
        return Boolean(updatedLandFilesMap.value[key1] || updatedLandFilesMap.value[key2]);
      }
      if (item.field_name) {
        const landData = updatedLandDataMap.value[lId];
        return Boolean(landData && (landData as any)[item.field_name] !== undefined);
      }
    } else {
      if (item.document_type) {
        const key1 = `${fId}-${item.document_type}`;
        const key2 = String(item.target_id);
        return Boolean(updatedFarmerFilesMap.value[key1] || updatedFarmerFilesMap.value[key2]);
      }
      if (item.field_name) {
        const farmerData = updatedFarmerDataMap.value[fId];
        return Boolean(farmerData && (farmerData as any)[item.field_name] !== undefined && String((farmerData as any)[item.field_name]).trim() !== '');
      }
    }

    return false;
  }

  function isFarmerGroupResolved(group: RejectedFarmerGroup): boolean {
    for (const field of group.rejectedFields) {
      const farmerData = updatedFarmerDataMap.value[group.farmerId];
      if (!farmerData || (farmerData as any)[field.fieldName] === undefined || String((farmerData as any)[field.fieldName]).trim() === '') {
        return false;
      }
    }
    for (const doc of group.rejectedDocs) {
      const key1 = `${group.farmerId}-${doc.documentType}`;
      const key2 = doc.docId ? String(doc.docId) : '';
      if (!updatedFarmerFilesMap.value[key1] && (!key2 || !updatedFarmerFilesMap.value[key2])) {
        return false;
      }
    }
    for (const land of group.rejectedLands) {
      for (const field of land.rejectedFields) {
        const landData = updatedLandDataMap.value[land.lahanId];
        if (!landData || (landData as any)[field.fieldName] === undefined) {
          return false;
        }
      }
      for (const doc of land.rejectedDocs) {
        const key1 = `${land.lahanId}-${doc.documentType}`;
        const key2 = doc.docId ? String(doc.docId) : '';
        if (!updatedLandFilesMap.value[key1] && (!key2 || !updatedLandFilesMap.value[key2])) {
          return false;
        }
      }
    }
    return true;
  }

  const isAllRejectedResolved = computed(() => {
    return unresolvedRejectedCount.value === 0;
  });

  async function loadRevisionDetail(id: number | string) {
    isLoading.value = true;
    try {
      const res = await proposalService.getRevisionDetail(id);
      const data = res?.data || res;
      proposalData.value = data;
      proposalId.value = Number(id);

      if (data?.revision_documents && Array.isArray(data.revision_documents)) {
        revisionDocuments.value = data.revision_documents;
      } else if (data?.documents && Array.isArray(data.documents)) {
        revisionDocuments.value = data.documents;
      }

      if (data?.categorized_rejections && Array.isArray(data.categorized_rejections)) {
        categorizedRejections.value = data.categorized_rejections;
      } else {
        categorizedRejections.value = [];
      }

      updatedFilesMap.value = {};
      updatedFarmerFilesMap.value = {};
      updatedLandFilesMap.value = {};
      updatedRabSignedFileId.value = null;
      updatedRabItemsMap.value = {};
    } catch (err: any) {
      console.error('Failed to load proposal revision detail:', err);
      toast.error(err?.message || 'Gagal memuat detail revisi proposal');
    } finally {
      isLoading.value = false;
    }
  }

  function setPendingReplacement(docId: number, fileId: number) {
    updatedFilesMap.value[docId] = fileId;
    const targetDoc = revisionDocuments.value.find((d) => d.id === docId);
    if (targetDoc) {
      targetDoc.file_id = fileId;
      targetDoc.is_updated = true;

      const docTypeUpper = String(targetDoc.document_type || '').toUpperCase();
      if (docTypeUpper.includes('RAB')) {
        updatedRabSignedFileId.value = fileId;
        categorizedRejections.value.forEach((i) => {
          if (i.category === 'RAB' || i.target_id === docId) {
            i.is_resolved = true;
          }
        });
      }
    }

    categorizedRejections.value.forEach((i) => {
      if (i.target_id === docId) {
        i.is_resolved = true;
      }
    });

    toast.success('Berkas berhasil dipilih untuk dikirim bersama usulan');
  }

  function setFarmerFieldEdit(farmerId: number, fieldName: string, value: string) {
    if (!updatedFarmerDataMap.value[farmerId]) {
      updatedFarmerDataMap.value[farmerId] = {};
    }
    (updatedFarmerDataMap.value[farmerId] as any)[fieldName] = value;

    categorizedRejections.value.forEach((i) => {
      if (i.category === 'PEKEBUN' && (i.farmer_id === farmerId || i.target_id === farmerId) && i.field_name === fieldName) {
        i.is_resolved = String(value || '').trim() !== '';
      }
    });
  }

  function setLandFieldEdit(lahanId: number, fieldName: string, value: any) {
    if (!updatedLandDataMap.value[lahanId]) {
      updatedLandDataMap.value[lahanId] = {};
    }
    (updatedLandDataMap.value[lahanId] as any)[fieldName] = value;

    categorizedRejections.value.forEach((i) => {
      if (i.category === 'PEKEBUN' && i.lahan_id === lahanId && i.field_name === fieldName) {
        i.is_resolved = value !== undefined && value !== '';
      }
    });
  }

  function setPendingFarmerReplacement(farmerDocId: number, fileId: number) {
    updatedFarmerFilesMap.value[String(farmerDocId)] = fileId;
    const targetItem = categorizedRejections.value.find((i) => i.target_id === farmerDocId && i.category === 'PEKEBUN');
    if (targetItem) targetItem.is_resolved = true;
    toast.success(LOCALIZATION.proposalRevision?.farmerDocUpdated || 'Dokumen pekebun berhasil diperbarui');
  }

  function setPendingFarmerDocReplacement(farmerId: number, docType: string, fileId: number, targetDocId?: number) {
    const key = `${farmerId}-${docType}`;
    updatedFarmerFilesMap.value[key] = fileId;
    if (targetDocId) {
      updatedFarmerFilesMap.value[String(targetDocId)] = fileId;
    }

    categorizedRejections.value.forEach((i) => {
      if (
        i.category === 'PEKEBUN' &&
        (i.farmer_id === farmerId || i.target_id === farmerId) &&
        (i.document_type === docType || (targetDocId && i.target_id === targetDocId))
      ) {
        i.is_resolved = true;
      }
    });

    toast.success(LOCALIZATION.proposalRevision?.uploadFarmerDocSuccess || 'Berkas pekebun berhasil diperbarui');
  }

  function setPendingLandReplacement(landDocId: number, fileId: number) {
    updatedLandFilesMap.value[String(landDocId)] = fileId;
    const targetItem = categorizedRejections.value.find((i) => i.target_id === landDocId && i.category === 'PEKEBUN');
    if (targetItem) targetItem.is_resolved = true;
    toast.success(LOCALIZATION.proposalRevision?.uploadLandDocSuccess || 'Dokumen legalitas lahan berhasil diperbarui');
  }

  function setPendingLandDocReplacement(lahanId: number, docType: string, fileId: number, targetDocId?: number) {
    const key = `${lahanId}-${docType}`;
    updatedLandFilesMap.value[key] = fileId;
    if (targetDocId) {
      updatedLandFilesMap.value[String(targetDocId)] = fileId;
    }

    categorizedRejections.value.forEach((i) => {
      if (
        i.category === 'PEKEBUN' &&
        i.lahan_id === lahanId &&
        (i.document_type === docType || (targetDocId && i.target_id === targetDocId))
      ) {
        i.is_resolved = true;
      }
    });

    toast.success(LOCALIZATION.proposalRevision?.uploadLandDocSuccess || 'Dokumen legalitas lahan berhasil diperbarui');
  }

  function setPendingRabSignedReplacement(fileId: number, docId?: number) {
    updatedRabSignedFileId.value = fileId;

    let targetDoc = docId ? revisionDocuments.value.find((d) => d.id === docId) : null;
    if (!targetDoc) {
      targetDoc = revisionDocuments.value.find((d) => {
        const t = String(d.document_type || '').toUpperCase();
        return t === 'RAB_PROPOSAL' || t === 'RAB_RK' || t === 'RAB_SIGNED' || t.includes('RAB');
      }) || null;
    }

    if (targetDoc) {
      updatedFilesMap.value[targetDoc.id] = fileId;
      targetDoc.file_id = fileId;
      targetDoc.is_updated = true;
    }

    categorizedRejections.value.forEach((i) => {
      if (i.category === 'RAB' || (targetDoc && i.target_id === targetDoc.id)) {
        i.is_resolved = true;
      }
    });

    toast.success(LOCALIZATION.proposalRevision?.rabSignedUpdated || 'Dokumen RAB bertandatangan berhasil diperbarui');
  }


  function setPendingRabItemEdit(rabItemId: number, editPayload: { uraian?: string; volume?: number; unit?: string; price_per_unit?: number }) {
    updatedRabItemsMap.value[rabItemId] = { rab_item_id: rabItemId, ...editPayload };
    const targetItem = categorizedRejections.value.find((i) => i.target_id === rabItemId && i.category === 'RAB');
    if (targetItem) targetItem.is_resolved = true;
    toast.success(LOCALIZATION.proposalRevision?.rabItemUpdated || 'Rincian RAB berhasil diperbarui');
  }

  async function replaceRejectedDocument(docId: number, newFileId: number) {
    if (!proposalId.value) return false;
    try {
      await proposalService.replaceRejectedDocument(proposalId.value, docId, newFileId);
      updatedFilesMap.value[docId] = newFileId;

      const targetDoc = revisionDocuments.value.find((d) => d.id === docId);
      if (targetDoc) {
        targetDoc.file_id = newFileId;
        targetDoc.is_updated = true;
      }
      toast.success('Dokumen berhasil diperbarui');
      return true;
    } catch (err: any) {
      console.error('Failed to replace document:', err);
      toast.error(err?.message || 'Gagal memperbarui dokumen');
      return false;
    }
  }

  async function submitRevision(storageAreaPayload?: {
    address?: string;
    coordinate?: string;
    exterior_photo_file_id?: number;
    interior_photo_file_id?: number;
  }) {
    if (!proposalId.value) return false;
    if (!isAllRejectedResolved.value) {
      toast.warning(LOCALIZATION.proposalRevision.incompleteWarning);
      return false;
    }

    isSubmitting.value = true;
    try {
      const payloadDocs = Object.entries(updatedFilesMap.value).map(([docId, fileId]) => ({
        dokumen_proposal_id: Number(docId),
        file_id: fileId,
      }));

      const payloadFarmerDocs = Object.entries(updatedFarmerFilesMap.value).map(([key, fileId]) => {
        if (key.includes('-')) {
          const [fIdStr, ...docTypeParts] = key.split('-');
          return {
            pekebun_id: Number(fIdStr),
            document_type: docTypeParts.join('-'),
            file_id: fileId,
          };
        }
        return {
          farmer_document_id: Number(key),
          file_id: fileId,
        };
      });

      const payloadLandDocs = Object.entries(updatedLandFilesMap.value).map(([key, fileId]) => {
        if (key.includes('-')) {
          const [lIdStr, ...docTypeParts] = key.split('-');
          return {
            lahan_id: Number(lIdStr),
            document_type: docTypeParts.join('-'),
            file_id: fileId,
          };
        }
        return {
          land_document_id: Number(key),
          file_id: fileId,
        };
      });

      const payloadFarmerData = Object.entries(updatedFarmerDataMap.value).map(([id, d]) => ({
        farmer_id: Number(id),
        ...d,
      }));

      const payloadLandData = Object.entries(updatedLandDataMap.value).map(([id, d]) => ({
        land_id: Number(id),
        ...d,
      }));

      const payloadRabSigned = updatedRabSignedFileId.value
        ? { rab_proposal_id: Number(proposalData.value?.rab_proposal?.id || 0), file_id: updatedRabSignedFileId.value }
        : undefined;

      const payloadRabItems = Object.values(updatedRabItemsMap.value);

      await proposalService.resubmitProposal(
        proposalId.value,
        payloadDocs,
        storageAreaPayload,
        payloadFarmerDocs,
        payloadLandDocs,
        payloadRabSigned,
        payloadRabItems,
        payloadFarmerData,
        payloadLandData
      );
      toast.success(LOCALIZATION.proposalRevision.resubmitSuccess);
      return true;
    } catch (err: any) {
      console.error('Failed to resubmit proposal revision:', err);
      toast.error(err?.message || 'Gagal mengirim ulang usulan proposal');
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function saveDraftRevision(storageAreaPayload?: any): Promise<boolean> {
    if (!proposalId.value) {
      toast.error('ID proposal tidak ditemukan');
      return false;
    }

    isDrafting.value = true;
    try {
      const payloadDocs = Object.entries(updatedFilesMap.value).map(([docId, fileId]) => ({
        dokumen_proposal_id: Number(docId),
        file_id: fileId,
      }));

      const payloadFarmerDocs = Object.entries(updatedFarmerFilesMap.value).map(([key, fileId]) => {
        if (key.includes('-')) {
          const [fIdStr, ...docTypeParts] = key.split('-');
          return {
            pekebun_id: Number(fIdStr),
            document_type: docTypeParts.join('-'),
            file_id: fileId,
          };
        }
        return {
          farmer_document_id: Number(key),
          file_id: fileId,
        };
      });

      const payloadLandDocs = Object.entries(updatedLandFilesMap.value).map(([key, fileId]) => {
        if (key.includes('-')) {
          const [lIdStr, ...docTypeParts] = key.split('-');
          return {
            lahan_id: Number(lIdStr),
            document_type: docTypeParts.join('-'),
            file_id: fileId,
          };
        }
        return {
          land_document_id: Number(key),
          file_id: fileId,
        };
      });

      const payloadFarmerData = Object.entries(updatedFarmerDataMap.value).map(([id, d]) => ({
        farmer_id: Number(id),
        ...d,
      }));

      const payloadLandData = Object.entries(updatedLandDataMap.value).map(([id, d]) => ({
        land_id: Number(id),
        ...d,
      }));

      const payloadRabSigned = updatedRabSignedFileId.value
        ? { rab_proposal_id: Number(proposalData.value?.rab_proposal?.id || 0), file_id: updatedRabSignedFileId.value }
        : undefined;

      const payloadRabItems = Object.values(updatedRabItemsMap.value);

      await proposalService.resubmitProposal(
        proposalId.value,
        payloadDocs,
        storageAreaPayload,
        payloadFarmerDocs,
        payloadLandDocs,
        payloadRabSigned,
        payloadRabItems,
        payloadFarmerData,
        payloadLandData,
        true // isDraft
      );
      toast.success('Draf revisi berhasil disimpan');
      return true;
    } catch (err: any) {
      console.error('Failed to save draft proposal revision:', err);
      toast.error(err?.message || 'Gagal menyimpan draf revisi proposal');
      return false;
    } finally {
      isDrafting.value = false;
    }
  }

  return {
    proposalId,
    proposalData,
    revisionDocuments,
    categorizedRejections,
    updatedFilesMap,
    updatedFarmerFilesMap,
    updatedLandFilesMap,
    updatedFarmerDataMap,
    updatedLandDataMap,
    updatedRabSignedFileId,
    updatedRabItemsMap,
    isLoading,
    isSubmitting,
    isDrafting,
    rejectedDocuments,
    rejectedFarmerList,
    unresolvedRejectedCount,
    isAllRejectedResolved,
    isFarmerItemResolved,
    isFarmerGroupResolved,
    loadRevisionDetail,
    setPendingReplacement,
    setFarmerFieldEdit,
    setLandFieldEdit,
    setPendingFarmerReplacement,
    setPendingFarmerDocReplacement,
    setPendingLandReplacement,
    setPendingLandDocReplacement,
    setPendingRabSignedReplacement,
    setPendingRabItemEdit,
    replaceRejectedDocument,
    submitRevision,
    saveDraftRevision,
  };
});
