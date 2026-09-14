import { defineStore } from 'pinia';
import { ref } from 'vue';
import { proposalService, extractFileObject } from '@/services/proposal.service';
import { usePengusulanStore } from '@/stores/pengusulan';

export const useVerifikasiDitjenbunStore = defineStore(
  'verifikasi-ditjenbun',
  () => {
    const isSubmitting = ref(false);

    /**
     * Submit proposal for revision from Ditjenbun:
     * 1. bulkProposalValidations (if validation payloads exist, e.g. including REKOMTEK document validation)
     * 2. update proposal status in proposal.service.ts:
     *    - If target is Verifikator Ditjenbun (REV_FROM_DITJEN_APPR) -> 'REV_FROM_DITJEN_APPR'
     *    - If target is Dinas Provinsi (PERBAIKAN_DINAS_PROV) -> 'REV_FROM_DITJEN_VERIF'
     *    - If target is Dinas Kab/Kota (PERBAIKAN_DINAS_KAB) -> 'REV_FROM_PROV'
     */
    async function submitForRevision(
      proposalId: string | number,
      validations?: any[],
      notes?: string,
      targetDestination:
        | 'PERBAIKAN_DINAS_PROV'
        | 'PERBAIKAN_DINAS_KAB'
        | 'REV_FROM_DITJEN_VERIF'
        | 'REV_FROM_PROV'
        | 'REV_FROM_DITJEN_APPR'
        | 'DITJENBUN_VERIFIKATOR'
        | string = 'PERBAIKAN_DINAS_PROV'
    ) {
      const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
      let status = 'REV_FROM_DITJEN_VERIF';
      if (
        targetDestination === 'PERBAIKAN_DINAS_KAB' ||
        targetDestination === 'REV_FROM_PROV'
      ) {
        status = 'REV_FROM_PROV';
      } else if (
        targetDestination === 'REV_FROM_DITJEN_APPR' ||
        targetDestination === 'DITJENBUN_VERIFIKATOR'
      ) {
        status = 'REV_FROM_DITJEN_APPR';
      }

      isSubmitting.value = true;
      try {
        // (1) bulkProposalValidations
        if (validations && validations.length > 0) {
          await proposalService.bulkProposalValidations(validations);
        }

        // (2) update proposal status
        const res = await proposalService.update(numId, {
          status,
        });

        const pengusulanStore = usePengusulanStore();
        pengusulanStore.updateStatus(String(proposalId), status, notes);

        return res;
      } finally {
        isSubmitting.value = false;
      }
    }

    /**
     * Submit proposal to Ditjenbun Approval (Ketua Tim Ditjenbun):
     * 1. bulk validate documents (proposalService.bulkProposalValidations)
     * 2. update proposal to status "DITJEN_VERIF_SUBMITTED", with data: no_rekomtek and bentuk_bantuan ("UANG" | "BARANG")
     * 3. if new rekomtek file is uploaded:
     *    - if existing rekomtekDocId exists: update single document (proposalService.updateProposalDocument)
     *    - else: create single document (proposalService.bulkCreateDocuments)
     *    - if no document updated/reuploaded: do NOT run document update API request
     */
    async function submitToDitjenApproval(
      proposalId: string | number,
      data: {
        validations?: any[];
        no_rekomtek: string;
        bentuk_bantuan: 'UANG' | 'BARANG' | string;
        rekomtekFile?: File | Blob | any;
        rekomtekDocId?: number | string;
        documents?: any[];
      }
    ) {
      const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
      isSubmitting.value = true;
      try {
        // (1) Bulk validate documents
        if (data.validations && data.validations.length > 0) {
          await proposalService.bulkProposalValidations(data.validations);
        }

        // (2) Update proposal to status DITJEN_VERIF_SUBMITTED, with no_rekomtek and bentuk_bantuan
        const res = await proposalService.update(numId, {
          status: 'DITJEN_VERIF_SUBMITTED',
          no_rekomtek: data.no_rekomtek,
          bentuk_bantuan: data.bentuk_bantuan,
        });

        // (3) Update single document or create document only if a new file is uploaded
        const fileObj = extractFileObject(data.rekomtekFile);
        if (fileObj) {
          const docIdNum = data.rekomtekDocId ? Number(String(data.rekomtekDocId).replace(/[^\d]/g, '')) : null;
          if (docIdNum) {
            // Update existing single document
            await proposalService.updateProposalDocument(numId, docIdNum, {
              document_type: 'REKOMTEK',
              file: fileObj,
            });
          } else {
            // Create new single document
            await proposalService.bulkCreateDocuments(numId, [
              {
                document_type: 'REKOMTEK',
                file: fileObj,
              },
            ]);
          }
        } else if (data.documents && data.documents.length > 0) {
          await proposalService.bulkCreateDocuments(numId, data.documents);
        }

        const pengusulanStore = usePengusulanStore();
        pengusulanStore.updateStatus(
          String(proposalId),
          'DITJEN_VERIF_SUBMITTED',
          `Diajukan Rekomtek nomor: ${data.no_rekomtek}`
        );

        return res;
      } finally {
        isSubmitting.value = false;
      }
    }

    /**
     * Submit proposal to BPDP (Approval by Ketua Tim Ditjenbun):
     * 1. validation of "REKOMTEK" document type (proposalService.bulkProposalValidations)
     * 2. change status proposal to "DITJEN_APPR_SUBMITTED" (proposalService.update)
     */
    async function submitToBPDP(
      proposalId: string | number,
      data?: {
        validations?: any[];
        rekomtekDocId?: number | string;
        notes?: string;
      }
    ) {
      const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;
      isSubmitting.value = true;
      try {
        // (1) validation of "REKOMTEK" document type
        const validationsToSubmit: any[] = [];
        if (data?.validations && data.validations.length > 0) {
          validationsToSubmit.push(...data.validations);
        } else if (data?.rekomtekDocId) {
          validationsToSubmit.push({
            dokumen_proposal_id: Number(data.rekomtekDocId),
            is_valid: true,
            notes: data.notes || 'Dokumen Rekomtek disetujui Ketua Tim Ditjenbun',
            validated_by_role: 'DITJENBUN_APPROVAL',
          });
        }

        if (validationsToSubmit.length > 0) {
          await proposalService.bulkProposalValidations(validationsToSubmit);
        }

        // (2) change status proposal to "DITJEN_APPR_SUBMITTED"
        const res = await proposalService.update(numId, {
          status: 'DITJEN_APPR_SUBMITTED',
        });

        const pengusulanStore = usePengusulanStore();
        pengusulanStore.updateStatus(
          String(proposalId),
          'DITJEN_APPR_SUBMITTED',
          'Rekomendasi teknis disetujui Ketua Tim Ditjenbun. Diteruskan ke BPDP.'
        );

        return res;
      } finally {
        isSubmitting.value = false;
      }
    }

    return {
      isSubmitting,
      submitForRevision,
      submitToDitjenApproval,
      submitToBPDP,
    };
  },
  { persist: true },
);
