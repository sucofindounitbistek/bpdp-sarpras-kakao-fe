import { defineStore } from 'pinia';
import { ref } from 'vue';
import { proposalService, extractFileObject } from '@/services/proposal.service';
import { usePengusulanStore } from '@/stores/pengusulan';

export const useVerifikasiBPDPStore = defineStore('verifikasi-bpdp', () => {
  const isSubmitting = ref(false);

  /**
   * Submit proposal to BPDP Approval (Kadiv BPDP):
   * 1. Bulk validate proposal documents (proposalService.bulkProposalValidations)
   * 2. Upload single document with bulkCreateDocuments for document "KEPUTUSAN_KELAYAKAN"
   * 3. Change proposal status to "BPDP_VERIF_SUBMITTED" (proposalService.update)
   */
  async function submitToBPDPApproval(
    proposalId: string | number,
    data: {
      validations?: any[];
      kelayakanFile?: File | Blob | any;
      kelayakanDocId?: number | string;
      notes?: string;
    }
  ) {
    const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
    isSubmitting.value = true;
    try {
      // (1) Bulk validate proposal documents
      if (data.validations && data.validations.length > 0) {
        await proposalService.bulkProposalValidations(data.validations);
      }

      // (2) Upload or update single document for document "KEPUTUSAN_KELAYAKAN"
      const fileObj = extractFileObject(data.kelayakanFile);
      if (fileObj) {
        let docId = data.kelayakanDocId;

        // If docId not passed, attempt to find existing KEPUTUSAN_KELAYAKAN document from proposal
        if (!docId) {
          try {
            const proposalData = await proposalService.getById(numId);
            const docs = (proposalData as any)?.data?.documents || (proposalData as any)?.documents || (proposalData as any)?.dokumen || [];
            const found = docs.find((d: any) => {
              const dt = String(d.document_type || d.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
              return dt === 'KEPUTUSANKELAYAKAN' || dt === 'KELAYAKAN' || dt === 'LAPORANKELAYAKAN';
            });
            if (found?.id) {
              docId = found.id;
            }
          } catch (err) {
            console.warn('[verifikasiBPDP] Error finding existing kelayakan doc:', err);
          }
        }

        if (docId) {
          // If document already exists and changed, update single document
          await proposalService.updateProposalDocument(numId, docId, {
            document_type: 'KEPUTUSAN_KELAYAKAN',
            file: fileObj,
          });
        } else {
          // Otherwise create single document
          await proposalService.bulkCreateDocuments(numId, [
            {
              document_type: 'KEPUTUSAN_KELAYAKAN',
              file: fileObj,
            },
          ]);
        }
      }

      // (3) Change status proposal to "BPDP_VERIF_SUBMITTED"
      const res = await proposalService.update(numId, {
        status: 'BPDP_VERIF_SUBMITTED',
      });

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(
        String(proposalId),
        'BPDP_VERIF_SUBMITTED',
        data.notes || 'Diajukan Laporan Kelayakan ke Kadiv BPDP'
      );

      return res;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Approve proposal by Kadiv BPDP (forward to SK Dirut / Pleno):
   * 1. Validate KEPUTUSAN_KELAYAKAN document (if docId provided) with is_valid: true, validated_by_role: 'BPDP_APPROVAL'
   * 2. Update status proposal to "BPDP_APPR_SUBMITTED"
   */
  async function approveByKadiv(
    proposalId: string | number,
    data?: {
      validations?: any[];
      kelayakanDocId?: number | string;
      notes?: string;
    }
  ) {
    const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
    isSubmitting.value = true;
    try {
      const validationPayloads = data?.validations || [];
      if (validationPayloads.length === 0 && data?.kelayakanDocId) {
        validationPayloads.push({
          dokumen_proposal_id: Number(data.kelayakanDocId),
          proposal_document_id: Number(data.kelayakanDocId),
          pengajuan_id: numId,
          proposal_id: numId,
          document_type: 'KEPUTUSAN_KELAYAKAN',
          is_valid: true,
          notes: data.notes || '',
          validated_by_role: 'BPDP_APPROVAL',
        });
      }

      if (validationPayloads.length > 0) {
        await proposalService.bulkProposalValidations(validationPayloads);
      }

      const res = await proposalService.update(numId, {
        status: 'BPDP_APPR_SUBMITTED',
      });

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(
        String(proposalId),
        'BPDP_APPR_SUBMITTED',
        data?.notes || 'Laporan kelayakan usulan disetujui Kadiv BPDP'
      );

      return res;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Submit proposal for revision from BPDP Approval (Kadiv BPDP):
   * 1. Validate proposal document for "KEPUTUSAN_KELAYAKAN" by role "BPDP_APPROVAL"
   * 2. Change status to "REV_FROM_BPDP_APPR" (to BPDP Verifikator) or "REV_FROM_BPDP_VERIF" (to Ditjenbun Approval)
   */
  async function submitForRevision(
    proposalId: string | number,
    data: {
      validations?: any[];
      kelayakanDocId?: number | string;
      notes: string;
      status?: 'REV_FROM_BPDP_APPR' | 'REV_FROM_BPDP_VERIF' | string;
    }
  ) {
    const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
    const targetStatus = data.status || 'REV_FROM_BPDP_APPR';
    isSubmitting.value = true;
    try {
      const validationPayloads = data.validations && data.validations.length > 0 ? data.validations : [];
      if (validationPayloads.length === 0 && data.kelayakanDocId) {
        validationPayloads.push({
          dokumen_proposal_id: Number(data.kelayakanDocId),
          proposal_document_id: Number(data.kelayakanDocId),
          pengajuan_id: numId,
          proposal_id: numId,
          document_type: 'KEPUTUSAN_KELAYAKAN',
          is_valid: false,
          notes: data.notes,
          validated_by_role: 'BPDP_APPROVAL',
        });
      }

      if (validationPayloads.length > 0) {
        await proposalService.bulkProposalValidations(validationPayloads);
      }

      const res = await proposalService.update(numId, {
        status: targetStatus,
      });

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(
        String(proposalId),
        targetStatus,
        data.notes
      );

      return res;
    } finally {
      isSubmitting.value = false;
    }
  }

  /**
   * Submit SK Dirut for proposal:
   * 1. update proposal with data no_sk_dirut & tanggal_sk_dirut in the form and status "SK_DIRUT_PUBLISHED" (proposalService.update)
   * 2. upload single document for "SK_DIRUT" using bulkCreateDocuments from proposal.service.ts
   */
  async function submitSKDirut(
    proposalId: string | number,
    data: {
      no_sk_dirut: string;
      tanggal_sk_dirut?: string;
      skDirutFile?: File | Blob | any;
      status?: string;
      notes?: string;
    }
  ) {
    const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
    const targetStatus = data.status || 'SK_DIRUT_PUBLISHED';
    isSubmitting.value = true;
    try {
      // (1) update proposal with no_sk_dirut, tanggal_sk_dirut and status SK_DIRUT_PUBLISHED
      const updatePayload: any = {
        no_sk_dirut: data.no_sk_dirut,
        status: targetStatus,
      };
      if (data.tanggal_sk_dirut) {
        updatePayload.tanggal_sk_dirut = data.tanggal_sk_dirut;
      }
      const res = await proposalService.update(numId, updatePayload);

      // (2) upload single document for "SK_DIRUT" using bulkCreateDocuments
      const fileObj = extractFileObject(data.skDirutFile);
      if (fileObj) {
        await proposalService.bulkCreateDocuments(numId, [
          {
            document_type: 'SK_DIRUT',
            file: fileObj,
          },
        ]);
      }

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(
        String(proposalId),
        targetStatus,
        data.notes || `Penerbitan SK Dirut nomor: ${data.no_sk_dirut}`
      );

      return res;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    submitToBPDPApproval,
    approveByKadiv,
    rejectByKadiv: submitForRevision,
    submitForRevision,
    submitSKDirut,
  };
});

